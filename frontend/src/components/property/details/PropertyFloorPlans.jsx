import Image from 'next/image';

export default function PropertyFloorPlans({ floorPlans = [], brochureUrl = '' }) {
  const hasFloorPlans = Array.isArray(floorPlans) && floorPlans.length > 0;
  const primaryFloorPlan = hasFloorPlans ? floorPlans[0] : null;

  return (
    <section>
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-2xl font-heading font-extrabold text-slate-900">Floor Plans</h2>
        <span className="text-slate-400 font-semibold text-sm">
          {hasFloorPlans ? `${floorPlans.length} Layout${floorPlans.length > 1 ? 's' : ''} Available` : 'No layouts uploaded'}
        </span>
      </div>
      <div className="relative rounded-2xl overflow-hidden border border-slate-100 group">
        <div className="aspect-video bg-slate-50 flex items-center justify-center overflow-hidden relative">
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
            <div className="w-full h-full bg-linear-to-br from-slate-100 to-white flex flex-col items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-5xl">grid_view</span>
              <p className="mt-3 text-xs font-bold uppercase tracking-widest">Floor plans not uploaded yet</p>
            </div>
          )}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/30">
              <svg className="text-white" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 className="text-white text-xl font-bold mb-2 font-heading">
              {hasFloorPlans ? 'Preview Available' : 'Awaiting Upload'}
            </h3>
            <p className="text-slate-200 mb-8 max-w-sm text-sm">
              {hasFloorPlans
                ? 'High-resolution floor plan assets are attached with this listing.'
                : 'This owner has not uploaded floor plans yet. Contact us for updated documents.'}
            </p>
            {brochureUrl ? (
              <a
                href={brochureUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-primary text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-primary/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Brochure
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="bg-white/20 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Brochure Not Uploaded
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
