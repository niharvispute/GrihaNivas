export default function ProfileStats() {
  const stats = [
    {
      label: "Properties Viewed",
      value: "24",
      icon: "domain",
      gradient: "from-pink-500 to-pink-700",
      text: "text-white"
    },
    {
      label: "Enquiries Made",
      value: "08",
      icon: "chat",
      type: "agents",
      agents: [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
      ],
      extra: "+6",
      text: "text-slate-900"
    },
    {
      label: "Upcoming Viewings",
      value: "03",
      icon: "calendar_month",
      action: "View Schedule",
      text: "text-slate-900"
    }
  ];

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className={`relative overflow-hidden rounded-[2rem] p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-100 ${
            stat.gradient ? `bg-gradient-to-br ${stat.gradient} border-transparent` : 'bg-white'
          }`}
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${stat.gradient ? 'text-white/70' : 'text-slate-400'}`}>
                {stat.label}
              </p>
              <h4 className={`text-4xl font-heading font-black mb-4 ${stat.text}`}>
                {stat.value}
              </h4>
            </div>

            {stat.type === 'agents' ? (
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {stat.agents.map((agent, i) => (
                    <img 
                      key={i} 
                      className="w-8 h-8 rounded-full border-2 border-white object-cover" 
                      src={agent} 
                      alt="Agent" 
                    />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                    {stat.extra}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Agents Assigned</span>
              </div>
            ) : stat.action ? (
              <button className="flex items-center gap-2 text-primary font-bold text-sm group/btn">
                <span>{stat.action}</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            ) : null}
          </div>
          
          <span className={`material-symbols-outlined absolute -right-4 -bottom-4 text-9xl pointer-events-none opacity-10 ${stat.text}`}>
            {stat.icon}
          </span>
        </div>
      ))}
    </div>
  );
}
