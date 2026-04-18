'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  { label: 'Buy', href: '/buy' },
  { label: 'Rent', href: '/rent' },
  { label: 'New Launch', href: '/new-launch' },
  { label: 'Builders', href: '/builders' },
  { label: 'Blogs', href: '/blogs' },
];

export default function Header() {
  const { user, loadingUser, openModal, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  const displayName = user?.name || user?.email || 'Account';
  const avatarSrc = user?.profilePictureUrl || user?.photoURL || user?.imageUrl || null;
  const normalizedRole = typeof user?.role === 'string' ? user.role.toLowerCase() : '';
  const accountHref = normalizedRole === 'admin' ? '/admin' : '/account';

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isAccountMenuOpen) return;
    const handleOutsideClick = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAccountMenuOpen]);

  const handleOpenLogin = () => {
    setIsMobileMenuOpen(false);
    try {
      openModal('login');
    } catch {
      router.push('/login');
    }
  };

  const handleListProperty = () => {
    setIsMobileMenuOpen(false);
    if (user) {
      router.push('/list-property');
    } else {
      openModal('login');
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsAccountMenuOpen(false);
  };

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      <header className="sticky top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-gray-100/50 shadow-sm">
        <div className="flex justify-between items-center px-5 md:px-8 py-4 max-w-screen-2xl mx-auto">
          {/* Brand Logo */}
          <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 shrink-0">
            Mumbai Editorial
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-semibold tracking-tight text-sm text-slate-600">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-2 border-b-2 transition-colors ${
                  isActive(link.href)
                    ? 'text-primary border-primary'
                    : 'border-transparent hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex shrink-0 items-center gap-3 sm:gap-4">
              {loadingUser ? (
                <div className="w-24 h-8 rounded-full bg-slate-100 animate-pulse" />
              ) : user ? (
                <div ref={accountMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                    aria-expanded={isAccountMenuOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-3 py-2 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
                  >
                    <span className="hidden xl:block max-w-35 truncate text-sm font-semibold text-slate-700">
                      {displayName}
                    </span>
                    <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-primary/10 via-white to-tertiary/60 text-primary ring-1 ring-slate-200 transition-transform hover:scale-105">
                      {avatarSrc ? (
                        <Image
                          src={avatarSrc}
                          alt={displayName}
                          fill
                          sizes="44px"
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-2xl">person</span>
                      )}
                    </span>
                  </button>

                  {/* Account Dropdown */}
                  <div
                    className={`absolute right-0 top-full z-50 pt-3 transition-all duration-200 ${
                      isAccountMenuOpen
                        ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
                        : 'pointer-events-none translate-y-2 scale-95 opacity-0'
                    }`}
                  >
                    <div className="w-64">
                      <div className="absolute right-6 -top-2 h-4 w-4 rotate-45 border-l border-t border-slate-100 bg-white/95" />
                      <div className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white/95 shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
                        <div className="border-b border-slate-100 px-5 py-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Signed in as</p>
                          <p className="mt-1 truncate font-heading text-sm font-black tracking-tight text-slate-900">
                            {displayName}
                          </p>
                        </div>
                        <div className="p-2">
                          <Link
                            href={accountHref}
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
                          >
                            <span className="material-symbols-outlined text-xl text-primary">person</span>
                            <span>My Account</span>
                          </Link>
                          <Link
                            href="/account/saved"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
                          >
                            <span className="material-symbols-outlined text-xl text-primary">favorite</span>
                            <span>Wishlist</span>
                          </Link>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-600 transition-all hover:bg-red-50 hover:text-red-600"
                          >
                            <span className="material-symbols-outlined text-xl">logout</span>
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors"
                >
                  Login / Register
                </button>
              )}

              <button
                onClick={handleListProperty}
                className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold tracking-tight hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                List Property
              </button>
            </div>
          </div>

          {/* Mobile: Login + Hamburger */}
          <div className="flex md:hidden items-center gap-3">
            {!loadingUser && !user && (
              <button
                type="button"
                onClick={handleOpenLogin}
                className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors"
              >
                Login
              </button>
            )}
            {!loadingUser && user && (
              <Link href={accountHref} className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary ring-1 ring-slate-200">
                {avatarSrc ? (
                  <Image src={avatarSrc} alt={displayName} fill sizes="36px" unoptimized className="object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-xl">person</span>
                )}
              </Link>
            )}
            <button
              type="button"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="flex flex-col justify-center items-center w-10 h-10 rounded-xl border border-slate-200 bg-white gap-1.5 transition-all hover:border-primary/30"
            >
              <span className={`block w-5 h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Slide-in panel */}
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <span className="text-lg font-black tracking-tighter text-slate-900">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/30 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Panel Footer */}
          <div className="px-4 pb-8 space-y-3 border-t border-slate-100 pt-6">
            <button
              onClick={handleListProperty}
              className="w-full bg-primary text-white py-3.5 rounded-full font-bold text-sm tracking-tight hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              List Your Property
            </button>
            {user ? (
              <button
                type="button"
                onClick={async () => { setIsMobileMenuOpen(false); await logout(); }}
                className="w-full border-2 border-slate-200 text-slate-600 py-3.5 rounded-full font-bold text-sm hover:border-red-200 hover:text-red-600 transition-all"
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenLogin}
                className="w-full border-2 border-slate-200 text-slate-700 py-3.5 rounded-full font-bold text-sm hover:border-primary/30 hover:text-primary transition-all"
              >
                Login / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
