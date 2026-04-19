'use client';

import { useState, useEffect } from 'react';

const MIN_BUDGET = 10000000; // 1 Cr
const MAX_BUDGET = 50000000; // 5 Cr
const MIN_GAP = 0; // No minimum gap, allow free movement

function formatPriceToCr(price) {
  if (!price) return '';
  return `₹${(Number(price) / 10000000).toFixed(1)} Cr`;
}

export default function BudgetRangeSlider({ minValue = MIN_BUDGET, maxValue = MAX_BUDGET, onChange }) {
  const [min, setMin] = useState(minValue);
  const [max, setMax] = useState(maxValue);

  useEffect(() => {
    setMin(minValue);
    setMax(maxValue);
  }, [minValue, maxValue]);

  const handleMinChange = (e) => {
    const newMin = Number(e.target.value);
    if (newMin <= max - MIN_GAP) {
      setMin(newMin);
      onChange?.({ min: newMin, max });
    }
  };

  const handleMaxChange = (e) => {
    const newMax = Number(e.target.value);
    if (newMax >= min + MIN_GAP) {
      setMax(newMax);
      onChange?.({ min, max: newMax });
    }
  };

  const minPercent = ((min - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;
  const maxPercent = ((max - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <label className="font-bold flex items-center gap-2 text-slate-700 text-xs uppercase tracking-wide mb-2">
          <span className="material-symbols-outlined text-primary text-xl">payments</span>
          Budget Range
        </label>
        <p className="text-[10px] text-slate-400 font-medium">Adjust your min and max budget</p>
      </div>

      {/* Min Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-600">Min Budget</span>
          <div className="text-primary font-black text-xs bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
            {formatPriceToCr(min)}
          </div>
        </div>
        <div className="relative pt-2 pb-2">
          <div className="absolute top-3 left-0 right-0 h-2 bg-slate-100 rounded-full pointer-events-none" />
          <div
            className="absolute top-3 h-2 bg-primary rounded-full pointer-events-none"
            style={{
              left: '0',
              right: `${100 - minPercent}%`,
            }}
          />
          <input
            type="range"
            min={MIN_BUDGET}
            max={MAX_BUDGET}
            step="1"
            value={min}
            onChange={handleMinChange}
            className="relative w-full h-2 appearance-none bg-transparent cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:border-3
              [&::-webkit-slider-thumb]:border-primary
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:cursor-grab
              [&::-webkit-slider-thumb]:active:cursor-grabbing
              [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-3
              [&::-moz-range-thumb]:border-primary
              [&::-moz-range-thumb]:shadow-lg
              [&::-moz-range-thumb]:cursor-grab
              [&::-moz-range-thumb]:active:cursor-grabbing"
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
          <span>₹1 Cr</span>
          <span>₹5 Cr</span>
        </div>
      </div>

      {/* Max Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-600">Max Budget</span>
          <div className="text-primary font-black text-xs bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
            {formatPriceToCr(max)}
          </div>
        </div>
        <div className="relative pt-2 pb-2">
          <div className="absolute top-3 left-0 right-0 h-2 bg-slate-100 rounded-full pointer-events-none" />
          <div
            className="absolute top-3 h-2 bg-primary rounded-full pointer-events-none"
            style={{
              left: `${minPercent}%`,
              right: '0',
            }}
          />
          <input
            type="range"
            min={MIN_BUDGET}
            max={MAX_BUDGET}
            step="1"
            value={max}
            onChange={handleMaxChange}
            className="relative w-full h-2 appearance-none bg-transparent cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:border-3
              [&::-webkit-slider-thumb]:border-primary
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:cursor-grab
              [&::-webkit-slider-thumb]:active:cursor-grabbing
              [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-3
              [&::-moz-range-thumb]:border-primary
              [&::-moz-range-thumb]:shadow-lg
              [&::-moz-range-thumb]:cursor-grab
              [&::-moz-range-thumb]:active:cursor-grabbing"
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
          <span>₹1 Cr</span>
          <span>₹5 Cr</span>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <div className="flex justify-between items-center gap-4">
          <div className="text-center flex-1">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">From</p>
            <p className="text-sm font-black text-primary">{formatPriceToCr(min)}</p>
          </div>
          <div className="text-slate-300">→</div>
          <div className="text-center flex-1">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">To</p>
            <p className="text-sm font-black text-primary">{formatPriceToCr(max)}</p>
          </div>
        </div>
      </div>

      {/* Hidden inputs for form submission */}
      <input type="hidden" name="minPrice" value={min} />
      <input type="hidden" name="maxPrice" value={max} />
    </div>
  );
}
