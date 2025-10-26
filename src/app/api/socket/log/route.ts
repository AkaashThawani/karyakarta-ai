// /src/app/api/socket/log/route.ts
import { NextResponse } from 'next/server';

declare const global: { _io: any; };

export async function POST(req: Request) {
  const body = await req.json();
  
  const io = global._io;
  if (io) {
    // If message is already structured with type, message, and timestamp, emit it as-is
    // Otherwise wrap it in a structure for compatibility
    if (body.type && body.message) {
      io.emit('agent-log', body);
    } else if (body.message) {
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
