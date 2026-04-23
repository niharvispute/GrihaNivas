'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const displayName = user?.name || user?.email || 'Admin User';
  const roleLabel = user?.role ? `${user.role} console` : 'admin console';
  const avatarSrc = user?.profilePictureUrl || user?.photoURL || user?.imageUrl || null;
  const initials = getInitials(displayName);

  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/admin' },
    { name: 'Properties', icon: 'real_estate_agent', href: '/admin/properties' },
    { name: 'Builders', icon: 'apartment', href: '/admin/builders' },
    { name: 'Property Submissions', icon: 'home_work', href: '/admin/property-submissions' },
    { name: 'Leads', icon: 'leaderboard', href: '/admin/leads' },
    { name: 'Blogs', icon: 'edit_note', href: '/admin/blogs' },
    { name: 'Banners', icon: 'view_carousel', href: '/admin/banners' },
    { name: 'Testimonials', icon: 'reviews', href: '/admin/testimonials' },
    { name: 'Users', icon: 'group', href: '/admin/users' },
    { name: 'Stamp Duty Rates', icon: 'receipt_long', href: '/admin/stamp-duty' },
    { name: 'System Settings', icon: 'tune', href: '/admin/system' }
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col py-8 bg-neutral-900 text-white z-50 border-r border-neutral-800 shadow-2xl">
      <div className="px-8 mb-12">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-black text-white tracking-tighter">Bricks.</span>
        </div>
        <p className="text-primary font-black text-[9px] uppercase tracking-[0.3em] opacity-80">Admin Console</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link 
              key={item.name}
              href={item.href} 
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'text-neutral-500 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="font-bold text-sm tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4">
        <div className="p-5 bg-neutral-800/30 rounded-4xl border border-neutral-700/30 backdrop-blur-sm">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="relative">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary/20 bg-linear-to-br from-primary/15 via-neutral-100 to-primary/5 text-primary flex items-center justify-center text-xs font-black">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={displayName}
                    fill
                    sizes="48px"
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials || 'A'}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary border-2 border-neutral-900 rounded-full"></div>
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-black truncate tracking-tight">{displayName}</p>
              <p className="text-neutral-500 text-[10px] truncate font-bold uppercase tracking-widest leading-none mt-1">{roleLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
