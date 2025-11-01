"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, StopCircle } from "lucide-react";
import { KeyboardEvent } from "react";

interface ChatInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isDisabled: boolean;
  isProcessing: boolean;
}

export function ChatInput({
  prompt,
  setPrompt,
  onSubmit,
  onStop,
  isDisabled,
  isProcessing,
}: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isDisabled && prompt.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-5xl mx-auto p-4">
        <div className="bg-muted rounded-2xl p-2">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                placeholder="Ask me anything..."
                className="min-h-[60px] max-h-[200px] resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base leading-relaxed px-4 py-3"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isDisabled}
              />
            </div>
            {isProcessing ? (
              <Button
                onClick={onStop}
                className="h-[60px] px-8 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-0 transition-all duration-300"
                size="lg"
              >
                <StopCircle className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                onClick={onSubmit}
                disabled={isDisabled || !prompt.trim()}
                className="h-[60px] px-8 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                <Send className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Helper text */}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 rounded-md bg-muted border border-border font-mono text-xs">Enter</kbd>
            <span>to send</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 rounded-md bg-muted border border-border font-mono text-xs">Shift</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 rounded-md bg-muted border border-border font-mono text-xs">Enter</kbd>
            <span>for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
