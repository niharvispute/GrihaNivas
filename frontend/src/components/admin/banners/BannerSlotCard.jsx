'use client';

import React from 'react';

const BannerSlotCard = ({ banner, onReplace }) => {
  const statusColors = {
    Live: 'bg-green-100 text-green-700 border-green-200',
    Scheduled: 'bg-primary/10 text-primary border-primary/20',
    Inactive: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  const isInactive = banner.status === 'Inactive';

  return (
    <section className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-500 group">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{banner.title}</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">{banner.description}</p>
        </div>
        <div className="flex items-center gap-3">
          {isInactive && (
            <span className="material-symbols-outlined text-error scale-90" style={{ fontVariationSettings: "'FILL' 1" }}>
              visibility_off
            </span>
          )}
          <span className={`px-4 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[banner.status]}`}>
            {banner.status}
          </span>
        </div>
      </div>

      <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Banner Preview Area */}
        <div className="lg:col-span-8">
          <div className={`relative group rounded-[2rem] overflow-hidden border border-slate-100 aspect-[1920/600] bg-slate-50 shadow-inner ${isInactive ? 'grayscale opacity-50' : ''}`}>
            <img 
              alt={banner.title} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              src={banner.image} 
            />
            {isInactive ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md px-8 py-3 rounded-full text-slate-400 font-bold flex items-center gap-3 shadow-2xl">
                  <span className="material-symbols-outlined font-black">block</span>
                  <span className="text-xs uppercase tracking-widest">Inactive Slot</span>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <button className="flex items-center gap-3 bg-white text-slate-900 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-lg">zoom_in</span>
                  Preview Full
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Banner Controls Area */}
        <div className="lg:col-span-4 flex flex-col justify-center h-full space-y-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="bg-primary/10 text-primary p-2 rounded-xl">
                <span className="material-symbols-outlined text-xl">info</span>
              </div>
              <div className="pt-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recommended Density</p>
                <p className="text-sm font-bold text-slate-700">{banner.recommendedSize}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="bg-slate-200 text-slate-500 p-2 rounded-xl">
                <span className="material-symbols-outlined text-xl">history</span>
              </div>
              <div className="pt-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Modification</p>
                <p className="text-sm font-bold text-slate-700">{banner.lastUpdated}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
             {banner.status === 'Scheduled' && (
                <div className="px-6 py-3 bg-primary/5 text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-primary/10 mb-2">
                   Goes live on November 1st
                </div>
             )}
             
             <div className="flex gap-4">
               <button 
                  onClick={() => onReplace(banner.id)}
                  className="flex-1 flex items-center justify-center gap-3 bg-primary text-white font-black text-xs uppercase tracking-widest py-5 px-8 rounded-full hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 active:scale-95 leading-none"
                >
                  <span className="material-symbols-outlined">cloud_upload</span>
                  {isInactive ? 'Upload Asset' : 'Replace Image'}
                </button>
                {!isInactive && (
                  <button className="w-14 h-14 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-all active:scale-95">
                    <span className="material-symbols-outlined">settings</span>
                  </button>
                )}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSlotCard;
