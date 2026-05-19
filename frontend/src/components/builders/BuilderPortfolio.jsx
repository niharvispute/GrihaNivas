"use client";

import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

function FilterDropdown({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const activeLabel = options.find((o) => o.value === value)?.label || label;
  const isFiltered = value !== 'all';

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full sm:w-auto flex items-center justify-between gap-3 pl-4 pr-3 py-2.5 rounded-2xl border text-xs font-black transition-all shadow-sm cursor-pointer select-none ${
          isFiltered
            ? 'border-primary/60 bg-primary/5 text-primary'
            : 'border-neutral-200 bg-white text-zinc-700 hover:border-primary/40'
        }`}
      >
        <span className="whitespace-nowrap">{activeLabel}</span>
        <span className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </span>
        {isFiltered && <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white" />}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 min-w-[180px] rounded-2xl border border-neutral-100 bg-white shadow-2xl shadow-slate-200/70 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs font-black transition-all flex items-center justify-between gap-3 ${
                value === opt.value
                  ? 'bg-primary/8 text-primary'
                  : 'text-zinc-600 hover:bg-slate-50 hover:text-zinc-900'
              }`}
            >
              {opt.label}
              {value === opt.value && (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BuilderPortfolio({ builder, properties = [] }) {
  const [selectedBhk, setSelectedBhk] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Carousel
  const [scrollX, setScrollX] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [stepSize, setStepSize] = useState(0);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const controls = useAnimation();

  const portfolioItems = useMemo(() => {
    if (Array.isArray(builder?.portfolio) && builder.portfolio.length > 0) {
      return builder.portfolio;
    }

    if (Array.isArray(properties) && properties.length > 0) {
      return properties;
    }

    return [];
  }, [builder?.portfolio, properties]);

  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const getPriceValue = (item) => {
    const rawPrice = toNumber(item?.raw?.price ?? item?.priceValue ?? item?.price);
    if (rawPrice && rawPrice > 0) return rawPrice;

    const label = String(item?.price || '').toLowerCase();
    if (!label.trim()) return null;

    const numeric = Number(label.replace(/[^\d.]/g, ''));
    if (!Number.isFinite(numeric) || numeric <= 0) return null;

    if (label.includes('cr')) return numeric * 10000000;
    if (label.includes('lakh') || label.includes('lac')) return numeric * 100000;
    return numeric;
  };

  const matchesBhk = (item) => {
    if (selectedBhk === 'all') return true;

    const bhkValue = Number.parseInt(String(item?.type || ''), 10);
    if (!Number.isFinite(bhkValue)) return false;

    if (selectedBhk === '2') return bhkValue === 2;
    if (selectedBhk === '3') return bhkValue === 3;
    if (selectedBhk === '4plus') return bhkValue >= 4;
    return true;
  };

  const matchesPrice = (item) => {
    if (selectedPriceRange === 'all') return true;

    const price = getPriceValue(item);
    if (!price) return false;

    if (selectedPriceRange === '2to5') return price >= 20000000 && price <= 50000000;
    if (selectedPriceRange === '5to10') return price > 50000000 && price <= 100000000;
    if (selectedPriceRange === '10plus') return price > 100000000;
    return true;
  };

  const matchesStatus = (item) => {
    if (selectedStatus === 'all') return true;

    const status = String(item?.status || '').toLowerCase();
    if (selectedStatus === 'ready') return status.includes('ready');
    if (selectedStatus === 'under') return status.includes('under');
    if (selectedStatus === 'new') return status.includes('new');
    return true;
  };

  const filteredPortfolio = useMemo(
    () => portfolioItems.filter((item) => matchesBhk(item) && matchesPrice(item) && matchesStatus(item)),
    [portfolioItems, selectedBhk, selectedPriceRange, selectedStatus]
  );

  const resetFilters = () => {
    setSelectedBhk('all');
    setSelectedPriceRange('all');
    setSelectedStatus('all');
  };

  useEffect(() => {
    const calc = () => {
      if (!containerRef.current || !trackRef.current) return;
      const cw = containerRef.current.offsetWidth;
      const tw = trackRef.current.scrollWidth;
      setMaxScroll(Math.max(tw - cw, 0));
      const children = Array.from(trackRef.current.children || []);
      if (children.length >= 2) {
        setStepSize(children[1].offsetLeft - children[0].offsetLeft);
      } else if (children.length === 1) {
        setStepSize(children[0].getBoundingClientRect().width);
      }
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [filteredPortfolio]);

  // Reset carousel position when filters change
  useEffect(() => {
    setScrollX(0);
    controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
  }, [selectedBhk, selectedPriceRange, selectedStatus, controls]);

  const handleScroll = (dir) => {
    const step = stepSize > 0 ? stepSize : 320;
    const newX = dir === 'left'
      ? Math.min(scrollX + step, 0)
      : Math.max(scrollX - step, -maxScroll);
    setScrollX(newX);
    controls.start({ x: newX, transition: { type: 'spring', stiffness: 300, damping: 30 } });
  };

  return (
    <section className="py-14 sm:py-18 lg:py-24 bg-neutral-50" id="portfolio">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 sm:mb-12 gap-6 sm:gap-8">
          <div>
            <h2 className="text-3xl! sm:text-4xl! font-extrabold text-zinc-900 mb-3 sm:mb-4 font-headline uppercase tracking-tight">Portfolio Showcase</h2>
            <p className="text-zinc-600 max-w-xl font-body text-sm sm:text-base">Explore our current residential masterpieces across the Mumbai Metropolitan Region.</p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3">
            <FilterDropdown
              label="Configuration"
              value={selectedBhk}
              onChange={setSelectedBhk}
              options={[
                { value: 'all', label: 'Configuration' },
                { value: '2', label: '2 BHK' },
                { value: '3', label: '3 BHK' },
                { value: '4plus', label: '4 BHK+' },
              ]}
            />
            <FilterDropdown
              label="Price Range"
              value={selectedPriceRange}
              onChange={setSelectedPriceRange}
              options={[
                { value: 'all', label: 'Price Range' },
                { value: '2to5', label: '₹2 Cr – ₹5 Cr' },
                { value: '5to10', label: '₹5 Cr – ₹10 Cr' },
                { value: '10plus', label: 'Above ₹10 Cr' },
              ]}
            />
            <FilterDropdown
              label="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={[
                { value: 'all', label: 'Status' },
                { value: 'ready', label: 'Ready to Move' },
                { value: 'under', label: 'Under Construction' },
                { value: 'new', label: 'New Launch' },
              ]}
            />
            <button
              type="button"
              onClick={resetFilters}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-primary text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Reset
            </button>
          </div>
        </div>
        
        <div className="relative group/carousel">
          {/* Left button */}
          <button
            onClick={() => handleScroll('left')}
            disabled={scrollX >= 0}
            aria-label="Previous"
            className={`absolute -left-2 md:-left-6 top-[40%] -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-xl backdrop-blur-sm ${
              scrollX >= 0
                ? 'opacity-0 pointer-events-none'
                : 'border-white bg-white/90 text-slate-700 hover:border-primary hover:text-primary md:opacity-0 md:group-hover/carousel:opacity-100'
            }`}
          >
            <span className="material-symbols-outlined text-xl">west</span>
          </button>

          {/* Right button */}
          <button
            onClick={() => handleScroll('right')}
            disabled={scrollX <= -maxScroll}
            aria-label="Next"
            className={`absolute -right-2 md:-right-6 top-[40%] -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-xl ${
              scrollX <= -maxScroll
                ? 'opacity-0 pointer-events-none'
                : 'border-primary bg-primary text-white hover:bg-primary/90 md:opacity-0 md:group-hover/carousel:opacity-100'
            }`}
          >
            <span className="material-symbols-outlined text-xl">east</span>
          </button>

          <div className="overflow-hidden" ref={containerRef}>
            <motion.div
              ref={trackRef}
              drag="x"
              dragConstraints={{ left: -maxScroll, right: 0 }}
              animate={controls}
              style={{ x: scrollX }}
              onDragEnd={(_, info) => {
                const proposed = scrollX + info.offset.x;
                const clamped = Math.min(0, Math.max(proposed, -maxScroll));
                setScrollX(clamped);
                controls.start({ x: clamped, transition: { type: 'spring', stiffness: 300, damping: 30 } });
              }}
              className="flex gap-4 sm:gap-6 cursor-grab active:cursor-grabbing"
            >
              {filteredPortfolio.map((prop) => (
                <div key={prop.id || prop.slug} className="shrink-0 w-[260px] sm:w-[300px] md:w-[320px] group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-neutral-100 flex flex-col">
                  <div className="relative overflow-hidden h-44 sm:h-52">
                    <Image
                      src={prop.image}
                      alt={prop.title}
                      fill
                      sizes="320px"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-primary text-white text-[8px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-tighter">
                      {prop.status}
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 flex flex-col grow">
                    <h3 className="text-sm font-black text-zinc-900 font-headline tracking-tighter leading-tight truncate uppercase mb-0.5">{prop.title}</h3>
                    <p className="text-primary font-black text-xs font-body mb-2">{prop.price}</p>
                    <div className="flex items-center gap-1 text-zinc-400 mb-3 text-[10px] font-bold truncate">
                      <span className="material-symbols-outlined text-xs">location_on</span> {prop.location}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-neutral-50 p-2.5 rounded-xl">
                        <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-0.5">Config</p>
                        <p className="font-black text-zinc-800 text-[10px] leading-none">{prop.type}</p>
                      </div>
                      <div className="bg-neutral-50 p-2.5 rounded-xl">
                        <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-0.5">Ready</p>
                        <p className="font-black text-zinc-800 text-[10px] leading-none">{prop.availability}</p>
                      </div>
                    </div>
                    <Link
                      href={`/property/${prop.slug || prop.id}`}
                      className="mt-auto w-full border-2 border-zinc-900 text-center text-zinc-900 py-2 rounded-xl font-black hover:bg-zinc-900 hover:text-white transition-all text-[9px] uppercase tracking-[0.1em]"
                    >
                      View Detail
                    </Link>
                  </div>
                </div>
              ))}
              <div className="w-2 shrink-0" aria-hidden="true" />
            </motion.div>
          </div>

          {/* Progress bar */}
          {maxScroll > 0 && (
            <div className="mt-6 flex justify-center md:justify-start">
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden w-32 md:w-40">
                <motion.div
                  animate={{ width: `${(Math.abs(scrollX) / (maxScroll || 1)) * 100}%` }}
                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        {portfolioItems.length === 0 && (
          <p className="text-center text-sm font-bold text-zinc-500 mt-12">
            Portfolio listings for this builder will be published soon.
          </p>
        )}

        {portfolioItems.length > 0 && filteredPortfolio.length === 0 && (
          <p className="text-center text-sm font-bold text-zinc-500 mt-12">
            No portfolio properties match the selected filters.
          </p>
        )}
      </div>
    </section>
  );
}
