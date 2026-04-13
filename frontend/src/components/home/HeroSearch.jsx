'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TYPE_TO_ROUTE = {
  any: '/buy',
  apartment: '/buy',
  villa: '/buy',
  commercial: '/commercial',
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
      className="bg-white/80 backdrop-blur-xl p-2 rounded-[2.5rem] shadow-2xl max-w-4xl mx-auto border border-white/50"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="flex flex-col items-start px-6 py-3 text-left">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">State</span>
          <input
            className="w-full bg-transparent border-none p-0 text-slate-900 focus:ring-0 font-bold placeholder:text-slate-400"
            placeholder="Maharashtra"
            value="Maharashtra"
            readOnly
          />
        </div>
        <div className="flex flex-col items-start px-6 py-3 text-left md:border-l border-slate-200">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Location</span>
          <input
            className="w-full bg-transparent border-none p-0 text-slate-900 focus:ring-0 font-bold placeholder:text-slate-400"
            placeholder="Bandra, Juhu..."
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </div>
        <div className="flex flex-col items-start px-6 py-3 text-left md:border-l border-slate-200">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Property Type</span>
          <select
            className="w-full bg-transparent border-none p-0 text-slate-900 focus:ring-0 font-bold cursor-pointer"
            value={propertyType}
            onChange={(event) => setPropertyType(event.target.value)}
          >
            <option value="any">Any Type</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="commercial">Commercial</option>
            <option value="new_launch">New Launch</option>
            <option value="rent">Rent</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-primary text-white py-4 px-8 rounded-full font-black flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          Search
        </button>
      </div>
    </form>
  );
}
