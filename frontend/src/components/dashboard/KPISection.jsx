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
    },
    {
      title: "Last Active",
      value: "Today",
      change: "Online Now",
      icon: "timer",
      theme: "emerald"
    }
  ];

  const themeClasses = {
    pink: "bg-pink-50 text-pink-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600"
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${themeClasses[kpi.theme]} group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined text-2xl">{kpi.icon}</span>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${kpi.theme === 'emerald' ? 'text-emerald-500' : kpi.theme === 'blue' ? 'text-blue-500' : 'text-slate-400'}`}>
              {kpi.change}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 mb-1">{kpi.title}</p>
            <h3 className="text-4xl font-heading font-black text-slate-900">{kpi.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
