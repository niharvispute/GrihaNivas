'use client';

import { motion } from 'framer-motion';

export default function PropertyGallery({ images, property }) {
  if (!images || images.length === 0) return null;

  const displayImages = images.slice(0, 5);
  const remainingCount = images.length - 5;

  return (
    <div className="space-y-6">
      {/* Mosaic Collage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[500px] md:h-[600px]">
        
        {/* HERO IMAGE: Large 2x2 section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-2 md:row-span-2 relative rounded-[2rem] overflow-hidden group shadow-xl"
        >
          <img 
            src={displayImages[0]} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
            alt="Main Property View" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none"></div>
          
          {/* Feature Overlays (Glassmorphism Cards) */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-3 pointer-events-auto">
             <div className="bg-white/20 backdrop-blur-xl border border-white/30 px-5 py-3 rounded-2xl flex flex-col items-center min-w-[80px]">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Type</span>
                <span className="text-sm font-black text-white italic tracking-tight">{property?.bhk} BHK</span>
             </div>
             <div className="bg-white/20 backdrop-blur-xl border border-white/30 px-5 py-3 rounded-2xl flex flex-col items-center min-w-[80px]">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Area</span>
                <span className="text-sm font-black text-white italic tracking-tight">{property?.area} SF</span>
             </div>
             <div className="bg-white/20 backdrop-blur-xl border border-white/30 px-5 py-3 rounded-2xl flex flex-col items-center min-w-[80px]">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Status</span>
                <span className="text-sm font-black text-white italic tracking-tight uppercase text-[10px]">{property?.status || 'Active'}</span>
             </div>
          </div>
        </motion.div>

        {/* NESTED SMALL IMAGES: 2x2 grid in remaining space or separate grid items */}
        {displayImages.slice(1, 5).map((img, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * (idx + 1) }}
            className="relative rounded-[1.5rem] overflow-hidden group shadow-md cursor-pointer border border-slate-100"
          >
            <img 
              src={img} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt={`Property Angle ${idx + 2}`} 
            />
            
            {/* "View More" Overlay on the last visible image */}
            {idx === 3 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <span className="text-3xl font-heading font-black italic tracking-tighter">+{remainingCount}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">More Views</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
          </motion.div>
        ))}
      </div>

      {/* Action Bar Below Collage */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-400">
               <span className="material-symbols-outlined text-[18px]">photo_camera</span>
               <span className="text-[11px] font-bold tracking-tight">{images.length} High-Res Professional Shots</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
               <span className="material-symbols-outlined text-[18px]">videocam</span>
               <span className="text-[11px] font-bold tracking-tight">Virtual Tour Available</span>
            </div>
         </div>
         <button className="flex items-center gap-2 px-6 py-2 border-2 border-slate-100 rounded-xl hover:border-primary hover:text-primary transition-all text-sm font-extrabold tracking-tight">
            <span className="material-symbols-outlined text-lg">grid_view</span>
            Browse All Media
         </button>
      </div>
    </div>
  );
}
