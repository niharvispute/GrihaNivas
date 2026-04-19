'use client';

import Link from 'next/link';

export default function QuickActions() {
  const actions = [
    { label: 'Saved Properties', icon: 'bookmark', href: '/account/saved' },
    { label: 'My Enquiries', icon: 'chat_bubble', href: '/account/enquiries' },
    { label: 'Download Documents', icon: 'download', href: '#' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-4xl p-3 sm:p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-100 bg-white group cursor-pointer"
        >
          <div className="relative z-10 flex flex-col h-full items-center justify-center text-center gap-2">
            <span className="material-symbols-outlined text-3xl sm:text-5xl md:text-6xl text-primary group-hover:scale-110 transition-transform">
              {action.icon}
            </span>
            <p className="text-[7px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
              {action.label}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
