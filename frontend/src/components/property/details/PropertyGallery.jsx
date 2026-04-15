'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function PropertyGallery({ images, property }) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!safeImages.length) {
    return (
      <div className="space-y-6">
        <div className="h-105 rounded-4xl border border-slate-100 bg-linear-to-br from-slate-100 via-white to-slate-50 flex flex-col items-center justify-center text-slate-400">
          <span className="material-symbols-outlined text-6xl">image_not_supported</span>
          <p className="mt-4 text-xs font-black uppercase tracking-widest">No gallery uploaded yet</p>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">This listing is live while media is being verified.</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              <span className="text-[11px] font-bold tracking-tight">0 Gallery Photos</span>
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Media Awaited</span>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  const displayImages = images.slice(0, 5);
  const remainingCount = images.length - 5;
=======
  const displayImages = safeImages.slice(0, 5);
  const remainingCount = safeImages.length - 5;
  const categoryLabel =
    property?.raw?.category === 'new_launch'
      ? 'New Launch'
      : property?.raw?.category
        ? String(property.raw.category).replace('_', ' ')
        : 'Property';
  const typeLabel = property?.bhk && property?.bhk !== '-' ? `${property.bhk} BHK` : categoryLabel;
  const areaLabel = property?.area && property?.area !== 'N/A' ? `${property.area} sq.ft` : 'Area pending';
  const statusLabel = property?.raw?.status || 'approved';
  const reraStatus = property?.reraNumber || property?.raw?.reraNumber ? 'RERA verified' : 'RERA details pending';
>>>>>>> 2cb51e1cc3eb1d59797484fe89c1c995a4dcd1a8

  return (
    <div className="space-y-6">
      {/* Mosaic Collage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-125 md:h-150">
        {/* HERO IMAGE: Large 2x2 section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-2 md:row-span-2 relative rounded-4xl overflow-hidden group shadow-xl"
        >
          <Image
            src={displayImages[0]}
            alt="Main Property View"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />

          {/* Feature Overlays (Glassmorphism Cards) */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-3 pointer-events-auto">
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 px-5 py-3 rounded-2xl flex flex-col items-center min-w-20">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Type</span>
              <span className="text-sm font-black text-white italic tracking-tight">{typeLabel}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 px-5 py-3 rounded-2xl flex flex-col items-center min-w-20">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Area</span>
              <span className="text-sm font-black text-white italic tracking-tight">{areaLabel}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 px-5 py-3 rounded-2xl flex flex-col items-center min-w-20">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Status</span>
              <span className="text-sm font-black text-white italic tracking-tight uppercase text-[10px]">
                {statusLabel}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Remaining images */}
        {displayImages.slice(1, 5).map((img, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * (idx + 1) }}
            className="relative rounded-3xl overflow-hidden group shadow-md cursor-pointer border border-slate-100"
          >
            <Image
              src={img}
              alt={`Property Angle ${idx + 2}`}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              unoptimized
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* "View More" Overlay on the last visible image */}
            {idx === 3 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <span className="text-3xl font-heading font-black italic tracking-tighter">+{remainingCount}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">More Views</span>
              </div>
            )}

            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Action Bar Below Collage */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            <span className="text-[11px] font-bold tracking-tight">{safeImages.length} Gallery Photo{safeImages.length > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span className="text-[11px] font-bold tracking-tight">{reraStatus}</span>
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
