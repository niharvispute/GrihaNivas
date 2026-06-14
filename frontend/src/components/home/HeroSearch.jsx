'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getSystemBootstrap } from '@/services/systemService';
import { SYSTEM_DEFAULT_CITY } from '@/lib/system/defaults';

const INTENT_OPTIONS = [
  { label: 'Buy', value: 'buy', route: '/buy' },
  { label: 'Rent', value: 'rent', route: '/rent' },
  { label: 'New Launch', value: 'new_launch', route: '/new-launch' },
];

const BHK_OPTIONS = ['1', '2', '3', '4', '5+'];
const POPULAR_AREA_FALLBACK = ['Bandra West', 'Worli', 'South Mumbai', 'Powai'];

export default function HeroSearch() {
  const router = useRouter();
  const locationInputId = 'hero-search-location';
  const [intent, setIntent] = useState('buy');
  const [location, setLocation] = useState('');
  const [bhk, setBhk] = useState('');
  const [bhkOpen, setBhkOpen] = useState(false);
  const [bhkOptions, setBhkOptions] = useState(BHK_OPTIONS);
  const [popularAreas, setPopularAreas] = useState(POPULAR_AREA_FALLBACK);
  const [defaultCity, setDefaultCity] = useState(SYSTEM_DEFAULT_CITY);
  const bhkRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    getSystemBootstrap()
      .then((bootstrap) => {
        if (!mounted) return;
        const dynamicBhk = Array.isArray(bootstrap?.options?.bhkValues)
          ? bootstrap.options.bhkValues.map((v) => String(v))
          : [];
        const dynamicAreas = Array.isArray(bootstrap?.areas)
          ? bootstrap.areas.map((v) => String(v))
          : [];
        if (dynamicBhk.length > 0) setBhkOptions(dynamicBhk);
        if (dynamicAreas.length > 0) setPopularAreas(dynamicAreas.slice(0, 4));
        if (bootstrap?.config?.city) setDefaultCity(String(bootstrap.config.city));
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Close BHK dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bhkRef.current && !bhkRef.current.contains(e.target)) {
        setBhkOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    setBhkOpen(false);
    const selected = INTENT_OPTIONS.find((o) => o.value === intent) || INTENT_OPTIONS[0];
    const params = new URLSearchParams();
    const trimmedLocation = location.trim();
    if (trimmedLocation) params.set('area', trimmedLocation);
    if (bhk) params.set('bhk', bhk);
    const queryString = params.toString();
    router.push(queryString ? `${selected.route}?${queryString}` : selected.route);
  };

  const selectBhk = (val) => {
    setBhk(val);
    setBhkOpen(false);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">

      {/* ── Intent Tabs ── */}
      <div className="flex items-center justify-center mb-5">
        <div className="inline-flex bg-white/80 backdrop-blur-md rounded-full p-1 shadow-xl shadow-black/10 border border-white/60 gap-0.5">
          {INTENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setIntent(option.value)}
              className={`px-5 sm:px-7 py-2.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                intent === option.value
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search Bar ── */}
      {/* No overflow-hidden — needed so the BHK dropdown isn't clipped */}
      <div className="flex flex-col sm:flex-row bg-white rounded-2xl sm:rounded-full shadow-2xl shadow-black/20 border border-slate-100">

        {/* Location */}
        <div className="flex items-center gap-3 px-5 sm:px-6 py-4 sm:py-3 flex-1 border-b sm:border-b-0 sm:border-r border-slate-100">
          <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              location_on
            </span>
          </div>
          <div className="flex flex-col text-left flex-1 min-w-0">
            <label
              htmlFor={locationInputId}
              className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5"
            >
              Location
            </label>
            <input
              id={locationInputId}
              name="location"
              className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 m-0 text-slate-900 text-sm font-bold placeholder:text-slate-300 w-full"
              placeholder={`${defaultCity} — area or locality`}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              suppressHydrationWarning
            />
          </div>
        </div>

        {/* BHK Custom Dropdown */}
        <div
          ref={bhkRef}
          className="relative flex items-center gap-3 px-5 sm:px-6 py-4 sm:py-3 sm:w-52 border-b sm:border-b-0 sm:border-r border-slate-100"
        >
          <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              apartment
            </span>
          </div>
          <div className="flex flex-col text-left flex-1 min-w-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
              BHK Type
            </span>
            <button
              type="button"
              onClick={() => setBhkOpen((o) => !o)}
              className="flex items-center justify-between gap-1 text-sm font-bold w-full focus:outline-none"
            >
              <span className={bhk ? 'text-slate-900' : 'text-slate-300'}>
                {bhk ? `${bhk} BHK` : 'Any'}
              </span>
              <span
                className={`material-symbols-outlined text-slate-400 text-[18px] transition-transform duration-200 ${bhkOpen ? 'rotate-180' : ''}`}
              >
                expand_more
              </span>
            </button>
          </div>

          {/* Dropdown panel */}
          {bhkOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-200 z-[9999] overflow-hidden">
              <button
                type="button"
                onClick={() => selectBhk('')}
                className={`w-full px-4 py-2.5 text-left text-sm font-bold transition-colors hover:bg-primary/5 hover:text-primary ${
                  bhk === '' ? 'text-primary bg-primary/5' : 'text-slate-600'
                }`}
              >
                Any
              </button>
              {bhkOptions.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => selectBhk(b)}
                  className={`w-full px-4 py-2.5 text-left text-sm font-bold transition-colors hover:bg-primary/5 hover:text-primary border-t border-slate-100 ${
                    bhk === b ? 'text-primary bg-primary/5' : 'text-slate-600'
                  }`}
                >
                  {b} BHK
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search CTA */}
        <div className="p-2.5">
          <button
            type="submit"
            className="w-full h-full min-h-[52px] bg-primary hover:bg-primary/90 active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-xl sm:rounded-full flex items-center justify-center gap-2.5 px-7 shadow-lg transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            Search
          </button>
        </div>
      </div>

      {/* ── Popular Areas ── */}
      <div className="mt-4 flex items-center gap-2 justify-center flex-wrap px-2">
        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Popular:</span>
        {popularAreas.map((area) => (
          <button
            key={area}
            type="button"
            onClick={() => {
              const selected = INTENT_OPTIONS.find((o) => o.value === intent) || INTENT_OPTIONS[0];
              const params = new URLSearchParams({ area });
              if (bhk) params.set('bhk', bhk);
              router.push(`${selected.route}?${params.toString()}`);
            }}
            className="text-slate-600 hover:text-primary text-xs font-bold bg-white/70 hover:bg-white backdrop-blur-sm border border-white/80 hover:border-primary/20 px-4 py-1.5 rounded-full shadow-sm transition-all duration-200"
          >
            {area}
          </button>
        ))}
      </div>
    </form>
  );
}
