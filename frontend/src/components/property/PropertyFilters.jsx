'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BudgetRangeSlider from './BudgetRangeSlider';

const AREA_OPTIONS = [
  { label: 'All Locations', value: '' },
  { label: 'South Mumbai', value: 'South Mumbai' },
  { label: 'Bandra West', value: 'Bandra West' },
  { label: 'Juhu', value: 'Juhu' },
  { label: 'Worli', value: 'Worli' },
  { label: 'Andheri West', value: 'Andheri West' },
  { label: 'Powai', value: 'Powai' },
];

const BHK_OPTIONS = [
  { label: 'Any', value: '' },
  { label: '2 BHK', value: '2' },
  { label: '3 BHK', value: '3' },
  { label: '4 BHK', value: '4' },
  { label: '5 BHK', value: '5' },
];

const FURNISHING_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Unfurnished', value: 'unfurnished' },
  { label: 'Semi-furnished', value: 'semi_furnished' },
  { label: 'Furnished', value: 'furnished' },
];

// Constants for Price Filtering (1 Cr to 5 Cr)
const MIN_BUDGET = 10000000; // 1 Cr
const MAX_BUDGET = 50000000; // 5 Cr
const STEP = 500000; // 5 Lacs step

function formatPriceToCr(price) {
  if (!price) return '';
  return `₹${(Number(price) / 10000000).toFixed(1)} Cr`;
}

function buildActiveFilterChips(currentQuery, basePath) {
  const chips = [];

  if (currentQuery.area) {
    const label = AREA_OPTIONS.find((o) => o.value === currentQuery.area)?.label || currentQuery.area;
    const params = new URLSearchParams();
    if (currentQuery.category && currentQuery.category !== 'buy') params.set('category', currentQuery.category);
    if (currentQuery.minPrice) params.set('minPrice', currentQuery.minPrice);
    if (currentQuery.maxPrice) params.set('maxPrice', currentQuery.maxPrice);
    if (currentQuery.bhk) params.set('bhk', currentQuery.bhk);
    if (currentQuery.furnishing) params.set('furnishing', currentQuery.furnishing);
    if (currentQuery.sortBy && currentQuery.sortBy !== 'newest') params.set('sortBy', currentQuery.sortBy);
    chips.push({ label: label, removeHref: `${basePath}${params.toString() ? `?${params}` : ''}` });
  }

  if (currentQuery.minPrice || currentQuery.maxPrice) {
    const min = formatPriceToCr(currentQuery.minPrice);
    const max = formatPriceToCr(currentQuery.maxPrice);
    const rangeLabel = min && max ? `${min} – ${max}` : min || max;
    const params = new URLSearchParams();
    if (currentQuery.category && currentQuery.category !== 'buy') params.set('category', currentQuery.category);
    if (currentQuery.area) params.set('area', currentQuery.area);
    if (currentQuery.bhk) params.set('bhk', currentQuery.bhk);
    if (currentQuery.furnishing) params.set('furnishing', currentQuery.furnishing);
    if (currentQuery.sortBy && currentQuery.sortBy !== 'newest') params.set('sortBy', currentQuery.sortBy);
    chips.push({ label: rangeLabel, removeHref: `${basePath}${params.toString() ? `?${params}` : ''}` });
  }

  if (currentQuery.bhk) {
    const params = new URLSearchParams();
    if (currentQuery.category && currentQuery.category !== 'buy') params.set('category', currentQuery.category);
    if (currentQuery.area) params.set('area', currentQuery.area);
    if (currentQuery.minPrice) params.set('minPrice', currentQuery.minPrice);
    if (currentQuery.maxPrice) params.set('maxPrice', currentQuery.maxPrice);
    if (currentQuery.furnishing) params.set('furnishing', currentQuery.furnishing);
    if (currentQuery.sortBy && currentQuery.sortBy !== 'newest') params.set('sortBy', currentQuery.sortBy);
    chips.push({ label: `${currentQuery.bhk} BHK`, removeHref: `${basePath}${params.toString() ? `?${params}` : ''}` });
  }

  return chips;
}

