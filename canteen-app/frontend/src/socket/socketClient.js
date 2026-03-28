import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/constants';

let socket = null;

// Connect to Socket.IO server with JWT auth
// On Vercel (serverless), Socket.IO won't be available - fails silently
export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  try {
    socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 5000,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', (err) => {
      console.log('Socket connection not available (serverless mode):', err.message);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  } catch (err) {
    console.log('Socket.IO not available');
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
