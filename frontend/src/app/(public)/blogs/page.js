import BlogCard from '@/components/blog/BlogCard';
import NewsletterSubscribeCard from '@/components/blog/NewsletterSubscribeCard';
import Link from 'next/link';
import CloudinaryImage from '@/components/CloudinaryImage';
import { listBlogs } from '@/services/blogService';

const PAGE_SIZE = 9;

const BLOG_CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Market Trends', value: 'market_trends' },
  { label: 'Buying Guide', value: 'buying_guide' },
  { label: 'Legal', value: 'legal' },
  { label: 'Investment', value: 'investment' },
  { label: 'Lifestyle', value: 'lifestyle' },
];

const getCurrentPage = (rawPage) => {
  const page = Number(rawPage);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
};

const getSearchText = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, 100);
};

const isValidCategory = (value) =>
  BLOG_CATEGORIES.some((item) => item.value === value);

export default async function BlogsPage({ searchParams }) {
  const params = await searchParams;
  const currentPage = getCurrentPage(params?.page);
  const currentCategory = isValidCategory(params?.category || '')
    ? (params?.category || '')
    : '';
  const currentSearch = getSearchText(params?.search);

  let posts = [];
  let meta = null;
  try {
    const response = await listBlogs({
      page: currentPage,
      limit: PAGE_SIZE,
      category: currentCategory || undefined,
      search: currentSearch || undefined,
    });
    posts = response.items || [];
    meta = response.meta || null;
  } catch {
    posts = [];
    meta = null;
  }

  const featured = currentPage === 1 ? posts[0] || null : null;
  const regularPosts = featured ? posts.slice(1) : posts;

  const totalPages = Math.max(1, Number(meta?.totalPages || 1));
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  const visiblePages = [];
  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages, currentPage + 1);
  for (let page = startPage; page <= endPage; page += 1) {
    visiblePages.push(page);
  }

  const buildBlogsHref = (
    page,
    {
      category = currentCategory,
      search = currentSearch,
    } = {}
  ) => {
    const qs = new URLSearchParams();
    if (page > 1) qs.set('page', String(page));
    if (category) qs.set('category', category);
    if (search) qs.set('search', search);
    const query = qs.toString();
    return query ? `/blogs?${query}` : '/blogs';
  };

  return (
    <div className="w-full h-full pt-8 sm:pt-10 lg:pt-12 pb-16 sm:pb-20 lg:pb-24">
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="sr-only">Mumbai Real Estate Blogs</h1>
        {/* 🔍 Category & Search Console */}
        <section className="mb-10 sm:mb-14 lg:mb-16 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 lg:gap-10">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {BLOG_CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={buildBlogsHref(1, { category: cat.value })}
                className={`px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-black tracking-tight transition-all ${currentCategory === cat.value ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
          <form action="/blogs" method="GET" className="w-full lg:max-w-md group flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
            {currentCategory ? <input type="hidden" name="category" value={currentCategory} /> : null}
            <div className="relative flex-1">
              <label htmlFor="blogs-search-input" className="sr-only">Search blogs by keyword</label>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                id="blogs-search-input"
                className="w-full pl-14 pr-5 py-3.5 sm:py-4 bg-white border-none rounded-full shadow-xl sm:shadow-2xl shadow-slate-200/50 focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 text-sm sm:text-base font-bold transition-all"
                placeholder="Search blogs by keyword"
                type="text"
                name="search"
                defaultValue={currentSearch}
              />
            </div>
            <button
              type="submit"
              className="sm:shrink-0 px-6 py-3 sm:py-4 rounded-full bg-primary text-white text-xs font-black tracking-wide hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </form>
        </section>

        {(currentSearch || currentCategory) && (
          <section className="mb-8 sm:mb-10 lg:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Showing results
              {currentCategory ? ` in ${BLOG_CATEGORIES.find((item) => item.value === currentCategory)?.label || currentCategory}` : ''}
              {currentSearch ? ` for "${currentSearch}"` : ''}.
            </p>
            <Link
              href="/blogs"
              className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-slate-500 hover:text-primary transition-colors"
            >
              Clear all
            </Link>
          </section>
        )}

        {/* ⭐ Featured Insight */}
        {featured && (
          <section className="mb-14 sm:mb-20 lg:mb-24">
            <div className="group relative overflow-hidden rounded-4xl sm:rounded-5xl lg:rounded-[3.5rem] bg-white border border-slate-50 shadow-sm flex flex-col lg:flex-row transition-all hover:shadow-2xl duration-700">
              <div className="lg:w-3/5 h-64 sm:h-80 md:h-96 lg:h-auto relative overflow-hidden">
                <img 
                  src={featured.image} 
                  alt={featured.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 lg:top-8 lg:left-8">
                  <span className="bg-white px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-2xl">
                    {featured.category}
                  </span>
                </div>
              </div>
              <div className="lg:w-2/5 p-6 sm:p-8 lg:p-12 xl:p-16 flex flex-col justify-center bg-slate-50/30">
                <div className="mb-4 sm:mb-5 lg:mb-6 flex flex-wrap items-center gap-3 text-slate-700 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                  <span>{featured.date}</span>
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  <span>{featured.readTime}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-4 sm:mb-6 lg:mb-8 leading-tight tracking-tighter group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="text-slate-500 mb-6 sm:mb-8 lg:mb-10 leading-relaxed text-sm sm:text-base lg:text-lg font-medium">
                  {featured.excerpt}
                </p>
                <Link 
                  href={`/blogs/${featured.slug}`} 
                  className="w-full sm:w-fit flex items-center justify-center gap-2 sm:gap-3 bg-primary text-white px-6 sm:px-8 lg:px-10 py-3.5 sm:py-4 lg:py-5 rounded-full font-black text-sm sm:text-base lg:text-lg hover:gap-5 transition-all shadow-2xl shadow-primary/20"
                >
                  Read Full Insight
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-col lg:flex-row gap-10 sm:gap-14 lg:gap-20">
          {/* 📰 Insights Feed (Main Grid) */}
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              {regularPosts.map((post, i) => (
                <div key={i} className="group">
                  <BlogCard post={post} />
                </div>
              ))}
            </div>

            {posts.length === 0 && (
              <p className="text-sm font-medium text-slate-500">
                No blog posts are published yet. Please check back soon.
              </p>
            )}
            
            {/* Pagination */}
            <div className="mt-12 sm:mt-16 lg:mt-20 flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-5">
              {prevPage ? (
                <Link href={buildBlogsHref(prevPage)} className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all font-black">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </Link>
              ) : (
                <span className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-slate-600 bg-slate-50 cursor-not-allowed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </span>
              )}

              {startPage > 1 && (
                <>
                  <Link href={buildBlogsHref(1)} className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all font-black">1</Link>
                  {startPage > 2 && <span className="text-slate-300 font-black tracking-widest px-2">...</span>}
                </>
              )}

              {visiblePages.map((page) => (
                <Link
                  key={page}
                  href={buildBlogsHref(page)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-sm sm:text-base font-black transition-all ${page === currentPage ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'}`}
                >
                  {page}
                </Link>
              ))}

              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && <span className="text-slate-300 font-black tracking-widest px-2">...</span>}
                  <Link href={buildBlogsHref(totalPages)} className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all font-black">{totalPages}</Link>
                </>
              )}

              {nextPage ? (
                <Link href={buildBlogsHref(nextPage)} className="px-6 sm:px-8 lg:px-10 h-10 sm:h-12 lg:h-14 rounded-full flex items-center justify-center gap-2 sm:gap-3 text-slate-900 bg-white border border-slate-100 text-sm sm:text-base font-black tracking-tight hover:shadow-lg transition-all group">
                  Next <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
                </Link>
              ) : (
                <span className="px-6 sm:px-8 lg:px-10 h-10 sm:h-12 lg:h-14 rounded-full flex items-center justify-center gap-2 sm:gap-3 text-slate-600 bg-slate-50 border border-slate-100 text-sm sm:text-base font-black tracking-tight cursor-not-allowed">
                  Next <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </span>
              )}
            </div>
          </div>

          {/* 📎 Sidebar */}
          <aside className="lg:w-1/3">
            <div className="lg:sticky lg:top-32 space-y-8 sm:space-y-10 lg:space-y-12">
              {/* Trending Now */}
              {regularPosts.length > 0 && (
                <div className="px-0 sm:px-2">
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 mb-5 sm:mb-7 tracking-tighter ">Trending <span className="text-primary tracking-normal">Now</span></h4>
                  <div className="space-y-5 sm:space-y-7 lg:space-y-8">
                    {regularPosts.slice(0, 2).map((trend, i) => (
                      <Link key={i} href={`/blogs/${trend.slug}`} className="flex gap-3 sm:gap-4 group cursor-pointer">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 shrink-0 rounded-2xl overflow-hidden shadow-md border-2 border-white group-hover:rotate-3 transition-all duration-500">
                          <CloudinaryImage src={trend.image} alt={trend.title} width={80} height={80} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h5 className="font-black text-[11px] sm:text-xs text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2 tracking-tight">{trend.title}</h5>
                          <span className="text-[9px] text-slate-700 uppercase font-black tracking-widest mt-1.5">{trend.readTime}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <NewsletterSubscribeCard />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
