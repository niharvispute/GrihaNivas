import Image from 'next/image';

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
    }
  ];

  return (
    <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`relative overflow-hidden rounded-2xl p-3 sm:p-6 md:p-8 shadow-sm transition-all duration-500 hover:shadow-lg hover:shadow-slate-200/80 hover:-translate-y-1 border border-slate-100 ${
            stat.gradient ? `bg-gradient-to-br ${stat.gradient} border-transparent` : 'bg-white'
          }`}
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className={`text-[7px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-0.5 sm:mb-1 md:mb-2 ${stat.gradient ? 'text-white/70' : 'text-slate-400'}`}>
                {stat.label}
              </p>
              <h4 className={`text-xl sm:text-2xl md:text-4xl font-heading font-black mb-2 sm:mb-3 md:mb-4 ${stat.text}`}>
                {stat.value}
              </h4>
            </div>

            {stat.type === 'agents' ? (
              <div className="flex flex-col items-start gap-2">
                <div className="flex -space-x-1 sm:-space-x-2">
                  {stat.agents.map((agent, i) => (
                    <Image
                      key={i}
                      width={32}
                      height={32}
                      className="w-5 h-5 sm:w-8 sm:h-8 rounded-full border border-sm:border-2 border-white object-cover"
                      src={agent}
                      alt="Agent"
                    />
                  ))}
                  <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full border border-sm:border-2 border-white bg-slate-100 flex items-center justify-center text-[7px] sm:text-[10px] font-black text-slate-400">
                    {stat.extra}
                  </div>
                </div>
                <span className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Agents</span>
              </div>
            ) : stat.action ? (
              <button className="flex items-center gap-1 sm:gap-2 text-primary font-bold text-[7px] sm:text-xs md:text-sm group/btn">
                <span className="hidden sm:inline">{stat.action}</span>
                <span className="material-symbols-outlined text-[14px] sm:text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            ) : null}
          </div>

          <span className={`material-symbols-outlined absolute -right-2 -bottom-2 sm:-right-4 sm:-bottom-4 text-3xl sm:text-6xl md:text-9xl pointer-events-none opacity-10 ${stat.text}`}>
            {stat.icon}
          </span>
        </div>
      ))}
    </div>
  );
}
