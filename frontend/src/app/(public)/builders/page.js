import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { builders } from '@/data/builders';
import BuilderCard from '@/components/builders/BuilderCard';

export const metadata = {
  title: 'Explore Builders | Bricks - Mumbai Editorial',
  description: 'Discover trusted real estate developers crafting the future of modern living across Mumbai.',
};

export default function ExploreBuildersPage() {
  const featuredBuilder = builders.find(b => b.slug === 'skyline-apex-group');
  const remainingBuilders = builders.filter(b => b.slug !== 'skyline-apex-group');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-20 max-w-screen-2xl mx-auto px-6">
        {/* Header Section */}
        <header className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-background tracking-tight mb-3 uppercase">
            Explore <span className="text-primary italic">Builders</span>
          </h1>
          <p className="text-zinc-500 text-lg font-body max-w-2xl">
            Discover trusted real estate developers crafting the future of modern living with uncompromising precision.
          </p>
        </header>

        {/* Sticky Search & Filter Bar */}
        <section className="sticky top-[73px] z-40 mb-12 py-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-white border border-neutral-200 p-3 xl:rounded-full rounded-2xl shadow-sm flex flex-col xl:flex-row items-center gap-4">
            <div className="relative flex-grow w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">search</span>
              <input 
                className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-sm font-medium font-body" 
                placeholder="Search builder by name..." 
                type="text"
              />
            </div>
            <div className="h-8 w-px bg-neutral-200 hidden xl:block"></div>
            <div className="flex items-center gap-6 w-full xl:w-auto px-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <span className="text-sm font-semibold text-zinc-600 group-hover:text-primary transition-colors font-label">Featured Builders</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input className="sr-only peer" type="checkbox" value="" />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </label>
              <div className="h-8 w-px bg-neutral-200"></div>
              <div className="relative group w-full xl:w-48">
                <button className="flex items-center justify-between w-full px-2 text-sm font-semibold text-zinc-600 font-label">
                  <span>All Locations</span>
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
              </div>
            </div>
            <button className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity w-full xl:w-auto uppercase tracking-widest">
              Search
            </button>
          </div>
        </section>

        {/* Featured Highlight */}
        {featuredBuilder && (
          <section className="mb-16 animate-in fade-in duration-1000">
            <div className="group relative overflow-hidden rounded-[2.5rem] bg-zinc-900 h-[500px] flex items-center shadow-2xl">
              <div className="absolute inset-0">
                <img 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                  src={featuredBuilder.heroImage} 
                  alt={featuredBuilder.name}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent"></div>
              </div>
              
              <div className="relative z-10 px-8 md:px-16 max-w-3xl">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-white border border-primary/30 text-[10px] font-bold uppercase tracking-widest mb-6">
                  Featured Partner
                </span>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center shadow-xl">
                    <img 
                      className="w-full h-full object-contain" 
                      src={featuredBuilder.logo} 
                      alt={featuredBuilder.name}
                    />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-headline font-extrabold text-white uppercase tracking-tighter">
                    {featuredBuilder.name}
                  </h2>
                </div>
                <p className="text-zinc-300 text-lg mb-8 leading-relaxed font-body">
                  {featuredBuilder.tagline} {featuredBuilder.description[0]}
                </p>
                <div className="flex flex-wrap gap-8 mb-10">
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold font-label">Est. Year</p>
                    <p className="text-white text-xl font-bold">{featuredBuilder.establishedYear}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold font-label">Total Projects</p>
                    <p className="text-white text-xl font-bold">{featuredBuilder.totalProjects}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold font-label">HQ Location</p>
                    <p className="text-white text-xl font-bold">{featuredBuilder.hqLocation}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <a href={`/builders/${featuredBuilder.slug}`} className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 text-sm uppercase tracking-widest">
                    View Details
                  </a>
                  <a href={`/builders/${featuredBuilder.slug}#portfolio`} className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all text-sm uppercase tracking-widest">
                    View Portfolio
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Builder Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {remainingBuilders.map((builder) => (
            <BuilderCard key={builder.id} builder={builder} />
          ))}
        </section>

        {/* Pagination placeholder */}
        <div className="mt-16 flex justify-center">
          <button className="group flex items-center gap-2 bg-on-background bg-zinc-900 text-white px-10 py-4 rounded-full font-bold hover:bg-zinc-800 transition-all active:scale-95 shadow-xl uppercase tracking-widest text-xs">
            <span>Load More Builders</span>
            <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">expand_more</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
