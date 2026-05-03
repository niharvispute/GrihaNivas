'use client';

import React from 'react';

export default function TermsAndConditionsPage() {
  const lastUpdated = 'May 03, 2026';

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero / Header */}
      <section className="bg-slate-900 pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,0,73,0.15),transparent_40%)]"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Governance</span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 uppercase">
            Terms of <span className="text-primary">Use</span>
          </h1>
          <p className="text-slate-400 font-bold text-lg max-w-2xl mx-auto leading-relaxed">
            The guiding principles for accessing Mumbai's premier editorial property platform.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span className="material-symbols-outlined text-sm">schedule</span>
            Version 2.4 • Effective {lastUpdated}
          </div>
        </div>
      </section>

      {/* 2. Content Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-32 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Quick Navigation</p>
                {['Acceptance', 'Service Scope', 'User Conduct', 'Liability', 'Intellectual Property'].map((item, i) => (
                  <button key={i} className="flex items-center gap-4 text-slate-500 hover:text-primary font-black text-xs uppercase tracking-widest transition-all group w-full text-left">
                    <span className="w-6 h-[1px] bg-slate-200 group-hover:w-10 group-hover:bg-primary transition-all"></span>
                    {item}
                  </button>
                ))}
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-8 space-y-16">
              
              <article>
                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight uppercase">1. Acceptance of Terms</h2>
                <p className="text-slate-500 font-bold leading-relaxed">
                  By accessing and using Mumbai Editorial (the "Platform"), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Use. If you do not agree to these terms, please refrain from using our digital concierge services.
                </p>
              </article>

              <article className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight uppercase">2. Scope of Services</h2>
                <p className="text-slate-600 font-bold leading-relaxed mb-6">
                  Mumbai Editorial provides a curated selection of real estate listings, architectural insights, and advisory services. While we strive for absolute accuracy:
                </p>
                <div className="space-y-4">
                  {[
                    'Listing data (price, area, availability) is subject to change by builders without notice.',
                    'Visual representations (renders) may differ from actual site conditions.',
                    'Advisory content is for informational purposes and does not constitute financial advice.'
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4">
                       <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">info</span>
                       <p className="text-xs text-slate-500 font-bold leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article>
                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight uppercase">3. User Conduct</h2>
                <p className="text-slate-500 font-bold leading-relaxed mb-6">
                  Users agree to use the platform for legitimate property search purposes only. Prohibited actions include:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 list-none pl-0">
                  {['Web Scraping', 'Spam Enquiries', 'Unauthorized Mirroring', 'False Information'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-slate-700 font-black text-xs uppercase tracking-widest">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                       {item}
                    </li>
                  ))}
                </ul>
              </article>

              <article>
                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight uppercase">4. Limitation of Liability</h2>
                <p className="text-slate-500 font-bold leading-relaxed">
                  Mumbai Editorial (Bricks) shall not be liable for any direct, indirect, or consequential damages resulting from your use of the platform, including but not limited to financial losses during property transactions. All transactions are independent contracts between the user and the developer/owner.
                </p>
              </article>

              <div className="pt-12 border-t border-slate-100">
                <div className="flex items-center justify-between gap-6 flex-wrap">
                  <div>
                    <h4 className="font-black text-slate-900 uppercase text-sm mb-1 tracking-tight">Need clarification?</h4>
                    <p className="text-slate-400 text-xs font-bold">Our compliance team is available Mon-Fri.</p>
                  </div>
                  <button className="bg-primary text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    Download PDF Version
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
