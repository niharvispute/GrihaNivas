import Image from 'next/image';
import Link from 'next/link';

export default function BuilderCard({ builder }) {
  const logo = builder?.logo?.trim() || '';
  const thumbnail = builder?.thumbnail?.trim() || builder?.heroImage?.trim() || '';
  const hasLogo = Boolean(logo);
  const established = builder?.establishedYear || 'N/A';
  const projectCount = builder?.projectCount || builder?.totalProjects || 0;
  const headquarters = builder?.hqLocation || '';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-primary/20 shadow-sm hover:shadow-lg hover:shadow-slate-200/80 transition-all duration-500 flex flex-col h-full">
      {/* Image */}
      <div className="relative h-[200px] sm:h-[220px] flex-none overflow-hidden bg-slate-100">
        {thumbnail ? (
          <Image
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            src={thumbnail}
            alt={builder.name}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
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
          {builder.tier && (
            <span className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase text-primary">
              {builder.tier}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col grow gap-2 min-h-[160px]">
        {/* Name + Location */}
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-tight line-clamp-1 uppercase tracking-tight group-hover:text-primary transition-colors">
            {builder.name}
          </h3>
          {headquarters && (
            <p className="text-slate-400 text-sm flex items-center gap-0.5 mt-0.5 font-bold truncate">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
              <span className="truncate">{headquarters}</span>
            </p>
          )}
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
          href={`/builders/${builder.slug}`}
          className="mt-auto h-8 sm:h-9 flex items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all hover:shadow-lg"
        >
          View Builder
        </Link>
      </div>
    </div>
  );
}
