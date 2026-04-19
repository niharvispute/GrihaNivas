'use client';

import Image from 'next/image';
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
    <header className="flex justify-between items-center h-16 sm:h-20 px-4 sm:px-6 md:px-8 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-100 shadow-sm">
      {/* Hamburger - Mobile Only */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          title="Open Navigation"
        >
          <span className="material-symbols-outlined text-2xl text-slate-900">menu</span>
        </button>
      </div>

      {/* Spacer for desktop */}
      <div className="hidden md:block flex-1"></div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden sm:block h-8 w-px bg-slate-100"></div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{displayName}</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter mt-1">Active Now</p>
          </div>
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary/10 hover:border-primary transition-colors cursor-pointer bg-linear-to-br from-primary/10 via-white to-tertiary/60 flex items-center justify-center text-primary font-black text-xs flex-none">
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
