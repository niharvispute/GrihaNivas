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
    <article className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative h-[200px] sm:h-[220px] flex-none overflow-hidden bg-slate-100">
        {bannerImage ? (
          <CloudinaryImage
            src={bannerImage}
            alt={builderName}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-slate-200">image_not_supported</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {builder.isFeatured && (
            <span className="bg-primary text-white px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Featured
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase text-primary">Trending</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col grow gap-2 min-h-[160px]">
        {/* Name + Location */}
        <div>
          <h3 className="!text-[16px] font-bold text-slate-900 leading-tight line-clamp-1 uppercase tracking-tight">
            {builderName}
          </h3>
          <p className="text-slate-400 !text-[14px] flex items-center gap-0.5 mt-0.5 font-medium truncate">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
            <span className="truncate">{headquarters}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between py-2 border-t border-slate-100">
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wide">Est.</p>
            <p className="text-xs font-black text-slate-900 mt-0.5">{established}</p>
          </div>
          <div className="w-px self-stretch bg-slate-100" />
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wide">Projects</p>
            <p className="text-xs font-black text-primary mt-0.5">{projectCount}+</p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={detailHref}
          className="mt-auto h-8 sm:h-9 flex items-center justify-center bg-primary text-white rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors"
        >
          View Builder
        </Link>
      </div>
    </article>
  );
}