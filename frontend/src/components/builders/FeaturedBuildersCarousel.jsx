'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
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
    <section className="mb-8 md:mb-12 lg:mb-14 animate-in fade-in duration-1000">
      <div className="group relative overflow-hidden rounded-2xl bg-slate-900 min-h-96 lg:h-125 flex items-center shadow-2xl pb-10">
        <div className="absolute inset-0">
          {heroImage ? (
            <Image
              fill
              sizes="100vw"
              className="object-cover opacity-60 transition-transform duration-700"
              src={heroImage}
              alt={activeBuilder?.name || 'Featured builder'}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent"></div>
        </div>

        <div className="relative z-10 px-4 sm:px-8 md:px-16 py-6 sm:py-10 max-w-3xl">
          <span className="inline-block px-2.5 sm:px-4 py-1 rounded-full bg-primary/20 text-white border border-primary/30 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-widest mb-4 sm:mb-6">
            Featured Partner
          </span>
          <div className="flex items-center gap-2.5 sm:gap-4 mb-5 sm:mb-4">
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl p-1.5 flex items-center justify-center shadow-xl shrink-0">
              {logo ? (
                <Image width={64} height={64} className="object-contain" src={logo} alt={activeBuilder?.name || 'Builder logo'} />
              ) : (
                <span className="text-lg font-black text-primary">{activeBuilder?.name?.[0] || 'B'}</span>
              )}
            </div>
            <h2 className="text-xl sm:text-3xl md:text-5xl font-headline font-black text-white uppercase tracking-tight leading-none">
              {activeBuilder?.name}
            </h2>
          </div>
          <p className="hidden sm:block text-slate-300 text-xs sm:text-sm lg:text-base mb-5 sm:mb-8 leading-relaxed font-body line-clamp-3">
            {activeBuilder?.tagline} {heroDescription}
          </p>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-4 gap-y-3 sm:gap-8 mb-5 sm:mb-10">
            <div>
              <p className="text-slate-500 text-[8px] uppercase tracking-widest font-black font-label leading-none mb-0.5 sm:mb-1">Est. Year</p>
              <p className="text-white text-xs sm:text-base font-bold">{activeBuilder?.establishedYear || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[8px] uppercase tracking-widest font-black font-label leading-none mb-0.5 sm:mb-1">Total Projects</p>
              <p className="text-white text-xs sm:text-base font-bold">{activeBuilder?.totalProjects || 'N/A'}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-slate-500 text-[8px] uppercase tracking-widest font-black font-label leading-none mb-0.5 sm:mb-1">HQ Location</p>
              <p className="text-white text-xs sm:text-base font-bold">{activeBuilder?.hqLocation || 'N/A'}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4">
            <Link
              href={`/builders/${activeBuilder?.slug}`}
              className="bg-primary hover:bg-primary/90 text-white px-5 sm:px-8 py-2.5 sm:py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg text-[10px] sm:text-sm uppercase tracking-widest text-center"
            >
              View Details
            </Link>
            <Link
              href={`/builders/${activeBuilder?.slug}#portfolio`}
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-5 sm:px-8 py-2.5 sm:py-4 rounded-2xl font-black hover:bg-white/20 transition-all text-[10px] sm:text-sm uppercase tracking-widest text-center"
            >
              View Portfolio
            </Link>
          </div>
        </div>

        <div className="absolute inset-y-0 left-2 sm:left-6 right-2 sm:right-6 z-20 flex items-center justify-between pointer-events-none">
          <button
            type="button"
            onClick={goToPrevious}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center pointer-events-auto"
            aria-label="Previous featured builder"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center pointer-events-auto"
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
