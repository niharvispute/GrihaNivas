'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthGuard({ children, requireAdmin = false }) {
  const { user, loadingUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loadingUser) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (requireAdmin && user.role?.toLowerCase() !== 'admin') {
      router.replace('/account');
    }
  }, [user, loadingUser, requireAdmin, router]);

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requireAdmin && user.role?.toLowerCase() !== 'admin') return null;

  return <>{children}</>;
}
