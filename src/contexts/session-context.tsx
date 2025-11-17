'use client';

/**
 * Session Context
 * 
 * Manages chat sessions and their state throughout the application.
 * Handles session creation, switching, and message management.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { Session } from '@/lib/supabase';

interface SessionContextType {
  sessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  createNewSession: () => Promise<Session | null>;
  switchSession: (sessionId: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);

  // Debounce duration: 5 minutes in milliseconds
  const REFRESH_DEBOUNCE_MS = 5 * 60 * 1000;

  // Load user sessions when authenticated with debouncing
  useEffect(() => {
    console.log('🔍 Session Context - User changed:', user);
    console.log('🔍 Session Context - User ID:', user?.id);
    console.log('🔍 API_URL being used:', API_URL);
    // Check what API URL is actually being used
    console.log('API_URL:', process.env.NEXT_PUBLIC_API_URL);

    // Check all env vars
    console.log('All env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')));

    if (user) {
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTime;

      // Only refresh if initial load or more than 5 minutes have passed
      if (initialLoad || timeSinceLastRefresh >= REFRESH_DEBOUNCE_MS) {
        console.log('🔍 Session Context - Loading sessions for user:', user.id);
        loadSessions();
        setLastRefreshTime(now);
      }
    } else {
      console.log('🔍 Session Context - No user, clearing sessions');
      setSessions([]);
      setCurrentSession(null);
      setLoading(false);
      setInitialLoad(true);
      setLastRefreshTime(0);
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;

    // Show loading only on initial load
    if (initialLoad) {
      setLoading(true);
    }

    try {
      const response = await fetch(`${API_URL}/sessions/?user_id=${user.id}`);

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);

        // If no current session, create one
        if (!currentSession && data.sessions.length === 0) {
          await createNewSession();
        } else if (!currentSession && data.sessions.length > 0) {
          // Set most recent session as current
          setCurrentSession(data.sessions[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      if (initialLoad) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  };

  const createNewSession = async (): Promise<Session | null> => {
    if (!user) return null;

    try {
      const response = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          title: 'New Chat',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newSession = data.session;

        setSessions((prev) => [newSession, ...prev]);
        setCurrentSession(newSession);

        return newSession;
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }

    return null;
  };

  const switchSession = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  };

  const updateSessionTitle = async (sessionId: string, title: string) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedSession = data.session;

        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? updatedSession : s))
        );

        if (currentSession?.id === sessionId) {
          setCurrentSession(updatedSession);
        }
      }
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));

        // If deleted current session, switch to another or create new
        if (currentSession?.id === sessionId) {
          const remainingSessions = sessions.filter((s) => s.id !== sessionId);
          if (remainingSessions.length > 0) {
            setCurrentSession(remainingSessions[0]);
          } else {
            await createNewSession();
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const value = {
    sessions,
    currentSession,
    loading,
    createNewSession,
    switchSession,
    loadSessions,
    updateSessionTitle,
    deleteSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
