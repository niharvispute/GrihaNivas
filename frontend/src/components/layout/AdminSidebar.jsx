'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();


  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/admin' },
    { name: 'Properties', icon: 'real_estate_agent', href: '/admin/properties' },
    { name: 'Projects', icon: 'domain', href: '/admin/projects' },
    { name: 'Builders', icon: 'apartment', href: '/admin/builders' },
    { name: 'Property Submissions', icon: 'home_work', href: '/admin/property-submissions' },
    { name: 'Leads', icon: 'leaderboard', href: '/admin/leads' },
    { name: 'Blogs', icon: 'edit_note', href: '/admin/blogs' },
    { name: 'Banners', icon: 'view_carousel', href: '/admin/banners' },
    { name: 'Testimonials', icon: 'reviews', href: '/admin/testimonials' },
    { name: 'Users', icon: 'group', href: '/admin/users' },
    { name: 'Offers', icon: 'local_offer', href: '/admin/offers' },
    { name: 'Stamp Duty Rates', icon: 'receipt_long', href: '/admin/stamp-duty' },
    { name: 'System Settings', icon: 'tune', href: '/admin/system' }
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col py-8 bg-slate-900 text-white z-50 border-r border-slate-800 shadow-2xl">
      <div className="px-8 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-black text-white tracking-tighter">Grihanivas</span>
        </div>
        <p className="text-primary font-black text-[9px] uppercase tracking-[0.3em] opacity-80 mb-3">Admin Console</p>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-[9px] font-black uppercase tracking-[0.3em] transition-colors group"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          Back to Home
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar py-4">
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
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-slate-500 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="font-bold text-sm tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
