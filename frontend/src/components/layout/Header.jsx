'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, loadingUser, openModal, logout } = useAuth();
  const router = useRouter();

  const displayName = user?.name || user?.email || 'Account';
  const avatarSrc = user?.profilePictureUrl || user?.photoURL || user?.imageUrl || null;
  const accountHref = user?.role?.toLowerCase() === 'admin' ? '/admin' : '/account';

  const handleListProperty = () => {
    if (user) {
      router.push('/list-property');
    } else {
      openModal('login');
    }
  };

  const handleLogout = async () => {
    await logout();
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
          <div className="group relative py-2">
            <Link href="/buy" className="hover:text-primary transition-colors">Buy</Link>
          </div>
          <div className="group relative py-2">
            <Link href="/rent" className="hover:text-primary transition-colors">Rent</Link>
          </div>
          <div className="group relative py-2">
            <Link href="/commercial" className="hover:text-primary transition-colors">Commercial</Link>
          </div>
          <div className="group relative py-2">
            <Link href="/new-launch" className="hover:text-primary transition-colors">New Launch</Link>
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
                <div className="group relative">
                  <button
                    type="button"
                    onClick={() => router.push(accountHref)}
                    className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-3 py-2 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
                  >
                    <span className="hidden xl:block max-w-35 truncate text-sm font-semibold text-slate-700">
                      {displayName}
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-primary/10 via-white to-tertiary/60 text-primary ring-1 ring-slate-200 transition-transform group-hover:scale-105">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-2xl">person</span>
                      )}
                    </span>
                  </button>

                  <div className="absolute right-0 top-full z-50 pt-3">
                    <div className="pointer-events-none w-64 translate-y-2 scale-95 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100">
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
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
                        >
                          <span className="material-symbols-outlined text-xl text-primary">person</span>
                          <span>My Account</span>
                        </Link>

                        <Link
                          href="/account/saved"
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
