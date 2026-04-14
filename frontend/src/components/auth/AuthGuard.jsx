'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthGuard({ children, requireAdmin = false }) {
  const { user, loadingUser } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const safeReplace = (href) => {
    try {
      router.replace(href);
    } catch {
      if (typeof window !== 'undefined') {
        window.location.replace(href);
      }
    }
  };

  useEffect(() => {
    if (!isMounted || loadingUser) return;
    if (!user) {
      safeReplace('/login');
      return;
    }
    if (requireAdmin && user.role?.toLowerCase() !== 'admin') {
      safeReplace('/account');
    }
  }, [user, loadingUser, requireAdmin, isMounted]);

  if (!isMounted || loadingUser) {
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
