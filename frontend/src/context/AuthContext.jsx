'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout as logoutService } from '@/services/authService';
import { clearTokens, hasSession } from '@/lib/auth/tokenStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Restore session on mount
  useEffect(() => {
    if (hasSession()) {
      getCurrentUser()
        .then((data) => { if (data) setUser(data); })
        .catch(() => clearTokens())
        .finally(() => setLoadingUser(false));
    } else {
      setLoadingUser(false);
    }
  }, []);

  const openModal = (v = 'login') => {
    setView(v);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const onAuthSuccess = (userData) => {
    setUser(userData);
    closeModal();
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (_) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isOpen, view, setView, user, loadingUser, openModal, closeModal, onAuthSuccess, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
