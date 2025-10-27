/**
 * Supabase Client Configuration
 * 
 * Creates and exports Supabase client instances for browser and server use.
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
  );
}

/**
 * Supabase client for browser use
 * 
 * This client uses the anon key which is safe to expose in the browser.
 * Row Level Security (RLS) policies ensure users can only access their own data.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Type definitions for our database schema
 */
export interface Session {
  id: string;
  user_id: string;
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  message_count: number;
  total_tokens: number;
  is_archived: boolean;
  metadata: Record<string, any>;
}

export interface Message {
  id: string;
  session_id: string;
  message_id: string;
  role: 'user' | 'agent';
  content: string;
  created_at: string;
  tokens: number;
  metadata: Record<string, any>;
  is_summarized: boolean;
  summary: string | null;
}

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: Session;
        Insert: Omit<Session, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Session, 'id' | 'created_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id' | 'created_at'>>;
      };
    };
  };
}
