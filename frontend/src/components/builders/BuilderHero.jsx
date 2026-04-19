export default function BuilderHero({ builder }) {
  const heroImage =
    builder?.heroImage ||
    'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1600&q=80';
  const hasLogo = Boolean(builder?.logo);

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] lg:min-h-153.5 flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt={builder.name} 
          className="w-full h-full object-cover brightness-50" 
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-black/20"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl">
          <div className="bg-white/10 backdrop-blur-md p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl border border-white/20 inline-block mb-6 sm:mb-8">
            {hasLogo ? (
              <img 
                src={builder.logo} 
                alt={`${builder.name} Logo`} 
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain bg-white rounded-lg shadow-xl mb-4 sm:mb-6 p-3 sm:p-4" 
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-white rounded-lg shadow-xl mb-4 sm:mb-6 p-3 sm:p-4 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl sm:text-5xl">domain</span>
              </div>
            )}
            <h1 className="text-3xl! sm:text-3xl! md:text-4xl! lg:text-5xl! font-extrabold text-white mb-3 sm:mb-4 tracking-tight font-headline leading-tight">
              {builder.name}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 font-medium font-body leading-relaxed">
              {builder.tagline}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-10">
            <div className="bg-white/90 p-4 sm:p-5 rounded-xl flex items-center gap-3 sm:gap-4 shadow-lg border border-zinc-100">
              <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">calendar_today</span>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider font-label">Est. Year</p>
                <p className="text-lg sm:text-xl font-bold text-zinc-900">{builder.establishedYear}</p>
              </div>
            </div>
            <div className="bg-white/90 p-4 sm:p-5 rounded-xl flex items-center gap-3 sm:gap-4 shadow-lg border border-zinc-100">
              <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">apartment</span>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider font-label">Total Projects</p>
                <p className="text-lg sm:text-xl font-bold text-zinc-900">{builder.totalProjects}</p>
              </div>
            </div>
            <div className="bg-white/90 p-4 sm:p-5 rounded-xl flex items-center gap-3 sm:gap-4 shadow-lg border border-zinc-100 col-span-2 md:col-span-1">
              <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">location_city</span>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider font-label">HQ Location</p>
                <p className="text-lg sm:text-xl font-bold text-zinc-900">{builder.hqLocation}</p>
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
