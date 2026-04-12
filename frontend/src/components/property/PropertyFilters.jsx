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

export default function PropertyFilters({ basePath, currentQuery }) {
  const sortBy = currentQuery?.sortBy || 'newest';
  const category = currentQuery?.category || 'buy';
  const resetParams = new URLSearchParams();
  if (category !== 'buy') resetParams.set('category', category);
  const resetHref = resetParams.toString() ? `${basePath}?${resetParams.toString()}` : basePath;

  return (
    <aside className="w-full lg:w-80 shrink-0">
      <div className="sticky top-24 bg-white rounded-moderate p-6 flex flex-col gap-8 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-primary mb-1">Filters</h2>
          <p className="text-xs text-slate-400 font-medium">Refine your luxury search</p>
        </div>

        <form className="space-y-8 text-sm" method="GET" action={basePath}>
          {category !== 'buy' ? <input type="hidden" name="category" value={category} /> : null}
          <input type="hidden" name="sortBy" value={sortBy} />

          {/* Location Filter */}
          <div className="space-y-3">
            <label className="font-bold flex items-center gap-2 text-slate-700">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Location
            </label>
            <select name="area" defaultValue={currentQuery?.area || ''} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 appearance-none">
              {AREA_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Budget Filter */}
          <div className="space-y-3">
            <label className="font-bold flex items-center gap-2 text-slate-700">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
              Budget Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="minPrice"
                type="number"
                min="0"
                defaultValue={currentQuery?.minPrice || ''}
                placeholder="Min"
                className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20"
              />
              <input
                name="maxPrice"
                type="number"
                min="0"
                defaultValue={currentQuery?.maxPrice || ''}
                placeholder="Max"
                className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* BHK Type */}
          <div className="space-y-3">
            <label className="font-bold flex items-center gap-2 text-slate-700">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              BHK Type
            </label>
            <select name="bhk" defaultValue={currentQuery?.bhk || ''} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 appearance-none">
              {BHK_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Furnishing */}
          <div className="space-y-3">
            <label className="font-bold flex items-center gap-2 text-slate-700">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
              Furnishing
            </label>
            <select name="furnishing" defaultValue={currentQuery?.furnishing || ''} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 appearance-none">
              {FURNISHING_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="pt-6 space-y-3 border-t border-slate-100">
            <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
              Apply Filters
            </button>
            <Link href={resetHref} className="block w-full text-center text-slate-400 text-xs font-bold hover:text-primary transition-colors underline underline-offset-4 decoration-slate-200">
              Reset All Filters
            </Link>
          </div>
        </form>
      </div>
    </aside>
  );
}
