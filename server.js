const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Create the Next.js app instance
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create our custom HTTP server
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    // Let Next.js handle all requests
    handle(req, res, parsedUrl);
  });

  // Attach Socket.IO to our custom server
  const io = new Server(httpServer);

  // Store the io instance in a global variable to be accessed from API routes
  global._io = io;

  // Listen for new client connections
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    socket.emit('status', 'Successfully connected to the agent server.');
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  // Start the server
  httpServer
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    })
    .on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
});