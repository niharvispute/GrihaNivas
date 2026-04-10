'use client';

import React, { useState, useMemo } from 'react';

const StampDutyCalculator = () => {
  const [propertyValue, setPropertyValue] = useState(50000000);
  const [buyerType, setBuyerType] = useState('male'); // male, female, joint
  const [propertyType, setPropertyType] = useState('residential');

  const results = useMemo(() => {
    // Stamp Duty Rates for Mumbai (Maharashtra)
    // Male/Joint: 6% (inclusive of 1% Metro Cess)
    // Female: 5% (1% concession)
    const stampDutyRate = buyerType === 'female' ? 0.05 : 0.06;
    const stampDuty = propertyValue * stampDutyRate;

    // Registration Charges: 1% of property value or ₹30,000 (whichever is lower)
    const registrationCharges = Math.min(propertyValue * 0.01, 30000);

    const totalPayable = stampDuty + registrationCharges;

    return {
      stampDutyRate: stampDutyRate * 100,
      stampDuty: Math.round(stampDuty),
      registrationCharges: Math.round(registrationCharges),
      totalPayable: Math.round(totalPayable),
    };
  }, [propertyValue, buyerType]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const FAQS = [
    {
      q: "What are the current stamp duty rates in Mumbai?",
      a: "As of 2024, the standard stamp duty rate in Mumbai is 6% (which includes a 1% Metro Cess). However, for female buyers, there is a 1% concession, bringing the rate down to 5%."
    },
    {
      q: "Are there any tax benefits on stamp duty?",
      a: "Yes, under Section 80C of the Income Tax Act, you can claim a deduction of up to ₹1.5 Lakhs on the amount paid for stamp duty and registration charges during the year of purchase."
    },
    {
      q: "When should I pay the stamp duty?",
      a: "Stamp duty must be paid before or at the time of executing the sale deed. Delay in payment can lead to significant penalties, often ranging from 2% to 200% of the deficit amount."
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 font-sans">
      {/* 1. Header */}
      <header className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4">
          Stamp Duty & Registration Calculator
        </h1>
        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-3xl mx-auto">
          Calculate precise property charges for your Mumbai real estate investment based on the latest government rates.
        </p>
      </header>

      {/* 2. Main Calculator Card */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 shadow-2xl shadow-slate-200/50">
        {/* Left: Inputs */}
        <div className="lg:col-span-7 p-8 md:p-12 border-r border-slate-50">
          <div className="space-y-12">
            {/* Property Value */}
            <div>
              <label className="block text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 mb-6">
                Property Value (INR)
              </label>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400 group-focus-within:text-primary transition-colors">₹</span>
                <input 
                  type="text" 
                  value={propertyValue.toLocaleString('en-IN')}
                  onChange={(e) => {
                    const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                    setPropertyValue(val);
                  }}
                  className="w-full bg-slate-50 border-none rounded-3xl py-6 pl-12 pr-8 text-3xl font-black text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-200"
                  placeholder="5,00,00,000"
                />
              </div>
            </div>

            {/* Buyer Type */}
            <div>
              <label className="block text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 mb-6">
                Buyer Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'male', label: 'Male' },
                  { id: 'female', label: 'Female' },
                  { id: 'joint', label: 'Joint' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setBuyerType(type.id)}
                    className={`p-5 rounded-2xl border-2 font-bold text-lg transition-all active:scale-95 ${
                      buyerType === type.id 
                      ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' 
                      : 'border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 mb-6">
                Property Type
              </label>
              <div className="relative">
                <select 
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 font-bold text-lg text-slate-900 focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                >
                  <option value="residential">Apartment / Residential</option>
                  <option value="commercial">Commercial Space</option>
                  <option value="agricultural">Agricultural Land</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results Summary */}
        <div className="lg:col-span-5 bg-slate-50/50 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -z-10 rounded-full"></div>
          
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-10 tracking-tight">Summary of Charges</h3>
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block">Stamp Duty</span>
                  <span className="text-slate-600 font-medium">at {results.stampDutyRate}% Rate</span>
                </div>
                <span className="text-3xl font-black text-primary">{formatCurrency(results.stampDuty)}</span>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block">Registration</span>
                  <span className="text-slate-600 font-medium">Standard Govt. Cap</span>
                </div>
                <span className="text-xl font-black text-slate-900">{formatCurrency(results.registrationCharges)}</span>
              </div>

              <div className="pt-10 border-t border-slate-200">
                <div className="flex justify-between items-end">
                  <span className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Total Payable</span>
                  <span className="text-4xl font-black text-slate-900 border-b-4 border-primary/20 pb-1">
                    {formatCurrency(results.totalPayable)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 space-y-4">
            <button className="w-full py-5 rounded-full bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all">
              Apply for Home Loan
            </button>
            <button className="w-full py-5 rounded-full border-2 border-primary text-primary font-black text-lg hover:bg-primary/5 transition-all">
              Contact Expert
            </button>
          </div>
        </div>
      </section>

      {/* 3. Disclaimer */}
      <p className="mt-8 text-center text-slate-400 text-xs font-medium italic">
        * Estimates based on current Mumbai municipal rates. Actual charges may vary based on exact location and Ready Reckoner Rates.
      </p>

      {/* 4. Info Content Section */}
      <section className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tighter">Understanding Stamp Duty</h2>
          <div className="space-y-6 text-slate-500 leading-relaxed font-medium text-lg">
            <p>
              Stamp duty is a mandatory legal tax paid to the government for asset or land acquisition. 
              In Mumbai, these rates are set by the State Government of Maharashtra and fluctuate based on municipal limits.
            </p>
            <p>
              Calculations are based on the higher value between the transaction price and the 
              <span className="text-primary italic font-bold"> Ready Reckoner Rate</span> 
              (the state-estimated value of the property).
            </p>
          </div>
        </div>

        <div className="bg-primary/5 rounded-[2.5rem] p-10 border border-primary/10">
          <h3 className="text-xl font-black text-primary mb-6">Key Considerations</h3>
          <ul className="space-y-6">
            {[
              { icon: 'analytics', text: "Calculations apply to the higher of sale value or government rate." },
              { icon: 'location_city', text: "Rates slightly differ between Mumbai City and Suburban districts." },
              { icon: 'person_celebrate', text: "Women buyers receive a 1% concession on stamp duty in Maharashtra." }
            ].map((item, i) => (
              <li key={i} className="flex gap-5 items-start">
                <div className="bg-primary/10 p-2 rounded-xl text-primary mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <span className="text-slate-600 font-medium leading-normal">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="mt-32 max-w-4xl mx-auto">
        <h2 className="text-4xl font-black text-center text-slate-900 mb-16 tracking-tighter">Expert Insights & FAQs</h2>
        <div className="space-y-6">
          {FAQS.map((faq, i) => (
            <details key={i} className="group bg-slate-50 rounded-3xl p-8 border border-slate-100 cursor-pointer transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
              <summary className="flex justify-between items-center text-xl font-black text-slate-900 list-none group-open:text-primary transition-colors">
                {faq.q}
                <div className="bg-white p-2 rounded-full shadow-sm group-open:rotate-180 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </summary>
              <p className="mt-6 text-slate-500 font-medium leading-relaxed border-t border-slate-200 pt-6">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 6. Asymmetric CTA Section */}
      <section className="mt-32 relative h-[500px] rounded-[3rem] overflow-hidden group shadow-2xl">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtD4TRJ9ji6_8mlYVQ-HUIQTCtxeqIj8WZc69nGXstCaQ2QAG_0UPAdGy6w1JXE2Mf_DLkH_-ZRgR9MDsaDLqnJyNB-n428EosoVI3ALRF50RyUJLnIeF1EybYQJVl9zdga6j7S2GAbUtcCeUEuSeu8_o7HsgAZgj20oqOPjHsGqwf9R3YUwXFo6spqOucL0_GwoYQr9Gb6XOpTAvnTTQ13i_o87qa5rjyBQ-pkkN3zz209svQI3mmOA5iEqmZugu4U_4n4-mTzU4" 
          alt="Mumbai Luxury Real Estate" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-24 max-w-3xl">
          <span className="text-primary font-black uppercase tracking-[0.4em] text-xs mb-6">Concierge Advisory</span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight tracking-tighter">
            Complexity, <br/>Simplified.
          </h2>
          <p className="text-slate-300 text-lg md:text-xl mb-12 font-medium leading-relaxed">
            Our legal experts manage the intricacies of Mumbai real estate documentation, 
            ensuring a seamless transition to your new luxury permanent residence.
          </p>
          <div className="flex">
            <button className="px-12 py-5 bg-primary text-white font-black text-lg rounded-full shadow-2xl shadow-primary/40 hover:bg-primary/90 hover:scale-105 transition-all active:scale-95">
              Get Expert Consultation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StampDutyCalculator;
