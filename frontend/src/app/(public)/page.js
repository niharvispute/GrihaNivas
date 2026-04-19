'use client';

import { useEffect, useState } from 'react';
import LeadForm from '@/components/forms/LeadForm';
import SectionHeader from '@/components/common/SectionHeader';
import HeroSearch from '@/components/home/HeroSearch';
import Link from 'next/link';
import { listBlogs } from '@/services/blogService';
import { listProperties } from '@/services/propertyService';

const MOCK_BLOGS = [
  {
    slug: "sobo-surge-2024",
    title: "Why South Mumbai Real Estate is Seeing a 20% Surge",
    category: "Market Trends",
    date: "Jan 24, 2024",
    readTime: "8 min read",
    excerpt: "An in-depth look at the infrastructure projects driving property prices in Mumbai's most expensive areas.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSML6vyWgiqELp9quxULVYzQKDqLv-NoWn1ljBf10FjCuzot5I-meCNA2ZJ1c0erZuXzo2Dy3giH_SatuD8OdU1wk0qupDoRqjwMzT1I466iENthPbssGlUE366Essvx5W5Z4Ti2tT-BzjzR2V1u8LPF_jvvWfCGr1L-kxPKwmRrc69tfyeSsJbWHOmOAlGR0amfIVmxEItIj6Pdcmr8ipXjQdAgaLzcCfkreH0iMDSAIwtgaB5_OL8d2saER0F3lAln0-sUwW5SI"
  },
  {
    slug: "maximising-small-spaces",
    title: "Maximizing Small Spaces: Apartment Living Guide",
    category: "Interior Design",
    date: "Feb 10, 2024",
    readTime: "5 min read",
    excerpt: "Clever design hacks and furniture choices for Mumbai's mid-range luxury apartments.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFIn59q4A7byfRd9Ehu0BUhysDvlO1dFDOOp8M2_y4b1lQ4Vwek3L-nt-moS87FpbmEgYHHjdmokqKNda2Vo1wfKr5yzvpnxuPc0tZ3zJpOXVOTvvDbRI8a3F-06Xm39hk7ojkvdj-lSfHl1rQbsssNCkFeBnPBGEGL16OGLD33S8sLrmvn19V_XZpoPPOr-IRdWnFZaY0pBSFTy4NslnCNdkLDgP-vmSCcZOeCyHrYK45D_K2xlAfY9Ga6cxafCGbkEu4Gj_0dTw"
  },
  {
    slug: "rera-guide-2024",
    title: "Navigating RERA: What Every Buyer Must Know",
    category: "Legal Advice",
    date: "Mar 05, 2024",
    readTime: "12 min read",
    excerpt: "Our legal experts break down the essential RERA clauses that protect your real estate investment.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3gEuTFYyvYda68hdVr_gHaw5mGU4vmGUkoRE6lL8dGoNXOufMtVSeY0S9yRHSBBPbqyHOWvFMoCuq8a7FkyqyDKP8QoA_S9wVnWh2nOrHEw-f0pI6quSyLZb9zZBILxbAU5ZzJlWhUiDWA-RFKDSWaygUzF3OfjsM7ExI-gCubYH_Tkq0gCgbMDA5s4zCjD6OMaI2hgJM6zadsM6SwQ3J_zlroURTZeesmfJwp0G-vswP7ChMINRBpC9NNqPPzXrNDA6-HH-YZQ0"
  }
];

