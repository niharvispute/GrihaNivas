import PropertyCard from '@/components/property/PropertyCard';
import PropertyFilters from '@/components/property/PropertyFilters';
import PropertyGrid from '@/components/property/PropertyGrid';
import PropertySortBar from '@/components/property/PropertySortBar';
import Link from 'next/link';
import { listProperties } from '@/services/propertyService';

const PAGE_SIZE = 12;
const BASE_PATH = '/rent';
const ALLOWED_SORT = new Set(['newest', 'price_asc', 'price_desc']);
const ALLOWED_FURNISHING = new Set(['unfurnished', 'semi_furnished', 'furnished']);

const getCurrentPage = (rawPage) => {
  const page = Number(rawPage);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
};

const normalizeText = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const normalizeNumberString = (value) => {
  if (value === undefined || value === null || value === '') return '';
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return '';
  return String(Math.floor(number));
};

const normalizeBhk = (value) => {
  const numeric = normalizeNumberString(value);
  if (!numeric) return '';
  const bhk = Number(numeric);
  if (bhk < 1 || bhk > 10) return '';
  return String(bhk);
};

const normalizeSort = (value) => {
  if (!ALLOWED_SORT.has(value)) return 'newest';
  return value;
};

const normalizeFurnishing = (value) => {
  if (!ALLOWED_FURNISHING.has(value)) return '';
  return value;
};

const buildListingHref = (basePath, query, page) => {
  const params = new URLSearchParams();
  if (query.area) params.set('area', query.area);
  if (query.minPrice) params.set('minPrice', query.minPrice);
  if (query.maxPrice) params.set('maxPrice', query.maxPrice);
  if (query.bhk) params.set('bhk', query.bhk);
  if (query.furnishing) params.set('furnishing', query.furnishing);
  if (query.sortBy && query.sortBy !== 'newest') params.set('sortBy', query.sortBy);
  if (query.view && query.view !== 'grid') params.set('view', query.view);
  if (page > 1) params.set('page', String(page));

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};

export default async function PropertiesPage({ searchParams }) {
  const params = await searchParams;
  const currentPage = getCurrentPage(params?.page);
  const currentQuery = {
    area: normalizeText(params?.area),
    minPrice: normalizeNumberString(params?.minPrice),
    maxPrice: normalizeNumberString(params?.maxPrice),
    bhk: normalizeBhk(params?.bhk),
    furnishing: normalizeFurnishing(params?.furnishing),
    sortBy: normalizeSort(params?.sortBy),
    view: params?.view === 'list' ? 'list' : 'grid',
  };

  let properties = [];
  let meta = null;
  try {
    const response = await listProperties({
      category: 'rent',
      limit: PAGE_SIZE,
      page: currentPage,
      sortBy: currentQuery.sortBy,
      ...(currentQuery.area ? { area: currentQuery.area } : {}),
      ...(currentQuery.minPrice ? { minPrice: currentQuery.minPrice } : {}),
      ...(currentQuery.maxPrice ? { maxPrice: currentQuery.maxPrice } : {}),
      ...(currentQuery.bhk ? { bhk: currentQuery.bhk } : {}),
      ...(currentQuery.furnishing ? { furnishing: currentQuery.furnishing } : {}),
    });
    properties = response.items || [];
    meta = response.meta || null;
  } catch {
    properties = [];
    meta = null;
  }

  const totalPages = Math.max(1, Number(meta?.totalPages || 1));
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  const visiblePages = [];
  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages, currentPage + 1);
  for (let page = startPage; page <= endPage; page += 1) {
    visiblePages.push(page);
  }

  return (
    <main className="w-full">
      {/* Breadcrumbs & Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 sm:mb-4">
          <ol className="inline-flex items-center space-x-2">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li className="flex items-center">
              <svg className="w-3 h-3 mx-1 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              <span className="text-primary truncate">Properties for Rent</span>
            </li>
          </ol>
        </nav>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tighter text-slate-900 mb-3 sm:mb-4">
          Mumbai Rental Properties
        </h1>
        <p className="text-slate-500 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
          Discover curated luxury residences across South Mumbai, Bandra, and beyond.
          Refined living in India's most vibrant skyline.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Sidebar Filters */}
        <PropertyFilters basePath={BASE_PATH} currentQuery={currentQuery} />

        {/* Main Content */}
        <div className="grow w-full">
          <PropertySortBar basePath={BASE_PATH} currentQuery={currentQuery} />
          
          <PropertyGrid columns={currentQuery.view === 'list' ? 1 : 2}>
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                variant={currentQuery.view === 'list' ? 'horizontal' : 'vertical'}
              />
            ))}
          </PropertyGrid>

          {properties.length === 0 && (
            <p className="mt-8 text-sm font-medium text-slate-500">
              No rental listings are available right now. Please check back shortly.
            </p>
          )}

          {/* Pagination */}
          <div className="mt-12 sm:mt-16 lg:mt-20 flex justify-center items-center gap-1 sm:gap-2 flex-wrap">
            {prevPage ? (
              <Link href={buildListingHref(BASE_PATH, currentQuery, prevPage)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </Link>
            ) : (
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-300 cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </span>
            )}

            {startPage > 1 && (
              <>
                <Link href={buildListingHref(BASE_PATH, currentQuery, 1)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-slate-100 font-bold text-xs sm:text-sm text-slate-600 transition-colors">1</Link>
                {startPage > 2 && <span className="px-1 text-slate-300 text-xs">...</span>}
              </>
            )}

            {visiblePages.map((page) => (
              <Link
                key={page}
                href={buildListingHref(BASE_PATH, currentQuery, page)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-colors ${page === currentPage ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                {page}
              </Link>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span className="px-1 text-slate-300 text-xs">...</span>}
                <Link href={buildListingHref(BASE_PATH, currentQuery, totalPages)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-slate-100 font-bold text-xs sm:text-sm text-slate-600 transition-colors">{totalPages}</Link>
              </>
            )}

            {nextPage ? (
              <Link href={buildListingHref(BASE_PATH, currentQuery, nextPage)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-primary hover:bg-slate-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </Link>
            ) : (
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-300 cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating Contact CTA — hidden on mobile (WhatsApp button handles mobile) */}
      <a
        href="https://wa.me/919222456789?text=Hi!%20I%20found%20a%20listing%20on%20Mumbai%20Editorial%20and%20I%27d%20like%20to%20know%20more."
        target="_blank"
        rel="noreferrer noopener"
        className="hidden md:flex fixed bottom-24 right-6 z-40 bg-primary text-white items-center gap-3 px-6 py-3.5 rounded-full shadow-2xl hover:scale-105 transition-all font-bold active:scale-95 group text-sm"
      >
        <svg className="group-hover:rotate-12 transition-transform" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Contact Expert
      </a>
    </main>
  );
}
