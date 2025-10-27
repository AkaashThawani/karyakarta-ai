'use client';

/**
 * Session List Component
 * 
 * Displays the list of chat sessions grouped by date with collapsible sections.
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SessionItem } from './session-item';
import { useSession } from '@/contexts/session-context';
import { Session } from '@/lib/supabase';

export function SessionList() {
  const { sessions, currentSession, switchSession, deleteSession, loading } = useSession();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Don't show loading text - it will update silently
  if (loading) {
    return null;
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          No sessions yet. Start a new chat!
        </p>
      </div>
    );
  }

  // Group sessions by date
  const groupedSessions = groupSessionsByDate(sessions);

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedSessions).map(([dateLabel, sessionList]) => {
        const isCollapsed = collapsedSections.has(dateLabel);
        
        return (
          <div key={dateLabel} className="space-y-1">
            <button
              onClick={() => toggleSection(dateLabel)}
              className="w-full flex items-center gap-2 px-3 py-1 hover:bg-muted/50 rounded transition-colors group"
            >
              {isCollapsed ? (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              )}
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {dateLabel}
              </h3>
              <span className="text-xs text-muted-foreground/60">
                ({sessionList.length})
              </span>
            </button>
            
            {!isCollapsed && (
              <div className="space-y-1">
                {sessionList.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={currentSession?.id === session.id}
                    onSelect={() => switchSession(session.id)}
                    onDelete={() => deleteSession(session.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function groupSessionsByDate(sessions: Session[]): Record<string, Session[]> {
  const groups: Record<string, Session[]> = {
    Today: [],
    Yesterday: [],
    'Last 7 Days': [],
    'Last 30 Days': [],
    Older: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  sessions.forEach((session) => {
    const sessionDate = new Date(session.updated_at);
    const sessionDay = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate()
    );

    if (sessionDay.getTime() === today.getTime()) {
      groups.Today.push(session);
    } else if (sessionDay.getTime() === yesterday.getTime()) {
      groups.Yesterday.push(session);
    } else if (sessionDay > sevenDaysAgo) {
      groups['Last 7 Days'].push(session);
    } else if (sessionDay > thirtyDaysAgo) {
      groups['Last 30 Days'].push(session);
    } else {
      groups.Older.push(session);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach((key) => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}
