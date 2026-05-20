'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

const DEFAULT_RATES = {
  buy: { maleRate: 6, femaleRate: 5, jointRate: 5, registrationCharge: 30000 },
  rent: { maleRate: 2, femaleRate: 2, jointRate: 2, registrationCharge: 1000 },
};

const computeResult = (propertyValue, buyerType, rateSet) => {
  const rateMap = { male: rateSet.maleRate, female: rateSet.femaleRate, joint: rateSet.jointRate };
  const ratePercent = rateMap[buyerType] ?? rateSet.maleRate;
  const stampDuty = Math.round(propertyValue * (ratePercent / 100));
  return {
    stampDutyRateLabel: `${ratePercent}%`,
    stampDuty,
    registrationCharges: rateSet.registrationCharge,
    totalPayable: stampDuty + rateSet.registrationCharge,
  };
};

const StampDutyCalculator = () => {
  const [propertyValue, setPropertyValue] = useState(50000000);
  const [buyerType, setBuyerType] = useState('male');
  const [propertyType, setPropertyType] = useState('buy');
  const [allRates, setAllRates] = useState(DEFAULT_RATES);
  const [results, setResults] = useState(() =>
    computeResult(50000000, 'male', DEFAULT_RATES.buy)
  );

  useEffect(() => {
    apiFetch('/api/stamp-duty')
      .then((res) => {
        const data = res.data || {};
        const fetched = {
          buy: { ...DEFAULT_RATES.buy, ...(data.buy || {}) },
          rent: { ...DEFAULT_RATES.rent, ...(data.rent || {}) },
        };
        setAllRates(fetched);
        setResults(computeResult(propertyValue, buyerType, fetched[propertyType]));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setResults(computeResult(propertyValue, buyerType, allRates[propertyType]));
  }, [propertyValue, buyerType, propertyType, allRates]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const currentRates = allRates[propertyType];

  const FAQS = [
    {
      q: "What are the current stamp duty rates in Mumbai?",
      a: "As of 2024, the standard stamp duty rate in Mumbai for buying is 6% (which includes a 1% Metro Cess). For female buyers, there is a 1% concession, bringing the rate down to 5%."
    },
    {
      q: "Are there any tax benefits on stamp duty?",
      a: "Yes, under Section 80C of the Income Tax Act, you can claim a deduction of up to ₹1.5 Lakhs on the amount paid for stamp duty and registration charges during the year of purchase."
    },
    {
      q: "When should I pay the stamp duty?",
      a: "Stamp duty must be paid before or at the time of executing the sale deed. Delay in payment can lead to significant penalties, often ranging from 2% to 200% of the deficit amount."
    },
    {
      q: "What is the Ready Reckoner Rate and how does it affect my calculation?",
      a: "The Ready Reckoner Rate (RRR) is the minimum property valuation fixed annually by the Maharashtra Government. Stamp duty is calculated on the higher of either your agreement value or the RRR — so even if you negotiate a lower price, duty is charged on the government's floor rate. In premium micro-markets like Worli, Bandra, and Lower Parel, RRRs are revised upward every year. Our calculator uses current market rates as a base estimate; consult our advisory team for a precise figure tied to your specific property."
    },
    {
      q: "Is stamp duty applicable on under-construction properties?",
      a: "Yes. Stamp duty on an under-construction property is calculated on the agreement value at the time of registration, not at possession. You register and pay duty upfront, even if the project delivers 3–5 years later. For MahaRERA-registered projects, this is straightforward — all properties listed on GrihaNivas carry active MahaRERA registration. Ensure the developer's RERA number is current and the project has all required NOCs before executing your agreement."
    },
    {
      q: "How can I legally reduce my stamp duty liability in Mumbai?",
      a: "Three legitimate methods: (a) Register in a woman's name — female buyers pay 5% vs 6% for male buyers, saving ₹1,00,000 on a ₹1 Cr property; (b) Claim Section 80C deduction — up to ₹1.5 Lakhs on stamp duty and registration charges paid in the year of purchase; (c) For joint registrations where the primary owner is female, the female rate of 5% applies. Our advisory team can run a tax-optimised registration scenario for your specific case."
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 font-sans">
      {/* 1. Header */}
      <header className="mb-8 md:mb-16 text-center">
        <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 mb-2 md:mb-4 px-2">
          Stamp Duty & Registration
        </h1>
        <p className="text-slate-500 text-sm md:text-xl font-bold max-w-3xl mx-auto px-4">
          Calculate precise property charges for your Mumbai real estate investment based on the latest rates.
        </p>
      </header>

      {/* 2. Main Calculator Card */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
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
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 md:py-6 pl-10 md:pl-12 pr-6 md:pr-8 text-xl md:text-3xl font-black text-slate-900 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-200"
                  placeholder="50,000,000"
                />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 mb-4 md:mb-6">
                Property Type
              </label>
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                {[
                  { id: 'buy', label: 'Buy' },
                  { id: 'rent', label: 'Rent' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setPropertyType(type.id)}
                    className={`py-3 md:p-5 rounded-xl md:rounded-2xl border-2 font-bold text-sm md:text-lg transition-all active:scale-95 ${
                      propertyType === type.id
                        ? 'border-primary bg-primary/5 text-primary shadow-md md:shadow-lg'
                        : 'border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
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
                        ? 'border-primary bg-primary/5 text-primary shadow-md md:shadow-lg'
                        : 'border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Rates Info */}
            <div className="bg-slate-50 rounded-2xl p-4 md:p-6">
              <p className="text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 mb-3">
                Current Rates — {propertyType === 'buy' ? 'Buy' : 'Rent'}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Male', value: `${currentRates.maleRate}%` },
                  { label: 'Female', value: `${currentRates.femaleRate}%` },
                  { label: 'Joint', value: `${currentRates.jointRate}%` },
                ].map((r) => (
                  <div key={r.label} className="text-center">
                    <p className="text-xs font-bold text-slate-500">{r.label}</p>
                    <p className="text-lg font-black text-primary">{r.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-[9px] md:text-[10px] text-slate-400 font-bold mt-3">
                Registration charge: {formatCurrency(currentRates.registrationCharge)} flat
              </p>
            </div>
          </div>
        </div>

        {/* Right: Results Summary */}
        <div className="lg:col-span-5 bg-slate-50/50 p-6 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-primary/5 blur-3xl -z-10 rounded-full"></div>

          <div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 mb-6 md:mb-10 tracking-tight">Summary of Charges</h3>
            <div className="space-y-6 md:space-y-8">
              <div className="flex justify-between items-end">
                <div className="space-y-0.5 md:space-y-1">
                  <span className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest block leading-none">Stamp Duty</span>
                  <span className="text-slate-600 text-xs md:text-base font-bold">at {results.stampDutyRateLabel} Rate</span>
                </div>
                <span className="text-xl md:text-3xl font-black text-primary">{formatCurrency(results.stampDuty)}</span>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-0.5 md:space-y-1">
                  <span className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest block leading-none">Registration</span>
                  <span className="text-slate-600 text-xs md:text-base font-bold">Flat Charge</span>
                </div>
                <span className="text-lg md:text-xl font-black text-slate-900">{formatCurrency(results.registrationCharges)}</span>
              </div>

              <div className="pt-6 md:pt-10 border-t border-slate-200">
                <div className="flex justify-between items-end">
                  <span className="font-black text-[9px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-400">Total Payable</span>
                  <span className="text-2xl md:text-4xl font-black text-slate-900 border-b-2 md:border-b-4 border-primary/20 pb-0.5 md:pb-1">
                    {formatCurrency(results.totalPayable)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 md:mt-16 space-y-3 md:space-y-4">
            <Link
              href="/home-loan"
              className="w-full py-4 md:py-5 rounded-full bg-primary text-white font-black text-center text-base md:text-lg shadow-xl hover:bg-primary/90 transition-all leading-none block"
            >
              Apply for Home Loan
            </Link>
            <Link
              href={`/contact?message=I would like to consult an expert regarding stamp duty and registration for a property valued at ₹${(propertyValue / 10000000).toFixed(2)} Cr.`}
              className="w-full py-4 md:py-5 rounded-full border-2 border-primary text-primary font-black text-center text-base md:text-lg hover:bg-primary/5 transition-all leading-none block"
            >
              Contact Expert
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Disclaimer */}
      <p className="mt-6 md:mt-8 text-center text-slate-400 text-[10px] md:text-xs font-bold px-4">
        * Estimates based on current Mumbai municipal rates. Ready Reckoner Rates may apply.
      </p>

      {/* 4. Info Content Section */}
      <section className="mt-16 md:mt-32 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start px-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 md:mb-8 tracking-tighter">Understanding Stamp Duty</h2>
          <div className="space-y-4 md:space-y-6 text-slate-500 leading-relaxed font-bold text-sm md:text-lg">
            <p>
              Stamp duty is a mandatory legal tax paid for asset acquisition.
              In Mumbai, these are set by the State Government of Maharashtra.
            </p>
            <p>
              Calculations are based on the higher value between the transaction price and the
              <span className="text-primary font-bold"> Ready Reckoner Rate</span>.
            </p>
          </div>
        </div>

        <div className="bg-primary/5 rounded-2xl p-6 md:p-10 border border-primary/10">
          <h3 className="text-lg md:text-xl font-black text-primary mb-4 md:mb-6">Key Considerations</h3>
          <ul className="space-y-4 md:space-y-6">
            {[
              { icon: 'analytics', text: "Calculations apply to the higher of sale value or govt rate." },
              { icon: 'location_city', text: "Rates differ slightly across various Mumbai sectors." },
              { icon: 'person_celebrate', text: "Women buyers receive a 1% concession in Maharashtra." }
            ].map((item, i) => (
              <li key={i} className="flex gap-4 md:gap-5 items-start">
                <div className="bg-primary/10 p-1.5 md:p-2 rounded-xl text-primary mt-0.5 md:mt-1 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <span className="text-slate-600 text-xs md:text-base font-bold leading-tight md:leading-normal">{item.text}</span>
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
            <details key={i} className="group bg-slate-50 rounded-2xl p-5 md:p-8 border border-slate-100 cursor-pointer transition-all hover:bg-white">
              <summary className="flex justify-between items-center text-base md:text-xl font-black text-slate-900 list-none group-open:text-primary transition-colors">
                {faq.q}
                <div className="bg-white p-1.5 md:p-2 rounded-full shadow-sm group-open:rotate-180 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary md:w-5 md:h-5"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </summary>
              <p className="mt-4 md:mt-6 text-slate-500 text-sm md:text-base font-bold leading-relaxed border-t border-slate-200 pt-4 md:pt-6">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 6. Asymmetric CTA Section */}
      <section className="mt-16 md:mt-32 relative h-80 md:h-125 rounded-2xl overflow-hidden group shadow-2xl bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20"></div>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 70% 50%, #b80049 0%, transparent 60%)'}}></div>
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-24 md:max-w-3xl">
          <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-3 md:mb-6">Concierge Advisory</span>
          <h2 className="text-3xl md:text-6xl font-black text-white mb-4 md:mb-8 leading-tight tracking-tighter">
            Complexity, <br/>Simplified.
          </h2>
          <p className="text-slate-300 text-sm md:text-xl mb-6 md:mb-12 font-bold leading-relaxed max-w-sm md:max-w-none">
            Our experts manage the intricacies of Mumbai real estate documentation,
            ensuring a seamless transition.
          </p>
          <div className="flex">
            <Link
              href={`/contact?message=I would like to request a professional consultation regarding property documentation and stamp duty for a ₹${(propertyValue / 10000000).toFixed(2)} Cr investment.`}
              className="px-8 md:px-12 py-3.5 md:py-5 bg-primary text-white font-black text-sm md:text-lg rounded-full shadow-2xl hover:bg-primary/90 transition-all leading-none text-center"
            >
              Get Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StampDutyCalculator;
