export default function ProfileHero() {
  return (
    <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 mb-8">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/5 group-hover:border-primary/20 transition-all duration-500">
            <img 
              alt="Alex Sterling" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300" 
            />
          </div>
          <button className="absolute bottom-1 right-1 bg-primary text-white p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>
        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h2 className="text-3xl font-heading font-black text-slate-900 tracking-tight">Alex Sterling</h2>
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0 flex items-center gap-1 border border-emerald-100">
              <span className="material-symbols-outlined text-xs">verified</span>
              Verified Profile
            </span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              Joined: May 2024
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">location_on</span>
              Mumbai, IN
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span className="text-primary">Premium Member</span>
          </div>
        </div>
      </div>
    </section>
  );
}
