'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export default function FeaturedBuildersCarousel({ builders = [] }) {
  const slides = useMemo(() => (Array.isArray(builders) ? builders.slice(0, 4) : []), [builders]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 2500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex > slides.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  if (!slides.length) return null;

  const activeBuilder = slides[activeIndex];
  const heroImage = activeBuilder?.heroImage?.trim() || null;
  const logo = activeBuilder?.logo?.trim() || null;
  const shortDescription = Array.isArray(activeBuilder?.shortDescription)
    ? activeBuilder.shortDescription[0]
    : activeBuilder?.shortDescription || '';
  const description = Array.isArray(activeBuilder?.description)
    ? activeBuilder.description[0]
    : activeBuilder?.description || '';
  const heroDescription = shortDescription || description;

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  return (
    <section className="mb-10 sm:mb-16 animate-in fade-in duration-1000">
      <div className="group relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-zinc-900 min-h-96 lg:h-125 flex items-center shadow-2xl">
        <div className="absolute inset-0">
          {heroImage ? (
            <img
              className="w-full h-full object-cover opacity-60 transition-transform duration-700"
              src={heroImage}
              alt={activeBuilder?.name || 'Featured builder'}
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-zinc-700 via-zinc-800 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-linear-to-r from-zinc-950 via-zinc-950/60 to-transparent"></div>
        </div>

        <div className="relative z-10 px-5 sm:px-8 md:px-16 py-8 sm:py-10 max-w-3xl">
          <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-primary/20 text-white border border-primary/30 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-widest mb-4 sm:mb-6">
            Featured Partner
          </span>
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl p-2 flex items-center justify-center shadow-xl shrink-0">
              {logo ? (
                <img className="w-full h-full object-contain" src={logo} alt={activeBuilder?.name || 'Builder logo'} />
              ) : (
                <span className="text-xl font-black text-primary">{activeBuilder?.name?.[0] || 'B'}</span>
              )}
            </div>
            <h2 className="text-[24px]! sm:text-4xl! md:text-6xl! font-headline font-extrabold text-white uppercase tracking-tighter leading-tight">
              {activeBuilder?.name}
            </h2>
          </div>
          <p className="text-zinc-300 text-sm sm:text-base lg:text-lg mb-5 sm:mb-8 leading-relaxed font-body line-clamp-3">
            {activeBuilder?.tagline} {heroDescription}
          </p>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-8 mb-6 sm:mb-10">
            <div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold font-label">Est. Year</p>
              <p className="text-white text-base sm:text-xl font-bold">{activeBuilder?.establishedYear || 'N/A'}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold font-label">Total Projects</p>
              <p className="text-white text-base sm:text-xl font-bold">{activeBuilder?.totalProjects || 'N/A'}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold font-label">HQ Location</p>
              <p className="text-white text-base sm:text-xl font-bold">{activeBuilder?.hqLocation || 'N/A'}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href={`/builders/${activeBuilder?.slug}`}
              className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-widest text-center"
            >
              View Details
            </Link>
            <Link
              href={`/builders/${activeBuilder?.slug}#portfolio`}
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-white/20 transition-all text-xs sm:text-sm uppercase tracking-widest text-center"
            >
              View Portfolio
            </Link>
          </div>
        </div>

        <div className="absolute inset-y-0 left-2 sm:left-6 right-2 sm:right-6 z-20 flex items-center justify-between pointer-events-none">
          <button
            type="button"
            onClick={goToPrevious}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/15 text-white border border-white/25 hover:bg-white/25 transition-colors flex items-center justify-center pointer-events-auto"
            aria-label="Previous featured builder"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/15 text-white border border-white/25 hover:bg-white/25 transition-colors flex items-center justify-center pointer-events-auto"
            aria-label="Next featured builder"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">chevron_right</span>
          </button>
        </div>

        <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-20 flex items-center gap-2">
          {slides.map((builder, index) => (
            <button
              key={builder?.id || builder?.slug || index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/70'}`}
              aria-label={`Go to featured builder ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
