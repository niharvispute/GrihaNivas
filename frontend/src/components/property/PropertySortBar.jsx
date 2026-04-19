import Link from 'next/link';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price Low-High', value: 'price_asc' },
  { label: 'Price High-Low', value: 'price_desc' },
];

const buildSortHref = (basePath, currentQuery, sortBy) => {
  const params = new URLSearchParams();

  if (currentQuery?.category && currentQuery.category !== 'buy') params.set('category', currentQuery.category);
  if (currentQuery?.area) params.set('area', currentQuery.area);
  if (currentQuery?.minPrice) params.set('minPrice', String(currentQuery.minPrice));
  if (currentQuery?.maxPrice) params.set('maxPrice', String(currentQuery.maxPrice));
  if (currentQuery?.bhk) params.set('bhk', String(currentQuery.bhk));
  if (currentQuery?.furnishing) params.set('furnishing', currentQuery.furnishing);
  if (currentQuery?.view && currentQuery.view !== 'grid') params.set('view', currentQuery.view);
  if (sortBy && sortBy !== 'newest') params.set('sortBy', sortBy);

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};

const buildViewHref = (basePath, currentQuery, view) => {
  const params = new URLSearchParams();

  if (currentQuery?.category && currentQuery.category !== 'buy') params.set('category', currentQuery.category);
  if (currentQuery?.area) params.set('area', currentQuery.area);
  if (currentQuery?.minPrice) params.set('minPrice', String(currentQuery.minPrice));
  if (currentQuery?.maxPrice) params.set('maxPrice', String(currentQuery.maxPrice));
  if (currentQuery?.bhk) params.set('bhk', String(currentQuery.bhk));
  if (currentQuery?.furnishing) params.set('furnishing', currentQuery.furnishing);
  if (currentQuery?.sortBy && currentQuery.sortBy !== 'newest') params.set('sortBy', currentQuery.sortBy);
  if (view && view !== 'grid') params.set('view', view);

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};

export default function PropertySortBar({ basePath, currentQuery }) {
  const activeSort = currentQuery?.sortBy || 'newest';
  const activeView = currentQuery?.view || 'grid';

  return (
    <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100">
      {/* Sort Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <span className="text-slate-500 text-xs sm:text-sm font-medium uppercase tracking-wide">Sort by:</span>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {SORT_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={buildSortHref(basePath, currentQuery, option.value)}
              className={`flex-none px-3 sm:px-5 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all border whitespace-nowrap ${activeSort === option.value ? 'bg-primary text-white shadow-md shadow-primary/20 border-primary' : 'bg-white text-slate-500 hover:bg-slate-100 border-slate-200'}`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {/* View Toggle - Only on Large Screens */}
      <div className="hidden lg:flex items-center justify-end">
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <Link
            href={buildViewHref(basePath, currentQuery, 'grid')}
            className={`p-1.5 sm:p-2 rounded-lg transition-all ${activeView === 'grid' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400 hover:bg-slate-50'}`}
            title="Grid View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          </Link>
          <Link
            href={buildViewHref(basePath, currentQuery, 'list')}
            className={`p-1.5 sm:p-2 rounded-lg transition-all ${activeView === 'list' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400 hover:bg-slate-50'}`}
            title="List View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
