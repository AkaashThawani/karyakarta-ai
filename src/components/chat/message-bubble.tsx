"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/types/api";
import { User, Bot, ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { useState } from "react";
import { ContentRenderer } from "./content-renderer";

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
  onOpenDetails?: (thoughts: any[]) => void;
}

export function MessageBubble({ message, index, onOpenDetails }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === 'user') {
    return (
      <div className="flex items-start gap-4 py-6 mb-2">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">You</span>
            <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
          </div>
          <p className="text-foreground leading-relaxed text-[15px]">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 py-6 mb-2 px-4 -mx-4 bg-muted/30 rounded-lg">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-cyan-500/20">
          <Bot className="h-5 w-5 text-primary" strokeWidth={2} />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">KaryaKarta AI</span>
          <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
          
          {/* Agent Thoughts Button - Opens Side Panel */}
          {message.thoughts && message.thoughts.length > 0 && onOpenDetails && (
            <Button
              onClick={() => onOpenDetails(message.thoughts || [])}
              variant="outline"
              size="sm"
              className="ml-2 h-7 px-3 text-xs rounded-lg border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5 mr-1" />
              Agent Thoughts
              <Badge variant="secondary" className="ml-1.5 text-[10px] h-5 px-1.5">
                {message.thoughts.length}
              </Badge>
            </Button>
          )}
        </div>
        
        {/* Message Content */}
        <div className="relative group/message">
          <div className="pr-10 break-words overflow-wrap-anywhere">
            <ContentRenderer content={message.content} />
          </div>
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0 h-8 w-8 p-0 rounded-lg opacity-0 group-hover/message:opacity-100 transition-opacity hover:bg-background/80"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
