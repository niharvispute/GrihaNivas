'use client';
import { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import Toaster from '@/components/common/Toaster';
import { getSystemBootstrap } from '@/services/systemService';

export default function Providers({ children }) {
  useEffect(() => {
    getSystemBootstrap().catch(() => {
      // Keep app boot resilient when system bootstrap is unavailable.
    });
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        {children}
        <Toaster />
      </ToastProvider>
    </AuthProvider>
  );
}
