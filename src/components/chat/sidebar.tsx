"use client";

import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useSession } from "@/contexts/session-context";
import { SessionList } from "./session-list";

export function Sidebar() {
  const { user } = useAuth();
  const { createNewSession } = useSession();

  // Hide sidebar if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="w-64 border-r border-border bg-muted/50 flex flex-col h-full">
      {/* Header with User Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Chat History
        </h3>
        <SessionList />
      </div>

      {/* Footer with New Chat Button */}
      <div className="p-4 border-t border-border space-y-3">
        <Button
          onClick={createNewSession}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Chat
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          KaryaKarta AI v1.0
        </p>
      </div>
    </div>
  );
}
