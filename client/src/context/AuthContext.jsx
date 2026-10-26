import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const data = await api.getMe();
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      // In single-user local mode, backend falls back to default seeded user
      try {
        const profile = await api.getProfile();
        setUser(profile);
      } catch (e) {
        console.warn('Could not auto-fetch user profile:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    if (data.token) {
      localStorage.setItem('gym_token', data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    if (data.token) {
      localStorage.setItem('gym_token', data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('gym_token');
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
