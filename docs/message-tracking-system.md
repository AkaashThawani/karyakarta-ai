# Message Tracking System Architecture

## Overview
This document outlines the architecture for implementing a robust message ID tracking system to prevent duplicate messages and enable reliable communication between the UI and backend.

## Problem Statement
Currently, the system experiences duplicate message rendering due to:
1. React Strict Mode double-invocation in development
2. Potential network retry scenarios
3. Socket.IO event duplication possibilities
4. Lack of message identity tracking

## Solution Architecture

### 1. Message ID Generation

#### Frontend (UI)
```typescript
// Generate unique message ID
const generateMessageId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `msg_${timestamp}_${random}`;
};

// Alternative using crypto API (more secure)
const generateSecureMessageId = (): string => {
  return `msg_${Date.now()}_${crypto.randomUUID()}`;
};
```

#### Backend (Python)
```python
import uuid
from datetime import datetime

def generate_message_id() -> str:
    timestamp = int(datetime.now().timestamp() * 1000)
    unique_id = str(uuid.uuid4())[:8]
    return f"msg_{timestamp}_{unique_id}"
```

### 2. Data Structures

#### Frontend TypeScript Interfaces
```typescript
interface ChatMessage {
  id: string;              // Unique message identifier
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  thoughts?: AgentMessage[];
  status?: 'sending' | 'sent' | 'delivered' | 'error';
}

interface AgentMessage {
  id?: string;             // Optional ID for thoughts
  type: 'status' | 'thinking' | 'response';
  message: string;
  timestamp: string;
}

// Tracking processed messages
const processedMessageIds = useRef<Set<string>>(new Set());
const pendingMessages = useRef<Map<string, ChatMessage>>(new Map());
```

#### Backend Python Data Structure
```python
from typing import Dict, Set
from dataclasses import dataclass
from datetime import datetime

@dataclass
class MessageMetadata:
    message_id: str
    timestamp: datetime
    status: str  # 'pending', 'processing', 'completed', 'error'
    user_prompt: str
    response: Optional[str] = None

# Global tracking
active_messages: Dict[str, MessageMetadata] = {}
processed_message_ids: Set[str] = set()
```

### 3. Implementation Flow

#### Step 1: User Sends Message (Frontend)
```typescript
const handleSubmit = async () => {
  if (!prompt.trim() || !isConnected || isProcessing) return;
  
  // Generate unique message ID
  const messageId = generateMessageId();
  
  const userMessage: ChatMessage = {
    id: messageId,
    role: 'user',
    content: prompt,
    timestamp: new Date().toISOString(),
    status: 'sending'
  };
  
  // Add to chat history
  setChatHistory(prev => [...prev, userMessage]);
  
  // Add to pending messages for tracking
  pendingMessages.current.set(messageId, userMessage);
  
  setCurrentThoughts([]);
  setIsProcessing(true);
  
  const currentPrompt = prompt;
  setPrompt('');

  try {
    // Send message with ID to backend
    await fetch('/api/agent/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: currentPrompt,
        messageId: messageId  // Include message ID
      }),
    });
    
    // Update status
    updateMessageStatus(messageId, 'sent');
  } catch (error) {
    updateMessageStatus(messageId, 'error');
  }
};

const updateMessageStatus = (messageId: string, status: string) => {
  setChatHistory(prev => 
    prev.map(msg => 
      msg.id === messageId ? { ...msg, status } : msg
    )
  );
};
```

#### Step 2: Backend Receives Message (Python)
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

class TaskRequest(BaseModel):
    prompt: str
    messageId: str  # Receive message ID from frontend

@app.post("/execute-task")
async def execute_task(request: TaskRequest):
    message_id = request.messageId
    
    # Check if already processing
    if message_id in active_messages:
        return {"status": "already_processing", "messageId": message_id}
    
    # Check if already processed
    if message_id in processed_message_ids:
        return {"status": "already_completed", "messageId": message_id}
    
    # Store metadata
    active_messages[message_id] = MessageMetadata(
        message_id=message_id,
        timestamp=datetime.now(),
        status='processing',
        user_prompt=request.prompt
    )
    
    try:
        # Emit status with message ID
        await emit_log({
            'type': 'status',
            'message': 'Processing your request...',
            'timestamp': datetime.now().isoformat(),
            'messageId': message_id
        })
        
        # Process the task
        result = await process_agent_task(request.prompt)
        
        # Emit response with message ID
        await emit_log({
            'type': 'response',
            'message': result,
            'timestamp': datetime.now().isoformat(),
            'messageId': message_id
        })
        
        # Mark as completed
        active_messages[message_id].status = 'completed'
        active_messages[message_id].response = result
        processed_message_ids.add(message_id)
        
        return {"status": "success", "messageId": message_id}
        
    except Exception as e:
        active_messages[message_id].status = 'error'
        await emit_log({
            'type': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat(),
            'messageId': message_id
        })
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up after some time
        cleanup_old_messages()
