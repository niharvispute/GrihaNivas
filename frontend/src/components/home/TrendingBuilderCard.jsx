import Link from 'next/link';
import Image from 'next/image';

export default function TrendingBuilderCard({ builder }) {
  const detailKey = builder?.slug || builder?.id;
  const detailHref = detailKey ? `/builders/${detailKey}` : '/builders';
  const bannerImage = builder?.thumbnail || builder?.heroImage || builder?.logo || '';
  const builderName = builder?.name || 'Builder';
  const headquarters = builder?.hqLocation || 'Mumbai';
  const projectCount = Number.isFinite(Number(builder?.projectCount || builder?.totalProjects))
    ? Number(builder?.projectCount || builder?.totalProjects)
    : 0;
  const established = builder?.establishedYear || 'N/A';
  const tagline = builder?.tagline || 'Trusted real estate developer with active Mumbai projects.';

  return (
    <article className="group rounded-2xl overflow-hidden">
      <div className="relative h-44 rounded-2xl overflow-hidden mb-2.5">
        <Link href={detailHref} className="block w-full h-full">
          {bannerImage ? (
            <Image
              src={bannerImage}
              alt={builderName}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-slate-100" />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-slate-900/30 via-slate-900/0 to-transparent" />

          <div className="absolute left-2.5 bottom-2.5 bg-white text-slate-900 px-2.5 py-1.5 rounded-lg text-[12px] leading-none font-extrabold shadow-sm">
            {projectCount} Projects
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        {builder?.isFeatured && (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4"/><path d="M21 12c.552 0 1.005.449.95.998a10 10 0 1 1-8.948-8.95A.954.954 0 0 1 14 5c0 .552-.449.998-.998 1.05a8 8 0 1 0 7.947 7.948A1 1 0 0 1 21 12z"/></svg>
            Featured Builder
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Trending
        </span>
      </div>

      <h3 className="text-xl leading-tight font-semibold text-slate-900 tracking-[-0.01em] mb-1 line-clamp-1">
        {builderName}
      </h3>
      <p className="text-base text-slate-700 mb-0.5 line-clamp-1">
        Est. {established}
      </p>
      <p className="text-base text-slate-800 font-medium mb-3.5 line-clamp-1">{headquarters}</p>

      <div className="space-y-2">
        <Link
          href={`${detailHref}#portfolio`}
          className="w-full h-10 rounded-full border border-primary/30 text-primary text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-primary/5 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20"/><path d="M5 20V8.2a.2.2 0 0 1 .2-.2h3.6a.2.2 0 0 1 .2.2V20"/><path d="M15 20V4.2a.2.2 0 0 1 .2-.2h3.6a.2.2 0 0 1 .2.2V20"/><path d="M10 20v-5.8a.2.2 0 0 1 .2-.2h3.6a.2.2 0 0 1 .2.2V20"/></svg>
          View Portfolio
        </Link>

        <Link
          href={detailHref}
          className="w-full h-10 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>
          Builder Details
        </Link>
      </div>

      <p className="text-xs text-slate-500 mt-2.5 line-clamp-2">{tagline}</p>
    </article>
  );
}