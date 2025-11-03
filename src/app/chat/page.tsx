"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Bot, Loader2, ChevronRight } from 'lucide-react';
import { 
  AgentMessage, 
  ChatMessage,
  generateMessageId,
  generateSessionId,
  isResponseMessage,
} from '@/types/api';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/chat/sidebar';
import { MessageBubble } from '@/components/chat/message-bubble';
import { ChatInput } from '@/components/chat/chat-input';
import { AgentStatusPanel } from '@/components/chat/agent-status-panel';
import { useAuth } from '@/contexts/auth-context';
import { SessionProvider, useSession } from '@/contexts/session-context';

let socket: Socket | null = null;

function ChatPageContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { currentSession } = useSession();
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentThoughts, setCurrentThoughts] = useState<AgentMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [historicalThoughts, setHistoricalThoughts] = useState<AgentMessage[]>([]);
  const [browserActive, setBrowserActive] = useState(false);
  const [cdpUrl, setCdpUrl] = useState('');
  const [playwrightLogs, setPlaywrightLogs] = useState<any[]>([]);
  const [currentMessageId, setCurrentMessageId] = useState<string>('');
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sessionId');
      if (saved) return saved;
    }
    const newSessionId = generateSessionId('user');
    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionId', newSessionId);
    }
    return newSessionId;
  });
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const currentThoughtsRef = useRef<AgentMessage[]>([]);
  const currentMessageIdRef = useRef<string>('');

  // Load messages when session changes
  useEffect(() => {
    if (currentSession) {
      loadSessionMessages(currentSession.session_id);
    }
  }, [currentSession?.id]);

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${apiUrl}/sessions/${sessionId}/messages`);
      if (response.ok) {
        const data = await response.json();
        const messages: ChatMessage[] = data.messages.map((msg: any) => ({
          id: msg.message_id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at,
          status: 'sent'
        }));
        setChatHistory(messages);
      }
    } catch (error) {
      console.error('Failed to load session messages:', error);
    }
  };

  // Note: No auth redirect - allowing trial mode
  // Users can try the chat without logging in

  useEffect(() => {
    if (socket) return;

    socket = io();

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle browser status events
    socket.on('browser-status', (data: any) => {
      console.log('Browser status:', data);
      if (data.status === 'active') {
        setBrowserActive(true);
        setCdpUrl(data.cdp_url || '');
      } else if (data.status === 'closed') {
        setBrowserActive(false);
        setCdpUrl('');
      }
    });

    // Handle playwright action logs
    socket.on('playwright-log', (data: any) => {
      console.log('Playwright log:', data);
      setPlaywrightLogs(prev => [...prev, data]);
    });

    socket.on('agent-log', (data: any) => {
      // Filter out custom events (handled by dedicated handlers)
      if (typeof data === 'object' && (data.type === 'browser-status' || data.type === 'playwright-log')) {
        return; // Skip these, they're handled by specific handlers above
      }
      
      let messageObj: AgentMessage;
      
      if (typeof data === 'string') {
        messageObj = {
          type: 'status',
          message: data,
          timestamp: new Date().toISOString()
        };
      } else {
        messageObj = data;
      }

      if (messageObj.type === 'error') {
        setIsProcessing(false);
        setShowDetailPanel(false);
        setCurrentMessageId('');
        
        const errorMessage: ChatMessage = {
          id: generateMessageId(),
          role: 'agent',
          content: messageObj.message || 'An error occurred. Please try again.',
          timestamp: messageObj.timestamp,
        };
        setChatHistory(prev => [...prev, errorMessage]);
        setCurrentThoughts([]);
        currentThoughtsRef.current = [];
        return;
      }
      
      if (isResponseMessage(messageObj)) {
        const messageId = messageObj.messageId || currentMessageIdRef.current;
        
        if (processedMessageIds.current.has(messageId)) {
          return;
        }
        
        processedMessageIds.current.add(messageId);
        const capturedThoughts = [...currentThoughtsRef.current];
        
        const agentMessage: ChatMessage = {
          id: messageId,
          role: 'agent',
          content: messageObj.message,
          timestamp: messageObj.timestamp,
          thoughts: capturedThoughts
        };
        
        setChatHistory(prev => [...prev, agentMessage]);
        setCurrentThoughts([]);
        currentThoughtsRef.current = [];
        setIsProcessing(false);
        setShowDetailPanel(false);
        setCurrentMessageId('');
      } else {
        setCurrentThoughts(prev => {
          const updated = [...prev, messageObj];
          currentThoughtsRef.current = updated;
          return updated;
        });
      }
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, currentThoughts]);

  const handleSubmit = async () => {
    if (!prompt.trim() || !isConnected || isProcessing) return;
    
    // Generate separate IDs for user message and agent response
    const userMessageId = generateMessageId();
    const agentMessageId = generateMessageId();
    currentMessageIdRef.current = agentMessageId;
    setCurrentMessageId(agentMessageId);
    
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setCurrentThoughts([]);
    currentThoughtsRef.current = [];
    setIsProcessing(true);
    setShowDetailPanel(false);
    
    const currentPrompt = prompt;
    setPrompt('');

    try {
      await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: currentPrompt,
          messageId: agentMessageId,
          sessionId: currentSession?.session_id || sessionId
        }),
      });
      
      setChatHistory(prev => 
        prev.map(msg => 
          msg.id === userMessageId ? { ...msg, status: 'sent' as const } : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setCurrentMessageId('');
      
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'agent',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      
      setChatHistory(prev => [
        ...prev.map(msg => 
          msg.id === userMessageId ? { ...msg, status: 'error' as const } : msg
        ),
        errorMessage
      ]);
      
      setIsProcessing(false);
      setShowDetailPanel(false);
      setCurrentThoughts([]);
      currentThoughtsRef.current = [];
      setCurrentMessageId('');
    }
  };

  const handleStop = async () => {
    console.log('[Chat] Stopping all active tasks');
    
    try {
      // Send "all" to cancel all active tasks instead of just the current one
      const response = await fetch('/api/agent/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: 'all' }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`[Chat] Tasks cancelled: ${result.message}`);
        // UI will be updated via socket event from backend
        setIsProcessing(false);
        setShowDetailPanel(false);
        setCurrentMessageId('');
      } else {
        console.error(`[Chat] Failed to cancel tasks: ${result.message}`);
      }
    } catch (error) {
      console.error('[Chat] Error cancelling tasks:', error);
    }
  };

  const getCurrentStatus = () => {
    if (currentThoughts.length > 0) {
      return currentThoughts[currentThoughts.length - 1].message;
    }
    return 'Processing your request...';
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Chat Section - Left 50% */}
        <div className="flex-1 flex flex-col overflow-hidden relative border-r border-border">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-8 py-4">
              {chatHistory.length === 0 && !isProcessing && (
                <div className="flex items-center justify-center h-full py-20">
                  <div className="text-center space-y-6 animate-in fade-in duration-500">
                    <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 via-cyan-500/20 to-purple-500/20 flex items-center justify-center border-2 border-primary/30">
                      <Bot className="w-12 h-12 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent">
                        Ready to Assist
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Start a conversation by typing your message below. I&apos;m here to help with tasks, answer questions, and assist you.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {chatHistory.map((message, index) => (
                <div key={message.id}>
                  <MessageBubble 
                    message={message} 
                    index={index}
                    onOpenDetails={(thoughts) => {
                      setHistoricalThoughts(thoughts);
                      setShowDetailPanel(true);
                    }}
                  />
                  
                  {message.role === 'user' && isProcessing && index === chatHistory.length - 1 && (
                    <div className="flex justify-start mb-6 animate-in fade-in duration-300">
                      <div className="max-w-[80%]">
                        <button
                          onClick={() => setShowDetailPanel(!showDetailPanel)}
                          className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted hover:border-border transition-all"
                        >
                          <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                          <span className="text-sm text-muted-foreground flex-1 text-left">
                            {getCurrentStatus()}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                              {showDetailPanel ? 'Hide' : 'Show'} details
                            </span>
                            <ChevronRight className={`w-4 h-4 transition-transform ${showDetailPanel ? 'rotate-90' : ''}`} />
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div ref={chatEndRef} />
            </div>
          </div>
          
          <ChatInput
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={handleSubmit}
            onStop={handleStop}
            isDisabled={!isConnected || isProcessing}
            isProcessing={isProcessing}
          />
        </div>
        
        {/* Browser Section - HIDDEN */}
        {/* Uncomment this section to show browser view
        <div className="flex-1 flex flex-col bg-muted/30">
          <div className="border-b border-border bg-background px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${browserActive ? 'bg-green-500' : 'bg-red-500'}`} />
                Browser View
              </h2>
              <span className="text-xs text-muted-foreground">
                {browserActive ? 'Browser Active' : 'No Browser Active'}
              </span>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-8">
            {browserActive && cdpUrl ? (
              <iframe
                src={cdpUrl}
                className="w-full h-full border rounded"
                title="Live Browser"
              />
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                  <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-muted-foreground">
                    No Browser Session
                  </h3>
                  <p className="text-sm text-muted-foreground/70 max-w-sm">
                    Browser will appear here when you run automation tasks
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t border-border bg-background">
            <div className="px-4 py-2 border-b border-border">
              <h3 className="text-xs font-semibold text-muted-foreground">
                Playwright Actions ({playwrightLogs.length})
              </h3>
            </div>
            <div className="h-32 overflow-y-auto p-4 space-y-1">
              {playwrightLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground/50 italic">No actions yet...</p>
              ) : (
                playwrightLogs.map((log, idx) => (
                  <div key={idx} className="text-xs font-mono flex items-center gap-2">
                    {log.status === 'success' && <span className="text-green-500">✓</span>}
                    {log.status === 'failed' && <span className="text-red-500">✗</span>}
                    {log.status === 'starting' && <span className="text-yellow-500">⟳</span>}
                    <span className="text-muted-foreground">
                      {log.method}
                      {log.selector && `: ${log.selector}`}
                      {log.url && `: ${log.url}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        */}
        
        <div 
          className={`absolute right-0 top-0 h-full w-80 bg-background border-l border-border transition-transform duration-300 ease-in-out z-50 ${
            showDetailPanel ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <AgentStatusPanel 
            isProcessing={isProcessing}
            thoughts={isProcessing ? currentThoughts : historicalThoughts}
            onClose={() => {
              setShowDetailPanel(false);
              setHistoricalThoughts([]);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <SessionProvider>
      <ChatPageContent />
    </SessionProvider>
  );
}
