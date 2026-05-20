'use client';

import Link from 'next/link';

export default function QuickActions() {
  const actions = [
    { label: 'Saved Properties', icon: 'bookmark', href: '/account/saved' },
    { label: 'My Enquiries', icon: 'chat_bubble', href: '/account/enquiries' },
    { label: 'Download Documents', icon: 'download', href: '#' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6 md:mt-8">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="relative overflow-hidden rounded-2xl p-3 sm:p-5 md:p-6 lg:p-8 shadow-sm transition-all duration-500 hover:shadow-lg hover:shadow-slate-200/80 hover:-translate-y-1 border border-slate-100 bg-white group cursor-pointer"
        >
          <div className="relative z-10 flex flex-col h-full items-center justify-center text-center gap-1.5 sm:gap-2">
            <span className="material-symbols-outlined text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-primary group-hover:scale-110 transition-transform">
              {action.icon}
            </span>
            <p className="text-[6px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
              {action.label}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
