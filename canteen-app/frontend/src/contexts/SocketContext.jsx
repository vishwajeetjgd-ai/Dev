import { createContext, useState, useEffect, useCallback } from 'react';
import { getSocket } from '../socket/socketClient';

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      const socket = getSocket();
      if (socket) {
        setIsConnected(socket.connected);
        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 2000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to a socket event
  const on = useCallback((event, callback) => {
    const socket = getSocket();
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => {};
  }, []);

  // Emit a socket event
  const emit = useCallback((event, data) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ isConnected, on, emit }}>
      {children}
    </SocketContext.Provider>
  );
}
