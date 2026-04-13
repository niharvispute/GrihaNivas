'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function UserSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const displayName = user?.name || user?.email || 'Your Account';
  const avatarSrc = user?.profilePictureUrl || user?.photoURL || user?.imageUrl || null;
  const roleLabel = user?.role ? `${user.role} Member` : 'Account Member';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const navLinks = [
    { name: 'My Dashboard', href: '/account', icon: 'dashboard' },
    { name: 'Saved Properties', href: '/account/saved', icon: 'bookmark' },
    { name: 'My Enquiries', href: '/account/enquiries', icon: 'chat_bubble' },
    { name: 'My Profile', href: '/account/profile', icon: 'person' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col p-4 bg-white border-r border-neutral-200 z-50">
      {/* Brand Logo */}
      <div className="px-4 py-8">
        <Link href="/" className="text-2xl font-black text-primary tracking-tighter font-heading">
          Bricks<span className="text-slate-900">.</span>
        </Link>
      </div>

      {/* Header Profile */}
      <div className="flex flex-col items-center gap-2 mb-8 px-4">
        <div className="relative group">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-linear-to-br from-primary/10 via-white to-tertiary/60 ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all duration-300 flex items-center justify-center text-primary font-black text-sm">
            {avatarSrc ? (
              <img
                alt={displayName}
                className="w-full h-full object-cover"
                src={avatarSrc}
              />
            ) : (
              <span>{initials || 'U'}</span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="text-center">
          <p className="font-heading text-base font-bold text-slate-900">{displayName}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{roleLabel}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href}
              href={link.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-heading text-sm font-bold transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/5 text-primary border-r-4 border-primary' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto">
        <button
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-bold transition-all duration-200"
          onClick={logout}
          type="button"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
