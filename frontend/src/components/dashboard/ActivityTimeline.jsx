'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function ActivityTimeline() {
  const { user } = useAuth();

  const savedCount = user?.savedProperties?.length ?? 0;
  const compareCount = user?.comparedProperties?.length ?? 0;

  const items = [
    savedCount > 0 && {
      id: 'saved',
      title: `${savedCount} propert${savedCount === 1 ? 'y' : 'ies'} saved to your wishlist`,
      meta: 'View your saved listings',
      icon: 'favorite',
      theme: 'indigo',
      href: '/account/saved',
    },
    compareCount > 0 && {
      id: 'compare',
      title: `${compareCount} propert${compareCount === 1 ? 'y' : 'ies'} added for comparison`,
      meta: 'Open comparison view',
      icon: 'compare_arrows',
      theme: 'amber',
      href: '/compare',
    },
    {
      id: 'profile',
      title: 'Your profile is active',
      meta: user?.email || 'Update your details',
      icon: 'person',
      theme: 'pink',
      href: '/account/profile',
    },
  ].filter(Boolean);

  const themeClasses = {
    pink: 'bg-pink-100 text-pink-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex justify-between items-center">
        <h2 className="text-base font-heading font-black text-slate-900">Account Overview</h2>
        <Link href="/account/enquiries" className="text-primary text-[10px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-1">
          View Enquiries
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
      <div className="divide-y divide-slate-50">
        {items.map((item, idx) => (
          <Link key={item.id} href={item.href} className="p-5 flex gap-4 items-start hover:bg-slate-50/50 transition-colors group block">
            <div className="relative mt-0.5">
              <div className={`w-9 h-9 rounded-full ${themeClasses[item.theme]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
              </div>
              {idx !== items.length - 1 && (
                <div className="absolute top-11 left-1/2 -translate-x-1/2 w-px h-12 bg-slate-100" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold text-slate-900 text-sm mb-0.5">{item.title}</p>
              <span className="text-[11px] text-slate-400 font-bold">{item.meta}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
