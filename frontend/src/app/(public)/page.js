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
      <section className="relative min-h-[340px] md:min-h-[440px] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBannerImage}
            alt="Mumbai Skyline"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/50"></div>
          <div className="absolute inset-0 bg-linear-to-b from-white/30 via-white/20 to-white"></div>
        </div>

        <div className="relative z-10 text-center w-full max-w-5xl pt-4 md:pt-16">
          <h1 className="type-large-title-32 text-slate-900 mb-2 md:mb-4 uppercase md:text-4xl lg:text-5xl">
            Find Your Dream{' '}
            <span className="text-secondary underline decoration-primary/30 underline-offset-8">
              Property
            </span>{' '}
            in Mumbai
          </h1>
          <p className="type-body-16 font-bold text-slate-700 mb-4 md:mb-6 max-w-2xl mx-auto sm:text-sm md:text-base">
            Curating Mumbai&apos;s most exclusive real estate listings from SoBo luxury to suburban
            sanctuaries.
          </p>

          <HeroSearch />
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
            title="Discovery Path"
            subtitle="Explore properties by your specific needs."
            align="center"
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              {
                title: 'Buy',
                desc: 'Permanent Residencies',
                href: '/buy',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtrP7J1G4WhTfOYemMEfQdOGNosX21kxNtOuO7NwHYCiXkLpDNAOl29r0R11-WorVdi8UdnB0cJGAJP-5qWr6V4sdQ-iSAyUPycFbbP08uSNeP6vzGSWtnpMUOWmcv5cujMW1_eXIH6myhWnV-lHp-b6LkbPOmn_Dan6bax3RktDgx61YuqoLQyruWVI4BwE8PxdNuSgDuWfv2jkdKN2_y303DEHnptYvMF2UzFUxjxz4nJcuf5_T2Bh57y1UPNcHlF0H07_WxZpg',
              },
              {
                title: 'Rent',
                desc: 'Curated Luxury Stays',
                href: '/rent',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0_-GLExTLnnHHswJYutJ0WAmNz4HI89AWs9t6IN9-Pqcv6nHN8M0P-9Oe7AwCvZsIcbyqmuDpRatKEhePTlbj842dsve0MjcTqpxrRXdkzehYTUUd_wGb_Wg2NWXC5RzQ9NrBN7_tXveDhNIA2v8BYrQ86pM8qeiPtBC-wJ5O03h_RFRMj13w6hKBH2grM_7DFwwuU5qYDrXJy7WueQXUpFQ5pP5hZJrzDbislpiWGvaiUbgnHM7iIp-UnVit9eoNXbKNFKAQhbs',
              },
              {
                title: 'Builders',
                desc: "Crafting Mumbai's Skyline",
                href: '/builders',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZFILInTcBoIKclQhYU_2ZcT5VhjD5dPVp-BLTSjIMId6a4p8hlyJvfM9rCB02NnM4aEsZt7xZgnn4aHvxhSipMLnbS7mJ7WYj2QrCEOIajVtB_1km5f3u7Mi4fgaUXxPjS1t0tNw7-gZkE8riGNAPwFfXKpB3pBJHbWQg-Ondx4q3Jn4-56lNXdnXIluPZQJs6ImQjyUHjYWa2DRJ64YAgzGStITyjpS4jEiqfPshklxvq3n6Xlc7wgmkxY1MvuIY_hhUn1L8JLs',
              },
              {
                title: 'New Launch',
                desc: 'Investment Opportunities',
                href: '/new-launch',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNTx25QeH5OPXLzM40sHriQNtaNHjXe5TSk3kPZNuN6hI8HMqMUxkWvTqlZs_mmFuSe8O12Wt4Qgraf6p6G0_Bi1wmS0dbj5vhIXkfKG7vXB7A3yyfkPP3BPUGQut9zn1giIeqYuM3qKwfqwYRDBpEj2xAz8FjiyvZ9HKurADOgk4X-ZOE1nhP1ohd-X0GRuWwrvrerw7DPesDig7_3bQJxOk03B_wwJGiVw6H2LDUFQWP61kaGcywudiZgUP0bakt0OJVlwOdFB0',
              },
            ].map((cat, i) => (
              <Link
                key={i}
                href={cat.href}
                className="group relative h-32 sm:h-52 lg:h-60 rounded-xl sm:rounded-moderate overflow-hidden cursor-pointer block ring-1 ring-slate-200/60"
              >
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
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
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgt1Gw7rG9pP1tt0OoFiHtg92YGnCx50E0UYIKwyzfT-abEQaBd7qSmUEHSzNtQJmXGEkdsPpCvEEkhvhXVl3D_FXvZQHIyfvcHxAowXPc2KTLNl5Dfwufzs0uIHJEik1SxSTmysoIc0mW4h19WYq74qMx9HKZqh2L0KvmHVgxccKA-3OLb-NzTdD6k5S9UIDFFY5vYdllGIRsoEOxf_q3CPb74iT8peU-Dq6dpA1eLcB7M4bPojwj1rDqDhAZFNlAt42ulP2JBCM"
              alt="Luxury Living"
              className="rounded-3xl md:rounded-[3rem] shadow-2xl"
            />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl z-[-1]"></div>
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
              <p className="text-slate-400 text-sm md:text-base font-medium">
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
      <section className="py-6 md:py-10 lg:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary rounded-3xl md:rounded-[3rem] p-6 sm:p-8 md:p-12 lg:p-20 text-white flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-20 items-start lg:items-center shadow-2xl shadow-primary/40 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 lg:w-1/2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 md:mb-6 leading-tight tracking-tighter">
                Your Mumbai Journey
                <br />
                Starts Here.
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-white/80 mb-6 md:mb-10 leading-relaxed font-medium">
                Schedule a private consultation with our area experts. We&apos;ll help you navigate
                the market with data-driven insights.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full border-2 border-primary bg-slate-200 flex items-center justify-center text-primary font-black text-xs ring-2 ring-white/20"
                    >
                      AD
                    </div>
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-bold tracking-tight">
                  + 8 experts online now
                </span>
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
                <p className="mt-4 text-slate-500 leading-relaxed font-medium">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
