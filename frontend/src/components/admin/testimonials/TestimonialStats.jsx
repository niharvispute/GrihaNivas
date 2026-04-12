'use client';

import React from 'react';

const TestimonialStats = () => {
  const stats = [
    { label: "Total Reviews", value: "1,284", grow: "+12%", bg: 'bg-white' },
    { label: "Average Rating", value: "4.8", stars: 5, bg: 'bg-white' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
      {stats.map((stat, i) => (
        <div key={i} className={`${stat.bg} p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 flex flex-col justify-between hover:scale-[1.02] transition-transform group`}>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
          <div className="flex items-end justify-between mt-6">
            <span className="text-5xl font-black text-slate-900 tracking-tighter">{stat.value}</span>
            {stat.grow && (
              <span className="text-green-500 text-[10px] font-black bg-green-50 px-3 py-1.5 rounded-full border border-green-100 uppercase tracking-widest">{stat.grow}</span>
            )}
            {stat.stars && (
              <div className="flex text-amber-400 gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="material-symbols-outlined text-xl" style={{ fontVariationSettings: j < 5 ? "'FILL' 1" : "" }}>star</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      <div className="md:col-span-2 bg-primary p-10 rounded-[2.5rem] shadow-2xl shadow-primary/30 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all">
        <div className="relative z-10">
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Platform Influence</p>
          <h3 className="text-3xl font-black text-white mt-6 tracking-tighter leading-none">Verified status increases <br/>conversion by <span className="italic">24.8%</span></h3>
        </div>
        <div className="mt-8 z-10">
          <button className="bg-white/20 hover:bg-white text-white hover:text-primary px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md">View Growth Insights</button>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-1000"></div>
      </div>
    </div>
  );
};

export default TestimonialStats;
