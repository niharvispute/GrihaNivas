'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function SectionCarousel({
  items,
  renderItem,
  title,
  subtitle,
  emptyMessage = 'Nothing listed yet — check back soon.',
  itemClassName = 'min-w-[300px] md:min-w-[400px] lg:min-w-[450px]',
  sectionClassName = 'bg-white',
}) {
  const [scrollX, setScrollX] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [stepSize, setStepSize] = useState(0);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const controls = useAnimation();

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

  const handleScroll = (direction) => {
    const step = stepSize > 0 ? stepSize : 320;
    const newX = direction === 'left'
      ? Math.min(scrollX + step, 0)
      : Math.max(scrollX - step, -maxScroll);

    setScrollX(newX);
    controls.start({ x: newX, transition: { type: 'spring', stiffness: 300, damping: 30 } });
  };

  const isEmpty = !items || items.length === 0;
  const useStaticGrid = !isEmpty && items.length <= 3;

  return (
    <section className={`py-6 md:py-10 lg:py-14 ${sectionClassName}`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 mb-5 md:mb-7 lg:mb-10 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-5 md:gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <span className="w-10 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full"></span>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80 ">Curated Selection</p>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2 md:mb-3 ">
              {title}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 font-bold leading-relaxed max-w-lg ">
              {subtitle}
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className={`flex gap-3 self-start md:self-auto ${isEmpty || useStaticGrid ? 'invisible' : ''}`}>
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
      ) : useStaticGrid ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`grid gap-5 sm:gap-6 md:gap-7 mx-auto ${
              items.length === 1
                ? 'max-w-sm'
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
      ) : (
        <>
          {/* Carousel Container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative group/carousel">
            {/* Left Button */}
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

            {/* Right Button */}
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

            <div className="relative overflow-hidden" ref={containerRef}>
              <motion.div
                ref={trackRef}
                drag="x"
                dragConstraints={{ left: -maxScroll, right: 0 }}
                animate={controls}
                style={{ x: scrollX }}
                onDragEnd={(_, info) => {
                  const proposedX = scrollX + info.offset.x;
                  const clampedX = Math.min(0, Math.max(proposedX, -maxScroll));
                  setScrollX(clampedX);
                  controls.start({ x: clampedX, transition: { type: 'spring', stiffness: 300, damping: 30 } });
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
