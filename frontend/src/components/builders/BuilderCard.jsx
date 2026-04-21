import Image from 'next/image';
import Link from 'next/link';

export default function BuilderCard({ builder }) {
  const logo = builder?.logo?.trim() || '';
  const thumbnail = builder?.thumbnail?.trim() || builder?.heroImage?.trim() || '';
  const hasLogo = Boolean(logo);

  return (
    <div className="group bg-white rounded-3xl border border-zinc-200 overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-300 flex flex-col">
      <div className="relative h-32 sm:h-48 overflow-hidden bg-zinc-100">
        {thumbnail ? (
          <Image
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            src={thumbnail}
            alt={builder.name}
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-zinc-100 via-zinc-50 to-white flex items-center justify-center">
            <span className="material-symbols-outlined text-zinc-300 text-3xl sm:text-4xl">domain</span>
          </div>
        )}
        {builder.tier && (
          <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4">
            <span className="bg-white/90 backdrop-blur px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black text-primary uppercase border border-primary/20 italic">
              {builder.tier}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-3.5 sm:p-6 flex flex-col grow">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-zinc-50 rounded-lg p-1.5 border border-zinc-100 shadow-sm flex items-center justify-center">
            {builder.isIconLogo ? (
              <span className="material-symbols-outlined text-primary text-xl sm:text-3xl">{logo}</span>
            ) : hasLogo ? (
              <Image src={logo} alt={builder.name} width={48} height={48} className="object-contain" />
            ) : (
              <span className="material-symbols-outlined text-primary text-xl sm:text-3xl">domain</span>
            )}
          </div>
          <span className="bg-primary/10 text-primary px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs font-black uppercase italic tracking-tighter">
            {builder.projectCount || builder.totalProjects} Projects
          </span>
        </div>
        
        <h3 className="font-headline text-sm sm:text-xl font-black text-on-background mb-1 sm:mb-2 group-hover:text-primary transition-colors italic leading-tight truncate">
          {builder.name}
        </h3>
        
        <p className="text-zinc-500 text-[10px] sm:text-sm line-clamp-2 mb-3 sm:mb-4 leading-relaxed font-bold">
          {builder.tagline}
        </p>
        
        <div className="mt-auto pt-3 sm:pt-4 border-t border-zinc-100 flex flex-col gap-1 text-[9px] sm:text-xs font-black text-zinc-400 mb-4 sm:mb-6">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] sm:text-sm">schedule</span>
            <span>Est. {builder.establishedYear}</span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <span className="material-symbols-outlined text-[12px] sm:text-sm">location_on</span>
            <span className="truncate">{builder.hqLocation}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Link 
            href={`/builders/${builder.slug}`}
            className="py-2 px-2 sm:py-2.5 sm:px-4 bg-primary text-white text-[9px] sm:text-xs font-black uppercase tracking-widest rounded-lg hover:bg-primary-container transition-all active:scale-95 text-center"
          >
            Details
          </Link>
          <Link 
            href={`/builders/${builder.slug}#portfolio`}
            className="py-2 px-2 sm:py-2.5 sm:px-4 bg-zinc-50 text-on-background border border-zinc-200 text-[9px] sm:text-xs font-black uppercase tracking-widest rounded-lg hover:bg-zinc-100 transition-all active:scale-95 text-center"
          >
            Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
