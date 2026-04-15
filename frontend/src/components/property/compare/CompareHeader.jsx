'use client';

import Image from 'next/image';
import React from 'react';

const CompareHeader = ({ properties, onRemove }) => {
  return (
    <div className="sticky top-[80px] z-40 bg-white/95 backdrop-blur-md pb-6 pt-2 border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-4 gap-6 items-end">
        {/* Legend Column */}
        <div className="flex flex-col justify-end pb-4">
          <span className="text-xs font-black tracking-[0.2em] uppercase text-primary/60">
            Parameters
          </span>
        </div>

        {/* Property Columns */}
        {properties.map((property) => (
          <div key={property.id} className="relative group">
            <button 
              onClick={() => onRemove(property.id)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white text-primary rounded-full shadow-lg z-10 flex items-center justify-center hover:bg-primary hover:text-white transition-all scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100"
              title="Remove from comparison"
            >
              <span className="material-symbols-outlined text-sm font-bold">close</span>
            </button>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all duration-300 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-slate-200/50">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-200 relative">
                  {property.image ? (
                    <Image
                      alt={property.title}
                      src={property.image}
                      fill
                      sizes="80px"
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-xl">image_not_supported</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-primary font-black text-lg leading-tight truncate">
                    ₹ {property.price}
                  </span>
                  <h3 className="font-black text-sm text-slate-900 line-clamp-1 mt-1 leading-tight">
                    {property.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider truncate mt-1">
                    {property.location.split(',')[0]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty placeholder if less than 3 properties */}
        {Array.from({ length: 3 - properties.length }).map((_, idx) => (
          <div key={`empty-${idx}`} className="border-2 border-dashed border-slate-100 rounded-2xl h-28 flex flex-center items-center justify-center text-slate-300 font-medium">
            <span className="text-xs font-black uppercase tracking-widest">+ Add Property</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompareHeader;
