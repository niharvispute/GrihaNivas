'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, loadingUser, openModal, logout } = useAuth();
  const router = useRouter();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = user?.name || user?.email || 'Account';
  const avatarSrc = user?.profilePictureUrl || user?.photoURL || user?.imageUrl || null;
  const accountHref = user?.role?.toLowerCase() === 'admin' ? '/admin' : '/account';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAccountOpen(false);
      }
    };

    if (isAccountOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccountOpen]);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsAccountOpen(!isAccountOpen);
  };

  const handleListProperty = () => {
    if (user) {
      router.push('/list-property');
    } else {
      openModal('login');
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsAccountOpen(false);
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-gray-100/50 shadow-sm">
      <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
        {/* Brand Logo */}
        <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900">
          Mumbai Editorial
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-semibold tracking-tight text-sm text-slate-600">
          <div className="py-2">
            <Link href="/buy" className="hover:text-primary transition-colors">Buy</Link>
          </div>
          <div className="py-2">
            <Link href="/rent" className="hover:text-primary transition-colors">Rent</Link>
          </div>
          <div className="py-2">
            <Link href="/new-launch" className="hover:text-primary transition-colors">New Launch</Link>
          </div>
          <div className="py-2">
            <Link href="/builders" className="hover:text-primary transition-colors">Builders</Link>
          </div>
          <Link href="/blogs" className="hover:text-primary transition-colors">Blogs</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button className="text-slate-600 hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>

          <div className="hidden lg:flex items-center gap-4">
            {!loadingUser && (
              user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={toggleDropdown}
                    className={`flex items-center gap-3 rounded-full border px-3 py-2 shadow-sm transition-all hover:shadow-md ${isAccountOpen ? 'border-primary bg-white shadow-lg' : 'border-slate-200 bg-white/90 hover:border-primary/20'}`}
                  >
                    <span className="hidden xl:block max-w-35 truncate text-sm font-semibold text-slate-700">
                      {displayName}
                    </span>
                    <span className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full transition-transform bg-linear-to-br from-primary/10 via-white to-tertiary/60 text-primary ring-1 ring-slate-200 ${isAccountOpen ? 'scale-105 ring-primary/30' : ''}`}>
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

                  <div className={`absolute right-0 top-full z-50 pt-3 transition-all duration-300 ${isAccountOpen ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-2 scale-95 opacity-0'}`}>
                    <div className="absolute right-6 -top-2 h-4 w-4 rotate-45 border-l border-t border-slate-100 bg-white" />
                    <div className="w-72 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
                      <div className="border-b border-slate-50 px-6 py-5 bg-slate-50/50">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Account</p>
                        <p className="mt-0.5 truncate font-heading text-sm font-black tracking-tight text-slate-900">
                          {displayName}
                        </p>
                      </div>

                      <div className="p-3 grid gap-1">
                        <Link
                          href={accountHref}
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-primary"
                        >
                          <span className="material-symbols-outlined text-lg opacity-70">person</span>
                          <span>My Account</span>
                        </Link>

                        <Link
                          href="/account/saved"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-primary"
                        >
                          <span className="material-symbols-outlined text-lg opacity-70">favorite</span>
                          <span>Wishlist</span>
                        </Link>

                        <div className="h-px bg-slate-50 my-1 mx-2" />

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm font-bold text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
                        >
                          <span className="material-symbols-outlined text-lg opacity-70">logout</span>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openModal('login')}
                  className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors"
                >
                  Login / Register
                </button>
              )
            )}

            <button
              onClick={handleListProperty}
              className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold tracking-tight hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              List Your Property
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
