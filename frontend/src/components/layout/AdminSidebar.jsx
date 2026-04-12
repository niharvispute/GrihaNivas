'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/admin' },
    { name: 'Properties', icon: 'real_estate_agent', href: '/admin/properties' },
    { name: 'Leads', icon: 'leaderboard', href: '/admin/leads' },
    { name: 'Blogs', icon: 'edit_note', href: '/admin/blogs' },
    { name: 'Banners', icon: 'view_carousel', href: '/admin/banners' },
    { name: 'Testimonials', icon: 'reviews', href: '/admin/testimonials' },
    { name: 'Users', icon: 'group', href: '/admin/users' },
    { name: 'Settings', icon: 'settings', href: '/admin/settings' },
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
          const isActive = pathname === item.href;
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
        <div className="p-5 bg-neutral-800/30 rounded-[2rem] border border-neutral-700/30 backdrop-blur-sm">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="relative">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAR1fdGuaC5bauEuGoODuNyXlS4_6wWpoaDdXOnGaxvnrYsjioN7sRvxmsmm1duPGGNXM1-f-_ORAN8W_CWUopGCZASvEePQl6jNEY6IjsvTCREy8S0rK5tg87JMVpNkoBsNJ8RUOrUBbFmKo4iTABa1XaoKvW-MaYYgX23RQlmStizfgBxhYgA630ql2FL4CfnV6O8lAhdmXyVCKrlLNIhROurdgteUcO6n6HqYwiUQXisj9gC3b0cm9lGbQrBAndoRTZR6XZXpIA" 
                alt="Admin Profile" 
                className="w-12 h-12 rounded-2xl object-cover border-2 border-primary/20"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary border-2 border-neutral-900 rounded-full"></div>
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-black truncate tracking-tight">Vikram Oberoi</p>
              <p className="text-neutral-500 text-[10px] truncate font-bold uppercase tracking-widest leading-none mt-1">Chief Editor</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
