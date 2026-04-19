import Link from 'next/link';

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
    chips.push({ label: `Location: ${label}`, removeHref: `${basePath}${params.toString() ? `?${params}` : ''}` });
  }

  if (currentQuery.minPrice || currentQuery.maxPrice) {
    const min = currentQuery.minPrice ? `₹${(Number(currentQuery.minPrice) / 10000000).toFixed(1)} Cr` : '';
    const max = currentQuery.maxPrice ? `₹${(Number(currentQuery.maxPrice) / 10000000).toFixed(1)} Cr` : '';
    const rangeLabel = min && max ? `${min} – ${max}` : min || max;
    const params = new URLSearchParams();
    if (currentQuery.category && currentQuery.category !== 'buy') params.set('category', currentQuery.category);
    if (currentQuery.area) params.set('area', currentQuery.area);
    if (currentQuery.bhk) params.set('bhk', currentQuery.bhk);
    if (currentQuery.furnishing) params.set('furnishing', currentQuery.furnishing);
    if (currentQuery.sortBy && currentQuery.sortBy !== 'newest') params.set('sortBy', currentQuery.sortBy);
    chips.push({ label: `Budget: ${rangeLabel}`, removeHref: `${basePath}${params.toString() ? `?${params}` : ''}` });
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

  if (currentQuery.furnishing) {
    const label = FURNISHING_OPTIONS.find((o) => o.value === currentQuery.furnishing)?.label || currentQuery.furnishing;
    const params = new URLSearchParams();
    if (currentQuery.category && currentQuery.category !== 'buy') params.set('category', currentQuery.category);
    if (currentQuery.area) params.set('area', currentQuery.area);
    if (currentQuery.minPrice) params.set('minPrice', currentQuery.minPrice);
    if (currentQuery.maxPrice) params.set('maxPrice', currentQuery.maxPrice);
    if (currentQuery.bhk) params.set('bhk', currentQuery.bhk);
    if (currentQuery.sortBy && currentQuery.sortBy !== 'newest') params.set('sortBy', currentQuery.sortBy);
    chips.push({ label, removeHref: `${basePath}${params.toString() ? `?${params}` : ''}` });
  }

  return chips;
}

export default function PropertyFilters({ basePath, currentQuery }) {
  const sortBy = currentQuery?.sortBy || 'newest';
  const category = currentQuery?.category || 'buy';
  const resetParams = new URLSearchParams();
  if (category !== 'buy') resetParams.set('category', category);
  const resetHref = resetParams.toString() ? `${basePath}?${resetParams.toString()}` : basePath;

  const activeChips = buildActiveFilterChips(currentQuery, basePath);

  return (
    <aside className="w-full lg:w-80 shrink-0">
      {/* Active Filter Chips — shown above results on mobile, inside sidebar on desktop */}
      {activeChips.length > 0 && (
        <div className="mb-4 lg:hidden flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Filters:</span>
          {activeChips.map((chip) => (
            <Link
              key={chip.label}
              href={chip.removeHref}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
            >
              {chip.label}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </Link>
          ))}
          <Link href={resetHref} className="text-xs text-slate-400 font-bold hover:text-primary transition-colors underline underline-offset-4">
            Clear all
          </Link>
        </div>
      )}

      <div className="sticky top-24 bg-white rounded-moderate p-6 flex flex-col gap-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary mb-0.5">Filters</h2>
            <p className="text-xs text-slate-400 font-medium">Refine your search</p>
          </div>
          {activeChips.length > 0 && (
            <span className="bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded-full">
              {activeChips.length} active
            </span>
          )}
        </div>

        {/* Active chips inside sidebar (desktop) */}
        {activeChips.length > 0 && (
          <div className="hidden lg:flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <Link
                key={chip.label}
                href={chip.removeHref}
                className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-bold px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
              >
                {chip.label}
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </Link>
            ))}
          </div>
        )}

        <form className="space-y-6 text-sm" method="GET" action={basePath}>
          {category !== 'buy' ? <input type="hidden" name="category" value={category} /> : null}
          <input type="hidden" name="sortBy" value={sortBy} />

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="font-bold flex items-center gap-2 text-slate-700 text-xs uppercase tracking-wide">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Location
            </label>
            <select
              name="area"
              defaultValue={currentQuery?.area || ''}
              className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20 appearance-none"
            >
              {AREA_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Budget Filter */}
          <div className="space-y-2">
            <label className="font-bold flex items-center gap-2 text-slate-700 text-xs uppercase tracking-wide">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
              Budget
              <span className="text-slate-400 font-medium normal-case tracking-normal text-[10px]">(₹ in Crores)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                <input
                  name="minPrice"
                  type="number"
                  min="0"
                  defaultValue={currentQuery?.minPrice || ''}
                  placeholder="Min Cr"
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-7 pr-3 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                <input
                  name="maxPrice"
                  type="number"
                  min="0"
                  defaultValue={currentQuery?.maxPrice || ''}
                  placeholder="Max Cr"
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-7 pr-3 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Enter value in crores, e.g. 2.5 = ₹2.5 Cr</p>
          </div>

          {/* BHK Type */}
          <div className="space-y-2">
            <label className="font-bold flex items-center gap-2 text-slate-700 text-xs uppercase tracking-wide">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              BHK Type
            </label>
            <select
              name="bhk"
              defaultValue={currentQuery?.bhk || ''}
              className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20 appearance-none"
            >
              {BHK_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Furnishing */}
          <div className="space-y-2">
            <label className="font-bold flex items-center gap-2 text-slate-700 text-xs uppercase tracking-wide">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M8 21v-4"/><path d="M16 21v-4"/></svg>
              Furnishing
            </label>
            <select
              name="furnishing"
              defaultValue={currentQuery?.furnishing || ''}
              className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20 appearance-none"
            >
              {FURNISHING_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 space-y-3 border-t border-slate-100">
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 text-sm"
            >
              Apply Filters
            </button>
            <Link
              href={resetHref}
              className="block w-full text-center text-slate-400 text-xs font-bold hover:text-primary transition-colors underline underline-offset-4 decoration-slate-200"
            >
              Reset All Filters
            </Link>
          </div>
        </form>
      </div>
    </aside>
  );
}
