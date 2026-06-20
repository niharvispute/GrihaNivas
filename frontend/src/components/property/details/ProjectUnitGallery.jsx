'use client';

import { useEffect, useState } from 'react';
import CloudinaryImage from '@/components/CloudinaryImage';

export default function ProjectUnitGallery({ images, alt }) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isViewerOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsViewerOpen(false);
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

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const previousOverflow = document.body.style.overflow;
    if (isViewerOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isViewerOpen]);

  if (!safeImages.length) return null;

  const openViewer = (index) => {
    setActiveIndex(index);
    setIsViewerOpen(true);
  };

  const currentImage = safeImages[activeIndex] || safeImages[0];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] gap-3 sm:gap-4 h-auto lg:h-120">
        <div
          className="relative min-h-72 sm:min-h-88 lg:h-full rounded-2xl overflow-hidden shadow-xl group cursor-pointer"
          onClick={() => openViewer(0)}
        >
          <CloudinaryImage
            src={safeImages[0]}
            alt={alt}
            fill
            eager
            sizes="(max-width: 1024px) 100vw, 70vw"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-3 sm:gap-4 lg:h-full">
          {[safeImages[1], safeImages[2]].map((img, idx) =>
            img ? (
              <div
                key={idx}
                className="relative min-h-32 sm:min-h-44 lg:min-h-0 rounded-2xl overflow-hidden border border-slate-100 group cursor-pointer"
                onClick={() => openViewer(idx + 1)}
              >
                <CloudinaryImage
                  src={img}
                  alt={`${alt} ${idx + 2}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 30vw"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {idx === 1 && safeImages.length > 3 && (
                  <div
                    className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white text-center px-4"
                  >
                    <span className="text-2xl sm:text-3xl font-heading font-black tracking-tighter">
                      +{safeImages.length - 3}
                    </span>
                    <span className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] opacity-85">
                      More Photos
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div key={idx} className="hidden lg:flex min-h-0 rounded-2xl bg-slate-50 border border-slate-100" />
            )
          )}
        </div>
      </div>

      {isViewerOpen && (
        <div
          className="fixed inset-0 z-9999 bg-black/20 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsViewerOpen(false)}
        >
          <div className="relative w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsViewerOpen(false)}
              className="absolute -top-10 sm:-top-12 right-0 text-white/80 hover:text-white transition-colors"
              aria-label="Close gallery"
            >
              <span className="material-symbols-outlined text-2xl sm:text-3xl">close</span>
            </button>

            <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl border border-white/10 min-h-[52vh] sm:min-h-[60vh] lg:min-h-[72vh]">
              <div className="absolute inset-0 flex items-center justify-center">
                <CloudinaryImage
                  src={currentImage}
                  alt={`Gallery image ${activeIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain bg-black"
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveIndex((current) => (current - 1 + safeImages.length) % safeImages.length)}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/12 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveIndex((current) => (current + 1) % safeImages.length)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/12 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>

              <div className="absolute left-3 sm:left-4 right-3 sm:right-4 top-3 sm:top-4 flex items-center justify-between gap-3 sm:gap-4">
                <div className="bg-black/45 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] backdrop-blur-md border border-white/10">
                  {activeIndex + 1} / {safeImages.length}
                </div>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
              {safeImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative w-24 h-24 sm:w-30 sm:h-30 md:w-37.5 md:h-37.5 shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border transition-all ${
                    index === activeIndex ? 'border-white ring-2 ring-white/70 scale-[1.02]' : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Show image ${index + 1}`}
                >
                  <CloudinaryImage
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
