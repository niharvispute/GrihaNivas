import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const FeaturedBuilder = ({ builder }) => {
  return (
    <section className="mb-16">
      <div className="group relative overflow-hidden rounded-2xl bg-zinc-900 h-[500px] flex items-center shadow-2xl">
        <div className="absolute inset-0">
          <Image
            fill
            sizes="100vw"
            className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2000ms]"
            src={builder.image}
            alt="Featured architectural marvel"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent"></div>
        </div>
        <div className="relative z-10 px-8 md:px-20 max-w-4xl">
          <span className="inline-block px-5 py-2 rounded-full bg-primary/20 text-white border border-primary/30 text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
            Featured Partner
          </span>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl p-3 flex items-center justify-center shadow-2xl ring-4 ring-white/10 animate-in zoom-in duration-700">
              <Image width={80} height={80} className="object-contain" src={builder.logo} alt={builder.name} />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
              {builder.name}
            </h2>
          </div>
          <p className="text-zinc-300 text-lg md:text-xl font-bold mb-12 leading-relaxed max-w-2xl opacity-90">
            {builder.description}
          </p>
          <div className="flex flex-wrap gap-12 mb-12">
            {[
              { label: "Est. Year", value: builder.estYear },
              { label: "Total Projects", value: `${builder.totalProjects}+` },
              { label: "HQ Location", value: builder.hq }
            ].map((stat, i) => (
              <div key={i} className="animate-in fade-in duration-700" style={{ animationDelay: `${i * 100}ms` }}>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                <p className="text-white text-2xl font-black tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-6">
            <Link 
              href={`/builders/${builder.slug}`}
              className="bg-primary text-white px-10 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-2xl shadow-primary/20 leading-none"
            >
              View Legacy
            </Link>
            <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all leading-none">
              View Properties
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBuilder;
