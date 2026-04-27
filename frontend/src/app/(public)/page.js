import LeadForm from '@/components/forms/LeadForm';
import SectionHeader from '@/components/common/SectionHeader';
import HeroSearch from '@/components/home/HeroSearch';
import Link from 'next/link';
import PropertiesCarousel from '@/components/home/PropertiesCarousel';
import BuildersCarousel from '@/components/home/BuildersCarousel';
import HomePageTestimonials from '@/components/home/HomePageTestimonials';
import { mapPropertyListToCardVM } from '@/lib/mappers/propertyMapper';
import { mapBuilderListToCardVM } from '@/lib/mappers/builderMapper';
import { mapBlogListToCardVM } from '@/lib/mappers/blogMapper';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const DEFAULT_HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDTt4k01Rv0EI75RlMBkam6QUCJiZxmg1pWElVfvID7rJzGZ0OvtAoOIdJrlB8otSwlYcMDK1aDPGzGHb70Ue2s_zCIpF7dgmcFEv9_ATI1Je_KgD_yyAVd5Xbx2dmJdP2AV03KZ3aZmBUBVKayjj31aeM1Ymyv1dCCl64XwHK2YfR5tRqT8xvPbZkcBourkgmbc4Mp0Jd8utO0w_T8VBhyUci1XElabmyXBbVzxZvtI0QlG1K55lIV-KnpVTV2SReMkfBGWCYL2-8';

const TRUST_SIGNALS = [
  { value: 'RERA', label: 'Verified inventory', icon: 'verified' },
  { value: '24 hr', label: 'Concierge callback', icon: 'support_agent' },
  { value: '3K+', label: 'Mumbai buyers guided', icon: 'groups' },
];

const DISCOVERY_CATEGORIES = [
  {
    title: 'Buy',
    desc: 'Ready homes and resale apartments',
    href: '/buy',
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Rent',
    desc: 'Move-in rentals across prime pockets',
    href: '/rent',
    img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Builders',
    desc: 'Trusted names shaping Mumbai',
    href: '/builders',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'New Launch',
    desc: 'Fresh projects and early access',
    href: '/new-launch',
    img: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
  },
];


async function fetchHomeData() {
  const revalidate = 300; // 5-min Next.js data cache

  try {
    const [propRes, buildRes, blogRes, bannerRes] = await Promise.allSettled([
      fetch(`${API_BASE}/api/properties?isFeatured=true&limit=12`, {
        next: { revalidate },
      }),
      fetch(`${API_BASE}/api/builders?isFeatured=true&limit=12`, {
        next: { revalidate },
      }),
      fetch(`${API_BASE}/api/blogs?limit=3`, {
        next: { revalidate },
      }),
      fetch(`${API_BASE}/api/banners`, {
        next: { revalidate },
      }),
    ]);

    const parseJson = async (settled) => {
      if (settled.status !== 'fulfilled' || !settled.value.ok) return null;
      try {
        return await settled.value.json();
      } catch {
        return null;
      }
    };

    const [propJson, buildJson, blogJson, bannerJson] = await Promise.all([
      parseJson(propRes),
      parseJson(buildRes),
      parseJson(blogRes),
      parseJson(bannerRes),
    ]);

    const properties = mapPropertyListToCardVM(propJson?.data || []);
    const builders = mapBuilderListToCardVM(buildJson?.data || []);
    const blogs = mapBlogListToCardVM(blogJson?.data || []);

    const heroBanner = Array.isArray(bannerJson?.data)
      ? bannerJson.data.find((b) => b?.position === 'home_hero') || bannerJson.data[0]
      : null;
    const heroBannerImage = heroBanner?.image?.url || DEFAULT_HERO_IMAGE;

    return { properties, builders, blogs, heroBannerImage };
  } catch {
    return {
      properties: [],
      builders: [],
      blogs: [],
      heroBannerImage: DEFAULT_HERO_IMAGE,
    };
  }
}

