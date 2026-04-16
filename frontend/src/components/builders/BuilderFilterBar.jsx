'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function BuilderFilterBar({ initialSearch = '', initialIsFeatured = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [isFeatured, setIsFeatured] = useState(initialIsFeatured);

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    
    // Merge new filters with existing params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Reset pagination when filtering
    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    updateFilters({ search });
  };

  const handleToggleFeatured = (e) => {
    const checked = e.target.checked;
    setIsFeatured(checked);
    updateFilters({ isFeatured: checked });
  };

  return (
    <section className="sticky top-18.25 z-40 mb-12 py-4 bg-background/80 backdrop-blur-sm">
      <form 
        onSubmit={handleSearchSubmit}
        className="bg-white border border-neutral-200 p-3 xl:rounded-full rounded-2xl shadow-sm flex flex-col xl:flex-row items-center gap-4"
      >
        <div className="relative grow w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">search</span>
          <input 
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-sm font-medium font-body text-slate-900" 
            placeholder="Search builder by name..." 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="h-8 w-px bg-neutral-200 hidden xl:block"></div>
        
        <div className="flex items-center gap-6 w-full xl:w-auto px-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <span className="text-sm font-semibold text-zinc-600 group-hover:text-primary transition-colors font-label">Featured Builders</span>
            <div className="relative inline-flex items-center cursor-pointer">
              <input 
                className="sr-only peer" 
                type="checkbox" 
                checked={isFeatured}
                onChange={handleToggleFeatured}
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </label>
          
          <div className="h-8 w-px bg-neutral-200"></div>
          
          <div className="relative group w-full xl:w-48">
            <button 
              type="button"
              className="flex items-center justify-between w-full px-2 text-sm font-semibold text-zinc-600 font-label hover:text-primary transition-colors"
            >
              <span>All Locations</span>
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isPending}
          className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity w-full xl:w-auto uppercase tracking-widest disabled:opacity-50"
        >
          {isPending ? 'Wait...' : 'Search'}
        </button>
      </form>
    </section>
  );
}
