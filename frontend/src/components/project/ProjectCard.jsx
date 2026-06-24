import Link from 'next/link';
import CloudinaryImage from '@/components/CloudinaryImage';

const STATUS_BADGE = {
  new_launch: 'bg-blue-500 text-white',
  under_construction: 'bg-amber-600 text-white',
  ready_to_move: 'bg-emerald-500 text-white',
};

export default function ProjectCard({ project, variant = 'vertical' }) {
  const isHorizontal = variant === 'horizontal';
  const detailHref = project?.slug ? `/projects/${project.slug}` : '/projects';
  const priceLabel = project?.startingPrice ? `Starting ₹${project.startingPrice}` : 'Price on Request';
  const bhkLabel = Array.isArray(project?.bhkSummary) && project.bhkSummary.length > 0
    ? project.bhkSummary.join(', ')
    : '';
  const locationLabel = project?.location || 'Mumbai';

  return (
    <article className={`group relative bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-primary/25 shadow-sm hover:shadow-lg transition-all duration-500 flex ${isHorizontal ? 'flex-col lg:flex-row col-span-full' : 'flex-col h-full'}`}>
      {/* Image */}
      <div className={`relative ${isHorizontal ? 'w-full lg:w-2/5 h-52 sm:h-64 lg:h-auto' : 'h-44 sm:h-48 flex-none'} overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50`}>
        {project.image ? (
          <CloudinaryImage
            src={project.image}
            alt={project.name}
            fill
            sizes={isHorizontal ? '(max-width: 1024px) 100vw, 40vw' : '(max-width: 1024px) 100vw, 33vw'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img src="/images/property-placeholder.svg" alt="" aria-hidden="true" className="w-1/2 max-w-[88px] object-contain opacity-50" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {project.isFeatured && (
            <span className="bg-gradient-to-r from-primary to-primary text-white px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Featured
            </span>
          )}
          {project.projectStatus && (
            <span className={`px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black tracking-wider uppercase shadow-lg ${STATUS_BADGE[project.projectStatus] || 'bg-slate-500 text-white'}`}>
              {project.projectStatusLabel}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`p-3 sm:p-4 md:p-5 flex flex-col grow gap-2 sm:gap-3 ${isHorizontal ? 'lg:p-6 lg:justify-center' : 'min-h-[190px]'}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`${isHorizontal ? 'text-lg sm:text-xl font-extrabold' : 'text-[11px] sm:text-[13px] font-black'} text-slate-900 leading-tight line-clamp-1 tracking-tight`}>
              {project.name}
            </h3>
            {bhkLabel && (
              <span className="flex-shrink-0 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[8px] sm:text-[9px] font-black uppercase tracking-tighter">
                {bhkLabel}
              </span>
            )}
          </div>
          {project.builderName && (
            <p className="text-slate-500 text-[10px] sm:text-xs font-bold truncate mb-0.5">{project.builderName}</p>
          )}
          <p className="text-slate-500 text-[10px] sm:text-xs flex items-center gap-1 font-bold truncate">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
            <span className="truncate">{locationLabel}</span>
          </p>
        </div>

        {isHorizontal && project.description && (
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{project.description}</p>
        )}

        <div className="py-2 sm:py-3 border-t border-slate-100">
          <span className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider">Starting Price</span>
          <span className="mt-1 flex items-center gap-1 text-xs sm:text-sm font-black text-slate-900 truncate">
            <span className="material-symbols-outlined text-primary text-sm sm:text-base">payments</span>
            {priceLabel}
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <Link
            href={detailHref}
            className="w-full h-9 sm:h-10 flex items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-tighter hover:shadow-lg transition-all"
          >
            View Project
          </Link>
        </div>
      </div>
    </article>
  );
}
