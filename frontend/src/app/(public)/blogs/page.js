import BlogCard from '@/components/blog/BlogCard';
import Link from 'next/link';
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

  const popularSeries = [
    { label: 'Market Trends', value: 'market_trends', count: 24 },
    { label: 'Investment', value: 'investment', count: 18 },
    { label: 'Legal', value: 'legal', count: 12 },
    { label: 'Buying Guide', value: 'buying_guide', count: 45 },
  ];

  return (
    <div className="w-full h-full pt-12 pb-24">
      <main className="max-w-screen-2xl mx-auto px-8">
        {/* 📖 Editorial Hero */}
        <section className="mb-20 pt-12">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-none">
              Real Estate <br /> <span className="text-primary italic">Insights</span> & Blogs
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed font-medium opacity-80 max-w-2xl">
              Expert advice, market trends, and neighbourhood guides for Mumbai's discerning property seekers. Curated by the city's leading architectural and market analysts.
            </p>
          </div>
        </section>

        {/* 🔍 Category & Search Console */}
        <section className="mb-16 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="flex flex-wrap gap-3">
            {BLOG_CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={buildBlogsHref(1, { category: cat.value })}
                className={`px-8 py-3.5 rounded-full text-sm font-black tracking-tight transition-all ${currentCategory === cat.value ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
          <form action="/blogs" method="GET" className="relative w-full lg:max-w-md group flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            {currentCategory ? <input type="hidden" name="category" value={currentCategory} /> : null}
            <input
              className="w-full pl-16 pr-28 py-5 bg-white border-none rounded-full shadow-2xl shadow-slate-200/50 focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 font-bold transition-all"
              placeholder="Search blogs by keyword"
              type="text"
              name="search"
              defaultValue={currentSearch}
            />
            <button
              type="submit"
              className="absolute right-3 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-black tracking-wide hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </form>
        </section>

        {(currentSearch || currentCategory) && (
          <section className="mb-12 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-slate-500">
              Showing results
              {currentCategory ? ` in ${BLOG_CATEGORIES.find((item) => item.value === currentCategory)?.label || currentCategory}` : ''}
              {currentSearch ? ` for "${currentSearch}"` : ''}.
            </p>
            <Link
              href="/blogs"
              className="text-xs font-black tracking-widest uppercase text-slate-500 hover:text-primary transition-colors"
            >
              Clear all
            </Link>
          </section>
        )}

        {/* ⭐ Featured Insight */}
        {featured && (
          <section className="mb-24">
            <div className="group relative overflow-hidden rounded-[3.5rem] bg-white border border-slate-50 shadow-sm flex flex-col lg:flex-row transition-all hover:shadow-2xl duration-700">
              <div className="lg:w-3/5 h-112.5 lg:h-auto relative overflow-hidden">
                <img 
                  src={featured.image} 
                  alt={featured.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute top-8 left-8">
                  <span className="bg-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-2xl">
                    {featured.category}
                  </span>
                </div>
              </div>
              <div className="lg:w-2/5 p-16 flex flex-col justify-center bg-slate-50/30">
                <div className="mb-6 flex items-center gap-3 text-slate-400 text-xs font-black uppercase tracking-widest">
                  <span>{featured.date}</span>
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  <span>{featured.readTime}</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-8 leading-tight tracking-tighter group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="text-slate-500 mb-10 leading-relaxed text-lg font-medium">
                  {featured.excerpt}
                </p>
                <Link 
                  href={`/blogs/${featured.slug}`} 
                  className="w-fit flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-full font-black text-lg hover:gap-5 transition-all shadow-2xl shadow-primary/20"
                >
                  Read Full Insight
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-col lg:flex-row gap-20">
          {/* 📰 Insights Feed (Main Grid) */}
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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
            <div className="mt-20 flex items-center justify-center gap-5">
              {prevPage ? (
                <Link href={buildBlogsHref(prevPage)} className="w-14 h-14 rounded-full flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all font-black">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </Link>
              ) : (
                <span className="w-14 h-14 rounded-full flex items-center justify-center text-slate-300 bg-slate-50 cursor-not-allowed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </span>
              )}

              {startPage > 1 && (
                <>
                  <Link href={buildBlogsHref(1)} className="w-14 h-14 rounded-full flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all font-black">1</Link>
                  {startPage > 2 && <span className="text-slate-300 font-black tracking-widest px-2">...</span>}
                </>
              )}

              {visiblePages.map((page) => (
                <Link
                  key={page}
                  href={buildBlogsHref(page)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-black transition-all ${page === currentPage ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'}`}
                >
                  {page}
                </Link>
              ))}

              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && <span className="text-slate-300 font-black tracking-widest px-2">...</span>}
                  <Link href={buildBlogsHref(totalPages)} className="w-14 h-14 rounded-full flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all font-black">{totalPages}</Link>
                </>
              )}

              {nextPage ? (
                <Link href={buildBlogsHref(nextPage)} className="px-10 h-14 rounded-full flex items-center justify-center gap-3 text-slate-900 bg-white border border-slate-100 font-black tracking-tight hover:shadow-lg transition-all group">
                  Next <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
                </Link>
              ) : (
                <span className="px-10 h-14 rounded-full flex items-center justify-center gap-3 text-slate-300 bg-slate-50 border border-slate-100 font-black tracking-tight cursor-not-allowed">
                  Next <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </span>
              )}
            </div>
          </div>

          {/* 📎 Sidebar */}
          <aside className="lg:w-1/3">
            <div className="sticky top-32 space-y-12">
              {/* Popular Categories */}
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                <h4 className="text-xl font-black text-slate-900 mb-6 tracking-tighter">Popular Series</h4>
                <div className="space-y-4">
                  {popularSeries.map((cat) => (
                    <Link key={cat.value} href={buildBlogsHref(1, { category: cat.value })} className="flex items-center justify-between group">
                      <span className="text-slate-500 font-black text-xs tracking-tight group-hover:text-primary transition-colors">{cat.label}</span>
                      <span className="bg-white w-9 h-9 flex items-center justify-center rounded-full text-[10px] font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">{cat.count}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending Now */}
              <div className="px-2">
                <h4 className="text-xl font-black text-slate-900 mb-7 tracking-tighter italic">Trending <span className="text-primary tracking-normal">Now</span></h4>
                <div className="space-y-8">
                  {[
                    { title: "Navigating the Resale Market in South Mumbai", time: "10 min read", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrnjcGoKcEUn24VJmBmhIpFaAXEC0YetjJ9SZzLs2gp_mE464NrUBXscX50mymvG6PXL9wO-jEYtzxWFzI8JbdFHq8xJyG1LbOlu5oseUByt4uuI3rnAuCnPRvL54G5pxdafaunXnxjAMIJ8S3IfP7L7IBXdqBcehHR2pd_Iw301FcAd9p8DUoACKUZKvP7bt2s5I4vu7V3qW51vLTvHaacdy_Dq4xGIY8ggzDLDjzHuESn8-gkwp6hH_YExvoTHSZIzGhxCThZCg" },
                    { title: "How Metro Line 3 is Reshaping Property Values", time: "7 min read", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_3Lytpw_NSLWittm05OLvrFTV1lkwAnkTXP-iE-hXzqYb9Xvl3YyypuvyQ4GdbOHZx77dZ4Knuhrma8UjIoQ0s7khhGmNkvI2GhB1sIYj6VvOm3NDh__afskWk1J0Knj2hDMEpAI4RXbgBoj7YRZ-9uVZ85Rj3xg7NNIsciCDNmcmI5CsBbsh2xlUM41pWCu4CmEyUWUtrm2-t9WV8KIcdaPZ6GHxsqTn-i12FFTfdlcx93fUVBq8PT1f1JewFTse7XqHkc1c6Yo" }
                  ].map((trend, i) => (
                    <div key={i} className="flex gap-4 group cursor-pointer">
                      <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden shadow-md border-2 border-white group-hover:rotate-3 transition-all duration-500">
                        <img src={trend.img} alt={trend.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h5 className="font-black text-xs text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2 tracking-tight">{trend.title}</h5>
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1.5">{trend.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-primary p-9 rounded-[3rem] text-white shadow-2xl shadow-primary/40 relative overflow-hidden group">
                <div className="absolute -top-20 -left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-6 opacity-40"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <h4 className="text-2xl font-black mb-3 tracking-tighter leading-none uppercase italic">Subscribe for <br /> Insights</h4>
                <p className="text-white/70 text-xs mb-7 leading-relaxed font-bold">Join 5,000+ investors receiving our weekly analysis.</p>
                <div className="space-y-3">
                  <input 
                    className="w-full px-6 py-4 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-white/40 focus:border-white/40 text-[13px] font-bold transition-all" 
                    placeholder="Your email address" 
                    type="email"
                  />
                  <button className="w-full py-4 rounded-full bg-white text-primary font-black text-xs hover:scale-[1.03] transition-all shadow-2xl shadow-black/10 uppercase tracking-widest">Subscribe Now</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
