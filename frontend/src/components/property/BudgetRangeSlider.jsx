'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';

const MIN_BUDGET = 10000000; // 1 Cr
const MAX_BUDGET = 50000000; // 5 Cr
const STEP = 500000; // 5 Lacs step

function formatPriceToCr(price) {
  if (!price) return '';
  return `₹${(Number(price) / 10000000).toFixed(1)} Cr`;
}

export default function BudgetRangeSlider({ minValue = MIN_BUDGET, maxValue = MAX_BUDGET, onChange }) {
  const { addToast } = useToast();
  const [min, setMin] = useState(minValue);
  const [max, setMax] = useState(maxValue);

  useEffect(() => {
    setMin(minValue);
    setMax(maxValue);
  }, [minValue, maxValue]);

  const handleMinChange = (e) => {
    const newMin = Number(e.target.value);
    if (newMin <= max) {
      setMin(newMin);
      onChange?.({ min: newMin, max });
    }
  };

  const handleMaxChange = (e) => {
    const newMax = Number(e.target.value);
    if (newMax >= min) {
      setMax(newMax);
      onChange?.({ min, max: newMax });
    }
  };

  const minPercent = ((min - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;
  const maxPercent = ((max - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;

  const validateOnSubmit = (e) => {
    if (min > max) {
      e.preventDefault();
      addToast('Minimum budget should not exceed maximum budget', 'error');
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <label className="font-bold flex items-center gap-2 text-slate-700 text-xs uppercase tracking-wide mb-2">
          <span className="material-symbols-outlined text-primary text-xl">payments</span>
          Budget Range
        </label>
        <p className="text-[10px] text-slate-400 font-bold">Drag sliders to set your budget range</p>
      </div>

      {/* Sliders Container */}
      <div className="space-y-8">
        {/* Min Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center gap-3">
            <label className="text-xs font-bold text-slate-700">Min Budget</label>
            <div className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-black min-w-fit">
              {formatPriceToCr(min)}
            </div>
          </div>

          <div className="relative h-8 flex items-center">
            {/* Background Track */}
            <div className="absolute w-full h-2 bg-slate-200 rounded-full pointer-events-none" />
            {/* Filled Track */}
            <div
              className="absolute h-2 bg-primary rounded-full pointer-events-none"
              style={{
                left: 0,
                right: `${100 - minPercent}%`,
              }}
            />
            {/* Input Slider */}
            <input
              type="range"
              min={MIN_BUDGET}
              max={MAX_BUDGET}
              step={STEP}
              value={min}
              onChange={handleMinChange}
              className="relative w-full h-2 appearance-none bg-transparent cursor-grab active:cursor-grabbing z-50
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-4
                [&::-webkit-slider-thumb]:border-primary
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:cursor-grab
                [&::-webkit-slider-thumb]:active:cursor-grabbing
                [&::-webkit-slider-thumb]:active:scale-125
                [&::-webkit-slider-thumb]:transition-transform
                [&::-moz-range-thumb]:appearance-none
                [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:h-6
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-4
                [&::-moz-range-thumb]:border-primary
                [&::-moz-range-thumb]:shadow-md
                [&::-moz-range-thumb]:cursor-grab
                [&::-moz-range-thumb]:active:cursor-grabbing"
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-bold">
            <span>₹1 Cr</span>
            <span>₹5 Cr</span>
          </div>
        </div>

        {/* Max Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center gap-3">
            <label className="text-xs font-bold text-slate-700">Max Budget</label>
            <div className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-black min-w-fit">
              {formatPriceToCr(max)}
            </div>
          </div>

          <div className="relative h-8 flex items-center">
            {/* Background Track */}
            <div className="absolute w-full h-2 bg-slate-200 rounded-full pointer-events-none" />
            {/* Filled Track */}
            <div
              className="absolute h-2 bg-primary rounded-full pointer-events-none"
              style={{
                left: `${minPercent}%`,
                right: 0,
              }}
            />
            {/* Input Slider */}
            <input
              type="range"
              min={MIN_BUDGET}
              max={MAX_BUDGET}
              step={STEP}
              value={max}
              onChange={handleMaxChange}
              className="relative w-full h-2 appearance-none bg-transparent cursor-grab active:cursor-grabbing z-50
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-4
                [&::-webkit-slider-thumb]:border-primary
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:cursor-grab
                [&::-webkit-slider-thumb]:active:cursor-grabbing
                [&::-webkit-slider-thumb]:active:scale-125
                [&::-webkit-slider-thumb]:transition-transform
                [&::-moz-range-thumb]:appearance-none
                [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:h-6
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-4
                [&::-moz-range-thumb]:border-primary
                [&::-moz-range-thumb]:shadow-md
                [&::-moz-range-thumb]:cursor-grab
                [&::-moz-range-thumb]:active:cursor-grabbing"
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-bold">
            <span>₹1 Cr</span>
            <span>₹5 Cr</span>
          </div>
        </div>
      </div>

      {/* Budget Range Summary */}
      <div className="bg-slate-100 rounded-xl p-5 border border-slate-200">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Budget Range</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-[9px] font-bold mb-1">From</p>
            <p className="text-primary font-black text-base">{formatPriceToCr(min)}</p>
          </div>
          <div className="text-slate-300 text-2xl">→</div>
          <div>
            <p className="text-slate-400 text-[9px] font-bold mb-1">To</p>
            <p className="text-primary font-black text-base">{formatPriceToCr(max)}</p>
          </div>
        </div>
      </div>

      {/* Hidden inputs for form */}
      <input type="hidden" name="minPrice" value={min} />
      <input type="hidden" name="maxPrice" value={max} data-validate="true" />
    </div>
  );
}
