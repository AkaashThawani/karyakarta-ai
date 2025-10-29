// /src/app/api/socket/log/route.ts
import { NextResponse } from 'next/server';

declare const global: { _io: any; };

export async function POST(req: Request) {
  const body = await req.json();
  
  const io = global._io;
  if (io) {
    // Route custom events to their dedicated channels
    if (body.type === 'browser-status') {
      io.emit('browser-status', body);
    } else if (body.type === 'playwright-log') {
      io.emit('playwright-log', body);
    } else if (body.type && body.message) {
      // Standard agent log with type and message
      io.emit('agent-log', body);
    } else if (body.message) {
      // Wrap message-only in structure
      io.emit('agent-log', {
        type: 'status',
        message: body.message,
        timestamp: new Date().toISOString()
      });
    } else {
      // Legacy support for plain string
      io.emit('agent-log', {
        type: 'status',
        message: body,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return NextResponse.json({ success: true });
}
