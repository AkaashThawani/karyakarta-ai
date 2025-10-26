"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { io, Socket } from 'socket.io-client';
import { ChevronDown, ChevronRight, Send, Trash2 } from 'lucide-react';
import { 
  AgentMessage, 
  ChatMessage,
  generateMessageId,
  generateSessionId,
  isResponseMessage,
  formatTimestamp
} from '@/types/api';

let socket: Socket | null = null;

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentThoughts, setCurrentThoughts] = useState<AgentMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState<number[]>([]);
  const [sessionId] = useState(() => {
    // Try to restore from localStorage, or generate new session
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

  useEffect(() => {
    if (socket) return;

    socket = io();

    socket.on('connect', () => {
      console.log('CLIENT: Connected to socket server!');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('CLIENT: Disconnected from socket server.');
      setIsConnected(false);
    });

    socket.on('agent-log', (data: any) => {
      console.log('========== SOCKET EVENT RECEIVED ==========');
      console.log('Raw data:', data);
      
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
      
      // Handle response messages with deduplication
      if (isResponseMessage(messageObj)) {
        console.log('>>> RESPONSE MESSAGE DETECTED <<<');
        
        // Use messageId from backend for deduplication
        const messageId = messageObj.messageId || currentMessageIdRef.current;
        console.log('Message ID:', messageId);
        
        // Check if we've already processed this response
        if (processedMessageIds.current.has(messageId)) {
          console.log('🚫 DUPLICATE RESPONSE DETECTED - SKIPPING!');
          console.log('==========================================\n');
          return;
        }
        
        console.log('✅ New response - processing...');
        processedMessageIds.current.add(messageId);
        
        // Capture current thoughts
        const capturedThoughts = [...currentThoughtsRef.current];
        
        // Create agent message with ID
        const agentMessage: ChatMessage = {
          id: messageId,
          role: 'agent',
          content: messageObj.message,
          timestamp: messageObj.timestamp,
          thoughts: capturedThoughts
        };
        
        setChatHistory(prev => [...prev, agentMessage]);
        
        // Clear thoughts
        setCurrentThoughts([]);
        currentThoughtsRef.current = [];
        setIsProcessing(false);
        
        console.log('==========================================\n');
      } else {
        // Handle status/thinking messages
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
  }, [chatHistory]);

  const handleSubmit = async () => {
    if (!prompt.trim() || !isConnected || isProcessing) return;
    
    // Generate unique message ID for this request
    const messageId = generateMessageId();
    currentMessageIdRef.current = messageId;
    
    const userMessage: ChatMessage = {
      id: messageId,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setCurrentThoughts([]);
    currentThoughtsRef.current = [];
    setIsProcessing(true);
    
    const currentPrompt = prompt;
    setPrompt('');

    try {
      await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: currentPrompt,
          messageId: messageId,
          sessionId: sessionId
        }),
      });
      
      // Update message status to sent
      setChatHistory(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'sent' as const } : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setIsProcessing(false);
      
      // Update message status to error
      setChatHistory(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'error' as const } : msg
        )
      );
    }
  };

  const clearChat = () => {
    // Generate new session ID
    const newSessionId = generateSessionId('user');
    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionId', newSessionId);
    }
    
    // Clear chat history and state
    setChatHistory([]);
    setCurrentThoughts([]);
    currentThoughtsRef.current = [];
    processedMessageIds.current.clear();
    setIsProcessing(false);
    
    // Reload page to get new session
    window.location.reload();
  };

  const toggleThoughts = (index: number) => {
    setExpandedThoughts(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-3xl h-[90vh] flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="text-xl font-bold flex items-center justify-between">
              <span>KaryaKarta Agent</span>
              <div className="flex items-center gap-3">
                <Button
                  onClick={clearChat}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={isProcessing}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear Chat
                </Button>
                <span className={`text-xs ${isConnected ? "text-green-500" : "text-red-500"}`}>
                  {isConnected ? '● Connected' : '● Disconnected'}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
            {chatHistory.length === 0 && !isProcessing && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <p className="text-lg mb-2">Welcome to KaryaKarta Agent</p>
                <p className="text-sm">Ask me anything and I&apos;ll help you find the information you need.</p>
              </div>
            )}
            
            {chatHistory.map((message, index) => (
              <div key={index} className="space-y-3">
                {message.role === 'user' ? (
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 min-w-[60px]">You:</span>
                    <p className="text-gray-800 dark:text-gray-200">{message.content}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {message.thoughts && message.thoughts.length > 0 && (
                      <div className="ml-[60px] mb-2">
                        <button
                          onClick={() => toggleThoughts(index)}
                          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                        >
                          {expandedThoughts.includes(index) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <span>Show Agent Thoughts ({message.thoughts.length})</span>
                        </button>
                        
                        {expandedThoughts.includes(index) && (
                          <div className="mt-3 ml-6 space-y-2 border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                            {message.thoughts.map((thought, thoughtIndex) => (
                              <div key={thoughtIndex} className="relative">
                                <div className="absolute -left-[21px] top-2 w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500 border-2 border-white dark:border-gray-900"></div>
                                <div className="text-xs space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 dark:text-gray-400">
                                      {formatTime(thought.timestamp)}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                      thought.type === 'thinking'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                      {thought.type.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300">{thought.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-green-600 dark:text-green-400 min-w-[60px]">Agent:</span>
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isProcessing && (
              <div className="space-y-2">
                {currentThoughts.length > 0 && (
                  <div className="ml-[60px] space-y-2 border-l-2 border-blue-300 dark:border-blue-600 pl-4 animate-pulse">
                    {currentThoughts.map((thought, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[21px] top-2 w-3 h-3 rounded-full bg-blue-400 dark:bg-blue-500 border-2 border-white dark:border-gray-900"></div>
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">
                              {formatTime(thought.timestamp)}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              thought.type === 'thinking'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {thought.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{thought.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-green-600 dark:text-green-400 min-w-[60px]">Agent:</span>
                  <p className="text-gray-500 dark:text-gray-400 italic">Thinking...</p>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </CardContent>
          
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask me anything..."
                className="min-h-[60px] resize-none"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={!isConnected || isProcessing}
              />
              <Button
                onClick={handleSubmit}
                disabled={!isConnected || isProcessing || !prompt.trim()}
                className="h-[60px] px-6"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
