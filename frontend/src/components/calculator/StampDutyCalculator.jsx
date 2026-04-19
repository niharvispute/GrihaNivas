'use client';

import React, { useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/api/errors';
import { calculateStampDuty } from '@/services/calculatorService';

const getLocalStampResult = (propertyValue, buyerType) => {
  const stampDutyRate = buyerType === 'female' ? 0.05 : 0.06;
  const stampDuty = propertyValue * stampDutyRate;
  const registrationCharges = Math.min(propertyValue * 0.01, 30000);
  const totalPayable = stampDuty + registrationCharges;

  return {
    stampDutyRateLabel: `${Math.round(stampDutyRate * 100)}%`,
    stampDuty: Math.round(stampDuty),
    registrationCharges: Math.round(registrationCharges),
    totalPayable: Math.round(totalPayable),
  };
};

const StampDutyCalculator = () => {
  const [propertyValue, setPropertyValue] = useState(50000000);
  const [buyerType, setBuyerType] = useState('male'); // male, female, joint
  const [propertyType, setPropertyType] = useState('residential');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState('');
  const [results, setResults] = useState(() =>
    getLocalStampResult(50000000, 'male')
  );

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setIsCalculating(true);
      setCalcError('');

      try {
        const response = await calculateStampDuty({
          propertyValue,
          ownershipType: buyerType,
        });

        setResults({
          stampDutyRateLabel: response?.stampDutyRate || '0%',
          stampDuty: Number(response?.stampDuty || 0),
          registrationCharges: Number(response?.registrationCharge || 0),
          totalPayable: Number(response?.totalCharges || 0),
        });
      } catch (error) {
        setCalcError(getErrorMessage(error, 'Unable to fetch stamp duty from backend.'));
        setResults(getLocalStampResult(propertyValue, buyerType));
      } finally {
        setIsCalculating(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
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

  return (    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 font-sans">
      {/* 1. Header */}
      <header className="mb-8 md:mb-16 text-center">
        <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 mb-2 md:mb-4 px-2">
          Stamp Duty & Registration
        </h1>
        <p className="text-slate-500 text-sm md:text-xl font-medium max-w-3xl mx-auto px-4">
          Calculate precise property charges for your Mumbai real estate investment based on the latest rates.
        </p>
      </header>

      {/* 2. Main Calculator Card */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:rounded-[2.5rem] rounded-[1.5rem] overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
        {/* Left: Inputs */}
        <div className="lg:col-span-7 p-6 md:p-12 border-b lg:border-r lg:border-b-0 border-slate-100">
          <div className="space-y-8 md:space-y-12">
            {/* Property Value */}
            <div>
              <label className="block text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 mb-4 md:mb-6">
                Property Value (INR)
              </label>
              <div className="relative group">
                <span className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-lg md:text-2xl font-bold text-slate-400 group-focus-within:text-primary transition-colors">₹</span>
                <input 
                  type="text" 
                  value={propertyValue.toLocaleString('en-IN')}
                  onChange={(e) => {
                    const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                    setPropertyValue(val);
                  }}
                  className="w-full bg-slate-50 border-none rounded-2xl md:rounded-3xl py-4 md:py-6 pl-10 md:pl-12 pr-6 md:pr-8 text-xl md:text-3xl font-black text-slate-900 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-200"
                  placeholder="50,000,000"
                />
              </div>
            </div>

            {/* Buyer Type */}
            <div>
              <label className="block text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 mb-4 md:mb-6">
                Buyer Type
              </label>
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {[
                  { id: 'male', label: 'Male' },
                  { id: 'female', label: 'Female' },
                  { id: 'joint', label: 'Joint' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setBuyerType(type.id)}
                    className={`py-3 md:p-5 rounded-xl md:rounded-2xl border-2 font-bold text-sm md:text-lg transition-all active:scale-95 ${
                      buyerType === type.id 
                      ? 'border-primary bg-primary/5 text-primary shadow-md md:shadow-lg shadow-primary/10' 
                      : 'border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 mb-4 md:mb-6">
                Property Type
              </label>
              <div className="relative">
                <select 
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl py-4 md:py-5 px-5 md:px-6 font-bold text-base md:text-lg text-slate-900 focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer"
                >
                  <option value="residential">Apartment / Residential</option>
                  <option value="agricultural">Agricultural Land</option>
                </select>
                <div className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results Summary */}
        <div className="lg:col-span-5 bg-slate-50/50 p-6 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-primary/5 blur-3xl -z-10 rounded-full"></div>
          
          <div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 mb-6 md:mb-10 tracking-tight">Summary of Charges</h3>
            {(isCalculating || calcError) && (
              <p className={`mb-4 md:mb-6 text-[10px] md:text-xs font-semibold ${calcError ? 'text-red-600' : 'text-slate-500'}`}>
                {calcError || 'Calculating latest rates...'}
              </p>
            )}
            <div className="space-y-6 md:space-y-8">
              <div className="flex justify-between items-end">
                <div className="space-y-0.5 md:space-y-1">
                  <span className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest block leading-none">Stamp Duty</span>
                  <span className="text-slate-600 text-xs md:text-base font-medium">at {results.stampDutyRateLabel} Rate</span>
                </div>
                <span className="text-xl md:text-3xl font-black text-primary">{formatCurrency(results.stampDuty)}</span>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-0.5 md:space-y-1">
                  <span className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest block leading-none">Registration</span>
                  <span className="text-slate-600 text-xs md:text-base font-medium">Standard Govt. Cap</span>
                </div>
                <span className="text-lg md:text-xl font-black text-slate-900">{formatCurrency(results.registrationCharges)}</span>
              </div>

              <div className="pt-6 md:pt-10 border-t border-slate-200">
                <div className="flex justify-between items-end">
                  <span className="font-black text-[9px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-400">Total Payable</span>
                  <span className="text-2xl md:text-4xl font-black text-slate-900 border-b-2 md:border-b-4 border-primary/20 pb-0.5 md:pb-1 italic">
                    {formatCurrency(results.totalPayable)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 md:mt-16 space-y-3 md:space-y-4">
            <button className="w-full py-4 md:py-5 rounded-full bg-primary text-white font-black text-base md:text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all leading-none">
              Apply for Home Loan
            </button>
            <button className="w-full py-4 md:py-5 rounded-full border-2 border-primary text-primary font-black text-base md:text-lg hover:bg-primary/5 transition-all leading-none">
              Contact Expert
            </button>
          </div>
        </div>
      </section>

      {/* 3. Disclaimer */}
      <p className="mt-6 md:mt-8 text-center text-slate-400 text-[10px] md:text-xs font-medium italic px-4">
        * Estimates based on current Mumbai municipal rates. Ready Reckoner Rates may apply.
      </p>

      {/* 4. Info Content Section */}
      <section className="mt-16 md:mt-32 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start px-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 md:mb-8 tracking-tighter">Understanding Stamp Duty</h2>
          <div className="space-y-4 md:space-y-6 text-slate-500 leading-relaxed font-medium text-sm md:text-lg">
            <p>
              Stamp duty is a mandatory legal tax paid for asset acquisition. 
              In Mumbai, these are set by the State Government of Maharashtra.
            </p>
            <p>
              Calculations are based on the higher value between the transaction price and the 
              <span className="text-primary italic font-bold"> Ready Reckoner Rate</span>.
            </p>
          </div>
        </div>

        <div className="bg-primary/5 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-primary/10">
          <h3 className="text-lg md:text-xl font-black text-primary mb-4 md:mb-6">Key Considerations</h3>
          <ul className="space-y-4 md:space-y-6">
            {[
              { icon: 'analytics', text: "Calculations apply to the higher of sale value or govt rate." },
              { icon: 'location_city', text: "Rates differ slightly across various Mumbai sectors." },
              { icon: 'person_celebrate', text: "Women buyers receive a 1% concession in Maharashtra." }
            ].map((item, i) => (
              <li key={i} className="flex gap-4 md:gap-5 items-start">
                <div className="bg-primary/10 p-1.5 md:p-2 rounded-lg md:rounded-xl text-primary mt-0.5 md:mt-1 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <span className="text-slate-600 text-xs md:text-base font-medium leading-tight md:leading-normal">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="mt-16 md:mt-32 max-w-4xl mx-auto px-2">
        <h2 className="text-2xl md:text-4xl font-black text-center text-slate-900 mb-8 md:mb-16 tracking-tighter">Expert Insights & FAQs</h2>
        <div className="space-y-3 md:space-y-6">
          {FAQS.map((faq, i) => (
            <details key={i} className="group bg-slate-50 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-100 cursor-pointer transition-all hover:bg-white">
              <summary className="flex justify-between items-center text-base md:text-xl font-black text-slate-900 list-none group-open:text-primary transition-colors">
                {faq.q}
                <div className="bg-white p-1.5 md:p-2 rounded-full shadow-sm group-open:rotate-180 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary md:w-5 md:h-5"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </summary>
              <p className="mt-4 md:mt-6 text-slate-500 text-sm md:text-base font-medium leading-relaxed border-t border-slate-200 pt-4 md:pt-6">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 6. Asymmetric CTA Section */}
      <section className="mt-16 md:mt-32 relative h-80 md:h-125 rounded-[2rem] md:rounded-[3rem] overflow-hidden group shadow-2xl">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtD4TRJ9ji6_8mlYVQ-HUIQTCtxeqIj8WZc69nGXstCaQ2QAG_0UPAdGy6w1JXE2Mf_DLkH_-ZRgR9MDsaDLqnJyNB-n428EosoVI3ALRF50RyUJLnIeF1EybYQJVl9zdga6j7S2GAbUtcCeUEuSeu8_o7HsgAZgj20oqOPjHsGqwf9R3YUwXFo6spqOucL0_GwoYQr9Gb6XOpTAvnTTQ13i_o87qa5rjyBQ-pkkN3zz209svQI3mmOA5iEqmZugu4U_4n4-mTzU4" 
          alt="Mumbai Luxury Real Estate" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-24 md:max-w-3xl">
          <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-3 md:mb-6">Concierge Advisory</span>
          <h2 className="text-3xl md:text-6xl font-black text-white mb-4 md:mb-8 leading-tight tracking-tighter">
            Complexity, <br/>Simplified.
          </h2>
          <p className="text-slate-300 text-sm md:text-xl mb-6 md:mb-12 font-medium leading-relaxed max-w-sm md:max-w-none">
            Our experts manage the intricacies of Mumbai real estate documentation, 
            ensuring a seamless transition.
          </p>
          <div className="flex">
            <button className="px-8 md:px-12 py-3.5 md:py-5 bg-primary text-white font-black text-sm md:text-lg rounded-full shadow-2xl shadow-primary/40 hover:bg-primary/90 transition-all leading-none">
              Get Consultation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StampDutyCalculator;
