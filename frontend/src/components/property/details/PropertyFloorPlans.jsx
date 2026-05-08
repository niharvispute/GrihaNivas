import Image from 'next/image';

export default function PropertyFloorPlans({ floorPlans = [], brochureUrl = '' }) {
  const hasFloorPlans = Array.isArray(floorPlans) && floorPlans.length > 0;
  const primaryFloorPlan = hasFloorPlans ? floorPlans[0] : null;

  return (
    <section className="py-4 sm:py-0">
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-8">
        <h2 className="text-lg sm:text-2xl font-heading font-black text-slate-900">Floor Plans</h2>
        <span className="text-slate-400 font-bold text-xs sm:text-sm shrink-0">
          {hasFloorPlans ? `${floorPlans.length} Layout${floorPlans.length > 1 ? 's' : ''} Available` : 'No layouts uploaded'}
        </span>
      </div>
      <div className="relative rounded-2xl overflow-hidden border border-slate-100 group">
        <div className="aspect-video sm:aspect-video min-h-52 sm:min-h-72 bg-slate-50 flex items-center justify-center overflow-hidden relative">
          {primaryFloorPlan ? (
            <Image
              className="w-full h-full object-contain"
              src={primaryFloorPlan}
              alt="Property Floor Plan"
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-white flex flex-col items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-4xl sm:text-5xl">grid_view</span>
              <p className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Floor plans not uploaded yet</p>
            </div>
          )}
          <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-md px-4 sm:px-6 py-4 sm:py-8 flex items-center justify-center">
            <div className="w-full max-w-[260px] sm:max-w-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mb-2.5 sm:mb-4 backdrop-blur-sm border border-white/30 shrink-0">
                <svg className="text-white" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3 className="text-white text-base sm:text-xl font-bold mb-1.5 sm:mb-2 font-heading leading-tight">
                {hasFloorPlans ? 'Preview Available' : 'Awaiting Upload'}
              </h3>
              <p className="text-slate-300 mb-4 sm:mb-8 text-[10px] sm:text-sm leading-relaxed">
                {hasFloorPlans
                  ? 'High-resolution floor plan assets are attached with this listing.'
                  : 'Owner has not uploaded floor plans yet. Contact us for updated documents.'}
              </p>
              {brochureUrl ? (
                <a
                  href={brochureUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full justify-center bg-primary text-white px-5 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download Brochure
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full justify-center bg-white/20 text-white/60 px-5 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Brochure Not Uploaded
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
