'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { useEffect } from 'react';
import { useMyListingsSummary } from '@/hooks/useMyListingsSummary';

export default function UserSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const { hasListings } = useMyListingsSummary(user, { enabled: Boolean(user) });

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

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
    { name: 'Comparison', href: '/compare', icon: 'compare' },
    { name: 'My Enquiries', href: '/account/enquiries', icon: 'chat_bubble' },
    ...(hasListings ? [{ name: 'My Listings', href: '/account/listings', icon: 'domain' }] : []),
    { name: 'My Profile', href: '/account/profile', icon: 'person' },
  ];

  const SidebarContent = () => (
    <>
      {/* Brand Logo */}
      <div className="px-4 py-6 md:py-8 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-primary tracking-tighter font-heading">
          Bricks<span className="text-slate-900">.</span>
        </Link>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1"
        >
          <span className="material-symbols-outlined text-2xl text-slate-600">close</span>
        </button>
      </div>

      {/* Header Profile */}
      <div className="flex flex-col items-center gap-2 mb-8 px-4">
        <div className="relative group">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-linear-to-br from-primary/10 via-white to-tertiary/60 ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all duration-300 flex items-center justify-center text-primary font-black text-sm">
            {avatarSrc ? (
              <Image
                alt={displayName}
                src={avatarSrc}
                fill
                sizes="64px"
                unoptimized
                className="w-full h-full object-cover"
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
      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg md:rounded-xl font-heading text-sm font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              onClick={() => setIsMobileOpen(false)}
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
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg md:rounded-xl text-sm font-bold transition-all duration-200"
          onClick={logout}
          type="button"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:flex md:flex-col md:p-4 md:bg-white md:border-r md:border-neutral-200 md:z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 flex flex-col bg-white z-50 md:hidden transition-transform duration-300 ease-out overflow-y-auto ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
