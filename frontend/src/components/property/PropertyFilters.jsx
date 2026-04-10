export default function PropertyFilters() {
  return (
    <aside className="w-full lg:w-80 flex-shrink-0">
      <div className="sticky top-24 bg-white rounded-moderate p-6 flex flex-col gap-8 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-primary mb-1">Filters</h2>
          <p className="text-xs text-slate-400 font-medium">Refine your luxury search</p>
        </div>

        <div className="space-y-8 text-sm">
          {/* Location Filter */}
          <div className="space-y-3">
            <label className="font-bold flex items-center gap-2 text-slate-700">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Location
            </label>
            <select className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 appearance-none">
              <option>Select Neighborhood</option>
              <option>South Mumbai</option>
              <option>Bandra West</option>
              <option>Juhu</option>
              <option>Worli</option>
            </select>
          </div>

          {/* Budget Filter */}
          <div className="space-y-3">
            <label className="font-bold flex items-center gap-2 text-slate-700">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
              Budget Range
            </label>
            <input className="w-full accent-primary h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" type="range" min="1" max="100" defaultValue="50" />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>₹1 Cr</span>
              <span>₹100 Cr+</span>
            </div>
          </div>

          {/* BHK Type */}
          <div className="space-y-3">
            <label className="font-bold flex items-center gap-2 text-slate-700">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              BHK Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['2 BHK', '3 BHK', '4 BHK', '5+ BHK'].map((type) => (
                <label key={type} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 cursor-pointer hover:bg-tertiary transition-colors border border-transparent hover:border-primary/20">
                  <input type="checkbox" className="rounded text-primary focus:ring-primary/20 border-slate-300" />
                  <span className="text-xs font-semibold text-slate-600">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <label className="font-bold flex items-center gap-2 text-slate-700">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
              Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {['Gym', 'Sea View', 'Infinity Pool', 'Garden'].map((amt) => (
                <button key={amt} className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-primary hover:text-white transition-all">
                  {amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 space-y-3 border-t border-slate-100">
          <button className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
            Apply Filters
          </button>
          <button className="w-full text-slate-400 text-xs font-bold hover:text-primary transition-colors underline underline-offset-4 decoration-slate-200">
            Reset All Filters
          </button>
        </div>
      </div>
    </aside>
  );
}
