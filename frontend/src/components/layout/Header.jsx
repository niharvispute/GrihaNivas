'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
const NAV_LINKS = [
  { label: 'BUY', href: '/buy' },
  { label: 'RENT', href: '/rent' },
  { label: 'NEW LAUNCH', href: '/new-launch' },
  { label: 'BUILDERS', href: '/builders' },
  { label: 'BLOGS', href: '/blogs' },
];

const CONTACT_LINK = { label: 'CONTACT', href: '/contact' };

const SERVICE_LINKS = [
  { label: 'Home Loan', href: '/home-loan', icon: 'account_balance' },
  { label: 'EMI Calculator', href: '/emi-calculator', icon: 'calculate' },
  { label: 'Stamp Duty', href: '/stamp-duty', icon: 'receipt_long' },
  { label: 'Rent Agreement', href: '/rent-agreement', icon: 'description' },
  { label: 'Comparison', href: '/compare', icon: 'compare' },
];

export default function Header() {
  const { user, loadingUser, openModal, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const servicesMenuRef = useRef(null);

  const displayName = user?.name || user?.email || 'Account';
  const avatarSrc = user?.profilePictureUrl || user?.photoURL || user?.imageUrl || null;
  const normalizedRole = typeof user?.role === 'string' ? user.role.toLowerCase() : '';
  const accountHref = normalizedRole === 'admin' ? '/admin' : '/account';

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsServicesMenuOpen(false);
    setIsMobileServicesOpen(false);
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
    if (!isAccountMenuOpen && !isServicesMenuOpen) return;
    const handleOutsideClick = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
      if (servicesMenuRef.current && !servicesMenuRef.current.contains(event.target)) {
        setIsServicesMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
        setIsServicesMenuOpen(false);
        setIsMobileServicesOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAccountMenuOpen, isServicesMenuOpen]);

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
    if (href === '/new-launch') {
      return (pathname === '/new-launch') ||
        (pathname === '/buy' && searchParams.get('category') === 'new_launch');
    }
    if (href === '/buy') {
      return pathname === '/buy' && searchParams.get('category') !== 'new_launch';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isServicesActive = SERVICE_LINKS.some((service) => isActive(service.href));

  return (
    <>
      <header className="sticky top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-gray-100/50 shadow-sm">
        <div className="grid grid-cols-2 nav:grid-cols-[auto_1fr_auto] items-center gap-x-4 lg:gap-x-6 px-5 md:px-8 py-4 max-w-screen-2xl mx-auto">
          {/* Brand Logo */}
          <div className="flex justify-start min-w-0">
            <Link href="/" className="text-lg nav:text-2xl font-black tracking-tighter text-slate-900 shrink-0 font-heading truncate">
              GrihaNivas
            </Link>
          </div>

          {/* Desktop Navigation Links (Column 2) */}
          <nav className="hidden nav:flex items-center justify-center gap-4 lg:gap-6 font-bold text-[11px] lg:text-xs text-slate-600 uppercase tracking-widest whitespace-nowrap font-body min-w-0 overflow-visible">
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

            <div
              ref={servicesMenuRef}
              className="relative"
              onMouseEnter={() => setIsServicesMenuOpen(true)}
              onMouseLeave={() => setIsServicesMenuOpen(false)}
            >
              <button
                type="button"
                aria-expanded={isServicesMenuOpen}
                aria-haspopup="true"
                onClick={() => setIsServicesMenuOpen((prev) => !prev)}
                className={`flex items-center gap-1 py-2 border-b-2 transition-colors font-bold uppercase tracking-widest ${
                  isServicesActive
                    ? 'text-primary border-primary'
                    : 'border-transparent hover:text-primary'
                }`}
              >
                <span>SERVICES</span>
                <span className={`material-symbols-outlined text-sm transition-transform ${isServicesMenuOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              <div
                className={`absolute left-1/2 top-full pt-3 w-72 -translate-x-1/2 transition-all duration-200 ${
                  isServicesMenuOpen
                    ? 'pointer-events-auto translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-1 opacity-0'
                }`}
              >
                <div className="rounded-2xl border border-slate-100 bg-white/95 p-2 shadow-2xl shadow-slate-200/70 backdrop-blur-xl">
                  {SERVICE_LINKS.map((service) => (
                    <Link
                      key={service.href}
                      href={service.href}
                      onClick={() => setIsServicesMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                        isActive(service.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg text-primary">{service.icon}</span>
                      <span>{service.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href={CONTACT_LINK.href}
              className={`py-2 border-b-2 transition-colors ${
                isActive(CONTACT_LINK.href)
                  ? 'text-primary border-primary'
                  : 'border-transparent hover:text-primary'
              }`}
            >
              {CONTACT_LINK.label}
            </Link>
          </nav>

          {/* Desktop Actions (Column 3) */}
          <div className="hidden nav:flex justify-end items-center gap-3 lg:gap-4 shrink-0">
            {loadingUser ? (
              <div className="w-24 h-8 rounded-full bg-slate-100 animate-pulse" />
            ) : user ? (
              <div ref={accountMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md min-w-[140px] justify-between"
                >
                  <span className="max-w-35 truncate text-[10px] font-black text-slate-700 uppercase tracking-widest">
                    {displayName}
                  </span>
                  <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/10 via-white to-tertiary/60 text-primary ring-1 ring-slate-200 transition-transform hover:scale-105">
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt={displayName}
                        fill
                        sizes="32px"
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-base">person</span>
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
                    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white/95 shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
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
                className="bg-white border border-slate-200 text-slate-600 px-6 lg:px-8 py-2.5 lg:py-3 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-widest hover:text-primary hover:border-primary/30 transition-all shadow-sm"
              >
                Login / Register
              </button>
            )}

            <button
              onClick={handleListProperty}
              className="bg-primary text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95"
            >
              List Property
            </button>
          </div>

          {/* Mobile: Login + Hamburger */}
          <div className="flex nav:hidden items-center justify-end gap-3">
            {!loadingUser && !user && (
              <button
                type="button"
                onClick={handleOpenLogin}
                className="text-slate-600 hover:text-primary text-sm font-bold transition-colors"
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
        className={`fixed inset-0 z-40 nav:hidden transition-all duration-300 ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
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

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80">
              <button
                type="button"
                onClick={() => setIsMobileServicesOpen((prev) => !prev)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                  isServicesActive
                    ? 'text-primary'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                aria-expanded={isMobileServicesOpen}
                aria-controls="mobile-services-menu"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">apps</span>
                  Services
                </span>
                <span className={`material-symbols-outlined text-base transition-transform ${isMobileServicesOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              <div
                id="mobile-services-menu"
                className={`grid transition-all duration-300 ${isMobileServicesOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <div className="px-2 pb-2 space-y-1">
                    {SERVICE_LINKS.map((service) => (
                      <Link
                        key={service.href}
                        href={service.href}
                        onClick={() => {
                          setIsMobileServicesOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                          isActive(service.href)
                            ? 'bg-primary/10 text-primary'
                            : 'text-slate-600 hover:bg-white hover:text-slate-900'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base text-primary">{service.icon}</span>
                        <span>{service.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link
              href={CONTACT_LINK.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                isActive(CONTACT_LINK.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {CONTACT_LINK.label}
            </Link>
          </nav>

          {/* Panel Footer */}
          <div className="px-4 pb-8 space-y-3 border-t border-slate-100 pt-6">
            <button
              onClick={handleListProperty}
              className="w-full bg-primary text-white py-3.5 rounded-full font-bold text-sm tracking-tight hover:bg-primary/90 transition-all shadow-lg"
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
