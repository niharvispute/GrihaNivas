import React from 'react';
import HomeLoanForm from '@/components/forms/HomeLoanForm';
import BankPartners from '@/components/common/BankPartners';
import Link from 'next/link';

export const metadata = {
  title: 'Home Loan Assistance | Mumbai Editorial Real Estate',
  description: 'Get expert home loan assistance in Mumbai. Compare interest rates, check eligibility, and get fast approvals with India\'s top banks.',
};

export default function HomeLoanPage() {
  return (
    <div className="bg-white min-h-screen font-sans">
      <main className="pt-8 md:pt-12">
        {/* 1. Hero Section */}
        <section className="px-6 md:px-8 py-8 md:py-24 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-24">
          <div className="md:w-1/2 space-y-6 md:space-y-8 text-center md:text-left">
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">Mortgage Solutions</span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight text-slate-900">
              Low Interest. <br className="hidden md:block"/>
              High <span className="text-primary italic">Precision.</span>
            </h1>
            <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
              Unlock the doors to Mumbai's finest addresses with bespoke home loan offers from India's premier banking institutions.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 pt-4">
              <button className="bg-primary text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-black text-base md:text-lg shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all transition-all leading-none">
                Apply Now
              </button>
              <Link 
                href="/contact?message=I would like to request a callback regarding a home loan application. Please contact me with more information."
                className="flex items-center gap-2 md:gap-3 px-6 md:px-8 py-4 md:py-5 text-slate-900 font-black text-base md:text-lg hover:bg-slate-50 rounded-full transition-all leading-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Request Callback
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 relative w-full">
            <div className="rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl group">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnaAyRjGb5g3qwKgviFX6pdVArwZEvtBmaRiqlUNcdpqe9cbbb-M9dDFEi9tcwN9C5jmfnclSuXJh07Fg0q5yeQ5p4r5MzSiXSVMybTJNdtfuA2N4Z2qRX7p_6OehBKbSeDGc5xknhghschF-5G0v1uQldemxWNAx0i1GASEuUPB9h_16hJaYs1PmFEbpX1FUEdDzPevpqOMO0UKGdlp9Oys3byCSVmu7nlMndS1FitGp0qPfyQr9BxoQSquyZJ3PgVKNrH5COiPY" 
                alt="Financial Advisory" 
                className="w-full h-[300px] md:h-[500px] object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            
            {/* Floating EMI Card */}
            <div className="absolute -bottom-6 -right-4 md:-bottom-10 md:-left-10 bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl max-w-[160px] md:max-w-xs border border-slate-50 scale-90 md:scale-110">
              <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-6">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                </div>
                <span className="font-black text-slate-900 text-xs md:text-base tracking-tight">EMI Estimate</span>
              </div>
              <p className="text-[8px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mb-1 md:mb-2">Starts from</p>
              <div className="text-lg md:text-3xl font-black text-primary mb-3 md:mb-4 tracking-tighter italic">₹ 42,450 <span className="text-[10px] md:text-sm font-bold text-slate-400">/mo</span></div>
              <Link href="/emi-calculator" className="text-primary text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 h-auto">
                Calulate yours <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Bank Partners */}
        <BankPartners />

        {/* 3. Benefits Grid */}
        <section className="py-12 md:py-24 px-6 md:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10">
            {[
              { icon: 'percent', title: "Lowest Rates", desc: "Access exclusive interest rates reserved for Mumbai Editorial clients." },
              { icon: 'bolt', title: "Fast Approval", desc: "Digital-first process with approvals in under 24 hours." },
              { icon: 'handshake', title: "Expert Advice", desc: "Dedicated managers to guide you through complex Mumbai documentation." },
              { icon: 'description', title: "Ease of Use", desc: "Doorstep document pickup and digital verification journey." }
            ].map((benefit, i) => (
              <div key={i} className="group p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] bg-white border border-slate-50 hover:shadow-2xl transition-all">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-primary/5 rounded-xl md:rounded-2xl flex items-center justify-center text-primary mb-4 md:mb-8 transition-all scale-100 group-hover:bg-primary group-hover:text-white">
                  <span className="font-black text-lg md:text-2xl">{benefit.icon === 'percent' ? '%' : (benefit.icon === 'bolt' ? '⚡' : (benefit.icon === 'handshake' ? '🤝' : '📄'))}</span>
                </div>
                <h3 className="text-sm md:text-xl font-black text-slate-900 mb-2 md:mb-4 tracking-tight">{benefit.title}</h3>
                <p className="text-slate-500 text-[10px] md:text-sm leading-relaxed font-medium line-clamp-2 md:line-clamp-none">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 md:py-32 px-6 md:px-8 max-w-7xl mx-auto">
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
                <p className="text-[10px] md:text-sm text-slate-400 font-medium leading-relaxed px-2 md:px-4">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Main Application Form */}
        <section className="py-16 md:py-32 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-10 md:h-20 bg-gradient-to-b from-white to-transparent"></div>
          <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="space-y-6 md:space-y-10 text-center lg:text-left">
              <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">Start Application</span>
              <h2 className="text-3xl md:text-6xl font-black tracking-tighter leading-tight text-slate-900">
                Your Dream Home <br className="hidden md:block"/>Starts Here.
              </h2>
              <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
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

        {/* 5. Process Steps */}
        

        {/* 6. Testimonials */}
        {/* <section className="py-16 md:py-32 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 md:mb-20 gap-6 md:gap-8 text-center md:text-left">
              <div className="space-y-2 md:space-y-4">
                <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">Public Verdict</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">
                  Join 5,000+ Precision<br className="hidden md:block"/> Powered Homeowners
                </h2>
              </div>
              <div className="flex gap-3 md:gap-4 hidden md:flex">
                Scroll buttons hidden on mobile to save space
                <button className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-slate-800 flex items-center justify-center hover:bg-white hover:text-slate-900 hover:border-white transition-all scale-100 md:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-slate-800 flex items-center justify-center hover:bg-white hover:text-slate-900 hover:border-white transition-all scale-100 md:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              {[
                { name: "Vikram Mehta", pos: "Worli Homeowner", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBsnAoQspniaKe-QMHTjyHUlvRV3T18Jd9NrvDO3HgE5Fk33HaIFWz9AfX6qmqPCjbYD6Hcb7iLI2YadPTfin90tfcjCDCI26GGMUV83VNI9wHCsOYhWPqHgu4SV_y_chPta3C1yGvjLY0OC-6tTx1plsCyKBiH-C9rinMphEe_Ffmu5mv8T3ww4uoKO0tPXONf1dV_7BCDzNqI5UF-5QgVlN7f5KQn2laObmumzYfie4QPkE9Oh6HFplc8dHILubd96FAfCpQZ7Ww", text: "Got a rate 0.5% lower than what my direct bank offered!" },
                { name: "Ananya Kapoor", pos: "Pali Hill Resident", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGnvJeZcQ7KHqCwFGWTQ1Gv86Gna23nACZfjd8htsJxGFW5ydk4nz4TUfOppp6ZP7WZGwnSb6ZK726jEl-zvn6Obds49bZctAhQJWnT7_uaopZkfoRBkAmOOBSCWScKeiP_8C9ihRTMqhtOsLRcleGNjQ2VuWsCVv5EzLkLoQu4hoEaT5z7shPeIO8bN-pVWvl64viTMtpC_AYwWItr5hb6KFK3PNlcnmSpH4KVHiY7DwWrYghhnf-dT1ORJwbWRoqaJE2NsLlrDk", text: "Handled the legal vetting and coordination with the bank perfectly." }
              ].map((test, i) => (
                <div key={i} className="p-6 md:p-10 bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] space-y-4 md:space-y-8 hover:bg-white/10 transition-colors group">
                  <div className="flex text-primary text-xs md:text-base">
                    {[1,2,3,4,5].map(s => <span key={s}>★</span>)}
                  </div>
                  <p className="text-slate-300 italic leading-relaxed text-sm md:text-lg font-medium group-hover:text-white transition-colors">&ldquo;{test.text}&rdquo;</p>
                  <div className="flex items-center gap-4 md:gap-5 pt-2 md:pt-4 scale-100 md:scale-110 origin-left">
                    <img src={test.img} alt={test.name} className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover ring-2 ring-primary/20" />
                    <div>
                      <p className="font-black text-white text-xs md:text-base tracking-tight">{test.name}</p>
                      <p className="text-[8px] md:text-xs text-primary font-black uppercase tracking-widest">{test.pos}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* 7. FAQ Section */}
        <section className="py-16 md:py-32 max-w-4xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12 md:mb-20 space-y-2 md:space-y-4">
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">Knowledge Base</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900">Expert Insights</h2>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {[
              { q: "What is the current interest rate?", a: "Interest rates range between 8.35% and 9.15% depending on credit score." },
              { q: "What documents are required?", a: "Primary documents include ITR (3 years), Salary Slips, and Bank Statements." }
            ].map((faq, i) => (
              <details key={i} className="group bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-slate-100 transition-all hover:bg-white">
                <summary className="w-full flex items-center justify-between p-6 md:p-8 text-left cursor-pointer list-none font-black text-base md:text-xl text-slate-900 group-open:text-primary transition-colors">
                  {faq.q}
                  <div className="bg-white p-1.5 md:p-2 rounded-full shadow-sm group-open:rotate-180 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-primary md:w-5 md:h-5"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </summary>
                <div className="px-6 md:px-8 pb-6 md:pb-8 text-slate-500 font-medium leading-relaxed text-sm md:text-lg border-t border-slate-100 pt-4 md:pt-6">
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
