'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const INTENT_OPTIONS = [
  { label: 'Buy', value: 'buy', route: '/buy' },
  { label: 'Rent', value: 'rent', route: '/rent' },
  { label: 'New Launch', value: 'new_launch', route: '/new-launch' },
];

const BHK_OPTIONS = ['1', '2', '3', '4', '5+'];

export default function HeroSearch() {
  const router = useRouter();
  const [intent, setIntent] = useState('buy');
  const [location, setLocation] = useState('');
  const [bhk, setBhk] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();
    const selected = INTENT_OPTIONS.find((o) => o.value === intent) || INTENT_OPTIONS[0];
    const params = new URLSearchParams();
    const trimmedLocation = location.trim();
    if (trimmedLocation) params.set('area', trimmedLocation);
    if (bhk) params.set('bhk', bhk);
    const queryString = params.toString();
    router.push(queryString ? `${selected.route}?${queryString}` : selected.route);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
      {/* Intent Toggle Tabs */}
      <div className="flex items-center flex-wrap justify-center gap-1 mb-3 md:mb-4 bg-white/20 backdrop-blur-sm rounded-full p-1.5 w-fit mx-auto border border-white/30">
        {INTENT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setIntent(option.value)}
            className={`px-4 sm:px-5 py-2.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all ${
              intent === option.value
                ? 'bg-white text-primary shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white/95 backdrop-blur-3xl p-2 sm:p-2.5 rounded-3xl md:rounded-4xl shadow-2xl border border-white/40 ring-1 ring-slate-900/5">
        <div className="flex flex-col md:flex-row gap-2 md:gap-1">
          {/* Location */}
          <div className="flex flex-col items-start px-4 sm:px-5 py-3 text-left flex-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Location</span>
            <input
              className="w-full bg-transparent border-none p-0 text-slate-900 focus:ring-0 font-bold placeholder:text-slate-400 text-sm"
              placeholder="Bandra, Juhu, Worli..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-slate-100 my-2" />

          {/* BHK Dropdown */}
          <div className="flex flex-col items-start px-4 sm:px-5 py-3 text-left md:min-w-45">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">BHK Type</span>
            <select
              value={bhk}
              onChange={(e) => setBhk(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-sm font-bold text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Any</option>
              {BHK_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b} BHK
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="bg-primary text-white h-12 md:h-auto py-3.5 md:py-4 px-6 md:px-7 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-secondary transition-all active:scale-95 shadow-md shadow-primary/20 text-xs uppercase tracking-widest self-stretch"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Search
          </button>
        </div>
      </div>

      {/* Popular Searches */}
      <div className="mt-4 md:mt-5 flex items-center gap-2 justify-center flex-wrap px-2">
        <span className="text-white/70 text-xs font-semibold">Popular:</span>
        {['Bandra West', 'Worli', 'South Mumbai', 'Powai'].map((area) => (
          <button
            key={area}
            type="button"
            onClick={() => { setLocation(area); }}
            className="text-white/85 text-xs font-bold hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/20 transition-all"
          >
            {area}
          </button>
        ))}
      </div>
    </form>
  );
}
