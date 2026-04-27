'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function DashboardHeader() {
  const { user } = useAuth();
  const { setIsMobileOpen } = useSidebar();
  const displayName = user?.name || user?.email || 'Your Account';
  const avatarSrc = user?.profilePictureUrl || user?.photoURL || user?.imageUrl || null;
  const initials = getInitials(displayName);

  return (
    <header className="flex justify-between items-center h-16 sm:h-20 px-4 sm:px-6 md:px-8 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      {/* Hamburger + Back to Home - Mobile */}
      <div className="md:hidden flex items-center gap-2">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          title="Open Navigation"
        >
          <span className="material-symbols-outlined text-2xl text-slate-900">menu</span>
        </button>
        <Link
          href="/"
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary transition-colors px-2 py-1.5 rounded-xl hover:bg-slate-100"
        >
          <span className="material-symbols-outlined text-base">home</span>
          <span className="hidden sm:inline">Home</span>
        </Link>
      </div>

      {/* Back to Home — desktop */}
      <div className="hidden md:flex flex-1 items-center">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors group"
        >
          <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          Back to Home
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden sm:block h-8 w-px bg-slate-100"></div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{displayName}</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter mt-1">Active Now</p>
          </div>
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary/10 hover:border-primary transition-colors cursor-pointer bg-gradient-to-br from-primary/10 via-white to-tertiary/60 flex items-center justify-center text-primary font-black text-xs flex-none">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={displayName}
                fill
                sizes="40px"
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials || 'U'}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
