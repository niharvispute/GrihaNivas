export default function BuilderHero({ builder }) {
  const heroImage =
    builder?.heroImage ||
    'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1600&q=80';
  const hasLogo = Boolean(builder?.logo);

  return (
    <section className="relative min-h-153.5 flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt={builder.name} 
          className="w-full h-full object-cover brightness-50" 
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-black/20"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10 py-20">
        <div className="max-w-4xl">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 inline-block mb-8">
            {hasLogo ? (
              <img 
                src={builder.logo} 
                alt={`${builder.name} Logo`} 
                className="w-32 h-32 object-contain bg-white rounded-lg shadow-xl mb-6 p-4" 
              />
            ) : (
              <div className="w-32 h-32 bg-white rounded-lg shadow-xl mb-6 p-4 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-5xl">domain</span>
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight font-headline">
              {builder.name}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium font-body">
              {builder.tagline}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/90 p-5 rounded-xl flex items-center gap-4 shadow-lg border border-zinc-100">
              <span className="material-symbols-outlined text-primary text-3xl">calendar_today</span>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider font-label">Est. Year</p>
                <p className="text-xl font-bold text-zinc-900">{builder.establishedYear}</p>
              </div>
            </div>
            <div className="bg-white/90 p-5 rounded-xl flex items-center gap-4 shadow-lg border border-zinc-100">
              <span className="material-symbols-outlined text-primary text-3xl">apartment</span>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider font-label">Total Projects</p>
                <p className="text-xl font-bold text-zinc-900">{builder.totalProjects}</p>
              </div>
            </div>
            <div className="bg-white/90 p-5 rounded-xl flex items-center gap-4 shadow-lg border border-zinc-100">
              <span className="material-symbols-outlined text-primary text-3xl">location_city</span>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider font-label">HQ Location</p>
                <p className="text-xl font-bold text-zinc-900">{builder.hqLocation}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <a 
              href="#portfolio" 
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-container transition-all flex items-center gap-2"
            >
              View All Properties <span className="material-symbols-outlined">arrow_downward</span>
            </a>
            <button className="bg-zinc-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-zinc-800 transition-all border border-zinc-700 flex items-center gap-2">
              Contact Expert <span className="material-symbols-outlined">call</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
