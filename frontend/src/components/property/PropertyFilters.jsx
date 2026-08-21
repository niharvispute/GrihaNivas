'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BudgetRangeSlider from './BudgetRangeSlider';
import { getSystemBootstrap } from '@/services/systemService';

const DEFAULT_AREA_OPTIONS = [
  { label: 'All Locations', value: '' },
  { label: 'South Mumbai', value: 'South Mumbai' },
  { label: 'Bandra West', value: 'Bandra West' },
  { label: 'Juhu', value: 'Juhu' },
  { label: 'Worli', value: 'Worli' },
  { label: 'Andheri West', value: 'Andheri West' },
  { label: 'Powai', value: 'Powai' },
];

const DEFAULT_BHK_OPTIONS = [
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

// Buy price range
const BUY_MIN = 5000000;   // 50 Lakh
const BUY_MAX = 30000000;  // 3 Cr
const BUY_STEP = 500000;   // 5 Lakh

// Rent price range
const RENT_MIN = 10000;    // ₹10K/month
const RENT_MAX = 500000;   // ₹5 Lakh/month
const RENT_STEP = 10000;   // ₹10K step

// Backwards-compat alias used in formatPriceToCr calls below
const MIN_BUDGET = BUY_MIN;
const MAX_BUDGET = BUY_MAX;
const STEP = BUY_STEP;

function formatPriceToCr(price) {
  if (!price) return '';
  const num = Number(price);
  if (num < 10000000) {
    return `₹${(num / 100000).toFixed(0)} Lakh`;
  }
  return `₹${(num / 10000000).toFixed(1).replace('.0', '')} Cr`;
}

function buildActiveFilterChips(currentQuery, basePath, areaOptions) {
  const chips = [];

  if (currentQuery.area) {
    const label = areaOptions.find((o) => o.value === currentQuery.area)?.label || currentQuery.area;
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

const CustomSelect = ({ name, options, defaultValue, label, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);
  const dropdownRef = useRef(null);

  // Sync with prop changes (important for reset)
  useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption =
    options.find((o) => o.value === selected) ||
    // Selection may not exist in a dynamically-refreshed options list yet.
    // Keep showing the chosen value rather than silently falling back to the
    // first option, which looked like the filter had reset itself.
    (selected ? { label: String(selected), value: selected } : null) ||
    options[0] ||
    { label: 'Select...', value: '' };

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="font-bold flex items-center gap-2 text-slate-700 text-xs uppercase tracking-wide">
        <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
        {label}
      </label>
      <div className="relative">
        <input type="hidden" name={name} value={selected} />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none font-semibold text-slate-800 cursor-pointer hover:border-slate-300 text-left flex items-center justify-between group"
        >
          <span className="truncate">{selectedOption.label}</span>
          <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-[60] bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-2xl py-2 overflow-y-auto max-h-60 no-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
            {options.map((option) => (
              <button
                key={option.label + option.value}
                type="button"
                onClick={() => {
                  setSelected(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm font-bold transition-all flex items-center justify-between ${
                  selected === option.value 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {option.label}
                {selected === option.value && (
                  <span className="material-symbols-outlined text-base">check</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Rendered as a stable top-level component. Declaring this inside
// PropertyFilters created a brand-new component type on every render, so React
// unmounted/remounted the whole form on each state change — which aborted
// in-progress budget slider drags and reset the CustomSelect selections
// (Location / BHK / Furnishing) back to their defaults.
function FilterContent({
  isMobile = false,
  basePath,
  category,
  sortBy,
  currentQuery,
  areaOptions,
  bhkOptions,
  furnishingOptions,
  minPrice,
  maxPrice,
  budgetMin,
  budgetMax,
  budgetStep,
  isRentPage,
  onBudgetChange,
  onSubmit,
  onMobileSubmit,
  resetHref,
}) {
  return (
    <form className="space-y-6 text-sm" method="GET" action={basePath} onSubmit={onSubmit}>
      {category !== 'buy' ? <input type="hidden" name="category" value={category} /> : null}
      <input type="hidden" name="sortBy" value={sortBy} />

      {/* Location Filter */}
      <CustomSelect
        name="area"
        defaultValue={currentQuery?.area || ''}
        options={areaOptions}
        label="Location"
        icon="location_on"
      />

      {/* Budget Slider Filter */}
      <BudgetRangeSlider
        minValue={minPrice}
        maxValue={maxPrice}
        onChange={onBudgetChange}
        budgetMin={budgetMin}
        budgetMax={budgetMax}
        budgetStep={budgetStep}
        isRent={isRentPage}
      />

      {/* BHK Type */}
      <CustomSelect
        name="bhk"
        defaultValue={currentQuery?.bhk || ''}
        options={bhkOptions}
        label="BHK Type"
        icon="home"
      />

      {/* Furnishing */}
      <CustomSelect
        name="furnishing"
        defaultValue={currentQuery?.furnishing || ''}
        options={furnishingOptions}
        label="Furnishing"
        icon="chair"
      />

      <div className="pt-6 space-y-4">
        <button
          type="submit"
          onClick={() => isMobile && onMobileSubmit?.()}
          className="w-full bg-primary text-white font-black py-4 rounded-2xl hover:bg-primary/90 transition-all active:scale-95 shadow-xl text-sm uppercase tracking-widest"
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
}

export default function PropertyFilters({ basePath, currentQuery }) {
  const router = useRouter();
  const isRentPage = basePath?.includes('/rent');
  const budgetMin = isRentPage ? RENT_MIN : BUY_MIN;
  const budgetMax = isRentPage ? RENT_MAX : BUY_MAX;
  const budgetStep = isRentPage ? RENT_STEP : BUY_STEP;

  const { addToast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(currentQuery?.minPrice || budgetMin);
  const [maxPrice, setMaxPrice] = useState(currentQuery?.maxPrice || budgetMax);
  const [areaOptions, setAreaOptions] = useState(DEFAULT_AREA_OPTIONS);
  const [bhkOptions, setBhkOptions] = useState(DEFAULT_BHK_OPTIONS);
  const [furnishingOptions, setFurnishingOptions] = useState(FURNISHING_OPTIONS);
  
  const sortBy = currentQuery?.sortBy || 'newest';
  const category = currentQuery?.category || 'buy';
  const resetParams = new URLSearchParams();
  if (category !== 'buy') resetParams.set('category', category);
  const resetHref = resetParams.toString() ? `${basePath}?${resetParams.toString()}` : basePath;

  const activeChips = buildActiveFilterChips(currentQuery, basePath, areaOptions);

  const handleFormSubmit = (e) => {
    if (minPrice > maxPrice) {
      e.preventDefault();
      addToast('Minimum budget should not exceed maximum budget', 'error');
      return false;
    }
  };

  // Sync state with props if they change
  useEffect(() => {
    setMinPrice(currentQuery?.minPrice ? Number(currentQuery.minPrice) : budgetMin);
    setMaxPrice(currentQuery?.maxPrice ? Number(currentQuery.maxPrice) : budgetMax);
  }, [currentQuery?.minPrice, currentQuery?.maxPrice, budgetMin, budgetMax]);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    let mounted = true;

    getSystemBootstrap()
      .then((bootstrap) => {
        if (!mounted) return;

        const dynamicAreas = Array.isArray(bootstrap?.areas)
          ? bootstrap.areas.map((value) => String(value).trim()).filter(Boolean)
          : [];

        const dynamicBhk = Array.isArray(bootstrap?.options?.bhkValues)
          ? bootstrap.options.bhkValues.map((value) => String(value).trim()).filter(Boolean)
          : [];

        const dynamicFurnishing = Array.isArray(bootstrap?.options?.furnishingOptions)
          ? bootstrap.options.furnishingOptions.map((value) => String(value).trim()).filter(Boolean)
          : [];

        if (dynamicAreas.length > 0) {
          setAreaOptions([
            { label: 'All Locations', value: '' },
            ...dynamicAreas.map((area) => ({ label: area, value: area })),
          ]);
        }

        if (dynamicBhk.length > 0) {
          setBhkOptions([
            { label: 'Any', value: '' },
            ...dynamicBhk.map((value) => ({ label: `${value} BHK`, value })),
          ]);
        }

        if (dynamicFurnishing.length > 0) {
          setFurnishingOptions([
            { label: 'Any', value: '' },
            ...dynamicFurnishing.map((val) => ({
              label: val.charAt(0).toUpperCase() + val.slice(1).replace('_', ' '),
              value: val,
            })),
          ]);
        }
      })
      .catch(() => {
        // Component already has static fallbacks.
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleBudgetChange = ({ min, max }) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  return (
    <>
      {/* Mobile Sticky Bar */}
      <div className="lg:hidden sticky top-18.25 z-30 px-4 py-3 -mx-4 sm:-mx-6 bg-white/80 backdrop-blur-md border-b border-slate-100 mb-6">
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
        <div className="sticky top-24 bg-white rounded-2xl p-8 flex flex-col gap-8 shadow-2xl border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Filters</h2>
            </div>
            {activeChips.length > 0 && (
              <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                {activeChips.length}
              </span>
            )}
          </div>

          <FilterContent
            basePath={basePath}
            category={category}
            sortBy={sortBy}
            currentQuery={currentQuery}
            areaOptions={areaOptions}
            bhkOptions={bhkOptions}
            furnishingOptions={furnishingOptions}
            minPrice={minPrice}
            maxPrice={maxPrice}
            budgetMin={budgetMin}
            budgetMax={budgetMax}
            budgetStep={budgetStep}
            isRentPage={isRentPage}
            onBudgetChange={handleBudgetChange}
            onSubmit={handleFormSubmit}
            resetHref={resetHref}
          />
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
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto max-h-[90vh]"
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
          
          <FilterContent
            isMobile
            basePath={basePath}
            category={category}
            sortBy={sortBy}
            currentQuery={currentQuery}
            areaOptions={areaOptions}
            bhkOptions={bhkOptions}
            furnishingOptions={furnishingOptions}
            minPrice={minPrice}
            maxPrice={maxPrice}
            budgetMin={budgetMin}
            budgetMax={budgetMax}
            budgetStep={budgetStep}
            isRentPage={isRentPage}
            onBudgetChange={handleBudgetChange}
            onSubmit={handleFormSubmit}
            onMobileSubmit={() => setIsDrawerOpen(false)}
            resetHref={resetHref}
          />
        </div>
        </div>
      )}
    </>
  );
}
