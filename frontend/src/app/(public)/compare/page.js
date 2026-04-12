'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { properties as allProperties } from '@/data/properties';
import CompareHeader from '@/components/property/compare/CompareHeader';
import CompareGrid from '@/components/property/compare/CompareGrid';

export default function ComparePage() {
  // Use the first 3 properties as default for the demo
  const [comparedIds, setComparedIds] = useState([1, 2, 3]);

  const comparedProperties = allProperties.filter(p => comparedIds.includes(p.id));

  const handleRemove = (id) => {
    setComparedIds(prev => prev.filter(i => i !== id));
  };

  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-[1440px] mx-auto px-8 py-12">
        {/* Header Section */}
        <div className="flex items-center gap-6 mb-16">
          <Link 
            href="/buy"
            className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:bg-white transition-all active:scale-95 group"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="group-hover:-translate-x-1 transition-transform"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">
              Compare Properties
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Side-by-side analysis of your top editorial picks in Mumbai
            </p>
          </div>
        </div>

        {comparedProperties.length > 0 ? (
          <>
            <CompareHeader 
              properties={comparedProperties} 
              onRemove={handleRemove} 
            />
            <CompareGrid 
              properties={comparedProperties} 
            />
          </>
        ) : (
          <div className="py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-slate-300 mx-auto mb-8">
              <span className="material-symbols-outlined text-4xl">compare_arrows</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">No Properties Selected</h2>
            <p className="text-slate-500 font-medium mb-12 max-w-sm mx-auto">
              Add properties from the listings page to start a detailed side-by-side comparison.
            </p>
            <Link 
              href="/buy" 
              className="px-10 py-5 bg-primary text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
            >
              Browse Listings
            </Link>
          </div>
        )}

        {/* Comparison Insight Section */}
        {comparedProperties.length > 0 && (
          <section className="mt-32 p-12 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-primary font-black uppercase tracking-[0.4em] text-xs mb-6 block">Editorial Insight</span>
                <h2 className="text-4xl font-black tracking-tighter leading-tight mb-8">
                  Confused between <br/>your top choices?
                </h2>
                <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">
                  Our area experts can provide a personalized feasibility report comparing appreciation potential, 
                  infrastructure development, and developer track records for these specific projects.
                </p>
                <button className="px-10 py-5 bg-primary text-white rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-primary/40">
                  Request Expert Consultation
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                  <h4 className="font-black text-primary text-2xl mb-2">98%</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Data Accuracy</p>
                </div>
                <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                  <h4 className="font-black text-white text-2xl mb-2">Verified</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">RERA Compliance</p>
                </div>
                <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm col-span-2">
                  <p className="text-slate-300 font-medium italic">"The side-by-side comparison saved us weeks of site visits. Precise and visually clear."</p>
                  <p className="mt-4 text-xs font-black uppercase tracking-widest text-primary">— Mumbai Resident</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
