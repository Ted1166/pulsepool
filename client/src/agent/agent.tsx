import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Settings, Plus, MessageSquare, Menu, X } from 'lucide-react';
import { ConversationAgent } from './ConversationAgent';
import { defaultCharacter } from './character';

// Types for the component
interface MessageAgent {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ConversationInfo {
  id: string;
  created: Date;
  lastUpdated: Date;
  messageCount: number;
  totalTokens: number;
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

const OpenAIAgent: React.FC = () => {
  const [agent, setAgent] = useState<ConversationAgent | null>(null);
  const [messages, setMessages] = useState<MessageAgent[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize agent with character config
  useEffect(() => {
    if (defaultCharacter.apiKey) {
      const newAgent = new ConversationAgent({
        openaiApiKey: defaultCharacter.apiKey,
        systemPrompt: defaultCharacter.system
      });
      setAgent(newAgent);
      const conversationId = newAgent.createConversation();
      setCurrentConversationId(conversationId);
      updateConversationsList(newAgent);
    }
  }, []);

  useEffect(() => {
    if (agent && currentConversationId) {
      const history = agent.getConversationHistory(currentConversationId);
      setMessages(history as any);
    }
  }, [currentConversationId, agent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateConversationsList = (agentInstance: ConversationAgent | null = agent): void => {
    if (agentInstance) {
      const convList: ConversationInfo[] = agentInstance.listConversations();
      setConversations(convList);
    }
  };

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || isLoading || !agent) return;

    setIsLoading(true);
    setShowSidebar(false); // Close sidebar on mobile after sending
    
    try {
      const response: ConversationResponse = await agent.sendMessage(input.trim(), currentConversationId!);
      
      if (response.success) {
        const updatedHistory = agent.getConversationHistory(currentConversationId!);
        setMessages(updatedHistory as any);
        updateConversationsList();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
    
    setInput('');
    setIsLoading(false);
  };

  const createNewConversation = (): void => {
    if (!agent) return;
    
    const newConversationId: string = agent.createConversation(defaultCharacter.system);
    setCurrentConversationId(newConversationId);
    updateConversationsList();
    setShowSidebar(false); // Close sidebar on mobile
  };

  const switchConversation = (conversationId: string): void => {
    if (agent && agent.switchConversation(conversationId)) {
      setCurrentConversationId(conversationId);
      setShowSidebar(false); // Close sidebar on mobile
    }
  };

  const clearCurrentConversation = (): void => {
    if (agent && currentConversationId) {
      agent.clearConversation(currentConversationId);
      setMessages([]);
      updateConversationsList();
    }
  };

  const deleteConversation = (conversationId: string): void => {
    if (agent && agent.deleteConversation(conversationId)) {
      if (conversationId === currentConversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        if (remaining.length > 0) {
          switchConversation(remaining[0].id);
        } else {
          createNewConversation();
        }
      }
      updateConversationsList();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const Sidebar: React.FC = () => (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          <div className="flex gap-2">
            <button
              onClick={createNewConversation}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              disabled={!agent}
              type="button"
            >
              <Plus className="w-5 h-5" />
            </button>
            {/* Mobile close button */}
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg lg:hidden"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {!defaultCharacter.apiKey && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            Please set OPENAI_API_KEY in environment variables
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv: ConversationInfo) => (
          <div
            key={conv.id}
            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              currentConversationId === conv.id ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => switchConversation(conv.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                switchConversation(conv.id);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {conv.messageCount} messages
                </span>
              </div>
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                className="text-gray-400 hover:text-red-500 p-1"
                type="button"
                aria-label={`Delete conversation with ${conv.messageCount} messages`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {conv.created.toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setShowSidebar(false)}
            role="button"
            tabIndex={0}
            aria-label="Close sidebar"
          />
          <div className="relative w-80 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg lg:hidden"
                type="button"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Bot className="w-6 h-6 text-blue-500" />
              <h1 className="text-lg lg:text-xl font-semibold text-gray-800 truncate">
                {defaultCharacter.name}
              </h1>
            </div>
          </div>
        
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-2 lg:p-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8 px-4">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Start a conversation with {defaultCharacter.name}!</p>
              <p className="text-sm mt-2">Each conversation maintains its own context and memory.</p>
            </div>
          )}
          
          {messages.map((message: MessageAgent, index: number) => (
            <div
              key={message.id || index}
              className={`flex items-start gap-2 lg:gap-3 mb-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[85%] lg:max-w-lg p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm lg:text-base leading-relaxed">
                  {message.content}
                </p>
                {message.timestamp && (
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-2 lg:gap-3 mb-4">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <div className="bg-white text-gray-800 border border-gray-200 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse text-sm">thinking...</div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-3 lg:p-4 bg-white">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm lg:text-base"
              rows={1}
              disabled={isLoading || !agent}
              style={{ minHeight: '44px' }} // Ensure touch-friendly on mobile
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || !agent}
              className="px-3 lg:px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              type="button"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 px-1">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default OpenAIAgent;