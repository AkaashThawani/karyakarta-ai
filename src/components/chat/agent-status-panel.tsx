"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentMessage } from "@/types/api";
import { Bot, Loader2, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface AgentStatusPanelProps {
  isProcessing: boolean;
  thoughts: AgentMessage[];
  onClose: () => void;
}

export function AgentStatusPanel({ isProcessing, thoughts, onClose }: AgentStatusPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new thoughts arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thoughts]);

  if (!isProcessing && thoughts.length === 0) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" strokeWidth={2} />
          <h3 className="font-semibold text-sm flex-1">Agent Status</h3>
          {isProcessing && (
            <Badge variant="secondary" className="text-xs h-6 px-2">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Active
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Thoughts Stream */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {thoughts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Waiting for agent activity...
          </div>
        ) : (
          thoughts.map((thought, index) => (
            <div 
              key={index}
              className="flex items-start gap-2 p-3 rounded-lg border border-border/50 bg-background/50 animate-in fade-in duration-200"
            >
              <Badge 
                variant="outline" 
                className={`text-[10px] h-5 px-2 shrink-0 ${
                  thought.type === 'thinking' ? 'border-blue-500/50 text-blue-600 bg-blue-500/10' :
                  thought.type === 'status' ? 'border-green-500/50 text-green-600 bg-green-500/10' :
                  'border-purple-500/50 text-purple-600 bg-purple-500/10'
                }`}
              >
                {thought.type}
              </Badge>
              <span className="flex-1 text-xs text-foreground leading-relaxed">
                {thought.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
