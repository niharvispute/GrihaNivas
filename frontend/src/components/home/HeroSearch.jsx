'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TYPE_TO_ROUTE = {
  any: '/buy',
  apartment: '/buy',
  villa: '/buy',
  new_launch: '/new-launch',
  rent: '/rent',
};

export default function HeroSearch() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('any');

  const handleSearch = (event) => {
    event.preventDefault();
    const basePath = TYPE_TO_ROUTE[propertyType] || '/buy';
    const params = new URLSearchParams();
    const trimmedLocation = location.trim();
    if (trimmedLocation) params.set('area', trimmedLocation);
    const queryString = params.toString();
    router.push(queryString ? `${basePath}?${queryString}` : basePath);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white/95 backdrop-blur-3xl p-1.5 rounded-[2rem] shadow-2xl max-w-3xl mx-auto border border-white/40 ring-1 ring-slate-900/5"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
        <div className="flex flex-col items-start px-6 py-2 text-left">
          <span className="text-[9px] font-black text-black uppercase tracking-[0.2em] mb-1 opacity-40">State</span>
          <input
            className="w-full bg-transparent border-none p-0 text-black focus:ring-0 font-bold placeholder:text-slate-400 text-sm"
            placeholder="Maharashtra"
            value="Maharashtra"
            readOnly
          />
        </div>
        <div className="flex flex-col items-start px-6 py-2 text-left md:border-l border-slate-100">
          <span className="text-[9px] font-black text-black uppercase tracking-[0.2em] mb-1 opacity-40">Location</span>
          <input
            className="w-full bg-transparent border-none p-0 text-black focus:ring-0 font-bold placeholder:text-slate-300 text-sm"
            placeholder="Bandra, Juhu..."
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </div>
        <div className="flex flex-col items-start px-6 py-2 text-left md:border-l border-slate-100">
          <span className="text-[9px] font-black text-black uppercase tracking-[0.2em] mb-1 opacity-40">Property Type</span>
          <select
            className="w-full bg-transparent border-none p-0 text-black focus:ring-0 font-bold cursor-pointer text-sm"
            value={propertyType}
            onChange={(event) => setPropertyType(event.target.value)}
          >
            <option value="any">Any Type</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="new_launch">New Launch</option>
            <option value="rent">Rent</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-primary text-white py-3.5 px-6 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-secondary transition-all active:scale-95 shadow-md shadow-primary/20 text-xs uppercase tracking-widest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          Search
        </button>
      </div>
    </form>
  );
}
