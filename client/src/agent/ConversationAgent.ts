import { OpenAI } from 'openai';
import type { Action } from './types/actions';

interface ConversationConfig {
    openaiApiKey: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
    maxHistoryLength?: number;
}

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp?: Date;
    id?: string;
}

interface ConversationResponse {
    success: boolean;
    message?: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    error?: string;
    conversationId?: string;
}

interface ConversationState {
    id: string;
    messages: Message[];
    created: Date;
    lastUpdated: Date;
    totalTokens: number;
    systemPrompt?: string; // Store system prompt separately, not as a message
}

export class ConversationAgent {
    private openai: OpenAI;
    private config: Required<ConversationConfig>;
    private conversations: Map<string, ConversationState>;
    private currentConversationId: string | null;
    private actions: Map<string, Action> = new Map();

    constructor(config: ConversationConfig) {
        this.openai = new OpenAI({
            apiKey: config.openaiApiKey,
            dangerouslyAllowBrowser: true
        });
        
        this.config = {
            openaiApiKey: config.openaiApiKey,
            model: config.model || 'gpt-4',
            maxTokens: config.maxTokens || 1000,
            temperature: config.temperature || 0.7,
            systemPrompt: config.systemPrompt || 'You are a helpful AI assistant. Be concise and friendly.',
            maxHistoryLength: config.maxHistoryLength || 50
        };

        this.conversations = new Map();
        this.currentConversationId = null;
    }

