const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

// Initialize Socket.IO server with JWT authentication
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  // Socket authentication middleware - verify JWT before allowing connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // Handle new connections
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user.id} (${socket.user.role})`);

    // Join personal room for targeted updates
    socket.join(`user:${socket.user.id}`);

    // Admin joins admin room to receive all order notifications
    if (socket.user.role === 'admin') {
      socket.join('admin');
    }

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

// Get the Socket.IO instance (returns null on Vercel serverless where Socket.IO isn't available)
const getIO = () => {
  return io || null;
};

module.exports = { initSocket, getIO };