export default function PropertyFilters({ basePath, currentQuery }) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(currentQuery?.minPrice || MIN_BUDGET);
  const [maxPrice, setMaxPrice] = useState(currentQuery?.maxPrice || MAX_BUDGET);
  
  const sortBy = currentQuery?.sortBy || 'newest';
  const category = currentQuery?.category || 'buy';
  const resetParams = new URLSearchParams();
  if (category !== 'buy') resetParams.set('category', category);
  const resetHref = resetParams.toString() ? `${basePath}?${resetParams.toString()}` : basePath;

  const activeChips = buildActiveFilterChips(currentQuery, basePath);

  // Sync state with props if they change
  useEffect(() => {
    if (currentQuery?.minPrice) setMinPrice(Number(currentQuery.minPrice));
    if (currentQuery?.maxPrice) setMaxPrice(Number(currentQuery.maxPrice));
  }, [currentQuery?.minPrice, currentQuery?.maxPrice]);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isDrawerOpen]);

  const handleBudgetChange = ({ min, max }) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const FilterContent = ({ isMobile = false }) => (
    <form className="space-y-6 text-sm" method="GET" action={basePath}>
      {category !== 'buy' ? <input type="hidden" name="category" value={category} /> : null}
      <input type="hidden" name="sortBy" value={sortBy} />

      {/* Location Filter */}
      <div className="space-y-2">
        <label className="font-bold flex items-center gap-2 text-slate-700 text-xs uppercase tracking-wide">
          <span className="material-symbols-outlined text-primary text-xl">location_on</span>
          Location
        </label>
        <select
          name="area"
          defaultValue={currentQuery?.area || ''}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20 appearance-none font-medium"
        >
          {AREA_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Budget Slider Filter */}
      <BudgetRangeSlider
        minValue={minPrice}
        maxValue={maxPrice}
        onChange={handleBudgetChange}
      />

      {/* BHK Type */}
      <div className="space-y-2">
        <label className="font-bold flex items-center gap-2 text-slate-700 text-xs uppercase tracking-wide">
          <span className="material-symbols-outlined text-primary text-xl">home</span>
          BHK Type
        </label>
        <select
          name="bhk"
          defaultValue={currentQuery?.bhk || ''}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20 appearance-none font-medium"
        >
          {BHK_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Furnishing */}
      <div className="space-y-2">
        <label className="font-bold flex items-center gap-2 text-slate-700 text-xs uppercase tracking-wide">
          <span className="material-symbols-outlined text-primary text-xl">chair</span>
          Furnishing
        </label>
        <select
          name="furnishing"
          defaultValue={currentQuery?.furnishing || ''}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20 appearance-none font-medium"
        >
          {FURNISHING_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="pt-6 space-y-4">
        <button
          type="submit"
          onClick={() => isMobile && setIsDrawerOpen(false)}
          className="w-full bg-primary text-white font-black py-4 rounded-2xl hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20 text-sm uppercase tracking-widest"
        >
          Update Results
        </button>
        <Link
          href={resetHref}
          className="block w-full text-center text-slate-400 text-xs font-bold hover:text-primary transition-colors underline underline-offset-8 decoration-slate-200"
        >
          Reset All
        </Link>
      </div>
    </form>
  );

  return (
    <>
      {/* Mobile Sticky Bar */}
      <div className="lg:hidden sticky top-18.25 z-40 px-4 py-3 -mx-4 sm:-mx-6 bg-white/80 backdrop-blur-md border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex-none flex items-center gap-1.5 bg-slate-900 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg"
          >
            <span className="material-symbols-outlined text-base">tune</span>
            <span className="hidden sm:inline">Filters</span>
          </button>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar flex-1 items-center">
            {activeChips.length > 0 ? (
              activeChips.map((chip) => (
                <Link
                  key={chip.label}
                  href={chip.removeHref}
                  className="flex-none flex items-center gap-1 bg-primary/10 text-primary text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-full uppercase tracking-tighter whitespace-nowrap"
                >
                  {chip.label}
                  <span className="material-symbols-outlined text-[12px]">close</span>
                </Link>
              ))
            ) : (
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 whitespace-nowrap">All properties</span>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 shrink-0">
        <div className="sticky top-24 bg-white rounded-[2rem] p-8 flex flex-col gap-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Filters</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Refine your search</p>
            </div>
            {activeChips.length > 0 && (
              <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-primary/20">
                {activeChips.length}
              </span>
            )}
          </div>

          <FilterContent />
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="absolute inset-0 bg-slate-900/60 transition-opacity duration-300"
          />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-white rounded-t-[3rem] shadow-2xl p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Refine Search</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Adjust your criteria</p>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-100 text-slate-500 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <FilterContent isMobile={true} />
        </div>
        </div>
      )}
    </>
  );
}
