import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
const PYTHON_CANCEL_URL = `${API_URL}/cancel-task`;

export async function POST(req: Request) {
  const { messageId } = await req.json();
  console.log(`[Cancel API Route] Received cancellation request for: ${messageId}`);

  try {
    // Call the Python FastAPI server to cancel the task
    const pythonResponse = await fetch(PYTHON_CANCEL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId }),
    });

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      throw new Error(`Python agent error: ${pythonResponse.statusText} - ${errorText}`);
    }

    const result = await pythonResponse.json();
    console.log('[Cancel API Route] Python agent responded:', result);
    
    return NextResponse.json({ 
      success: true, 
      status: result.status,
      message: result.message
    });

  } catch (error) {
    console.error('[Cancel API Route] Error cancelling task:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to cancel task',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
