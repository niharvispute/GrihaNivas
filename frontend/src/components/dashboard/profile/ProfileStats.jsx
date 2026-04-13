export default function ProfileStats({ user }) {
  const savedCount = user?.savedProperties?.length ?? 0;
  const compareCount = user?.comparedProperties?.length ?? 0;

  const stats = [
    {
      label: "Saved Properties",
      value: String(savedCount).padStart(2, '0'),
      icon: "bookmark",
      gradient: "from-pink-500 to-pink-700",
      text: "text-white"
    },
    {
      label: "Comparing",
      value: String(compareCount).padStart(2, '0'),
      icon: "compare_arrows",
      text: "text-slate-900"
    },
    {
      label: "Account Status",
      value: user?.isVerified ? "Verified" : "Pending",
      icon: "verified_user",
      action: user?.isVerified ? null : "Verify Now",
      text: "text-slate-900"
    }
  ];

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className={`relative overflow-hidden rounded-4xl p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-100 ${
            stat.gradient ? `bg-linear-to-br ${stat.gradient} border-transparent` : 'bg-white'
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