import SectionCarousel from '@/components/home/SectionCarousel';
import TrendingProjectCard from '@/components/home/TrendingProjectCard';
import TrendingBuilderCard from '@/components/home/TrendingBuilderCard';
import { listBuilders } from '@/services/builderService';
import { SkeletonCarousel } from '@/components/common/SkeletonCard';

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [featuredBuilders, setFeaturedBuilders] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState(MOCK_BLOGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, buildRes, blogRes] = await Promise.all([
          listProperties({ isFeatured: true, limit: 12 }),
          listBuilders({ isFeatured: true, limit: 12 }),
          listBlogs({ limit: 3 })
        ]);

        // Backend already enriches properties with isSaved flag via enrichPropertiesWithUserStatus
        setFeaturedProperties(propRes.items || []);
        setFeaturedBuilders(buildRes.items || []);
        if (blogRes.items?.length) setLatestBlogs(blogRes.items);
      } catch (error) {
        console.error('Home Page Data Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="relative min-h-140 md:min-h-160 flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-24 md:py-28">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTt4k01Rv0EI75RlMBkam6QUCJiZxmg1pWElVfvID7rJzGZ0OvtAoOIdJrlB8otSwlYcMDK1aDPGzGHb70Ue2s_zCIpF7dgmcFEv9_ATI1Je_KgD_yyAVd5Xbx2dmJdP2AV03KZ3aZmBUBVKayjj31aeM1Ymyv1dCCl64XwHK2YfR5tRqT8xvPbZkcBourkgmbc4Mp0Jd8utO0w_T8VBhyUci1XElabmyXBbVzxZvtI0QlG1K55lIV-KnpVTV2SReMkfBGWCYL2-8" 
            alt="Mumbai Skyline" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-slate-900/40 via-slate-900/20 to-white"></div>
        </div>
        
        <div className="relative z-10 text-center w-full max-w-5xl pt-8 md:pt-16">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-4 md:mb-6 leading-[1.1]">
            Find Your Dream <span className="text-secondary underline decoration-primary/30 underline-offset-8">Property</span> in Mumbai
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-700 mb-7 md:mb-10 font-medium max-w-3xl mx-auto leading-relaxed">
            Curating Mumbai's most exclusive real estate listings from SoBo luxury to suburban sanctuaries.
          </p>

          <HeroSearch />
        </div>
      </section>

      {/* 2. Featured Properties Carousel */}
      {loading ? (
        <SkeletonCarousel count={3} />
      ) : featuredProperties.length > 0 ? (
        <SectionCarousel
          title="Trending Projects in Mumbai"
          subtitle="Discover verified projects with best-value inventory and quick brochure access."
          items={featuredProperties}
          itemClassName="w-full min-w-full max-w-full sm:w-[calc((100%-1.5rem)/2)] sm:min-w-[calc((100%-1.5rem)/2)] sm:max-w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-4rem)/3)] md:min-w-[calc((100%-4rem)/3)] md:max-w-[calc((100%-4rem)/3)] lg:w-[calc((100%-6rem)/4)] lg:min-w-[calc((100%-6rem)/4)] lg:max-w-[calc((100%-6rem)/4)]"
          renderItem={(prop) => <TrendingProjectCard property={prop} />}
        />
      ) : null}

      {/* 3. Featured Builders Carousel */}
      {loading ? (
        <SkeletonCarousel count={3} />
      ) : featuredBuilders.length > 0 ? (
        <SectionCarousel
          title="The Master Builders"
          subtitle="Discover the visionaries behind Mumbai's most iconic skylines and architectural marvels."
          items={featuredBuilders}
          itemClassName="w-full min-w-full max-w-full sm:w-[calc((100%-1.5rem)/2)] sm:min-w-[calc((100%-1.5rem)/2)] sm:max-w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-4rem)/3)] md:min-w-[calc((100%-4rem)/3)] md:max-w-[calc((100%-4rem)/3)] lg:w-[calc((100%-6rem)/4)] lg:min-w-[calc((100%-6rem)/4)] lg:max-w-[calc((100%-6rem)/4)]"
          renderItem={(builder) => <TrendingBuilderCard builder={builder} />}
        />
      ) : null}

      {/* 3. Categories */}
      <section className="py-16 md:py-20 lg:py-24 bg-slate-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeader 
            title="Discovery Path" 
            subtitle="Explore properties by your specific needs."
            align="center"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: "Buy", desc: "Permanent Residencies", href: "/buy", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtrP7J1G4WhTfOYemMEfQdOGNosX21kxNtOuO7NwHYCiXkLpDNAOl29r0R11-WorVdi8UdnB0cJGAJP-5qWr6V4sdQ-iSAyUPycFbbP08uSNeP6vzGSWtnpMUOWmcv5cujMW1_eXIH6myhWnV-lHp-b6LkbPOmn_Dan6bax3RktDgx61YuqoLQyruWVI4BwE8PxdNuSgDuWfv2jkdKN2_y303DEHnptYvMF2UzFUxjxz4nJcuf5_T2Bh57y1UPNcHlF0H07_WxZpg" },
              { title: "Rent", desc: "Curated Luxury Stays", href: "/rent", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0_-GLExTLnnHHswJYutJ0WAmNz4HI89AWs9t6IN9-Pqcv6nHN8M0P-9Oe7AwCvZsIcbyqmuDpRatKEhePTlbj842dsve0MjcTqpxrRXdkzehYTUUd_wGb_Wg2NWXC5RzQ9NrBN7_tXveDhNIA2v8BYrQ86pM8qeiPtBC-wJ5O03h_RFRMj13w6hKBH2grM_7DFwwuU5qYDrXJy7WueQXUpFQ5pP5hZJrzDbislpiWGvaiUbgnHM7iIp-UnVit9eoNXbKNFKAQhbs" },
              { title: "Builders", desc: "Crafting Mumbai's Skyline", href: "/builders", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZFILInTcBoIKclQhYU_2ZcT5VhjD5dPVp-BLTSjIMId6a4p8hlyJvfM9rCB02NnM4aEsZt7xZgnn4aHvxhSipMLnbS7mJ7WYj2QrCEOIajVtB_1km5f3u7Mi4fgaUXxPjS1t0tNw7-gZkE8riGNAPwFfXKpB3pBJHbWQg-Ondx4q3Jn4-56lNXdnXIluPZQJs6ImQjyUHjYWa2DRJ64YAgzGStITyjpS4jEiqfPshklxvq3n6Xlc7wgmkxY1MvuIY_hhUn1L8JLs" },
              { title: "New Launch", desc: "Investment Opportunities", href: "/new-launch", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNTx25QeH5OPXLzM40sHriQNtaNHjXe5TSk3kPZNuN6hI8HMqMUxkWvTqlZs_mmFuSe8O12Wt4Qgraf6p6G0_Bi1wmS0dbj5vhIXkfKG7vXB7A3yyfkPP3BPUGQut9zn1giIeqYuM3qKwfqwYRDBpEj2xAz8FjiyvZ9HKurADOgk4X-ZOE1nhP1ohd-X0GRuWwrvrerw7DPesDig7_3bQJxOk03B_wwJGiVw6H2LDUFQWP61kaGcywudiZgUP0bakt0OJVlwOdFB0" }
            ].map((cat, i) => (
              <Link key={i} href={cat.href} className="group relative h-72 sm:h-80 lg:h-96 rounded-moderate overflow-hidden cursor-pointer block">
                <img src={cat.img} alt={cat.title} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                <div className="absolute bottom-5 sm:bottom-6 left-5 sm:left-6 right-5 sm:right-6">
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight">{cat.title}</h3>
                  <p className="text-slate-300 text-sm mb-4 font-medium">{cat.desc}</p>
                  <span className="text-white text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                    Explore <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Value Proposition */}
      <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 lg:gap-20 items-center">
          <div>
            <span className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4 block">The Bricks Philosophy</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-6 md:mb-8 leading-[1.1] tracking-tighter">
              We Don't Just Find Homes. We Curate <span className="text-primary italic">Lifestyles.</span>
            </h2>
            <p className="text-base md:text-lg text-slate-500 mb-8 md:mb-12 leading-relaxed font-medium">
              Mumbai Editorial by Bricks is more than a portal. We are a boutique real estate advisory dedicated to the city's most discerning residents.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {[
                { title: "Verified Listings", desc: "Every home is physically inspected by our concierge.", icon: "verified" },
                { title: "Trusted Network", desc: "10,000+ happy residents across the island city.", icon: "groups" },
                { title: "Expert Guidance", desc: "24/7 dedicated advisory for your property journey.", icon: "support_agent" },
                { title: "Legal Support", desc: "End-to-end paperwork and registration assistance.", icon: "description" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary">
                    {/* Simplified SVG icons */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
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
      </section>

      {/* 5. Blogs */}
      <section className="py-16 md:py-20 lg:py-24 bg-slate-900 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-5 mb-10 md:mb-14 lg:mb-16">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-3 md:mb-4">Inside Mumbai Real Estate</h2>
              <p className="text-slate-400 text-sm md:text-base font-medium">Expert analysis, neighborhood deep-dives, and market forecasts.</p>
            </div>
            <Link href="/blogs" className="text-primary font-black flex items-center gap-2 hover:translate-x-1 transition-transform uppercase text-xs tracking-widest">
              Read All Articles
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {latestBlogs.map((blog, i) => (
              <Link key={i} href={`/blogs/${blog.slug}`} className="group cursor-pointer">
                <div className="aspect-16/10 overflow-hidden rounded-2xl mb-4 md:mb-6 relative">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">{blog.category}</span>
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 group-hover:text-primary transition-colors leading-snug">{blog.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-2 font-medium leading-relaxed">{blog.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Lead Capture */}
      <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
        <div className="bg-primary rounded-3xl md:rounded-[3rem] p-6 sm:p-8 md:p-12 lg:p-20 text-white flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-20 items-start lg:items-center shadow-2xl shadow-primary/40 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 lg:w-1/2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 md:mb-6 leading-tight tracking-tighter">Your Mumbai Journey <br/>Starts Here.</h2>
            <p className="text-sm sm:text-base lg:text-lg text-white/80 mb-6 md:mb-10 leading-relaxed font-medium">Schedule a private consultation with our area experts. We'll help you navigate the market with data-driven insights.</p>
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-primary bg-slate-200 flex items-center justify-center text-primary font-black text-xs ring-2 ring-white/20">
                    AD
                  </div>
                ))}
              </div>
              <span className="text-xs sm:text-sm font-bold tracking-tight">+ 8 experts online now</span>
            </div>
          </div>
          <div className="relative z-10 lg:w-1/2 w-full">
            <LeadForm title="Get Free Consultation" />
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <SectionHeader 
            title="FAQs" 
            subtitle="Everything you need to know about properties in Mumbai." 
            align="center" 
          />
          <div className="space-y-4">
            {[
              { q: "What are the current luxury rates in Worli?", a: "Luxury properties in Worli range from ₹45k to ₹85k per sq.ft depending on sea views and amenities." },
              { q: "Do you provide home loan assistance?", a: "Yes, we have tie-ups with leading banks for preferential rates and fast-track processing." },
              { q: "Are all listings RERA registered?", a: "Exclusively. We only list properties with verified RERA IDs for complete security." }
            ].map((faq, i) => (
              <details key={i} className="group bg-slate-50 rounded-2xl p-4 sm:p-5 md:p-6 cursor-pointer border border-slate-100 transition-all">
                <summary className="flex justify-between items-center gap-3 font-bold text-base md:text-lg list-none text-slate-900 group-open:text-primary transition-colors">
                  {faq.q}
                  <svg className="transition-transform group-open:rotate-180 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </summary>
                <p className="mt-4 text-slate-500 leading-relaxed font-medium">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
