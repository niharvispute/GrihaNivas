'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function SectionCarousel({
  items,
  renderItem,
  title,
  subtitle,
  itemClassName = 'min-w-[300px] md:min-w-[400px] lg:min-w-[450px]',
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

  if (!items || items.length === 0) return null;

  return (
    <section className="py-16 md:py-20 lg:py-28 bg-gradient-to-b from-white via-slate-50/30 to-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 mb-12 md:mb-16 lg:mb-20 max-w-screen-2xl">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 md:gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4 md:mb-5">
              <span className="w-12 h-1.5 bg-gradient-to-r from-primary to-primary/60 rounded-full"></span>
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/80">Curated Selection</p>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4 md:mb-5">
              {title}
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-semibold leading-relaxed max-w-xl">
              {subtitle}
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 md:gap-4 self-start md:self-auto">
            <button
              onClick={() => handleScroll('left')}
              disabled={scrollX >= 0}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                scrollX >= 0
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                  : 'border-primary/20 bg-white text-slate-700 hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-primary/20'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">west</span>
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={scrollX <= -maxScroll}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                scrollX <= -maxScroll
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                  : 'border-primary bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">east</span>
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Container - Full Width with overflow control */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
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
        <div className="mx-auto px-4 sm:px-6 lg:px-8 mt-10 md:mt-12 lg:mt-14 max-w-screen-2xl">
          <div className="flex justify-center md:justify-start">
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden w-32 md:w-40">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(Math.abs(scrollX) / (maxScroll || 1)) * 100}%` }}
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
