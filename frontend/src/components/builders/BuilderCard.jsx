import Link from 'next/link';

export default function BuilderCard({ builder }) {
  const hasLogo = Boolean(builder?.logo);

  return (
    <div className="group bg-white rounded-3xl border border-zinc-200 overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-300 flex flex-col">
      <div className="relative h-48 overflow-hidden bg-zinc-100">
        <img 
          src={builder.thumbnail || builder.heroImage} 
          alt={builder.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        {builder.tier && (
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase border border-primary/20">
              {builder.tier}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col grow">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-zinc-50 rounded-lg p-1.5 border border-zinc-100 shadow-sm flex items-center justify-center">
            {builder.isIconLogo ? (
              <span className="material-symbols-outlined text-primary text-3xl">{builder.logo}</span>
            ) : hasLogo ? (
              <img src={builder.logo} alt={builder.name} className="w-full h-full object-contain" />
            ) : (
              <span className="material-symbols-outlined text-primary text-3xl">domain</span>
            )}
          </div>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
            {builder.projectCount || builder.totalProjects} Projects
          </span>
        </div>
        
        <h3 className="font-headline text-xl font-bold text-on-background mb-2 group-hover:text-primary transition-colors">
          {builder.name}
        </h3>
        
        <p className="text-zinc-500 text-sm line-clamp-2 mb-4 leading-relaxed">
          {builder.tagline}
        </p>
        
        <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-medium text-zinc-500 mb-6">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>Est. {builder.establishedYear}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span>{builder.hqLocation}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Link 
            href={`/builders/${builder.slug}`}
            className="py-2.5 px-4 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container transition-colors text-center"
          >
            Details
          </Link>
          <Link 
            href={`/builders/${builder.slug}#portfolio`}
            className="py-2.5 px-4 bg-zinc-50 text-on-background border border-zinc-200 text-xs font-bold rounded-lg hover:bg-zinc-100 transition-colors text-center"
          >
            Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