export default async function HomePage() {
  const { properties, builders, blogs, heroBannerImage } = await fetchHomeData();
  const latestBlogs = blogs;

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="relative min-h-[430px] md:min-h-[540px] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBannerImage}
            alt="Mumbai Skyline"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/35"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/55 to-white"></div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        <div className="relative z-10 text-center w-full max-w-5xl pt-4 md:pt-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-primary shadow-sm backdrop-blur-md mb-4">
            <span className="material-symbols-outlined text-sm">location_city</span>
            Mumbai Editorial by Bricks
          </div>
          <h1 className="type-large-title-32 text-slate-950 mb-3 md:mb-4 uppercase md:text-4xl lg:text-5xl">
            Find a Mumbai home with{' '}
            <span className="text-secondary underline decoration-primary/30 underline-offset-8">
              verified confidence
            </span>
          </h1>
          <p className="type-body-16 font-bold text-slate-700 mb-5 md:mb-7 max-w-2xl mx-auto sm:text-sm md:text-base">
            Curated projects, trusted builders, and area-led advice for buyers, renters, and new-launch investors.
          </p>

          <HeroSearch />

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 max-w-3xl mx-auto">
            {TRUST_SIGNALS.map((item) => (
              <div key={item.label} className="flex items-center justify-center gap-3 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-left shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-black text-slate-950 leading-none">{item.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Featured Properties Carousel */}
      <PropertiesCarousel properties={properties} />

      {/* 3. Featured Builders Carousel */}
      <BuildersCarousel builders={builders} />

      {/* 4. Categories */}
      <section className="py-6 md:py-10 lg:py-14 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Choose Your Property Path"
            subtitle="Jump into the Mumbai journey that matches your intent."
            align="center"
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {DISCOVERY_CATEGORIES.map((cat, i) => (
              <Link
                key={i}
                href={cat.href}
                className="group relative h-36 sm:h-52 lg:h-64 rounded-2xl overflow-hidden cursor-pointer block border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/80 transition-all duration-500"
              >
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/35 to-transparent"></div>
                <div className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-primary shadow-sm">
                  0{i + 1}
                </div>
                <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6">
                  <h3 className="text-base sm:text-2xl font-black text-white mb-0.5 tracking-tight uppercase leading-tight">
                    {cat.title}
                  </h3>
                  <p className="text-slate-300 text-[10px] sm:text-sm mb-2 sm:mb-4 font-bold line-clamp-1">
                    {cat.desc}
                  </p>
                  <span className="text-white text-[9px] sm:text-xs font-black uppercase tracking-[0.2em] flex items-center gap-1 sm:gap-2 group-hover:translate-x-2 transition-transform">
                    Explore{' '}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Value Proposition */}
      <section className="py-6 md:py-10 lg:py-14 px-4 sm:px-6 lg:px-8 bg-[#f8f7f5]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 lg:gap-20 items-center">
          <div>
            <span className="type-small-10 text-primary mb-4 block tracking-[0.3em]">
              The Bricks Philosophy
            </span>
            <h2 className="type-heading-26 text-slate-900 mb-6 md:mb-8 tracking-tighter sm:text-4xl lg:text-5xl">
              We Don&apos;t Just Find Homes. We Curate{' '}
              <span className="text-primary">Lifestyles.</span>
            </h2>
            <p className="type-body-16 text-slate-500 mb-8 md:mb-12 md:text-lg">
              Mumbai Editorial by Bricks is more than a portal. We are a boutique real estate
              advisory dedicated to the city&apos;s most discerning residents.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {[
                {
                  title: 'Verified Listings',
                  desc: 'Every home is physically inspected by our concierge.',
                  icon: 'verified',
                },
                {
                  title: 'Trusted Network',
                  desc: '10,000+ happy residents across the island city.',
                  icon: 'groups',
                },
                {
                  title: 'Expert Guidance',
                  desc: '24/7 dedicated advisory for your property journey.',
                  icon: 'support_agent',
                },
                {
                  title: 'Legal Support',
                  desc: 'End-to-end paperwork and registration assistance.',
                  icon: 'description',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-bold">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white shadow-2xl shadow-slate-200/90">
            <img
              src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"
              alt="Premium Mumbai apartment living room"
              className="h-full min-h-[360px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/90 p-4 shadow-lg backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Concierge Lens</p>
              <p className="mt-1 text-sm font-black text-slate-900">Shortlists built around commute, possession, paperwork, and resale value.</p>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* 6. Blogs */}
      <section className="py-6 md:py-10 lg:py-14 bg-slate-900 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-5 mb-10 md:mb-12 lg:mb-14">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-3 md:mb-4">
                Inside Mumbai Real Estate
              </h2>
              <p className="text-slate-400 text-sm md:text-base font-bold">
                Expert analysis, neighborhood deep-dives, and market forecasts.
              </p>
            </div>
            <Link
              href="/blogs"
              className="text-white font-black flex items-center gap-2 hover:translate-x-1 transition-transform uppercase text-xs tracking-widest"
            >
              Read All Articles
            </Link>
          </div>
          {latestBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 lg:gap-10">
              {latestBlogs.map((blog, i) => (
                <Link
                  key={i}
                  href={`/blogs/${blog.slug}`}
                  className="group cursor-pointer block"
                >
                  <div className="aspect-11/8 sm:aspect-16/10 overflow-hidden rounded-xl sm:rounded-2xl mb-3 sm:mb-6 relative">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                    />
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                      <span className="bg-primary text-white text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-tighter">
                        {blog.category}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-lg md:text-xl font-black mb-1.5 sm:mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-2 uppercase">
                    {blog.title}
                  </h3>
                  <p className="text-slate-400 text-[10px] sm:text-sm line-clamp-1 sm:line-clamp-2 font-bold leading-relaxed">
                    {blog.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 md:py-20 rounded-2xl border-2 border-dashed border-white/10 bg-white/5">
              <span className="material-symbols-outlined text-5xl text-white/20 mb-4">article</span>
              <p className="text-white/40 font-bold text-sm md:text-base">No articles published yet — editorial content coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* 7. Testimonials */}
      <HomePageTestimonials />

      {/* 8. Lead Capture */}
      <section className="py-6 md:py-10 lg:py-14 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-950 rounded-2xl p-6 sm:p-8 md:p-12 lg:p-16 text-white flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16 items-start lg:items-center shadow-2xl shadow-slate-300/80 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(184,0,73,0.35),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)]"></div>
            <div className="relative z-10 lg:w-1/2">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/50 mb-4">Private Advisory</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 md:mb-6 leading-tight tracking-tighter">
                Get a sharper shortlist before you spend weekends visiting.
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-white/80 mb-6 md:mb-10 leading-relaxed font-bold">
                Tell us your budget, commute, and possession timeline. Our area experts will suggest verified projects and next steps.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {['Area match', 'RERA check', 'Loan assist'].map((label) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    <p className="mt-2 text-xs font-black uppercase tracking-wider text-white">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <a
                  href="tel:+919222456789"
                  className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-5 py-3 transition-all group w-fit"
                >
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 5.55 5.55l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.92z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest leading-none mb-0.5">Contact Now</p>
                    <p className="text-white font-black text-sm sm:text-base tracking-tight">+91 92224 56789</p>
                  </div>
                </a>
              </div>
            </div>
            <div className="relative z-10 lg:w-1/2 w-full">
              <LeadForm title="Get Free Consultation" />
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="py-6 md:py-10 lg:py-14 px-4 sm:px-6 lg:px-8 bg-[#f8f7f5]">
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            title="FAQs"
            subtitle="Everything you need to know about properties in Mumbai."
            align="center"
          />
          <div className="space-y-4">
            {[
              {
                q: 'What are the current luxury rates in Worli?',
                a: 'Luxury properties in Worli range from ₹45k to ₹85k per sq.ft depending on sea views and amenities.',
              },
              {
                q: 'Do you provide home loan assistance?',
                a: 'Yes, we have tie-ups with leading banks for preferential rates and fast-track processing.',
              },
              {
                q: 'Are all listings RERA registered?',
                a: 'Exclusively. We only list properties with verified RERA IDs for complete security.',
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-white rounded-2xl p-4 sm:p-5 md:p-6 cursor-pointer border border-slate-200 open:border-primary/25 transition-all"
              >
                <summary className="flex justify-between items-center gap-3 font-bold text-base md:text-lg list-none text-slate-900 group-open:text-primary transition-colors">
                  {faq.q}
                  <svg
                    className="transition-transform group-open:rotate-180 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <p className="mt-4 text-slate-500 leading-relaxed font-bold">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
