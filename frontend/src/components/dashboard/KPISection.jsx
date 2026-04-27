export default function KPISection({ savedCount = 0, compareCount = 0 }) {
  const kpis = [
    {
      title: "Saved Properties",
      value: String(savedCount),
      change: savedCount === 1 ? "1 property" : `${savedCount} properties`,
      icon: "bookmark",
      theme: "pink"
    },
    {
      title: "Comparing",
      value: String(compareCount),
      change: `of 3 max`,
      icon: "compare_arrows",
      theme: "blue"
    }
  ];

  const themeClasses = {
    pink: "bg-pink-50 text-pink-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600"
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-lg hover:shadow-slate-200/80 transition-all duration-500">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className={`p-2 rounded-xl ${themeClasses[kpi.theme]} group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined text-base sm:text-xl">{kpi.icon}</span>
            </div>
            <span className={`text-[7px] sm:text-[10px] font-bold uppercase tracking-wider ${kpi.theme === 'emerald' ? 'text-emerald-500' : kpi.theme === 'blue' ? 'text-blue-500' : 'text-slate-400'}`}>
              {kpi.change}
            </span>
          </div>
          <div>
            <p className="text-[9px] sm:text-xs font-bold text-slate-400 mb-0.5">{kpi.title}</p>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-900">{kpi.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
