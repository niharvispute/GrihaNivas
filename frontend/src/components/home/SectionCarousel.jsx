'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function SectionCarousel({
  items,
  renderItem,
  title,
  subtitle,
  eyebrow = 'Curated Selection',
  emptyMessage = 'Nothing listed yet — check back soon.',
  itemClassName = 'min-w-[300px] md:min-w-[400px] lg:min-w-[450px]',
  sectionClassName = 'bg-white',
  autoplay = true,
  autoplayInterval = 3500,
}) {
  const [scrollX, setScrollX] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [stepSize, setStepSize] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const controls = useAnimation();
  const scrollXRef = useRef(0);
  const maxScrollRef = useRef(0);
  const stepSizeRef = useRef(0);

  // Keep refs in sync so autoplay interval always has current values
  useEffect(() => { scrollXRef.current = scrollX; }, [scrollX]);
  useEffect(() => { maxScrollRef.current = maxScroll; }, [maxScroll]);
  useEffect(() => { stepSizeRef.current = stepSize; }, [stepSize]);

  useEffect(() => {
    const calculateLayoutMetrics = () => {
      if (containerRef.current && trackRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const trackWidth = trackRef.current.scrollWidth;
        setMaxScroll(Math.max(trackWidth - containerWidth, 0));

        const trackChildren = Array.from(trackRef.current.children || []);
        if (trackChildren.length >= 2) {
          const firstLeft = trackChildren[0].offsetLeft;
          const secondLeft = trackChildren[1].offsetLeft;
          setStepSize(Math.max(secondLeft - firstLeft, 0));
        } else if (trackChildren.length === 1) {
          setStepSize(trackChildren[0].getBoundingClientRect().width);
        } else {
          setStepSize(0);
        }
      }
    };

    calculateLayoutMetrics();
    window.addEventListener('resize', calculateLayoutMetrics);
    return () => window.removeEventListener('resize', calculateLayoutMetrics);
  }, [items]);

  // Autoplay
  useEffect(() => {
    if (!autoplay || isPaused) return;
    const id = setInterval(() => {
      const step = stepSizeRef.current > 0 ? stepSizeRef.current : 320;
      const max = maxScrollRef.current;
      if (max <= 0) return;
      const current = scrollXRef.current;

      // If already at (or past) last card, loop to start. Otherwise advance one step.
      const newX = current <= -(max - step * 0.5) ? 0 : Math.max(current - step, -max);
      scrollXRef.current = newX;
      setScrollX(newX);
      controls.start({ x: newX, transition: { type: 'spring', stiffness: 260, damping: 28 } });
    }, autoplayInterval);
    return () => clearInterval(id);
  }, [autoplay, autoplayInterval, isPaused, controls]);

  const handleScroll = (direction) => {
    const step = stepSize > 0 ? stepSize : 320;
    const newX = direction === 'left'
      ? Math.min(scrollX + step, 0)
      : Math.max(scrollX - step, -maxScroll);

    setScrollX(newX);
    controls.start({ x: newX, transition: { type: 'spring', stiffness: 300, damping: 30 } });
  };

  const isEmpty = !items || items.length === 0;
  // Desktop (md+): use static grid for ≤3 items. Mobile: always carousel.
  const useStaticGridOnDesktop = !isEmpty && items.length <= 3;

  const carouselTrack = (
    <div
      className="relative overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0"
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        ref={trackRef}
        drag="x"
        dragConstraints={{ left: -maxScroll, right: 0 }}
        animate={controls}
        style={{ x: scrollX }}
        onDragStart={() => setIsPaused(true)}
        onDragEnd={(_, info) => {
          const proposedX = scrollX + info.offset.x;
          const clampedX = Math.min(0, Math.max(proposedX, -maxScroll));
          setScrollX(clampedX);
          controls.start({ x: clampedX, transition: { type: 'spring', stiffness: 300, damping: 30 } });
          setIsPaused(false);
        }}
        className="flex gap-5 sm:gap-6 md:gap-7 cursor-grab active:cursor-grabbing"
      >
        {items.map((item, idx) => (
          <div key={idx} className={`${itemClassName} shrink-0 transition-all duration-300 hover:shadow-xl`}>
            {renderItem(item)}
          </div>
        ))}
        <div className="w-2 sm:w-4 shrink-0" aria-hidden="true" />
      </motion.div>
    </div>
  );

  return (
    <section className={`py-6 md:py-10 lg:py-14 ${sectionClassName}`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 mb-5 md:mb-7 lg:mb-10 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-5 md:gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <span className="w-10 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full"></span>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80 ">{eyebrow}</p>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2 md:mb-3 ">
              {title}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 font-bold leading-relaxed max-w-lg ">
              {subtitle}
            </p>
          </div>

          {/* Header nav buttons — visible only for desktop carousel (>3 items) */}
          <div className={`flex gap-3 self-start md:self-auto ${isEmpty || useStaticGridOnDesktop ? 'invisible' : ''}`}>
            <button
              onClick={() => handleScroll('left')}
              disabled={scrollX >= 0}
              aria-label="Previous"
              className={`w-9 h-9 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                scrollX >= 0
                  ? 'border-slate-100 text-slate-200 cursor-not-allowed bg-slate-50/50'
                  : 'border-primary/10 bg-white text-slate-700 hover:border-primary hover:text-primary hover:shadow-lg'
              }`}
            >
              <span className="material-symbols-outlined text-base md:text-2xl">west</span>
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={scrollX <= -maxScroll}
              aria-label="Next"
              className={`w-9 h-9 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                scrollX <= -maxScroll
                  ? 'border-slate-100 text-slate-200 cursor-not-allowed bg-slate-50/50'
                  : 'border-primary bg-primary text-white hover:bg-primary/90 hover:shadow-lg'
              }`}
            >
              <span className="material-symbols-outlined text-base md:text-2xl">east</span>
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-16 md:py-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">inventory_2</span>
            <p className="text-slate-500 font-bold text-sm md:text-base">{emptyMessage}</p>
          </div>
        </div>
      ) : useStaticGridOnDesktop ? (
        <>
          {/* Mobile: always carousel */}
          <div className="md:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {carouselTrack}
          </div>

          {/* Desktop: static grid for ≤3 items */}
          <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`grid gap-5 sm:gap-6 md:gap-7 mx-auto ${
                items.length === 1
                  ? 'max-w-2xl'
                  : items.length === 2
                    ? 'max-w-4xl md:grid-cols-2'
                    : 'max-w-7xl md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {items.map((item, idx) => (
                <div key={idx} className="min-w-0">
                  {renderItem(item)}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Carousel Container (mobile + desktop for >3 items) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative group/carousel">
            {/* Left overlay button */}
            <button
              onClick={() => handleScroll('left')}
              disabled={scrollX >= 0}
              aria-label="Previous"
              className={`absolute -left-2 md:-left-7 top-[40%] -translate-y-1/2 z-30 w-10 h-10 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-xl backdrop-blur-sm ${
                scrollX >= 0
                  ? 'opacity-0 pointer-events-none'
                  : 'border-white bg-white/90 text-slate-700 hover:border-primary hover:text-primary md:opacity-0 md:group-hover/carousel:opacity-100'
              }`}
            >
              <span className="material-symbols-outlined text-base md:text-2xl">west</span>
            </button>

            {/* Right overlay button */}
            <button
              onClick={() => handleScroll('right')}
              disabled={scrollX <= -maxScroll}
              aria-label="Next"
              className={`absolute -right-2 md:-right-7 top-[40%] -translate-y-1/2 z-30 w-10 h-10 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-xl ${
                scrollX <= -maxScroll
                  ? 'opacity-0 pointer-events-none'
                  : 'border-primary bg-primary text-white hover:bg-primary/90 md:opacity-0 md:group-hover/carousel:opacity-100'
              }`}
            >
              <span className="material-symbols-outlined text-base md:text-2xl">east</span>
            </button>

            {carouselTrack}
          </div>

          {/* Progress Indicator */}
          {maxScroll > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 md:mt-7 lg:mt-10">
              <div className="flex justify-center md:justify-start">
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden w-32 md:w-40">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(Math.abs(scrollX) / (maxScroll || 1)) * 100}%` }}
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