    private generateId(): string {
        return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    public registerAction(action: Action): void {
        this.actions.set(action.name, action);
        }


    private validateMessage(content: string): boolean {
        if (!content || typeof content !== 'string') {
            throw new Error('Message content must be a non-empty string');
        }
        
        if (content.trim().length === 0) {
            throw new Error('Message content cannot be empty');
        }

        if (content.length > 10000) {
            throw new Error('Message content exceeds maximum length of 10000 characters');
        }

        return true;
    }

    private trimConversationHistory(messages: Message[]): Message[] {
        // Only trim user/assistant messages, system message is handled separately
        if (messages.length > this.config.maxHistoryLength) {
            return messages.slice(-this.config.maxHistoryLength);
        }
        return messages;
    }

    private async callOpenAI(conversation: ConversationState): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    try {
        const trimmedMessages = this.trimConversationHistory(conversation.messages);
        
        const apiMessages = [];
        
        if (conversation.systemPrompt) {
        apiMessages.push({
            role: 'system' as const,
            content: conversation.systemPrompt
        });
        }
        
        apiMessages.push(...trimmedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
        })));

        const tools = this.getToolDefinitions();
        
        const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: apiMessages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        tools: tools.length > 0 ? tools : undefined
        });

        // Handle tool calls
        const choice = response.choices[0];
        if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
        return this.handleToolCalls(conversation, apiMessages, choice.message, response);
        }

        return response;
    } catch (error) {
        throw new Error(`OpenAI API error: ${(error as Error).message}`);
    }
    }

    public createConversation(systemPrompt?: string): string {
        const conversationId = this.generateId();
        const now = new Date();

        const conversation: ConversationState = {
            id: conversationId,
            messages: [], // No system message stored here!
            created: now,
            lastUpdated: now,
            totalTokens: 0,
            systemPrompt: systemPrompt || this.config.systemPrompt // Store separately
        };

        this.conversations.set(conversationId, conversation);
        this.currentConversationId = conversationId;

        return conversationId;
    }

    public switchConversation(conversationId: string): boolean {
        if (!this.conversations.has(conversationId)) {
            return false;
        }
        
        this.currentConversationId = conversationId;
        return true;
    }

    public listConversations(): Array<{
        id: string;
        created: Date;
        lastUpdated: Date;
        messageCount: number;
        totalTokens: number;
    }> {
        return Array.from(this.conversations.values()).map(conv => ({
            id: conv.id,
            created: conv.created,
            lastUpdated: conv.lastUpdated,
            messageCount: conv.messages.length, // Only counts user/assistant messages
            totalTokens: conv.totalTokens
        }));
    }

    public async sendMessage(content: string, conversationId?: string): Promise<ConversationResponse> {
        try {
            // Validate input
            this.validateMessage(content);

            // Determine which conversation to use
            const targetConversationId = conversationId || this.currentConversationId;
            
            if (!targetConversationId) {
                // Create new conversation if none exists
                this.createConversation();
            }

            const conversation = this.conversations.get(targetConversationId || this.currentConversationId!);
            if (!conversation) {
                throw new Error('Conversation not found');
            }

            // Add user message
            const userMessage: Message = {
                role: 'user',
                content: content.trim(),
                timestamp: new Date(),
                id: this.generateId()
            };

            conversation.messages.push(userMessage);

            // Call OpenAI (system prompt handled internally)
            const response = await this.callOpenAI(conversation);
            
            if (!response.choices[0]?.message?.content) {
                throw new Error('No response generated from OpenAI');
            }

            // Add assistant response
            const assistantMessage: Message = {
                role: 'assistant',
                content: response.choices[0].message.content,
                timestamp: new Date(),
                id: this.generateId()
            };

            conversation.messages.push(assistantMessage);
            conversation.lastUpdated = new Date();
            
            if (response.usage) {
                conversation.totalTokens += response.usage.total_tokens;
            }

            return {
                success: true,
                message: assistantMessage.content,
                usage: response.usage ? {
                    promptTokens: response.usage.prompt_tokens,
                    completionTokens: response.usage.completion_tokens,
                    totalTokens: response.usage.total_tokens
                } : undefined,
                conversationId: conversation.id
            };

        } catch (error) {
            return {
                success: false,
                error: `Message error: ${(error as Error).message}`
            };
        }
    }

    public getConversationHistory(conversationId?: string): Message[] {
        const targetId = conversationId || this.currentConversationId;
        if (!targetId) {
            return [];
        }

        const conversation = this.conversations.get(targetId);
        // Return only user/assistant messages, system prompt is not included
        return conversation ? [...conversation.messages] : [];
    }

    public clearConversation(conversationId?: string): boolean {
        const targetId = conversationId || this.currentConversationId;
        if (!targetId) {
            return false;
        }

        const conversation = this.conversations.get(targetId);
        if (!conversation) {
            return false;
        }

        // Clear only user/assistant messages, keep system prompt
        conversation.messages = [];
        conversation.lastUpdated = new Date();
        conversation.totalTokens = 0;

        return true;
    }

    public deleteConversation(conversationId: string): boolean {
        if (!this.conversations.has(conversationId)) {
            return false;
        }

        this.conversations.delete(conversationId);
        
        if (this.currentConversationId === conversationId) {
            this.currentConversationId = null;
        }

        return true;
    }

    public updateSystemPrompt(systemPrompt: string, conversationId?: string): boolean {
        const targetId = conversationId || this.currentConversationId;
        if (!targetId) {
            return false;
        }

        const conversation = this.conversations.get(targetId);
        if (!conversation) {
            return false;
        }

        // Update system prompt (stored separately, not as a message)
        conversation.systemPrompt = systemPrompt;
        conversation.lastUpdated = new Date();
        return true;
    }

    public exportConversation(conversationId?: string): ConversationState | null {
        const targetId = conversationId || this.currentConversationId;
        if (!targetId) {
            return null;
        }

        const conversation = this.conversations.get(targetId);
        return conversation ? JSON.parse(JSON.stringify(conversation)) : null;
    }

    public importConversation(conversationData: ConversationState): string {
        const newId = this.generateId();
        const importedConversation = {
            ...conversationData,
            id: newId,
            lastUpdated: new Date()
        };

        this.conversations.set(newId, importedConversation);
        return newId;
    }

    public getStats(): {
        totalConversations: number;
        totalMessages: number;
        totalTokens: number;
        activeConversation: string | null;
    } {
        const conversations = Array.from(this.conversations.values());
        
        return {
            totalConversations: conversations.length,
            totalMessages: conversations.reduce((sum, conv) => sum + conv.messages.length, 0),
            totalTokens: conversations.reduce((sum, conv) => sum + conv.totalTokens, 0),
            activeConversation: this.currentConversationId
        };
    }

    public async askFollowUp(
        question: string,
        conversationId?: string
    ): Promise<ConversationResponse> {
        return this.sendMessage(question, conversationId);
    }

    private getToolDefinitions(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return Array.from(this.actions.values()).map(action => ({
        type: 'function' as const,
        function: {
        name: action.name,
        description: action.description,
        parameters: {
            type: 'object',
            properties: Object.fromEntries(
            action.parameters.map(p => [
                p.name,
                { type: p.type, description: p.description }
            ])
            ),
            required: action.parameters.filter(p => p.required).map(p => p.name)
        }
        }
    }));
    }
    private async handleToolCalls(
    conversation: ConversationState,
    apiMessages: any[],
    assistantMessage: OpenAI.Chat.Completions.ChatCompletionMessage,
    originalResponse: OpenAI.Chat.Completions.ChatCompletion
    ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    
    apiMessages.push(assistantMessage);

    for (const toolCall of assistantMessage.tool_calls!) {
        // Type guard to handle different tool call types
        if (toolCall.type !== 'function') {
        continue;
        }

        const functionCall = toolCall as OpenAI.Chat.Completions.ChatCompletionMessageToolCall & {
        function: { name: string; arguments: string };
        };

        const action = this.actions.get(functionCall.function.name);
        
        let toolResult: string;
        if (action) {
        const params = JSON.parse(functionCall.function.arguments);
        const result = await action.execute(params);
        toolResult = JSON.stringify(result);
        } else {
        toolResult = JSON.stringify({ success: false, error: 'Unknown action' });
        }

        apiMessages.push({
        role: 'tool' as const,
        tool_call_id: toolCall.id,
        content: toolResult
        });
    }

    const finalResponse = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: apiMessages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
    });

    if (originalResponse.usage && finalResponse.usage) {
        finalResponse.usage.prompt_tokens += originalResponse.usage.prompt_tokens;
        finalResponse.usage.completion_tokens += originalResponse.usage.completion_tokens;
        finalResponse.usage.total_tokens += originalResponse.usage.total_tokens;
    }

    return finalResponse;
    }
}