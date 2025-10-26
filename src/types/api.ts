/**
 * API Type Definitions for KaryaKarta Agent
 * 
 * DO NOT MODIFY MANUALLY
 * These types mirror the backend Pydantic models
 * Last synced: 2025-10-25
 * Version: 1.0.0
 */

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Request to execute an agent task
 */
export interface TaskRequest {
  prompt: string;           // User's message/query
  messageId: string;        // Unique message ID (format: msg_{timestamp}_{random})
  sessionId?: string;       // Optional session ID (default: "default")
}

/**
 * Response from task execution
 */
export interface TaskResponse {
  status: "success" | "error" | "already_processing" | "already_completed";
  messageId: string;        // Echo back the message ID
  sessionId: string;        // Session ID used
  error?: string;           // Error message if status is "error"
}

// ============================================================================
// WEBSOCKET MESSAGE TYPES
// ============================================================================

/**
 * Message types for WebSocket communication
 */
export type MessageType = "status" | "thinking" | "response" | "error";

/**
 * Base message structure for all WebSocket messages
 */
export interface BaseMessage {
  type: MessageType;
  message: string;
  timestamp: string;        // ISO 8601 format
  messageId?: string;       // Links to original request (optional for status/thinking)
}

/**
 * Status update message
 * Used for: "Searching...", "Processing...", etc.
 */
export interface StatusMessage extends BaseMessage {
  type: "status";
  message: string;
  timestamp: string;
  messageId?: string;
}

/**
 * Agent thinking message
 * Shows agent's reasoning process
 */
export interface ThinkingMessage extends BaseMessage {
  type: "thinking";
  message: string;
  timestamp: string;
  messageId?: string;
}

/**
 * Final response message
 * The agent's complete answer to the user's query
 */
export interface ResponseMessage extends BaseMessage {
  type: "response";
  message: string;
  timestamp: string;
  messageId: string;        // REQUIRED for deduplication
}

/**
 * Error message
 */
export interface ErrorMessage extends BaseMessage {
  type: "error";
  message: string;
  timestamp: string;
  messageId?: string;
  errorCode?: string;       // Optional error code
}

/**
 * Union type for all possible agent messages
 */
export type AgentMessage = 
  | StatusMessage 
  | ThinkingMessage 
  | ResponseMessage 
  | ErrorMessage;

// ============================================================================
// CHAT TYPES
// ============================================================================

/**
 * Message status for tracking
 */
export type MessageStatus = "sending" | "sent" | "delivered" | "error";

/**
 * Chat message role
 */
export type ChatRole = "user" | "agent";

/**
 * Complete chat message with metadata
 */
export interface ChatMessage {
  id: string;                    // Message ID
  role: ChatRole;               // Who sent the message
  content: string;              // Message content
  timestamp: string;            // ISO 8601 timestamp
  thoughts?: AgentMessage[];    // Agent's thinking process (for agent messages)
  status?: MessageStatus;       // Delivery status (for user messages)
}

// ============================================================================
// SESSION TYPES
// ============================================================================

/**
 * Session state
 */
export interface SessionState {
  sessionId: string;
  createdAt: string;            // ISO 8601 timestamp
  lastActivity: string;         // ISO 8601 timestamp
  messageCount: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * API error response
 */
export interface APIError {
  detail: string;
  statusCode: number;
  timestamp: string;
}

/**
 * Type guard: Check if message is a response
 */
export function isResponseMessage(message: AgentMessage): message is ResponseMessage {
  return message.type === "response";
}

/**
 * Type guard: Check if message is an error
 */
export function isErrorMessage(message: AgentMessage): message is ErrorMessage {
  return message.type === "error";
}

/**
 * Type guard: Check if message is a status update
 */
export function isStatusMessage(message: AgentMessage): message is StatusMessage {
  return message.type === "status";
}

/**
 * Type guard: Check if message is thinking
 */
export function isThinkingMessage(message: AgentMessage): message is ThinkingMessage {
  return message.type === "thinking";
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique message ID
 * Format: msg_{timestamp}_{random}
 */
export const generateMessageId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `msg_${timestamp}_${random}`;
};

/**
 * Generate a unique session ID
 * Format: session_{identifier}_{timestamp}
 */
export const generateSessionId = (identifier: string = "default"): string => {
  const timestamp = Date.now();
  return `session_${identifier}_${timestamp}`;
};

/**
 * Validate message ID format
 */
export const isValidMessageId = (messageId: string): boolean => {
  const pattern = /^msg_\d{13}_[a-z0-9]{7,8}$/;
  return pattern.test(messageId);
};

/**
 * Validate session ID format
 */
export const isValidSessionId = (sessionId: string): boolean => {
  const pattern = /^session_.+_\d{13}$/;
  return pattern.test(sessionId);
};

/**
 * Parse timestamp to Date object
 */
export const parseTimestamp = (timestamp: string): Date => {
  return new Date(timestamp);
};

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = parseTimestamp(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  EXECUTE_TASK: '/api/agent/run',
  HEALTH: '/health',
} as const;

/**
 * WebSocket events
 */
export const WS_EVENTS = {
  AGENT_LOG: 'agent-log',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  SESSION_ID: 'default',
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
} as const;
