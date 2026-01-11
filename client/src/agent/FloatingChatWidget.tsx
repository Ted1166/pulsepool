import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Plus, MessageSquare, Menu, X, Minimize2, Maximize2 } from 'lucide-react';
import { ConversationAgent } from './ConversationAgent';
import { defaultCharacter } from './character';
import { GitHubAction } from './actions/github';
import { PulsePoolAction } from './actions/pool';

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

const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [agent, setAgent] = useState<ConversationAgent | null>(null);
  const [messages, setMessages] = useState<MessageAgent[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize agent with character config
  useEffect(() => {
    if (defaultCharacter.apiKey) {
      const newAgent = new ConversationAgent({
        openaiApiKey: defaultCharacter.apiKey,
        systemPrompt: defaultCharacter.system
      });
       // Register actions
      // agent.registerAction(new GitHubAction());
      // agent.registerAction(new PulsePoolAction(
      //   '0xREGISTRY_ADDRESS',
      //   '0xPOOL_ADDRESS', 
      //   '0xMARKET_ADDRESS',
      //   'https://bsc-dataseed.binance.org/' // or testnet
      // ));
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

  // Reset unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const updateConversationsList = (agentInstance: ConversationAgent | null = agent): void => {
    if (agentInstance) {
      const convList: ConversationInfo[] = agentInstance.listConversations();
      setConversations(convList);
    }
  };

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || isLoading || !agent) return;

    setIsLoading(true);
    setShowSidebar(false);
    
    try {
      const response: ConversationResponse = await agent.sendMessage(input.trim(), currentConversationId!);
      
      if (response.success) {
        const updatedHistory = agent.getConversationHistory(currentConversationId!);
        setMessages(updatedHistory as any);
        updateConversationsList();
        
        // If chat is closed, increment unread count
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
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
    setShowSidebar(false);
  };

  const switchConversation = (conversationId: string): void => {
    if (agent && agent.switchConversation(conversationId)) {
      setCurrentConversationId(conversationId);
      setShowSidebar(false);
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

  const toggleChat = (): void => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  // Floating button when chat is closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="group relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
          type="button"
          aria-label="Open chat"
        >
          {/* Unread badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
          
          {/* Bot icon with pulse animation */}
          <Bot className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" />
          
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-white opacity-20 scale-0 group-hover:scale-100 group-hover:opacity-0 transition-all duration-500"></div>
          
          {/* Floating particles effect */}
          <div className="absolute -inset-2 rounded-full opacity-30">
            <div className="absolute top-0 left-0 w-2 h-2 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
            <div className="absolute bottom-2 right-2 w-1 h-1 bg-purple-300 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-0 left-2 w-1.5 h-1.5 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
          </div>
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-20 right-0 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Chat with {defaultCharacter.name}
        </div>
      </div>
    );
  }

  // Full chat interface when opened
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
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat window */}
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 transform ${
          isMinimized 
            ? 'w-80 h-16' 
            : 'w-96 h-[32rem] sm:w-[28rem] sm:h-[36rem]'
        }`}
        style={{
          transform: 'translateY(0)',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{defaultCharacter.name}</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs opacity-90">Online</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!isMinimized && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  type="button"
                >
                  <Menu className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                type="button"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleChat}
                className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Sidebar overlay */}
            {showSidebar && (
              <div className="absolute inset-0 z-10 bg-black bg-opacity-50 rounded-2xl" onClick={() => setShowSidebar(false)}>
                <div className="w-64 h-full bg-white rounded-l-2xl" onClick={e => e.stopPropagation()}>
                  <Sidebar />
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 h-80 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">Start a conversation!</p>
                  <p className="text-xs mt-1">I'm here to help you anytime.</p>
                </div>
              )}
              
              {messages.map((message: MessageAgent, index: number) => (
                <div
                  key={message.id || index}
                  className={`flex items-start gap-2 mb-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] p-2.5 rounded-lg text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    {message.timestamp && (
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-white text-gray-800 border border-gray-200 p-2.5 rounded-lg rounded-bl-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">typing</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-3 bg-white rounded-b-2xl">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  rows={1}
                  disabled={isLoading || !agent}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading || !agent}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  type="button"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FloatingChatWidget;