```

#### Step 3: Frontend Receives Response
```typescript
socket.on('agent-log', (data: any) => {
  let messageObj: AgentMessage & { messageId?: string };
  
  if (typeof data === 'string') {
    messageObj = {
      type: 'status',
      message: data,
      timestamp: new Date().toISOString()
    };
  } else {
    messageObj = data;
  }
  
  // Check for message ID
  const messageId = messageObj.messageId;
  
  if (messageObj.type === 'response') {
    // Create response ID for duplicate detection
    const responseId = messageId 
      ? messageId 
      : `${messageObj.timestamp}-${messageObj.message.substring(0, 50)}`;
    
    // Check if already processed
    if (processedMessageIds.current.has(responseId)) {
      console.log('🚫 DUPLICATE RESPONSE - Already processed:', responseId);
      return;
    }
    
    // Mark as processed
    processedMessageIds.current.add(responseId);
    
    // Update pending message if exists
    if (messageId && pendingMessages.current.has(messageId)) {
      pendingMessages.current.delete(messageId);
    }
    
    // Add to chat history
    setCurrentThoughts(prevThoughts => {
      const newMessage: ChatMessage = {
        id: responseId,
        role: 'agent',
        content: messageObj.message,
        timestamp: messageObj.timestamp,
        thoughts: [...prevThoughts],
        status: 'delivered'
      };
      
      setChatHistory(prev => [...prev, newMessage]);
      return [];
    });
    
    setIsProcessing(false);
  } else {
    // Handle status/thinking messages
    setCurrentThoughts(prev => [...prev, messageObj]);
  }
});
```

### 4. Message Cleanup & Maintenance

#### Frontend Cleanup
```typescript
// Clean up old processed message IDs (keep last 100)
const cleanupProcessedMessages = () => {
  if (processedMessageIds.current.size > 100) {
    const idsArray = Array.from(processedMessageIds.current);
    processedMessageIds.current = new Set(idsArray.slice(-100));
  }
};

// Clean up old pending messages (timeout after 30 seconds)
const cleanupPendingMessages = () => {
  const now = Date.now();
  const timeout = 30000; // 30 seconds
  
  pendingMessages.current.forEach((msg, id) => {
    const messageTime = new Date(msg.timestamp).getTime();
    if (now - messageTime > timeout) {
      pendingMessages.current.delete(id);
      // Optionally mark as error in UI
      updateMessageStatus(id, 'error');
    }
  });
};

// Run cleanup periodically
useEffect(() => {
  const interval = setInterval(() => {
    cleanupProcessedMessages();
    cleanupPendingMessages();
  }, 60000); // Every minute
  
  return () => clearInterval(interval);
}, []);
```

#### Backend Cleanup
```python
from datetime import timedelta

def cleanup_old_messages():
    """Remove messages older than 1 hour"""
    now = datetime.now()
    cutoff = now - timedelta(hours=1)
    
    # Clean active messages
    to_remove = [
        msg_id for msg_id, meta in active_messages.items()
        if meta.timestamp < cutoff
    ]
    for msg_id in to_remove:
        del active_messages[msg_id]
    
    # Clean processed IDs (keep last 1000)
    if len(processed_message_ids) > 1000:
        # Convert to list, sort by timestamp, keep newest
        # (In production, use a proper time-based cleanup)
        processed_message_ids.clear()
```

### 5. Benefits of This System

✅ **Duplicate Prevention**: Each message has a unique ID tracked on both sides

✅ **Idempotency**: Repeated requests with same message ID don't cause duplicate processing

✅ **Message Tracking**: Know the status of every message (pending, sent, delivered, error)

✅ **Debugging**: Easy to trace message flow with IDs in logs

✅ **Network Resilience**: Handle retries, reconnections gracefully

✅ **Audit Trail**: Complete history of message IDs and their lifecycle

### 6. Testing Strategy

```typescript
// Test 1: Send multiple messages rapidly
test('handles rapid message sending', async () => {
  const messages = ['msg1', 'msg2', 'msg3'];
  messages.forEach(msg => sendMessage(msg));
  
  // Verify each has unique ID
  // Verify no duplicates in UI
});

// Test 2: Simulate network failure
test('handles network failure gracefully', async () => {
  sendMessage('test');
  // Disconnect socket
  // Reconnect
  // Verify message status updated correctly
});

// Test 3: Duplicate socket events
test('filters duplicate socket events', () => {
  const event = { type: 'response', message: 'test', messageId: 'msg_123' };
  
  handleSocketEvent(event);
  handleSocketEvent(event); // Duplicate
  
  // Verify only one message in chat history
});
```

### 7. Future Enhancements

1. **Persistent Storage**: Store message IDs in localStorage for session recovery
2. **Retry Logic**: Automatic retry for failed messages with exponential backoff
3. **Message Queuing**: Queue messages when offline, send when reconnected
4. **Read Receipts**: Track when messages are read/acknowledged
5. **Message Editing**: Support editing sent messages with new message IDs
6. **Conversation Threading**: Group related messages with parent-child IDs

### 8. Implementation Priority

**Phase 1 (Immediate)**:
- ✅ Fix React Strict Mode issue (already implemented)
- Generate message IDs on frontend
- Pass message IDs to backend

**Phase 2 (Next Sprint)**:
- Backend message tracking
- Deduplication on both sides
- Status updates

**Phase 3 (Future)**:
- Cleanup & maintenance
- Persistent storage
- Advanced features (retry, queuing, etc.)

## Conclusion

This message tracking system provides a robust foundation for reliable message delivery and duplicate prevention. By implementing unique message IDs tracked on both frontend and backend, we ensure message integrity and enable advanced features like retry logic, status tracking, and audit trails.
