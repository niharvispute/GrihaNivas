import React from 'react';
import HomeLoanForm from '@/components/forms/HomeLoanForm';
import BankPartners from '@/components/common/BankPartners';
import Link from 'next/link';

export const metadata = {
  title: 'Home Loan Assistance',
  description: 'Get expert home loan assistance in Mumbai. Compare interest rates, check eligibility, and get fast approvals with India\'s top banks.',
};

export default function HomeLoanPage() {
  return (
    <div className="bg-white min-h-screen font-sans">
      <main className="pt-0">
        {/* 1. Hero Section */}
        <section className="px-6 md:px-8 pt-6 pb-8 md:pt-16 md:pb-24 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-24">
          <div className="md:w-2/5 space-y-6 md:space-y-8 text-center md:text-left">
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">Mortgage Solutions</span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight text-slate-900">
              Low Interest. <br className="hidden md:block"/>
              High <span className="text-primary ">Precision.</span>
            </h1>
            <p className="text-base md:text-xl text-slate-500 font-bold leading-relaxed max-w-lg mx-auto md:mx-0">
              Unlock the doors to Mumbai's finest addresses with bespoke home loan offers from India's premier banking institutions.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 pt-4">
              <Link 
                href="#apply-form" 
                className="bg-primary text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-black text-base md:text-lg shadow-2xl hover:bg-primary/90 transition-all leading-none flex items-center justify-center text-center"
              >
                Apply Now
              </Link>
              <Link 
                href="/contact?message=I would like to request a callback regarding a home loan application. Please contact me with more information."
                className="flex items-center gap-2 md:gap-3 px-6 md:px-8 py-4 md:py-5 text-slate-900 font-black text-base md:text-lg hover:bg-slate-50 rounded-full transition-all leading-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Request Callback
              </Link>
            </div>
          </div>
          
          <div className="md:w-3/5 relative w-full">
            <div className="rounded-2xl overflow-hidden shadow-2xl group">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnaAyRjGb5g3qwKgviFX6pdVArwZEvtBmaRiqlUNcdpqe9cbbb-M9dDFEi9tcwN9C5jmfnclSuXJh07Fg0q5yeQ5p4r5MzSiXSVMybTJNdtfuA2N4Z2qRX7p_6OehBKbSeDGc5xknhghschF-5G0v1uQldemxWNAx0i1GASEuUPB9h_16hJaYs1PmFEbpX1FUEdDzPevpqOMO0UKGdlp9Oys3byCSVmu7nlMndS1FitGp0qPfyQr9BxoQSquyZJ3PgVKNrH5COiPY" 
                alt="Financial Advisory" 
                className="w-full h-[300px] md:h-[500px] object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            
            {/* Floating EMI Card */}
            <div className="absolute -bottom-6 -right-4 md:-bottom-10 md:-left-10 bg-white p-4 md:p-8 rounded-2xl shadow-2xl max-w-[160px] md:max-w-xs border border-slate-50 scale-90 md:scale-110">
              <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-6">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                </div>
                <span className="font-black text-slate-900 text-xs md:text-base tracking-tight">EMI Estimate</span>
              </div>
              <p className="text-[8px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mb-1 md:mb-2">Starts from</p>
              <div className="text-lg md:text-3xl font-black text-primary mb-3 md:mb-4 tracking-tighter ">₹ 42,450 <span className="text-[10px] md:text-sm font-bold text-slate-400">/mo</span></div>
              <Link href="/emi-calculator" className="text-primary text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 h-auto">
                Calculate yours <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Bank Partners */}
        <BankPartners />

        {/* 3. Benefits Grid */}
        <section className="py-12 md:py-24 px-6 md:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {/* Featured primary card */}
            <div className="col-span-2 md:col-span-1 md:row-span-2 group p-6 md:p-10 rounded-2xl bg-primary text-white flex flex-col justify-between min-h-[180px] md:min-h-0">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-8">
                <span className="material-symbols-outlined text-xl md:text-2xl text-white">percent</span>
              </div>
              <div>
                <p className="text-white/60 font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px] mb-2">Rates from</p>
                <p className="text-3xl md:text-5xl font-black tracking-tighter mb-2 md:mb-4">8.35% <span className="text-base md:text-xl font-bold text-white/70">p.a.</span></p>
                <h3 className="text-base md:text-xl font-black tracking-tight mb-2 md:mb-3">Lowest Rates</h3>
                <p className="text-white/70 text-xs md:text-sm leading-relaxed font-bold">Exclusive interest rates reserved for GrihaNivas clients — sourced from 6 premier lenders.</p>
              </div>
            </div>
            {/* 3 compact supporting cards */}
            {[
              { icon: 'flash_on', title: "Fast Approval", desc: "Digital-first process with approvals in under 24 hours." },
              { icon: 'handshake', title: "Expert Advice", desc: "Dedicated managers for complex Mumbai documentation." },
              { icon: 'description', title: "Ease of Use", desc: "Doorstep document pickup and digital verification." }
            ].map((benefit, i) => (
              <div key={i} className="group p-5 md:p-8 rounded-2xl bg-white border border-slate-100 hover:shadow-lg hover:shadow-slate-200/80 transition-all duration-500">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-4 transition-all group-hover:bg-primary group-hover:text-white">
                  <span className="material-symbols-outlined text-xl">{benefit.icon}</span>
                </div>
                <h3 className="text-sm md:text-base font-black text-slate-900 mb-2 tracking-tight">{benefit.title}</h3>
                <p className="text-slate-500 text-[10px] md:text-sm leading-relaxed font-bold">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-8 md:py-16 px-6 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20 space-y-2 md:space-y-4">
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">The Workflow</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900">Simple 4-Step Journey</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 relative">
            <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-slate-100 -z-10"></div>
            {[
              { step: 1, title: "Apply Online", desc: "Fill the simple digital form." },
              { step: 2, title: "Counseling", desc: "Expert calls to understand your needs." },
              { step: 3, title: "Compare", desc: "Review offers from top-tier banks." },
              { step: 4, title: "Disbursement", desc: "Get sanctioned in record time." }
            ].map((item, i) => (
              <div key={i} className="text-center space-y-4 md:space-y-6">
                <div className="w-12 h-12 md:w-20 md:h-20 bg-white border-4 md:border-8 border-slate-50 shadow-lg rounded-full flex items-center justify-center font-black text-primary mx-auto text-lg md:text-2xl z-10 scale-100 md:scale-110">
                  {item.step}
                </div>
                <h4 className="text-sm md:text-xl font-black text-slate-900 tracking-tight">{item.title}</h4>
                <p className="text-[10px] md:text-sm text-slate-400 font-bold leading-relaxed px-2 md:px-4">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Main Application Form */}
        <section id="apply-form" className="py-16 md:py-32 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-10 md:h-20 bg-gradient-to-b from-white to-transparent"></div>
          <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="space-y-6 md:space-y-10 text-center lg:text-left">
              <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">Start Application</span>
              <h2 className="text-3xl md:text-6xl font-black tracking-tighter leading-tight text-slate-900">
                Your Dream Home <br className="hidden md:block"/>Starts Here.
              </h2>
              <p className="text-base md:text-xl text-slate-500 font-bold leading-relaxed max-w-xl mx-auto lg:mx-0">
                Provide your basic details and our senior financial engineers will curate the best possible mortgage structures.
              </p>
              <div className="space-y-4 md:space-y-6 text-left max-w-md mx-auto lg:mx-0">
                {[
                  "No hidden consultation fees",
                  "AES-256 bank-level encryption",
                  "Personalized counseling sessions"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 md:gap-4 group">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="md:w-3 md:h-3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="font-black text-slate-700 tracking-tight text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <HomeLoanForm />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-32 max-w-4xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12 md:mb-20 space-y-2 md:space-y-4">
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">Knowledge Base</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900">Expert Insights</h2>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {[
              { q: "What is the current home loan interest rate in Mumbai?", a: "Rates currently range between 8.35% and 9.15% p.a. depending on your credit score, loan tenure, and the lender. Salaried applicants with a CIBIL score above 750 typically qualify for the lowest tier. GrihaNivas partners with SBI, HDFC, ICICI, Axis, Kotak, and LIC HFL." },
              { q: "What documents are required for a home loan application?", a: "For salaried applicants: last 3 years' ITR with Form 16, last 6 months' salary slips, last 12 months' bank statements, PAN card, Aadhaar, and property documents. For self-employed: 3 years' ITR with P&L and balance sheet, GST returns, and business proof." },
              { q: "How much loan am I eligible for?", a: "Most banks sanction up to 75–80% of the property's market value (LTV ratio). Eligibility also depends on your net monthly income — typically banks approve an EMI of up to 40–50% of your take-home pay. Our advisors run a free eligibility check before you apply." },
              { q: "What is the typical loan processing time?", a: "With GrihaNivas's digital-first process, in-principle approval takes 24–48 hours for complete documentation. Final sanction and disbursement typically follows within 7–10 working days after property legal verification." },
              { q: "Can I get a home loan for an under-construction property?", a: "Yes. Banks disburse in tranches linked to construction milestones. You pay pre-EMI interest on the disbursed amount until possession, after which full EMIs begin. Ensure the project is MahaRERA-registered — all properties listed on GrihaNivas meet this requirement." },
              { q: "What is the stamp duty impact on my total purchase cost?", a: "In Mumbai, stamp duty is 6% for male buyers, 5% for female buyers, and 6% for joint (male+female) purchases, calculated on the higher of agreement value or Ready Reckoner Rate. Registration charge is a flat ₹29,000. This is separate from your loan amount and must be paid upfront." }
            ].map((faq, i) => (
              <details key={i} className="group bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 transition-all hover:bg-white">
                <summary className="w-full flex items-center justify-between p-6 md:p-8 text-left cursor-pointer list-none font-black text-base md:text-xl text-slate-900 group-open:text-primary transition-colors">
                  {faq.q}
                  <div className="bg-white p-1.5 md:p-2 rounded-full shadow-sm group-open:rotate-180 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-primary md:w-5 md:h-5"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </summary>
                <div className="px-6 md:px-8 pb-6 md:pb-8 text-slate-500 font-bold leading-relaxed text-sm md:text-lg border-t border-slate-100 pt-4 md:pt-6">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
