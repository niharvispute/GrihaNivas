import Link from 'next/link';

export default function BuilderPortfolio({ builder, properties = [] }) {
  return (
    <section className="py-24 bg-neutral-50" id="portfolio">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div>
            <h2 className="text-4xl font-extrabold text-zinc-900 mb-4 font-headline uppercase tracking-tight">Portfolio Showcase</h2>
            <p className="text-zinc-600 max-w-xl font-body">Explore our current residential and commercial masterpieces across the Mumbai Metropolitan Region.</p>
          </div>
          
          <div className="flex flex-wrap gap-3 bg-white p-2 rounded-2xl shadow-sm border border-neutral-200">
            <select className="border-0 focus:ring-0 text-sm font-semibold text-zinc-600 bg-transparent font-label">
              <option>Configuration (BHK)</option>
              <option>2 BHK</option>
              <option>3 BHK</option>
              <option>4 BHK+</option>
            </select>
            <div className="w-px h-6 bg-zinc-200 self-center"></div>
            <select className="border-0 focus:ring-0 text-sm font-semibold text-zinc-600 bg-transparent font-label">
              <option>Price Range</option>
              <option>₹2 Cr - ₹5 Cr</option>
              <option>₹5 Cr - ₹10 Cr</option>
              <option>Above ₹10 Cr</option>
            </select>
            <div className="w-px h-6 bg-zinc-200 self-center"></div>
            <select className="border-0 focus:ring-0 text-sm font-semibold text-zinc-600 bg-transparent font-label">
              <option>Status</option>
              <option>Ready to Move</option>
              <option>Under Construction</option>
              <option>New Launch</option>
            </select>
            <button className="bg-zinc-900 text-white p-2 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {builder.portfolio.map((prop) => (
            <div key={prop.id || prop.slug} className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-neutral-100 flex flex-col">
              <div className="relative overflow-hidden h-72">
                <img 
                  src={prop.image} 
                  alt={prop.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                  {prop.status}
                </div>
              </div>
              <div className="p-8 flex flex-col grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold text-zinc-900 font-headline tracking-tight">{prop.title}</h3>
                  <p className="text-primary font-bold text-lg font-body">{prop.price}</p>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 mb-6 text-sm font-body">
                  <span className="material-symbols-outlined text-sm">location_on</span> {prop.location}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-neutral-50 p-4 rounded-xl">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-label mb-1">Configurations</p>
                    <p className="font-bold text-zinc-800 text-xs font-body">{prop.type}</p>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-xl">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-label mb-1">Availability</p>
                    <p className="font-bold text-zinc-800 text-xs font-body">{prop.availability}</p>
                  </div>
                </div>
                <Link 
                  href={`/property/${prop.slug || prop.id}`}
                  className="mt-auto w-full border-2 border-zinc-900 text-center text-zinc-900 py-3 rounded-xl font-bold hover:bg-zinc-900 hover:text-white transition-all text-sm uppercase tracking-widest"
                >
                  View Property Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {properties.length === 0 && (
          <p className="text-center text-sm font-medium text-zinc-500 mt-12">
            Portfolio listings for this builder will be published soon.
          </p>
        )}
      </div>
    </section>
  );
}
