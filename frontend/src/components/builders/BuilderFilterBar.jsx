'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition, useEffect, useRef } from 'react';
import { listBuilderCities } from '@/services/builderService';

export default function BuilderFilterBar({ initialSearch = '', initialIsFeatured = false, initialCity = '' }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [isFeatured, setIsFeatured] = useState(initialIsFeatured);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await listBuilderCities();
        setCities(data);
      } catch (err) {
        console.error('Failed to fetch builder cities:', err);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    
    // Merge new filters with existing params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === false) {
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

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setIsCityDropdownOpen(false);
    updateFilters({ city: city === 'All Locations' ? '' : city });
  };

  return (
    <section className="lg:sticky lg:top-18.25 z-40 mb-8 sm:mb-12 py-3 sm:py-4 bg-white/80 backdrop-blur-sm">
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white border border-slate-200 p-2.5 sm:p-3 xl:rounded-full rounded-2xl shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center gap-3 sm:gap-4"
      >
        <div className="relative grow w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-sm font-medium font-body text-slate-900" 
            placeholder="Search builder by name..." 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="h-8 w-px bg-slate-200 hidden xl:block"></div>
        
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-6 w-full xl:w-auto px-2 sm:px-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <span className="text-xs sm:text-sm font-bold text-slate-600 group-hover:text-primary transition-colors font-label">Featured Builders</span>
            <div className="relative inline-flex items-center cursor-pointer">
              <input 
                className="sr-only peer" 
                type="checkbox" 
                checked={isFeatured}
                onChange={handleToggleFeatured}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </label>
          
          <div className="h-8 w-px bg-slate-200"></div>
          
          <div className="relative w-full min-w-44 xl:w-48" ref={dropdownRef}>
            <button 
              type="button"
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center justify-between w-full px-2 text-sm font-bold text-slate-900 font-label hover:text-primary transition-colors"
            >
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Location</span>
                <span className="truncate">{selectedCity || 'All Locations'}</span>
              </div>
              <span className={`material-symbols-outlined transition-transform duration-200 ${isCityDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {isCityDropdownOpen && (
              <div className="absolute top-full left-0 mt-3 w-full sm:w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid gap-1">
                  <button
                    type="button"
                    onClick={() => handleCitySelect('All Locations')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${!selectedCity || selectedCity === 'All Locations' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <span className="material-symbols-outlined text-lg">location_on</span>
                    <span>All Locations</span>
                  </button>
                  {cities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${selectedCity === city ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <span className="material-symbols-outlined text-lg">map</span>
                      <span>{city}</span>
                    </button>
                  ))}
                  {cities.length === 0 && (
                    <div className="px-4 py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                      No locations found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-black text-xs sm:text-sm transition-all active:scale-95 shadow-lg shadow-primary/30 w-full xl:w-auto uppercase tracking-widest disabled:opacity-50"
        >
          {isPending ? 'Wait...' : 'Search'}
        </button>
      </form>
    </section>
  );
}
