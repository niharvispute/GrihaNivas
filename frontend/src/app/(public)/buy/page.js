import PropertyCard from '@/components/property/PropertyCard';
import PropertyFilters from '@/components/property/PropertyFilters';
import PropertyGrid from '@/components/property/PropertyGrid';
import PropertySortBar from '@/components/property/PropertySortBar';
import Link from 'next/link';
import { listProperties } from '@/services/propertyService';

export const metadata = {
  title: 'Buy Property in Mumbai',
  description: 'Browse flats, apartments, villas, and new launches available for sale across Mumbai. Filter by BHK, area, price and more.',
  openGraph: {
    title: 'Buy Property in Mumbai | Bricks',
    description: 'Explore thousands of properties for sale in Mumbai — from affordable flats to luxury villas.',
  },
};

const PAGE_SIZE = 12;
const BASE_PATH = '/buy';
const ALLOWED_CATEGORY = new Set(['buy', 'new_launch']);
const ALLOWED_SORT = new Set(['newest', 'price_asc', 'price_desc']);
const ALLOWED_FURNISHING = new Set(['unfurnished', 'semi_furnished', 'furnished']);

const CATEGORY_CONTENT = {
  buy: {
    breadcrumb: 'Properties for Sale',
    title: 'Luxury Homes in Mumbai',
    description:
      "Discover curated luxury residences across South Mumbai, Bandra, and beyond. Refined living in India's most vibrant skyline.",
  },
  new_launch: {
    breadcrumb: 'New Launches',
    title: 'New Launch Projects in Mumbai',
    description:
      'Browse newly launched developments with early pricing, curated amenities, and high-growth locations.',
  },
};

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

const normalizeCategory = (value) => {
  if (!ALLOWED_CATEGORY.has(value)) return 'buy';
  return value;
};

const buildListingHref = (basePath, query, page) => {
  const params = new URLSearchParams();
  if (query.category && query.category !== 'buy') params.set('category', query.category);
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
  const currentCategory = normalizeCategory(params?.category || 'buy');
  const currentQuery = {
    category: currentCategory,
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
      category: currentCategory,
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

  const categoryContent = CATEGORY_CONTENT[currentCategory] || CATEGORY_CONTENT.buy;

  return (
    <main className="w-full">
      {/* Breadcrumbs & Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 lg:py-14">
        <nav aria-label="Breadcrumb" className="flex text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 sm:mb-4">
          <ol className="inline-flex items-center space-x-2">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li className="flex items-center">
              <svg className="w-3 h-3 mx-1 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              <span className="text-primary truncate">{categoryContent.breadcrumb}</span>
            </li>
          </ol>
        </nav>
        <span className="type-small-10 text-primary mb-3 block tracking-[0.3em]">Mumbai Real Estate</span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 mb-3 sm:mb-4">
          {categoryContent.title}
        </h1>
        <p className="text-slate-500 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed font-medium">
          {categoryContent.description}
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
            <div className="flex flex-col items-center justify-center py-16 md:py-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 mt-6">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">home_work</span>
              <p className="text-slate-500 font-bold text-sm md:text-base">No listings available in this category right now — check back shortly.</p>
            </div>
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
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-colors ${page === currentPage ? 'bg-primary text-white shadow-lg' : 'hover:bg-slate-100 text-slate-600'}`}
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

      
    </main>
  );
}
