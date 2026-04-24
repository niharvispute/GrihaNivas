import Link from 'next/link';
import Image from 'next/image';
import { SYSTEM_DEFAULT_CITY } from '@/lib/system/defaults';

export default function TrendingBuilderCard({ builder }) {
  const detailKey = builder?.slug || builder?.id;
  const detailHref = detailKey ? `/builders/${detailKey}` : '/builders';
  const bannerImage = builder?.thumbnail || builder?.heroImage || builder?.logo || '';
  const builderName = builder?.name || 'Builder';
  const headquarters = builder?.hqLocation || SYSTEM_DEFAULT_CITY;
  const projectCount = Number.isFinite(Number(builder?.projectCount || builder?.totalProjects))
    ? Number(builder?.projectCount || builder?.totalProjects)
    : 0;
  const established = builder?.establishedYear || 'N/A';
  const tagline = builder?.tagline || 'Trusted real estate developer with active Mumbai projects.';

  return (
    <article className="group relative bg-white rounded-xl md:rounded-3xl overflow-hidden shadow-sm md:shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
      {/* Image Section */}
      <div className={`relative ${'h-32 sm:h-48 md:h-56'} overflow-hidden flex-none bg-gradient-to-br from-slate-100 to-slate-50`}>
        {bannerImage ? (
          <Image
            src={bannerImage}
            alt={builderName}
            fill
            unoptimized
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center px-4">
              <span className="material-symbols-outlined text-4xl sm:text-5xl text-slate-200">image_not_supported</span>
              <p className="mt-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-300">No image</p>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex gap-1.5 flex-wrap">
          {builder.isFeatured && (
            <span className="bg-gradient-to-r from-primary to-primary/80 text-white px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Featured
            </span>
          )}
          <span className="bg-white/95 backdrop-blur-sm px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black tracking-wider uppercase text-primary shadow-lg">Trending</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-5 md:p-6 flex flex-col grow gap-2 sm:gap-4">
        {/* Header */}
        <div>
          <h3 className="text-[13px] sm:text-base md:text-lg font-black text-slate-900 leading-tight mb-0.5 line-clamp-1 uppercase">
            {builderName}
          </h3>
          <p className="text-slate-500 text-[10px] sm:text-xs flex items-center gap-1 truncate font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
            <span className="truncate">{headquarters}</span>
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between gap-2 py-2 sm:py-3 border-t border-slate-100 mt-1">
          <div>
            <p className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Est.</p>
            <p className="text-xs sm:text-base font-black text-slate-900">{established}</p>
          </div>
          <div className="border-l border-slate-100 pl-2 sm:pl-3">
            <p className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Projects</p>
            <p className="text-xs sm:text-base font-black text-primary">{projectCount}+</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-[10px] sm:text-xs line-clamp-1 sm:line-clamp-2 font-bold leading-relaxed flex-grow">
          {tagline}
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-2.5 mt-auto pt-1">
          <Link
            href={detailHref}
            className="flex-1 bg-gradient-to-r from-primary to-primary/85 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl font-black tracking-tighter hover:shadow-lg hover:shadow-primary/40 transition-all text-center text-[9px] sm:text-xs uppercase text-nowrap h-9 sm:h-11 flex items-center justify-center"
          >
            Details
          </Link>
          <Link
            href={`${detailHref}#portfolio`}
            className="flex-1 border-2 border-slate-200 text-slate-700 py-2 sm:py-3 rounded-lg sm:rounded-xl font-black tracking-tighter hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-center text-[9px] sm:text-xs uppercase text-nowrap h-9 sm:h-11 flex items-center justify-center hidden sm:flex"
          >
            Portfolio
          </Link>
        </div>
      </div>
    </article>
  );
}