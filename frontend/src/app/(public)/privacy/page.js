'use client';

import React from 'react';
import SectionHeader from '@/components/common/SectionHeader';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'May 03, 2026';

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero / Header */}
      <section className="bg-slate-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Legal Framework</span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 uppercase">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg max-w-2xl mx-auto leading-relaxed">
            How we protect your data and curate your digital experience within the Mumbai Editorial ecosystem.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span className="material-symbols-outlined text-sm">update</span>
            Last Updated: {lastUpdated}
          </div>
        </div>
      </section>

      {/* 2. Content Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose prose-slate prose-lg">
          <div className="space-y-12">
            
            <div className="bg-[#f8f7f5] p-8 rounded-2xl border border-slate-100 mb-12">
              <h2 className="text-2xl font-black text-slate-900 mt-0 mb-4 tracking-tight uppercase">Introduction</h2>
              <p className="text-slate-600 font-bold leading-relaxed mb-0">
                At Mumbai Editorial by Bricks, we believe transparency is the foundation of trust. This Privacy Policy outlines how we collect, use, and safeguard your personal information when you navigate our platform or engage with our concierge services.
              </p>
            </div>

            <article>
              <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-xs">01</span>
                Information We Collect
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                When you use our platform, we may collect the following types of information:
              </p>
              <ul className="space-y-3 text-slate-600 font-bold list-none pl-0">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  <span>Personal Identifiers: Name, email address, phone number, and residential preferences.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  <span>Property Interest: Saved listings, search history, and budget parameters.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  <span>Technical Data: IP address, browser type, and usage patterns through cookies.</span>
                </li>
              </ul>
            </article>

            <article>
              <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-xs">02</span>
                How We Use Your Data
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Your data is used exclusively to refine your Mumbai real estate journey:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="p-5 rounded-xl border border-slate-100 bg-white shadow-sm">
                  <span className="material-symbols-outlined text-primary mb-3">person_search</span>
                  <h4 className="font-black text-slate-900 text-sm mb-2 uppercase">Concierge Shortlists</h4>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">To provide personalized property recommendations based on your commute and lifestyle.</p>
                </div>
                <div className="p-5 rounded-xl border border-slate-100 bg-white shadow-sm">
                  <span className="material-symbols-outlined text-primary mb-3">notifications_active</span>
                  <h4 className="font-black text-slate-900 text-sm mb-2 uppercase">Market Alerts</h4>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">To notify you of fresh listings, price drops, or new launches in your preferred pockets.</p>
                </div>
              </div>
            </article>

            <article>
              <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-xs">03</span>
                Data Security
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                We implement industry-standard encryption and security protocols (SSL/TLS) to ensure your data is protected from unauthorized access. Our database is audited periodically to maintain the highest levels of integrity.
              </p>
            </article>

            <article>
              <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-xs">04</span>
                Third-Party Sharing
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                We do not sell your personal information. However, we may share data with verified builder partners or financial institutions (like banks for home loans) only when you explicitly request an inquiry or consultation through our platform.
              </p>
            </article>

            <div className="pt-12 border-t border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight uppercase">Contact Legal Desk</h3>
              <div className="bg-slate-950 p-8 rounded-2xl text-white relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                 <p className="relative z-10 text-sm text-white/70 font-bold leading-relaxed mb-6">
                   If you have any questions regarding your data or wish to exercise your right to be forgotten, please reach out to our privacy officer.
                 </p>
                 <a href="mailto:privacy@mumbaieditorial.com" className="relative z-10 inline-flex items-center gap-3 bg-white text-slate-950 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                    Contact Privacy Officer
                    <span className="material-symbols-outlined text-sm">mail</span>
                 </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
