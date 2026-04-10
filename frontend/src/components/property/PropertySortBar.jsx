export default function PropertySortBar() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-4 text-sm font-medium">
        <span className="text-slate-500">Sort by:</span>
        <div className="flex gap-2">
          <button className="px-5 py-1.5 rounded-full bg-primary text-white text-xs font-bold shadow-md shadow-primary/20 transition-all">
            Newest
          </button>
          <button className="px-5 py-1.5 rounded-full bg-white text-slate-500 text-xs font-bold hover:bg-slate-100 transition-all border border-slate-200">
            Price
          </button>
          <button className="px-5 py-1.5 rounded-full bg-white text-slate-500 text-xs font-bold hover:bg-slate-100 transition-all border border-slate-200">
            Popular
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
        <button className="p-2 bg-slate-100 rounded-lg text-primary shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
        </button>
        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </div>
  );
}
