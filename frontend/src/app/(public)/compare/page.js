'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CompareHeader from '@/components/property/compare/CompareHeader';
import CompareGrid from '@/components/property/compare/CompareGrid';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/api/errors';
import { getCompareProperties, removeCompareProperty } from '@/services/userService';

export default function ComparePage() {
  const [comparedProperties, setComparedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    getCompareProperties()
      .then(setComparedProperties)
      .catch(() => setComparedProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id) => {
    try {
      await removeCompareProperty(id);
      setComparedProperties((prev) => prev.filter((p) => p.id !== id));
      addToast('Property removed from comparison list.', 'info');
    } catch (error) {
      addToast(getErrorMessage(error, 'Unable to remove property from compare list.'), 'error');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-16">
          <Link 
            href="/buy"
            className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all group"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="group-hover:-translate-x-1 transition-transform md:w-6 md:h-6"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 mb-1">
              Compare Properties
            </h1>
            <p className="text-slate-500 font-bold text-xs md:text-lg">
              Side-by-side analysis of your top picks
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50">
            <div className="space-y-3 animate-pulse w-full max-w-md">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-2xl" />)}
            </div>
          </div>
        ) : comparedProperties.length > 0 ? (
          <div className="overflow-x-auto -mx-4 px-4 pb-8 no-scrollbar md:overflow-visible">
            <div className="min-w-[700px] md:min-w-0">
              <CompareHeader 
                properties={comparedProperties} 
                onRemove={handleRemove} 
              />
              <CompareGrid 
                properties={comparedProperties} 
              />
            </div>
          </div>
        ) : (
          <div className="py-20 md:py-32 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-300 mx-auto mb-6 md:mb-8">
              <span className="material-symbols-outlined text-3xl md:text-4xl">compare_arrows</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 md:mb-4">No Properties Selected</h2>
            <p className="text-slate-500 font-bold mb-8 md:mb-12 max-w-xs mx-auto text-sm md:text-base">
              Add properties from the listings page to start a detailed side-by-side comparison.
            </p>
            <Link 
              href="/buy" 
              className="px-8 py-4 md:px-10 md:py-5 bg-primary text-white rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              Browse Listings
            </Link>
          </div>
        )}

        {/* Comparison Insight Section */}
        {comparedProperties.length > 0 && (
          <section className="mt-16 md:mt-32 p-8 md:p-12 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 md:w-100 md:h-100 bg-primary/10 blur-[60px] md:blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div>
                <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 md:mb-6 block">Editorial Insight</span>
                <h2 className="text-2xl md:text-4xl font-black tracking-tighter leading-tight mb-6 md:mb-8">
                  Confused between <br className="hidden md:block"/>your top choices?
                </h2>
                <p className="text-slate-400 text-sm md:text-lg font-bold leading-relaxed mb-8 md:mb-10">
                  Our area experts can provide a personalized feasibility report comparing appreciation potential and more.
                </p>
                <button className="w-full md:w-auto px-8 py-4 md:px-10 md:py-5 bg-primary text-white rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-primary/40 leading-none">
                  Request Expert Consultation
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm text-center md:text-left">
                  <h4 className="font-black text-primary text-xl md:text-2xl mb-1 md:mb-2">98%</h4>
                  <p className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Data Accuracy</p>
                </div>
                <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm text-center md:text-left">
                  <h4 className="font-black text-white text-xl md:text-2xl mb-1 md:mb-2">Verified</h4>
                  <p className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-slate-500">RERA Compliance</p>
                </div>
                <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm col-span-2">
                  <p className="text-slate-300 text-xs md:text-base font-medium ">&ldquo;The side-by-side comparison saved us weeks of site visits.&rdquo;</p>
                  <p className="mt-3 md:mt-4 text-[8px] md:text-xs font-black uppercase tracking-widest text-primary">— Mumbai Resident</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
