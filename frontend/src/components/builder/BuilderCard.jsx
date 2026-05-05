import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const BuilderCard = ({ builder }) => {
  return (
    <div className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-300 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden bg-zinc-100">
        <Image
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          src={builder.image}
          alt={builder.name}
        />
        {builder.tier && (
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase border border-primary/20 tracking-widest">
              {builder.tier}
            </span>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-zinc-50 rounded-lg p-1.5 border border-zinc-100 shadow-sm flex items-center justify-center">
             {builder.logo ? (
               <Image src={builder.logo} alt={builder.name} width={48} height={48} className="object-contain" />
             ) : (
               <span className="material-symbols-outlined text-primary text-2xl">domain</span>
             )}
          </div>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
            {builder.totalProjects} Projects
          </span>
        </div>
        <h3 className="font-headline text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors tracking-tight">
          {builder.name}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-bold leading-relaxed">
          {builder.description}
        </p>
        <div className="mt-auto pt-4 border-t border-zinc-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm font-black">schedule</span>
            <span>Est. {builder.estYear}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm font-black">location_on</span>
            <span>{builder.hq}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link 
            href={`/builders/${builder.slug}`}
            className="py-3 px-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest text-center rounded-xl hover:bg-primary/90 transition-all shadow-lg active:scale-95 leading-none"
          >
            Details
          </Link>
          <button className="py-3 px-4 bg-zinc-50 text-slate-900 border border-zinc-100 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-100 transition-all active:scale-95 leading-none">
            Properties
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuilderCard;
