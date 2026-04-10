import BlogCard from '@/components/blog/BlogCard';
import SectionHeader from '@/components/common/SectionHeader';
import Link from 'next/link';

const BLOG_POSTS = [
  {
    slug: "sobo-penthouses-2024",
    title: "The Rise of Luxury Penthouses in South Mumbai: 2024 Outlook",
    category: "Market Trends",
    date: "Jan 24, 2024",
    readTime: "8 min read",
    excerpt: "As the Mumbai skyline evolves, we explore why ultra-high-net-worth individuals are shifting their gaze towards vertical villas in the heart of SoBo.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoC8WjizGKI4ePTId9IbJ7gB4maklHRxYRz_ClTmEPf-l3We_0DEbwKBCsW-U8lCaf1C8wHUrZ5shDw55LzERXB65IKPuwNF5zO_W0k0k0IaVuyjqf14alNCyQx83ChlOhQlKNVJlAT6MIsDCuHhZJof_NmQi0qre-vjMu43bMxKGLJd2GAmFILab7-G3QRkhGnFbaGCmINfJSI6EkgRHCl8qj_xJIq36zNHuZU9zERUROWFno4khR8Fi9vroyaFN_Qbq1aGmsVTE",
    isFeatured: true
  },
  {
    slug: "rera-buyer-guide",
    title: "Understanding RERA: A Comprehensive Buyer's Guide",
    category: "Legal Guides",
    date: "Feb 12, 2024",
    readTime: "12 min read",
    excerpt: "Navigating the complexities of real estate regulations in Maharashtra doesn't have to be daunting. We break down what every homebuyer needs to know.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZxlUWqjcmXVU3-0V7R9j0bP65ux8kF3Am29Sz4ty685sW5TQoqVYhP21fYbUgkxH3cP8aefwN8weToPc70jKbWFM9WkVWx4RocB7Miam0mNmPO78wFhHmuCbX2qws7e4X8ytzoD_2oEMDUdIRQeqpXu7UOaXjt7z4Qz7suRtch67Dn-MUPlpFI6sB868V05xNLEktyIwFnrodArdZU4jpnKjLwgjeYQss5YBlR6d-JBweMmZaZG3eYOih942yIIDKUry-FW-pS5Q"
  },
  {
    slug: "bandra-localities",
    title: "Top 5 Up-and-coming Localities in Bandra West",
    category: "Neighborhoods",
    date: "Mar 05, 2024",
    readTime: "6 min read",
    excerpt: "Bandra remains the queen of suburbs, but new pockets are emerging as prime investment hubs. Discover where to put your money next.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDb9yNB-tM91W37RfbInB714zG9-QUmDq-oE8mDuIxSVx5tuYtb4LbC8gKRi8GcY2V4dbUNnLsYMh1LEg0E2SPCBWAu2uvuo1A3kKQBATI2nXlWusLE45-7GAvluilryWaLrXdjbX4zhp7rdsl_dzVAQzKxjHZsFI3HlViKhW5ay48Qt-mYZQ9R_fB2xStkSDAtKXnt-qMX-aJtDWuZWDPYi5zEW4VvH3zhs7M0DCxykZWfGdX0N452cB4mdE8uoD1dNiv_NE-qq_o"
  },
  {
    slug: "commercial-gold-mine",
    title: "Why Commercial Real Estate is the New Gold Mine",
    category: "Investment Tips",
    date: "Mar 20, 2024",
    readTime: "10 min read",
    excerpt: "With fractional ownership becoming a reality, commercial spaces are no longer just for big corporations.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEjstFR2wZUFwmx5wCSZy9cSfVG2U6n3czDdKQzkwv7R3T4as4jBDqcuIDhjRpDqjg2o7k_9G6FhaPHSVTBr2w6XLyTrB3YOVFlgxVCI6xKGlYmyKEVnu9ilRdj-ZVYIIynIsobCUxqjR9dnQERUuvQxoEpVASwWKgb0hVZHHkInNS3JWLoXN8IvX6P5M07DcLJr-unFsPoLFW-7ck22HeMWWPdi2FDeXHrt9OWu-vobdzSDgJrkA4Do8eJg2e3wv4WwN5f8hqxtc"
  },
  {
    slug: "sustainable-luxury",
    title: "Sustainable Luxury: The New Home Standard",
    category: "Market Trends",
    date: "Apr 02, 2024",
    readTime: "7 min read",
    excerpt: "Mumbai developers are integrating green tech into premium projects. Is sustainability the ultimate luxury in 2024?",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKdNTyGZiEcgxwR_d7WO9Lsty_B171kQ9HdLZxMqiLFaXd71oIFK5lVlxh2DYZRP6k6UjRjBwvpa06XL08I29dSH0aXrGTnjBIPzr7b7x30PnS7Vh-nOBpeYZ3N-XMhzrr8VVOpGrWn_IBWNPF9Ohi-mPQoIa2CpimI0wb4LjhoO1d3Wie4tzr5UQ-yP859jQNDHnSAquJlKKRNXrslN6PBmDhynfXmkhWorBnSS9jJ2NuQMhqPJz1o2ib1n6F0nnPCSBQBzK26JQ"
  }
];

