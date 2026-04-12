'use client';

export default function DashboardHeader() {
  return (
    <header className="flex justify-between items-center h-20 px-8 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-100 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 text-slate-400 focus-within:text-primary transition-all group bg-slate-50 px-4 py-2 rounded-full border border-slate-100 focus-within:bg-white focus-within:shadow-inner">
          <span className="material-symbols-outlined text-xl group-focus-within:scale-110 transition-transform">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-80 placeholder:text-slate-400 text-slate-900 font-medium" 
            placeholder="Search properties, enquiries..." 
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex gap-4">
          <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all relative">
            <span className="material-symbols-outlined text-2xl">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all">
            <span className="material-symbols-outlined text-2xl">settings</span>
          </button>
        </div>
        <div className="h-8 w-px bg-slate-100 mx-2"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">Alex Johnson</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter mt-1">Active Now</p>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200" 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-primary/10 hover:border-primary transition-colors cursor-pointer"
          />
        </div>
      </div>
    </header>
  );
}
