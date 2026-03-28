import { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import { connectSocket, disconnectSocket } from '../socket/socketClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On mount: if token exists, validate it by fetching profile
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getProfile();
        setUser(res.data.user);
        connectSocket(token);
      } catch {
        // Token invalid - clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { user: userData, token: newToken } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    connectSocket(newToken);
    return userData;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    const { user: userData, token: newToken, welcomeCoupon } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    connectSocket(newToken);
    return { user: userData, welcomeCoupon };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    disconnectSocket();
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data) => {
    const res = await authService.updateProfile(data);
    setUser(res.data.user);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data.user;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
