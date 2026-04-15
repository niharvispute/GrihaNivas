'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function SectionCarousel({ items, renderItem, title, subtitle }) {
  const [scrollX, setScrollX] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const controls = useAnimation();

  useEffect(() => {
    const calculateMaxScroll = () => {
      if (containerRef.current && trackRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const trackWidth = trackRef.current.scrollWidth;
        setMaxScroll(Math.max(trackWidth - containerWidth + 40, 0)); // +40 for padding
      }
    };

    calculateMaxScroll();
    window.addEventListener('resize', calculateMaxScroll);
    return () => window.removeEventListener('resize', calculateMaxScroll);
  }, [items]);

  const handleScroll = (direction) => {
    const containerWidth = containerRef.current.offsetWidth;
    const step = containerWidth * 0.8;
    const newX = direction === 'left' 
      ? Math.min(scrollX + step, 0) 
      : Math.max(scrollX - step, -maxScroll);
    
    setScrollX(newX);
    controls.start({ x: newX, transition: { type: 'spring', stiffness: 300, damping: 30 } });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-8 mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-1 bg-primary rounded-full"></span>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Curated Selection</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4 italic">
            {title}
          </h2>
          <p className="text-base text-slate-500 font-bold leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mb-2">
          <button
            onClick={() => handleScroll('left')}
            disabled={scrollX >= 0}
            className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all shadow-xl hover:-translate-y-1 active:scale-95 ${
              scrollX >= 0 
                ? 'border-slate-100 text-slate-200 cursor-not-allowed' 
                : 'border-slate-100 bg-white text-slate-500 hover:border-primary hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">west</span>
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={scrollX <= -maxScroll}
            className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all shadow-xl hover:-translate-y-1 active:scale-95 ${
              scrollX <= -maxScroll 
                ? 'border-slate-100 text-slate-200 cursor-not-allowed' 
                : 'border-slate-900 bg-slate-900 text-white hover:bg-primary hover:border-primary'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">east</span>
          </button>
        </div>
      </div>

      <div className="relative px-8" ref={containerRef}>
        <motion.div
          ref={trackRef}
          drag="x"
          dragConstraints={{ left: -maxScroll, right: 0 }}
          animate={controls}
          style={{ x: scrollX }}
          onDragEnd={(_, info) => {
             setScrollX(info.point.x); // Simple tracking for button logic
          }}
          className="flex gap-6 md:gap-8 cursor-grab active:cursor-grabbing"
        >
          {items.map((item, idx) => (
            <div key={idx} className="min-w-[300px] md:min-w-[400px] lg:min-w-[450px] shrink-0 transform transition-transform duration-500 hover:translate-y-[-8px]">
              {renderItem(item)}
            </div>
          ))}
          {/* Peeking Spacer */}
          <div className="min-w-[100px] shrink-0" />
        </motion.div>
      </div>

      {/* Progress Bar Indicators */}
      <div className="max-w-screen-2xl mx-auto px-8 mt-12">
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden w-48 mx-auto md:mx-0">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(Math.abs(scrollX) / (maxScroll || 1)) * 100}%` }}
            className="h-full bg-primary"
          />
        </div>
      </div>
    </section>
  );
}
