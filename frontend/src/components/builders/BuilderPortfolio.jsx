"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';

export default function BuilderPortfolio({ builder, properties = [] }) {
  const [selectedBhk, setSelectedBhk] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

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

  return (
    <section className="py-14 sm:py-18 lg:py-24 bg-neutral-50" id="portfolio">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 sm:mb-12 gap-6 sm:gap-8">
          <div>
            <h2 className="text-3xl! sm:text-4xl! font-extrabold text-zinc-900 mb-3 sm:mb-4 font-headline uppercase tracking-tight">Portfolio Showcase</h2>
            <p className="text-zinc-600 max-w-xl font-body text-sm sm:text-base">Explore our current residential masterpieces across the Mumbai Metropolitan Region.</p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 bg-white p-2 rounded-2xl shadow-sm border border-neutral-200">
            <select
              className="w-full sm:w-auto border-0 focus:ring-0 text-sm font-semibold text-zinc-600 bg-transparent font-label"
              value={selectedBhk}
              onChange={(event) => setSelectedBhk(event.target.value)}
            >
              <option value="all">Configuration (BHK)</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4plus">4 BHK+</option>
            </select>
            <div className="hidden sm:block w-px h-6 bg-zinc-200 self-center"></div>
            <select
              className="w-full sm:w-auto border-0 focus:ring-0 text-sm font-semibold text-zinc-600 bg-transparent font-label"
              value={selectedPriceRange}
              onChange={(event) => setSelectedPriceRange(event.target.value)}
            >
              <option value="all">Price Range</option>
              <option value="2to5">₹2 Cr - ₹5 Cr</option>
              <option value="5to10">₹5 Cr - ₹10 Cr</option>
              <option value="10plus">Above ₹10 Cr</option>
            </select>
            <div className="hidden sm:block w-px h-6 bg-zinc-200 self-center"></div>
            <select
              className="w-full sm:w-auto border-0 focus:ring-0 text-sm font-semibold text-zinc-600 bg-transparent font-label"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option value="all">Status</option>
              <option value="ready">Ready to Move</option>
              <option value="under">Under Construction</option>
              <option value="new">New Launch</option>
            </select>
            <button
              type="button"
              onClick={resetFilters}
              className="w-full sm:w-auto bg-zinc-900 text-white px-3 py-2 rounded-xl flex items-center justify-center text-xs font-bold uppercase tracking-wider"
            >
              Reset
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPortfolio.map((prop) => (
            <div key={prop.id || prop.slug} className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-neutral-100 flex flex-col">
              <div className="relative overflow-hidden h-60 sm:h-64 lg:h-72">
                <img 
                  src={prop.image} 
                  alt={prop.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                  {prop.status}
                </div>
              </div>
              <div className="p-5 sm:p-6 lg:p-8 flex flex-col grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 font-headline tracking-tight leading-tight">{prop.title}</h3>
                  <p className="text-primary font-bold text-base sm:text-lg font-body">{prop.price}</p>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 mb-5 sm:mb-6 text-sm font-body">
                  <span className="material-symbols-outlined text-sm">location_on</span> {prop.location}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="bg-neutral-50 p-3 sm:p-4 rounded-xl">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-label mb-1">Configurations</p>
                    <p className="font-bold text-zinc-800 text-xs font-body">{prop.type}</p>
                  </div>
                  <div className="bg-neutral-50 p-3 sm:p-4 rounded-xl">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-label mb-1">Availability</p>
                    <p className="font-bold text-zinc-800 text-xs font-body">{prop.availability}</p>
                  </div>
                </div>
                <Link 
                  href={`/property/${prop.slug || prop.id}`}
                  className="mt-auto w-full border-2 border-zinc-900 text-center text-zinc-900 py-3 rounded-xl font-bold hover:bg-zinc-900 hover:text-white transition-all text-xs sm:text-sm uppercase tracking-widest"
                >
                  View Property Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {portfolioItems.length === 0 && (
          <p className="text-center text-sm font-medium text-zinc-500 mt-12">
            Portfolio listings for this builder will be published soon.
          </p>
        )}

        {portfolioItems.length > 0 && filteredPortfolio.length === 0 && (
          <p className="text-center text-sm font-medium text-zinc-500 mt-12">
            No portfolio properties match the selected filters.
          </p>
        )}
      </div>
    </section>
  );
}
