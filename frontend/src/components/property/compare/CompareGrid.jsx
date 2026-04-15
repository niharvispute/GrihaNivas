'use client';

import React from 'react';
import Link from 'next/link';

const getHighlightValue = (property, label, fallback = 'N/A') => {
  const highlights = Array.isArray(property?.highlights) ? property.highlights : [];
  const match = highlights.find((item) => item?.label === label);
  return match?.value || fallback;
};

const getAmenities = (property) =>
  Array.isArray(property?.amenities) ? property.amenities : [];

const getBuilderName = (property) => property?.builder?.name || 'Builder details pending';

const getPropertyHref = (property) => {
  const key = property?.slug || property?.id;
  return key ? `/property/${key}` : '/buy';
};

const CompareGrid = ({ properties }) => {
  const parameters = [
    { label: 'Price', key: 'price', format: (v) => `₹ ${v}`, isPrice: true },
    { label: 'Location', key: 'location', isHighlighted: true },
    { label: 'BHK', key: 'bhk', format: (v) => `${v} BHK` },
    { label: 'Super Area', key: 'area', format: (v) => `${v} sq.ft`, isHighlighted: true },
    { 
      label: 'Possession', 
      getValue: (p) => getHighlightValue(p, 'Possession', 'Ready to Move'),
      isPrice: (v) => v !== 'Ready to Move' 
    },
    { 
      label: 'Furnishing', 
      getValue: (p) => getHighlightValue(p, 'Furnishing'),
      isHighlighted: true 
    },
    { 
      label: 'Amenities', 
      getValue: (p) => (
        <div className="flex gap-2 flex-wrap max-w-xs">
          {getAmenities(p).slice(0, 3).map((a, i) => (
            <span key={i} className="px-2 py-1 bg-slate-100 rounded-sm text-[9px] font-black tracking-widest uppercase text-slate-500">
              {a?.label || 'Amenity'}
            </span>
          ))}
          {getAmenities(p).length > 3 && (
            <span className="text-[9px] font-black text-slate-400 mt-1">+{getAmenities(p).length - 3} More</span>
          )}
          {getAmenities(p).length === 0 && (
            <span className="text-[10px] font-semibold text-slate-400">No amenities listed</span>
          )}
        </div>
      )
    },
    { 
      label: 'RERA Status', 
      getValue: (p) => (
        <span className="material-symbols-outlined text-green-500 scale-125" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      )
    },
    { 
      label: 'Builder', 
      getValue: (p) => getBuilderName(p),
      isBold: true
    }
  ];

  return (
    <div className="mt-8 space-y-px overflow-hidden rounded-4xl border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]">
      {parameters.map((param, idx) => (
        <div 
          key={param.label} 
          className={`grid grid-cols-4 items-center transition-colors ${
            param.isHighlighted ? 'bg-primary/5 hover:bg-primary/10' : 'bg-white hover:bg-slate-50'
          }`}
        >
          {/* Label Column */}
          <div className="px-8 py-6 font-black text-xs uppercase tracking-widest text-slate-400 border-r border-slate-50 h-full flex items-center">
            {param.label}
          </div>

          {/* Value Columns */}
          {properties.map((property) => {
            const value = param.getValue ? param.getValue(property) : property[param.key];
            const formattedValue = param.format ? param.format(value) : value;
            const isPriceValue =
              typeof param.isPrice === 'function' ? param.isPrice(value, property) : Boolean(param.isPrice);
            const isReactNode = React.isValidElement(formattedValue);
            const displayValue =
              isReactNode || (formattedValue !== undefined && formattedValue !== null && String(formattedValue).trim() !== '')
                ? formattedValue
                : 'N/A';
            
            return (
              <div 
                key={property.id} 
                className={`px-8 py-6 text-sm font-bold ${
                  isPriceValue ? 'text-primary text-xl' : 'text-slate-800'
                } ${param.isBold ? 'font-black' : ''}`}
              >
                {displayValue}
              </div>
            );
          })}

          {/* Empty columns for alignment */}
          {Array.from({ length: 3 - properties.length }).map((_, i) => (
            <div key={`empty-cell-${i}`} className="px-8 py-6" />
          ))}
        </div>
      ))}

      {/* Action Row */}
      <div className="grid grid-cols-4 items-center bg-white pt-8 pb-12">
        <div className="px-8 py-6" />
        {properties.map((property) => (
          <div key={`actions-${property.id}`} className="px-8 flex flex-col gap-3">
            <button className="w-full py-4 bg-primary text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 leading-none">
              Contact Builder
            </button>
            <Link
              href={getPropertyHref(property)}
              className="w-full py-4 bg-white text-primary border-2 border-primary/10 rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary/5 transition-all leading-none text-center"
            >
              View Details
            </Link>
          </div>
        ))}
        {Array.from({ length: 3 - properties.length }).map((_, i) => (
          <div key={`empty-actions-${i}`} className="px-8" />
        ))}
      </div>
    </div>
  );
};

export default CompareGrid;
