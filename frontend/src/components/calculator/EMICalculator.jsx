'use client';

import React, { useState, useEffect, useMemo } from 'react';

const EMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState(7500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  // EMI Calculation
  const results = useMemo(() => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenure * 12;

    if (r === 0) {
      const emi = P / n;
      return {
        emi: Math.round(emi),
        totalInterest: 0,
        totalPayable: P,
        principalPercent: 100,
        interestPercent: 0,
      };
    }

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;
    const totalInterest = totalPayable - P;

    const principalPercent = (P / totalPayable) * 100;
    const interestPercent = (totalInterest / totalPayable) * 100;

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayable: Math.round(totalPayable),
      principalPercent: Math.round(principalPercent),
      interestPercent: Math.round(interestPercent),
    };
  }, [loanAmount, interestRate, tenure]);

  // Amortization Schedule (Yearly)
  const schedule = useMemo(() => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenure * 12;
    const emi = results.emi;

    let balance = P;
    const yearlySchedule = [];
    const currentYear = new Date().getFullYear();

    for (let year = 1; year <= tenure; year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      for (let month = 1; month <= 12; month++) {
        const interestForMonth = balance * r;
        const principalForMonth = emi - interestForMonth;
        
        yearlyInterest += interestForMonth;
        yearlyPrincipal += principalForMonth;
        balance -= principalForMonth;
        
        if (balance < 0) balance = 0;
      }

      yearlySchedule.push({
        year: currentYear + year - 1,
        principal: Math.round(yearlyPrincipal),
        interest: Math.round(yearlyInterest),
        totalPayment: Math.round(yearlyPrincipal + yearlyInterest),
        balance: Math.round(balance),
      });

      if (balance <= 0) break;
    }

    return yearlySchedule;
  }, [loanAmount, interestRate, tenure, results.emi]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full max-w-screen-xl mx-auto px-6 py-12 font-sans">
      {/* 1. Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4">
          EMI Calculator
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
          Plan your home ownership journey with our precise financial planning tool. 
          Calculate monthly payments and view your interest breakdown instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        {/* 2. Inputs Section */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          <div className="space-y-10">
            {/* Loan Amount */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">
                  Loan Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input 
                    type="text" 
                    value={loanAmount.toLocaleString('en-IN')}
                    onChange={(e) => {
                      const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                      setLoanAmount(val);
                    }}
                    className="pl-8 pr-4 py-2 bg-slate-50 border-none rounded-xl text-right font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 w-40"
                  />
                </div>
              </div>
              <input 
                type="range"
                min="100000"
                max="50000000"
                step="50000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold tracking-tighter mt-2">
                <span>₹ 1L</span>
                <span>₹ 5Cr</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                    className="pr-8 pl-4 py-2 bg-slate-50 border-none rounded-xl text-right font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 w-32"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
              </div>
              <input 
                type="range"
                min="5"
                max="20"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold tracking-tighter mt-2">
                <span>5%</span>
                <span>20%</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">
                  Loan Tenure
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={tenure}
                    onChange={(e) => setTenure(parseInt(e.target.value) || 0)}
                    className="pr-12 pl-4 py-2 bg-slate-50 border-none rounded-xl text-right font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 w-32"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Yrs</span>
                </div>
              </div>
              <input 
                type="range"
                min="1"
                max="30"
                step="1"
                value={tenure}
                onChange={(e) => setTenure(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold tracking-tighter mt-2">
                <span>1 Yr</span>
                <span>30 Yrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Results Section */}
        <div className="lg:col-span-5 relative group">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10 group-hover:bg-primary/10 transition-all duration-700"></div>
          <div className="h-full bg-white/80 backdrop-blur-2xl rounded-2xl p-8 border border-white/50 shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase mb-2">Monthly EMI</p>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-primary mb-8">
                {formatCurrency(results.emi)}
              </h2>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-slate-500 text-sm font-medium">Principal Amount</span>
                  </div>
                  <span className="text-slate-900 font-bold">{formatCurrency(loanAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                    <span className="text-slate-500 text-sm font-medium">Total Interest</span>
                  </div>
                  <span className="text-slate-900 font-bold">{formatCurrency(results.totalInterest)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 text-sm font-bold uppercase tracking-widest text-[10px]">Total Payable</span>
                  <span className="text-slate-900 text-2xl font-black">{formatCurrency(results.totalPayable)}</span>
                </div>
              </div>
            </div>

            {/* Visual Chart */}
            <div className="mt-12 flex justify-center scale-110">
              <div className="relative w-40 h-40 rounded-full border-[12px] border-secondary flex items-center justify-center">
                <svg className="absolute -inset-[12px] w-[calc(100%+24px)] h-[calc(100%+24px)] -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40"
                    fill="none"
                    stroke="#2F6FED"
                    strokeWidth="12"
                    strokeDasharray={`${results.principalPercent} 100`}
                    pathLength="100"
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="text-center">
                  <span className="block text-[8px] uppercase tracking-[0.2em] font-black text-slate-400 mb-1">Breakdown</span>
                  <span className="text-sm font-black text-slate-900 leading-none">
                    {results.principalPercent}% / {results.interestPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Amortization Schedule */}
      <section className="mt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black tracking-tight text-slate-900">Amortization Schedule</h3>
            <p className="text-slate-500 text-sm mt-1 font-medium">Yearly breakdown of your loan repayment.</p>
          </div>
          <button className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform bg-primary/5 px-4 py-2 rounded-full">
            Download Report 
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-100 shadow-sm">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Year</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Principal (A)</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Interest (B)</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Yearly Total</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {schedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 font-black text-slate-900">{row.year}</td>
                  <td className="px-8 py-5 text-slate-500 font-medium">{formatCurrency(row.principal)}</td>
                  <td className="px-8 py-5 text-slate-500 font-medium">{formatCurrency(row.interest)}</td>
                  <td className="px-8 py-5 text-slate-900 font-bold">{formatCurrency(row.totalPayment)}</td>
                  <td className="px-8 py-5 text-right font-black text-primary group-hover:scale-105 transition-transform origin-right">
                    {formatCurrency(row.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="mt-24 bg-slate-900 rounded-[3rem] p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[80px] translate-y-1/2 -translate-x-1/2 rounded-full"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">Ready to Lock in Your Rate?</h2>
          <p className="text-slate-400 text-lg mb-12 font-medium">
            Get exclusive pre-approved home loan offers from our banking partners 
            at competitive rates specifically for Mumbai's premium properties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-primary hover:bg-primary/90 text-white px-10 py-5 rounded-full font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 w-full sm:w-auto">
              Get Pre-Approved
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-10 py-5 rounded-full font-black text-lg border border-white/10 transition-all w-full sm:w-auto">
              Speak to Advisor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EMICalculator;
