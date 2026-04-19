'use client';

import Image from 'next/image';
import React from 'react';

const CompareHeader = ({ properties, onRemove }) => {
  return (
    <div className="sticky top-[73px] md:top-[80px] z-30 bg-white/95 backdrop-blur-md pb-4 pt-2 border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto px-1 md:px-8 grid grid-cols-4 gap-2 md:gap-6 items-end">
        {/* Legend Column */}
        <div className="flex flex-col justify-end pb-3 md:pb-4 px-1 md:px-0">
          <span className="text-[8px] md:text-xs font-black tracking-[0.1em] md:tracking-[0.2em] uppercase text-primary/60">
            Compare
          </span>
        </div>

        {/* Property Columns */}
        {properties.map((property) => (
          <div key={property.id} className="relative group">
            <button 
              onClick={() => onRemove(property.id)}
              className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-white text-primary rounded-full shadow-lg z-10 flex items-center justify-center hover:bg-primary hover:text-white transition-all scale-75 md:scale-90 group-hover:scale-100 opacity-100 md:opacity-0 group-hover:opacity-100"
              title="Remove from comparison"
            >
              <span className="material-symbols-outlined text-[12px] md:text-sm font-bold">close</span>
            </button>
            <div className="bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl p-2 md:p-4 transition-all duration-300 group-hover:bg-white group-hover:shadow-xl">
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center md:items-start text-center md:text-left">
                <div className="flex-shrink-0 w-10 h-10 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden bg-slate-200 relative">
                  {property.image ? (
                    <Image
                      alt={property.title}
                      src={property.image}
                      fill
                      sizes="(max-width: 768px) 40px, 80px"
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-xs md:text-xl">image_not_supported</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center min-w-0 w-full">
                  <span className="text-primary font-black text-[10px] md:text-lg leading-tight truncate">
                    ₹{property.price}
                  </span>
                  <h3 className="font-black text-[9px] md:text-sm text-slate-900 line-clamp-1 mt-0.5 leading-tight">
                    {property.title}
                  </h3>
                  <p className="text-[8px] md:text-xs text-slate-500 font-bold uppercase tracking-wider truncate mt-0.5">
                    {property.location.split(',')[0]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty placeholder */}
        {Array.from({ length: 3 - properties.length }).map((_, idx) => (
          <div key={`empty-${idx}`} className="border-2 border-dashed border-slate-100 rounded-xl md:rounded-2xl h-16 md:h-28 flex items-center justify-center text-slate-300 px-2 text-center">
            <span className="text-[8px] md:text-xs font-black uppercase tracking-widest">+ Add</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompareHeader;
