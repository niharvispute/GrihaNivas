import Link from 'next/link';
import CloudinaryImage from '@/components/CloudinaryImage';
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
    <article className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-primary/25 shadow-sm hover:shadow-lg hover:shadow-slate-200/80 transition-all duration-500 flex flex-col h-full">
      {/* Image */}
      <div className="relative h-44 sm:h-48 flex-none overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
        {bannerImage ? (
          <CloudinaryImage
            src={bannerImage}
            alt={builderName}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img src="/images/property-placeholder.svg" alt="" aria-hidden="true" className="w-1/2 max-w-[88px] object-contain opacity-50" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {builder.isFeatured && (
            <span className="bg-gradient-to-r from-primary to-primary text-white px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Featured
            </span>
          )}
          <span className="bg-white/95 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black tracking-wider uppercase text-primary shadow-lg">Trending</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-5 flex flex-col grow gap-2 sm:gap-3 min-h-[190px]">
        {/* Name + Location */}
        <div>
          <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight line-clamp-1 uppercase tracking-tight">
            {builderName}
          </h3>
          <p className="text-slate-500 text-[11px] sm:text-xs flex items-center gap-1 mt-1 font-bold truncate">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
            <span className="truncate">{headquarters}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 py-2 sm:py-3 border-t border-slate-100">
          <div>
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider">Est.</p>
            <p className="text-xs sm:text-sm font-black text-slate-900 mt-1">{established}</p>
          </div>
          <div className="border-l border-slate-100 pl-3">
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider">Projects</p>
            <p className="text-xs sm:text-sm font-black text-primary mt-1">{projectCount}+</p>
          </div>
        </div>

        <p className="text-xs font-bold leading-relaxed text-slate-600 line-clamp-2">{tagline}</p>

        {/* CTA */}
        <Link
          href={detailHref}
          prefetch={false}
          className="mt-auto h-9 sm:h-10 flex items-center justify-center bg-gradient-to-r from-primary to-primary/85 text-white rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-tighter hover:shadow-lg transition-all"
        >
          View Builder
        </Link>
      </div>
    </article>
  );
}