export default function BlogsPage() {
  const featured = BLOG_POSTS.find(p => p.isFeatured);
  const regularPosts = BLOG_POSTS.filter(p => !p.isFeatured);

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
            {['All', 'Market Trends', 'Legal Guides', 'Investment Tips', 'Neighborhood Reviews'].map((cat, i) => (
              <button 
                key={i} 
                className={`px-8 py-3.5 rounded-full text-sm font-black tracking-tight transition-all ${i === 0 ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:max-w-md group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              className="w-full pl-16 pr-8 py-5 bg-white border-none rounded-full shadow-2xl shadow-slate-200/50 focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 font-bold transition-all" 
              placeholder="Search blogs by keyword" 
              type="text"
            />
          </div>
        </section>

        {/* ⭐ Featured Insight */}
        {featured && (
          <section className="mb-24">
            <div className="group relative overflow-hidden rounded-[3.5rem] bg-white border border-slate-50 shadow-sm flex flex-col lg:flex-row transition-all hover:shadow-2xl duration-700">
              <div className="lg:w-3/5 h-[450px] lg:h-auto relative overflow-hidden">
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
                  <BlogCard blog={post} />
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="mt-20 flex items-center justify-center gap-5">
              <button className="w-14 h-14 rounded-full flex items-center justify-center bg-primary text-white font-black shadow-xl shadow-primary/20 animate-pulse-subtle">1</button>
              <button className="w-14 h-14 rounded-full flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all font-black">2</button>
              <button className="w-14 h-14 rounded-full flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all font-black">3</button>
              <span className="text-slate-300 font-black tracking-widest px-2">...</span>
              <button className="px-10 h-14 rounded-full flex items-center justify-center gap-3 text-slate-900 bg-white border border-slate-100 font-black tracking-tight hover:shadow-lg transition-all group">
                Next <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>

          {/* 📎 Sidebar */}
          <aside className="lg:w-1/3">
            <div className="sticky top-32 space-y-12">
              {/* Popular Categories */}
              <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
                <h4 className="text-2xl font-black text-slate-900 mb-8 tracking-tighter">Popular Series</h4>
                <div className="space-y-6">
                  {[
                    { name: 'Market Trends', count: 24 },
                    { name: 'Investment Tips', count: 18 },
                    { name: 'Legal Guides', count: 12 },
                    { name: 'Neighbourhoods', count: 45 }
                  ].map((cat, i) => (
                    <Link key={i} href={`/blogs?category=${cat.name}`} className="flex items-center justify-between group">
                      <span className="text-slate-500 font-black text-sm tracking-tight group-hover:text-primary transition-colors">{cat.name}</span>
                      <span className="bg-white w-10 h-10 flex items-center justify-center rounded-full text-xs font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">{cat.count}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending Now */}
              <div>
                <h4 className="text-2xl font-black text-slate-900 mb-8 tracking-tighter italic">Trending <span className="text-primary tracking-normal">Now</span></h4>
                <div className="space-y-10">
                  {[
                    { title: "Navigating the Resale Market in South Mumbai", time: "10 min read", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrnjcGoKcEUn24VJmBmhIpFaAXEC0YetjJ9SZzLs2gp_mE464NrUBXscX50mymvG6PXL9wO-jEYtzxWFzI8JbdFHq8xJyG1LbOlu5oseUByt4uuI3rnAuCnPRvL54G5pxdafaunXnxjAMIJ8S3IfP7L7IBXdqBcehHR2pd_Iw301FcAd9p8DUoACKUZKvP7bt2s5I4vu7V3qW51vLTvHaacdy_Dq4xGIY8ggzDLDjzHuESn8-gkwp6hH_YExvoTHSZIzGhxCThZCg" },
                    { title: "How Metro Line 3 is Reshaping Property Values", time: "7 min read", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_3Lytpw_NSLWittm05OLvrFTV1lkwAnkTXP-iE-hXzqYb9Xvl3YyypuvyQ4GdbOHZx77dZ4Knuhrma8UjIoQ0s7khhGmNkvI2GhB1sIYj6VvOm3NDh__afskWk1J0Knj2hDMEpAI4RXbgBoj7YRZ-9uVZ85Rj3xg7NNIsciCDNmcmI5CsBbsh2xlUM41pWCu4CmEyUWUtrm2-t9WV8KIcdaPZ6GHxsqTn-i12FFTfdlcx93fUVBq8PT1f1JewFTse7XqHkc1c6Yo" }
                  ].map((trend, i) => (
                    <div key={i} className="flex gap-6 group cursor-pointer">
                      <div className="w-24 h-24 shrink-0 rounded-3xl overflow-hidden shadow-lg border-2 border-white group-hover:rotate-3 transition-all duration-500">
                        <img src={trend.img} alt={trend.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h5 className="font-black text-sm text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2 tracking-tight">{trend.title}</h5>
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-2">{trend.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-primary p-12 rounded-[3.5rem] text-white shadow-2xl shadow-primary/40 relative overflow-hidden group">
                <div className="absolute -top-20 -left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-8 opacity-40"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <h4 className="text-3xl font-black mb-4 tracking-tighter leading-none">Subscribe for <br /> Insights</h4>
                <p className="text-white/70 text-sm mb-8 leading-relaxed font-medium">Join 5,000+ investors receiving our weekly analysis.</p>
                <div className="space-y-4">
                  <input 
                    className="w-full px-8 py-5 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-white/40 focus:border-white/40 text-sm font-bold transition-all" 
                    placeholder="Your email address" 
                    type="email"
                  />
                  <button className="w-full py-5 rounded-full bg-white text-primary font-black text-sm hover:scale-[1.03] transition-all shadow-2xl shadow-black/10">Subscribe Now</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
