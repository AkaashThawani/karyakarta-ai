// /src/app/api/agent/run/route.ts
import { NextResponse } from 'next/server';

declare const global: { _io: any; };

const PYTHON_AGENT_URL = 'http://localhost:8000/execute-task';

export async function POST(req: Request) {
  const { prompt, messageId, sessionId } = await req.json();
  console.log(`[API Route] Received request:`, { prompt, messageId, sessionId });

  const io = global._io;
  
  // Emit with messageId for tracking
  io?.emit('agent-log', {
    type: 'status',
    message: 'Forwarding task to Python agent...',
    timestamp: new Date().toISOString(),
    messageId
  });

  try {
    // Call the Python FastAPI server with messageId and sessionId
    const pythonResponse = await fetch(PYTHON_AGENT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt,
        messageId,
        sessionId: sessionId || 'default'
      }),
    });

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      throw new Error(`Python agent error: ${pythonResponse.statusText} - ${errorText}`);
    }

    const result = await pythonResponse.json();
    console.log('[API Route] Python agent responded:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Agent task started.',
      messageId: result.messageId,
      sessionId: result.sessionId
    });

  } catch (error) {
    console.error('[API Route] Error calling Python agent:', error);
    
    io?.emit('agent-log', {
      type: 'error',
      message: 'Error: Could not connect to the Python agent.',
      timestamp: new Date().toISOString(),
      messageId
    });
    
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to start agent task.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
