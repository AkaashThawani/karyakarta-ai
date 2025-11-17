const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';

// IMPORTANT: bind to 0.0.0.0 and dynamic Render port
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

// Create the Next.js app instance
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // FIX: Add CORS!
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // or specific frontend URL
      methods: ["GET", "POST"],
    }
  });

  global._io = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    socket.emit('status', 'Successfully connected to the agent server.');
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  httpServer
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    })
    .on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
});
