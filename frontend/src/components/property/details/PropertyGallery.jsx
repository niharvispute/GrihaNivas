<<<<<<< HEAD
'use client';

import { motion } from 'framer-motion';
=======
const FALLBACK_FEATURES = [
  'Zero Brokerage',
  'Best Price Guarantee',
  'Pay 20% now and 80% on possession',
  'Excellent connectivity across Mumbai',
  'Premium clubhouse access',
];

const formatInrCompact = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 1,
    notation: 'compact',
  }).format(value || 0);

const getPerSqftLabel = (property) => {
  const price = Number(property?.raw?.price || 0);
  const area = Number(property?.raw?.areaSqft || 0);
  if (!Number.isFinite(price) || !Number.isFinite(area) || area <= 0) {
    return 'On request';
  }

  const perSqft = price / area;
  if (perSqft >= 1000) {
    return `INR ${(perSqft / 1000).toFixed(1)} K per Sqft.`;
  }
  return `INR ${Math.round(perSqft).toLocaleString('en-IN')} per Sqft.`;
};
>>>>>>> 900b7b01c41e025cdb9ab3c012e2284be4cdb96c

export default function PropertyGallery({ images, property }) {
  if (!images || images.length === 0) return null;

<<<<<<< HEAD
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
=======
  const mainImage = images[0];
  const rightTopImage = images[1] || images[0];
  const rightBottomImage = images[2] || images[0];
  const featureBullets = Array.isArray(property?.feature) && property.feature.length > 0
    ? property.feature.slice(0, 7)
    : FALLBACK_FEATURES;
  const specs = [
    {
      label: 'Configurations',
      value: property?.bhk && property.bhk !== '-' ? `${property.bhk} BHK` : 'On request',
    },
    {
      label: 'Possession Date',
      value: property?.raw?.possession || 'On request',
    },
    {
      label: 'Built up Area',
      value: property?.area && property.area !== 'N/A' ? `${property.area} Sq.ft` : 'On request',
    },
    {
      label: 'Carpet Area',
      value: property?.area && property.area !== 'N/A' ? `${property.area} Sq.ft` : 'On request',
    },
    {
      label: 'Min. Price per Sqft.',
      value: getPerSqftLabel(property),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
        <div className="md:col-span-8 relative rounded-2xl overflow-hidden min-h-80 md:min-h-130 group">
          <img
            src={mainImage}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Main Property Image"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/35 via-black/10 to-transparent" />

          <ul className="absolute top-4 left-4 md:top-5 md:left-5 z-20 space-y-1.5 max-w-[82%]">
            {featureBullets.map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-2 bg-slate-900/70 text-white pl-2 pr-4 py-1 rounded-r-full rounded-l-md"
              >
                <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center">
                  *
                </span>
                <span className="text-[11px] md:text-[13px] font-semibold leading-tight">{item}</span>
              </li>
            ))}
          </ul>

          {property?.reraUrl ? (
            <a
              href={property.reraUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute left-4 bottom-4 z-20 bg-white/95 text-slate-700 rounded-lg px-3 py-2 shadow-lg border border-slate-200 hover:bg-white transition-colors"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">RERA</p>
              <p className="text-sm font-extrabold">RERA QR</p>
            </a>
          ) : null}

          <button className="absolute right-4 bottom-4 z-20 bg-black/75 text-white rounded-lg px-4 py-2 text-xl font-semibold backdrop-blur hover:bg-black/85 transition-colors">
            Photos
          </button>
        </div>

        <div className="md:col-span-4 grid grid-rows-2 gap-3 md:gap-4 min-h-80 md:min-h-130">
          <div className="rounded-2xl overflow-hidden relative group">
            <img
              src={rightTopImage}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Property side visual"
            />
          </div>

          <div className="rounded-2xl overflow-hidden relative group">
            <img
              src={rightBottomImage}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Property secondary visual"
            />
            <div className="absolute inset-0 bg-slate-900/45 flex items-center justify-center">
              <span className="text-white text-2xl font-extrabold tracking-tight">
                View all images
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          {specs.map((spec) => (
            <div key={spec.label} className="px-5 py-4">
              <p className="text-xs md:text-[13px] font-medium text-slate-500 mb-1.5">{spec.label}</p>
              <p className="text-base md:text-2xl font-black text-slate-900">{spec.value}</p>
            </div>
          ))}
        </div>
>>>>>>> 900b7b01c41e025cdb9ab3c012e2284be4cdb96c
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
