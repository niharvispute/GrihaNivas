'use client';

import { useAuth } from '@/context/AuthContext';

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
  const displayName = user?.name || user?.email || 'Your Account';
  const avatarSrc = user?.profilePictureUrl || user?.photoURL || user?.imageUrl || null;
  const initials = getInitials(displayName);

  return (
    <header className="flex justify-between items-center h-20 px-8 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-100 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 text-slate-400 focus-within:text-primary transition-all group bg-slate-50 px-4 py-2 rounded-full border border-slate-100 focus-within:bg-white focus-within:shadow-inner">
          <span className="material-symbols-outlined text-xl group-focus-within:scale-110 transition-transform">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-80 placeholder:text-slate-400 text-slate-900 font-medium" 
            placeholder="Search properties, enquiries..." 
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="h-8 w-px bg-slate-100 mx-2"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{displayName}</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter mt-1">Active Now</p>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/10 hover:border-primary transition-colors cursor-pointer bg-linear-to-br from-primary/10 via-white to-tertiary/60 flex items-center justify-center text-primary font-black text-xs">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={displayName}
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
