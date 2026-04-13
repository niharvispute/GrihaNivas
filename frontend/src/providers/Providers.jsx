'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import Toaster from '@/components/common/Toaster';

const GOOGLE_CLIENT_ID = String(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim();

function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
        <Toaster />
      </ToastProvider>
    </AuthProvider>
  );
}

export default function Providers({ children }) {
  if (!GOOGLE_CLIENT_ID) {
    return <AppProviders>{children}</AppProviders>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppProviders>{children}</AppProviders>
    </GoogleOAuthProvider>
  );
}
