import React from 'react';

const BuilderStats = ({ builder }) => {
  const stats = [
    { label: "Total Projects", value: builder.totalProjects, bg: "bg-zinc-800/50" },
    { label: "Ongoing Projects", value: builder.ongoingProjects, bg: "bg-primary text-white shadow-2xl shadow-primary/30", isHigh: true },
    { label: "Completed Deliveries", value: builder.completedProjects, bg: "bg-zinc-800/50" },
  ];

  return (
    <section className="bg-zinc-950 py-24">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className={`group p-12 rounded-[2.5rem] ${stat.bg} border ${stat.isHigh ? 'border-primary' : 'border-zinc-800/50'} hover:scale-105 transition-all text-center relative overflow-hidden`}
            >
              {stat.isHigh && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              )}
              <h3 className={`text-6xl font-black mb-4 tracking-tighter ${stat.isHigh ? 'text-white' : 'text-primary'}`}>
                {stat.value}
              </h3>
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] font-headline ${stat.isHigh ? 'text-white/60' : 'text-zinc-500'}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BuilderStats;
