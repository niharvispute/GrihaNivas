import Link from 'next/link';

export default function AboutPage() {
  const features = [
    { title: "Verified Listings", desc: "Every square foot authenticated by our rigorous internal audit team.", icon: "verified_user" },
    { title: "Expert Guidance", desc: "Access to the city's top legal, architectural, and financial consultants.", icon: "architecture" },
    { title: "Transparent Deals", desc: "A no-hidden-clause philosophy ensuring peace of mind for all stakeholders.", icon: "handshake" },
    { title: "Trusted by Thousands", desc: "Serving Mumbai's most discerning families and HNI individuals.", icon: "groups" }
  ];

  const metrics = [
    { value: "10k+", label: "Properties Listed" },
    { value: "5k+", label: "Happy Clients" },
    { value: "15+", label: "Cities Covered" },
    { value: "12", label: "Years of Excellence" }
  ];

  const partners = ["GODREJ", "LODHA", "OBEROI", "PIRAMAL", "TATA"];

  return (
    <div className="w-full h-full">
      {/* Hero */}
      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2Y2aEOzOcLJw5LG4yNtWtgdGhX_9il9DFqmHeRuNVBCTBk1huZ5n-l9Utd6LyRxIjiyDY3yQ0aRNxQkPESqCS4Pmmx7YTcJO6ZimfeobYQnfBW90B0pzBeGOz48qOR8p_VyoM8tZ41iEnoYdSVWEADF_TJySotMeJgPp4WKdFO-KTl4REwCm33HDip3VwAquqJ8gbJJfGtyUuMBUR2VXWmN1yoO3n0n0pN4r7iKJlF6rc17cd8I1dZKJQiRMeWccO59f41xuos2Q"
            alt="Mumbai Marine Drive"
            className="w-full h-full object-cover brightness-[0.4]"
          />
        </div>
        <div className="relative z-10 text-center px-6">
          <span className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4 block drop-shadow-lg">ABOUT US</span>
          <h1 className="text-3xl md:text-6xl font-black text-white leading-tight tracking-tighter mb-5 drop-shadow-2xl">
            Redefining Mumbai's Luxury<br /> Real Estate Landscape.
          </h1>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-14 px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight leading-none">A Legacy of Excellence</h2>
            <div className="space-y-5 text-slate-500 text-base leading-relaxed font-bold">
              <p>Founded at the intersection of architecture and heritage, Grihanivas began as a specialized boutique focused exclusively on South Mumbai's historic mansions. We believed then, as we do now, that luxury is not just a price point—it's a narrative of space and craftsmanship.</p>
              <p>Over the last twelve years, we have evolved into a market leader, curating the city's most prestigious skyline silhouettes. Our journey is defined by a commitment to the "Editorial" standard: every listing is vetted for its architectural significance, lifestyle potential, and investment integrity.</p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="bg-slate-100 p-3 rounded-2xl shadow-2xl rotate-3 scale-95 hover:rotate-0 hover:scale-100 transition-all duration-700 cursor-pointer">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhHSA19jfOT3ptyV811OR4A_pSGPe_ojr6buy8YNM_ms0_PgFXSYaeeDYSQbl1FBM7N8ac_7PXKwSg5QPO68zgVZW3hG_8s49cqaD6sho28D7Z0m6pT7zI_RreQf8GH1rOWO9bUurhTKma_hWZ8bUxd9hqqTbcJM121Y0NZhFF_UD9P7wyP191SqVCgzDYdy6_1tCVykz4qNt-D-vERgih0oUe77-WKyZul-aGX31pOVhvtPl75Fw6-mjsjlLiUr1cMHw9nxKbr-U"
                alt="Luxury Penthouse"
                className="rounded-2xl object-cover aspect-[4/5] grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-14 bg-slate-50 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9l4-6z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Our Mission</h3>
            <p className="text-slate-500 text-base leading-relaxed font-bold">To curate the most exclusive living experiences by blending deep local market insights with a world-class standard of service and discretion.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Our Vision</h3>
            <p className="text-slate-500 text-base leading-relaxed font-bold">To be the gold standard for luxury real estate in India, recognized for transforming property acquisition into an art form.</p>
          </div>
        </div>
      </section>

      {/* Why Grihanivas */}
      <section className="py-14 px-8 max-w-7xl mx-auto">
        <h2 className="text-center text-3xl font-black text-slate-900 mb-12 tracking-tighter">Why Grihanivas?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {features.map((f, i) => (
            <div key={i} className="group flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 text-primary rotate-3 group-hover:rotate-12 transition-all shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <h4 className="text-base font-black text-slate-900 mb-2 tracking-tight">{f.title}</h4>
              <p className="text-slate-500 text-sm font-bold leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-14 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -mr-36 -mt-36 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10 text-white">
          {metrics.map((m, i) => (
            <div key={i}>
              <div className="text-4xl md:text-6xl font-black mb-2 tracking-tighter">{m.value}</div>
              <div className="text-white/60 uppercase tracking-[0.3em] text-xs font-black">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="py-12 border-y border-slate-100 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-center text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mb-10">STRATEGIC DEVELOPERS</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
            {partners.map((p, i) => (
              <span key={i} className="text-2xl font-black tracking-tighter text-slate-900">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto bg-slate-950 rounded-2xl p-10 md:p-20 text-center relative overflow-hidden shadow-2xl group">
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-primary/20 rounded-full blur-[8rem] -mr-60 -mt-60 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative z-10">
            <h2 className="text-white text-3xl md:text-5xl font-black mb-8 tracking-tighter">Ready to find your<br /> masterpiece?</h2>
            <Link
              href="/buy"
              className="inline-block bg-primary text-white px-10 py-4 rounded-full font-black text-base hover:scale-105 hover:bg-white hover:text-primary transition-all shadow-2xl"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
