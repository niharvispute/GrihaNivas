'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';

export default function Providers({ children }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
