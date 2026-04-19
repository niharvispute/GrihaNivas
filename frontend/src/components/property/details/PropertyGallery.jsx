'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function PropertyGallery({ images, property }) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayImages = useMemo(() => safeImages.slice(0, 5), [safeImages]);
  const remainingCount = Math.max(safeImages.length - 3, 0);

  useEffect(() => {
    if (!isViewerOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsViewerOpen(false);
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => (current - 1 + safeImages.length) % safeImages.length);
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((current) => (current + 1) % safeImages.length);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isViewerOpen, safeImages.length]);

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

  const categoryLabel =
    property?.raw?.category === 'new_launch'
      ? 'New Launch'
      : property?.raw?.category
        ? String(property.raw.category).replace('_', ' ')
        : 'Property';
  const typeLabel = property?.bhk && property?.bhk !== '-' ? `${property.bhk} BHK` : categoryLabel;
  const areaLabel = property?.area && property?.area !== 'N/A' ? `${property.area} sq.ft` : 'Area pending';
  const formatAreaChip = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return `${value.toLocaleString('en-IN')} sq.ft`;
    }

    const input = String(value).trim();
    if (!input) return '';

    const numeric = Number(input.replace(/[^\d.]/g, ''));
    if (Number.isFinite(numeric) && numeric > 0) {
      if (/sq\.?\s*ft/i.test(input)) return input;
      return `${numeric.toLocaleString('en-IN')} sq.ft`;
    }

    return input;
  };

  const formatCompactIndianPrice = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return '';

    const toFixedTrimmed = (amount) =>
      Number(amount.toFixed(2)).toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });

    if (numeric >= 10000000) {
      return `${toFixedTrimmed(numeric / 10000000)} Cr`;
    }

    if (numeric >= 100000) {
      return `${toFixedTrimmed(numeric / 100000)} Lakh`;
    }

    return numeric.toLocaleString('en-IN');
  };

  const rawPrice = Number.isFinite(Number(property?.priceValue)) && Number(property?.priceValue) > 0
    ? `${formatCompactIndianPrice(property.priceValue)}${property?.priceSuffix ? ` ${property.priceSuffix}` : ''}`
    : property?.price || property?.raw?.priceDisplay || property?.raw?.priceLabel || 'On request';

  const carpetAreaLabel =
    formatAreaChip(
      property?.raw?.carpetArea ||
      property?.raw?.carpetAreaSqft ||
      property?.raw?.area?.carpet ||
      property?.raw?.area?.carpetSqft ||
      property?.raw?.carpet?.area ||
      property?.raw?.carpet?.sqft ||
      property?.carpetArea
    ) || 'On request';

  const reraStatus = property?.reraNumber || property?.raw?.reraNumber ? 'RERA verified' : 'RERA details pending';
  const openViewer = (index) => {
    setActiveIndex(index);
    setIsViewerOpen(true);
  };

  const currentImage = safeImages[activeIndex] || safeImages[0];

  return (
    <div className="space-y-6">
      {/* Split Gallery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)] gap-4 h-auto lg:h-144">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative min-h-88 lg:h-full rounded-4xl overflow-hidden group shadow-xl cursor-pointer"
          onClick={() => openViewer(0)}
        >
          <Image
            src={displayImages[0]}
            alt="Main Property View"
            fill
            sizes="(max-width: 1024px) 100vw, 70vw"
            unoptimized
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/15 to-transparent opacity-80 pointer-events-none" />

          <div className="absolute left-6 right-6 bottom-6 flex flex-wrap gap-3">
            <div className="bg-white/15 backdrop-blur-xl border border-white/25 px-4 py-3 rounded-2xl flex flex-col min-w-24">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70">Price</span>
              <span className="text-sm font-black text-white tracking-tight">{rawPrice}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-xl border border-white/25 px-4 py-3 rounded-2xl flex flex-col min-w-24">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70">Type</span>
              <span className="text-sm font-black text-white tracking-tight">{typeLabel}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-xl border border-white/25 px-4 py-3 rounded-2xl flex flex-col min-w-24">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70">Carpet Area</span>
              <span className="text-sm font-black text-white tracking-tight">{carpetAreaLabel}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-xl border border-white/25 px-4 py-3 rounded-2xl flex flex-col min-w-24">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70">Area</span>
              <span className="text-sm font-black text-white tracking-tight">{areaLabel}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-4 lg:h-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative min-h-44 lg:min-h-0 rounded-3xl overflow-hidden group shadow-md cursor-pointer border border-slate-100"
            onClick={() => openViewer(Math.min(1, safeImages.length - 1))}
          >
            <Image
              src={displayImages[1] || displayImages[0]}
              alt="Property Angle 2"
              fill
              sizes="(max-width: 1024px) 50vw, 30vw"
              unoptimized
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent pointer-events-none" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative min-h-44 lg:min-h-0 rounded-3xl overflow-hidden group shadow-md cursor-pointer border border-slate-100"
            onClick={() => openViewer(Math.min(2, safeImages.length - 1))}
          >
            <Image
              src={displayImages[2] || displayImages[1] || displayImages[0]}
              alt="Property Gallery More"
              fill
              sizes="(max-width: 1024px) 50vw, 30vw"
              unoptimized
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white text-center px-4">
              {remainingCount > 0 ? (
                <>
                  <span className="text-4xl md:text-5xl font-heading font-black italic tracking-tighter">+{remainingCount}</span>
                  <span className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] opacity-85">
                    Remaining Images
                  </span>
                </>
              ) : (
                <span className="text-sm font-black uppercase tracking-[0.25em] opacity-90">Open Gallery</span>
              )}
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/15 border border-white/20 px-4 py-2 rounded-full">
                <span className="material-symbols-outlined text-[18px]">photo_library</span>
                View All
              </span>
            </div>
          </motion.div>
        </div>
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
        <button
          type="button"
          onClick={() => openViewer(0)}
          className="flex items-center gap-2 px-6 py-2 border-2 border-slate-100 rounded-xl hover:border-primary hover:text-primary transition-all text-sm font-extrabold tracking-tight"
        >
          <span className="material-symbols-outlined text-lg">grid_view</span>
          Browse All Media
        </button>
      </div>

      {isViewerOpen && (
        <div
          className="fixed inset-0 z-9999 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsViewerOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsViewerOpen(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
              aria-label="Close gallery"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>

            <div className="relative overflow-hidden rounded-4xl bg-black shadow-2xl border border-white/10 min-h-[60vh] lg:min-h-[72vh]">
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={currentImage}
                  alt={`Gallery image ${activeIndex + 1}`}
                  fill
                  sizes="100vw"
                  unoptimized
                  className="object-contain bg-black"
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveIndex((current) => (current - 1 + safeImages.length) % safeImages.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/12 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveIndex((current) => (current + 1) % safeImages.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/12 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>

              <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-4">
                <div className="bg-black/45 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">
                  {activeIndex + 1} / {safeImages.length}
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-black/45 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">
                  <span className="material-symbols-outlined text-[16px]">swipe</span>
                  Use arrows or tap thumbnails
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {safeImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative w-37.5 h-37.5 shrink-0 rounded-2xl overflow-hidden border transition-all ${
                    index === activeIndex ? 'border-white ring-2 ring-white/70 scale-[1.02]' : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Show image ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    sizes="150px"
                    unoptimized
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
