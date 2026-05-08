import Image from 'next/image';

export default function BuilderHero({ builder }) {
  const heroImage =
    builder?.heroImage ||
    'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1600&q=80';
  const hasLogo = Boolean(builder?.logo);

  return (
    <section className="relative min-h-[60vh] sm:min-h-[90vh] lg:min-h-153.5 flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt={builder.name}
          fill
          sizes="100vw"
          className="object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10 py-8 sm:py-16 lg:py-20">
        <div className="max-w-4xl">
          <div className="bg-white p-5 sm:p-7 lg:p-10 rounded-2xl shadow-2xl shadow-black/30 inline-block mb-6 sm:mb-10 relative">
            {hasLogo ? (
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 mb-5 sm:mb-10 rounded-2xl overflow-hidden border-4 border-primary/40 shadow-xl bg-white">
                <div className="absolute inset-3 flex items-center justify-center">
                  <Image
                    src={builder.logo}
                    alt={`${builder.name} Logo`}
                    fill
                    sizes="(max-width: 640px) 80px, 144px"
                    className="object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 bg-white rounded-2xl shadow-xl mb-5 sm:mb-10 flex items-center justify-center border-4 border-primary/40">
                <span className="material-symbols-outlined text-primary text-4xl sm:text-6xl">domain</span>
              </div>
            )}
            <h1 className="text-3xl! sm:text-4xl! md:text-5xl! lg:text-6xl! font-black text-zinc-900 mb-2 sm:mb-4 tracking-tighter font-headline leading-tight uppercase">
              {builder.name}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-500 font-bold font-body leading-relaxed max-w-xl">
              {builder.tagline}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 md:gap-6 mb-6 sm:mb-10">
            <div className="bg-white p-3.5 sm:p-5 rounded-xl flex items-center gap-2.5 sm:gap-4 shadow-lg border border-zinc-100">
              <span className="material-symbols-outlined text-primary text-xl sm:text-3xl">calendar_today</span>
              <div>
                <p className="text-[8px] sm:text-xs text-zinc-400 font-black uppercase tracking-widest font-label leading-none mb-0.5 sm:mb-1">Est. Year</p>
                <p className="text-base sm:text-xl font-black text-zinc-900">{builder.establishedYear}</p>
              </div>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-xl flex items-center gap-2.5 sm:gap-4 shadow-lg border border-zinc-100">
              <span className="material-symbols-outlined text-primary text-xl sm:text-3xl">apartment</span>
              <div>
                <p className="text-[8px] sm:text-xs text-zinc-400 font-black uppercase tracking-widest font-label leading-none mb-0.5 sm:mb-1">Total Assets</p>
                <p className="text-base sm:text-xl font-black text-zinc-900">{builder.totalProjects}</p>
              </div>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-xl flex items-center gap-2.5 sm:gap-4 shadow-lg border border-zinc-100 col-span-2 md:col-span-1">
              <span className="material-symbols-outlined text-primary text-xl sm:text-3xl">location_city</span>
              <div>
                <p className="text-[8px] sm:text-xs text-zinc-400 font-black uppercase tracking-widest font-label leading-none mb-0.5 sm:mb-1">HQ Location</p>
                <p className="text-base sm:text-xl font-black text-zinc-900">{builder.hqLocation}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <a 
              href="#portfolio" 
              className="w-full sm:w-auto bg-primary text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base lg:text-lg hover:bg-primary-container transition-all flex items-center justify-center gap-2"
            >
              View All Properties <span className="material-symbols-outlined">arrow_downward</span>
            </a>
            <a href="#builder-contact-form" className="w-full sm:w-auto bg-zinc-900 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base lg:text-lg hover:bg-zinc-800 transition-all border border-zinc-700 flex items-center justify-center gap-2">
              Contact Expert <span className="material-symbols-outlined">call</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
