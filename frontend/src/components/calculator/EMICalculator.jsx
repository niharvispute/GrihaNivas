'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

const getLocalEmiResult = (principal, annualInterestRate, tenureYears) => {
  const P = principal;
  const r = annualInterestRate / 12 / 100;
  const n = tenureYears * 12;

  if (!Number.isFinite(P) || !Number.isFinite(r) || !Number.isFinite(n) || n <= 0) {
    return {
      emi: 0,
      totalInterest: 0,
      totalPayable: 0,
      principalPercent: 0,
      interestPercent: 0,
    };
  }

  if (r === 0) {
    const emi = P / n;
    return {
      emi: Math.round(emi),
      totalInterest: 0,
      totalPayable: Math.round(P),
      principalPercent: 100,
      interestPercent: 0,
    };
  }

  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayable = emi * n;
  const totalInterest = totalPayable - P;

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayable: Math.round(totalPayable),
    principalPercent: Math.round((P / totalPayable) * 100),
    interestPercent: Math.round((totalInterest / totalPayable) * 100),
  };
};

const EMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState(7500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const results = useMemo(
    () => getLocalEmiResult(loanAmount, interestRate, tenure),
    [loanAmount, interestRate, tenure]
  );

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

  const downloadReport = () => {
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const principalPct = results.principalPercent;
    const interestPct = results.interestPercent;

    const scheduleRows = schedule.map((r) => `
      <tr>
        <td>${r.year}</td>
        <td>${formatCurrency(r.principal)}</td>
        <td>${formatCurrency(r.interest)}</td>
        <td>${formatCurrency(r.totalPayment)}</td>
        <td class="right">${formatCurrency(r.balance)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>EMI Report — GrihaNivas</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; font-size: 13px; background: #fff; }
  .page { max-width: 780px; margin: 0 auto; padding: 40px 48px; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #2F6FED; margin-bottom: 28px; }
  .brand { font-size: 22px; font-weight: 900; color: #2F6FED; letter-spacing: -0.5px; }
  .report-meta { text-align: right; }
  .report-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
  .report-date { font-size: 11px; color: #94a3b8; margin-top: 2px; }

  /* Loan Summary */
  .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 12px; }
  .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 32px; }
  .summary-cell { padding: 16px 20px; background: #fff; }
  .summary-cell:not(:last-child) { border-right: 1px solid #e2e8f0; }
  .summary-cell.highlight { background: #EAF2FF; }
  .summary-cell.emi { background: #2F6FED; color: #fff; }
  .cell-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; margin-bottom: 4px; }
  .summary-cell.emi .cell-label { color: rgba(255,255,255,0.7); }
  .cell-value { font-size: 17px; font-weight: 900; color: #1e293b; letter-spacing: -0.5px; }
  .summary-cell.emi .cell-value { color: #fff; font-size: 20px; }

  /* Breakdown bar */
  .breakdown { margin-bottom: 32px; }
  .bar-wrap { height: 10px; border-radius: 99px; overflow: hidden; background: #FF7A1A; margin-bottom: 10px; }
  .bar-principal { height: 100%; background: #2F6FED; border-radius: 99px; width: ${principalPct}%; }
  .bar-legend { display: flex; gap: 24px; }
  .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: #475569; }
  .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .dot-blue { background: #2F6FED; }
  .dot-orange { background: #FF7A1A; }

  /* Table */
  .amort-section { margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  thead tr { background: #f8fafc; }
  th { padding: 10px 12px; text-align: left; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; border-bottom: 1px solid #e2e8f0; }
  td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; color: #475569; font-weight: 500; }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: #fafafa; }
  td:first-child { font-weight: 800; color: #1e293b; }
  .right { text-align: right; font-weight: 700; color: #2F6FED; }

  /* Footer */
  .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
  .footer-note { font-size: 9px; color: #cbd5e1; }
  .powered { font-size: 9px; color: #94a3b8; font-weight: 600; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 24px 32px; }
    @page { margin: 0.5cm; size: A4 portrait; }
  }
</style>
</head>
<body onload="setTimeout(()=>window.print(),400)">
<div class="page">

  <div class="header">
    <div>
      <div class="brand">GrihaNivas</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:3px;">Mumbai's Real Estate Advisory</div>
    </div>
    <div class="report-meta">
      <div class="report-title">EMI Report — Loan Summary</div>
      <div class="report-date">Generated: ${today}</div>
    </div>
  </div>

  <div class="section-title">Loan Details</div>
  <div class="summary-grid">
    <div class="summary-cell">
      <div class="cell-label">Loan Amount</div>
      <div class="cell-value">${formatCurrency(loanAmount)}</div>
    </div>
    <div class="summary-cell">
      <div class="cell-label">Interest Rate</div>
      <div class="cell-value">${interestRate}%</div>
    </div>
    <div class="summary-cell">
      <div class="cell-label">Tenure</div>
      <div class="cell-value">${tenure} Yrs</div>
    </div>
    <div class="summary-cell emi">
      <div class="cell-label">Monthly EMI</div>
      <div class="cell-value">${formatCurrency(results.emi)}</div>
    </div>
    <div class="summary-cell highlight">
      <div class="cell-label">Total Interest</div>
      <div class="cell-value">${formatCurrency(results.totalInterest)}</div>
    </div>
    <div class="summary-cell highlight">
      <div class="cell-label">Total Payable</div>
      <div class="cell-value">${formatCurrency(results.totalPayable)}</div>
    </div>
  </div>

  <div class="breakdown">
    <div class="section-title">Principal vs Interest Breakdown</div>
    <div class="bar-wrap"><div class="bar-principal"></div></div>
    <div class="bar-legend">
      <div class="legend-item"><span class="dot dot-blue"></span> Principal ${principalPct}% — ${formatCurrency(loanAmount)}</div>
      <div class="legend-item"><span class="dot dot-orange"></span> Interest ${interestPct}% — ${formatCurrency(results.totalInterest)}</div>
    </div>
  </div>

  <div class="amort-section">
    <div class="section-title">Amortization Schedule (Yearly)</div>
    <table>
      <thead>
        <tr>
          <th>Year</th>
          <th>Principal Paid</th>
          <th>Interest Paid</th>
          <th>Total Payment</th>
          <th class="right">Outstanding Balance</th>
        </tr>
      </thead>
      <tbody>${scheduleRows}</tbody>
    </table>
  </div>

  <div class="footer">
    <div class="footer-note">This is a computer-generated report. Values are indicative and may vary.</div>
    <div class="powered">Powered by Shree Gurudev Properties</div>
  </div>

</div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
  };

  const principalShare = Math.max(0, Math.min(100, Number(results.principalPercent) || 0));
  const interestShare = Math.max(0, Math.min(100, Number(results.interestPercent) || 0));

  const chartRadius = 56;
  const chartCircumference = 2 * Math.PI * chartRadius;
  const principalArc = (principalShare / 100) * chartCircumference;
  const interestArc = (interestShare / 100) * chartCircumference;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 font-sans">
      {/* 1. Header */}
      <div className="text-center mb-8 md:mb-16">
        <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 mb-2 md:mb-4">
          EMI Calculator
        </h1>
        <p className="text-slate-500 text-sm md:text-lg max-w-2xl mx-auto font-bold px-4">
          Plan your home ownership journey with precision. 
          Calculate monthly payments and view your interest breakdown instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-12 md:mb-20">
        {/* 2. Inputs Section */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 md:p-8 border border-slate-100 shadow-sm">
          <div className="space-y-6 md:space-y-10">
            {/* Loan Amount */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-slate-400 font-bold text-[9px] md:text-[10px] tracking-widest uppercase">
                  Loan Amount
                </label>
                <div className="relative">
                  <span className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs md:text-base">₹</span>
                  <input
                    type="text"
                    value={loanAmount.toLocaleString('en-IN')}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value.replace(/,/g, '')) || 0);
                      setLoanAmount(val);
                    }}
                    className="pl-6 md:pl-8 pr-3 md:pr-4 py-1.5 md:py-2 bg-slate-50 border-none rounded-lg md:rounded-xl text-right font-bold text-slate-900 focus:ring-1 focus:ring-primary/20 w-32 md:w-40 text-sm md:text-base"
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
                className="w-full h-1 md:h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[9px] md:text-[10px] text-slate-400 font-bold tracking-tighter mt-1 md:mt-2">
                <span>₹ 1L</span>
                <span>₹ 5Cr</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-slate-400 font-bold text-[9px] md:text-[10px] tracking-widest uppercase">
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="pr-6 md:pr-8 pl-3 md:pl-4 py-1.5 md:py-2 bg-slate-50 border-none rounded-lg md:rounded-xl text-right font-bold text-slate-900 focus:ring-1 focus:ring-primary/20 w-24 md:w-32 text-sm md:text-base"
                  />
                  <span className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs md:text-base">%</span>
                </div>
              </div>
              <input 
                type="range"
                min="5"
                max="20"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full h-1 md:h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[9px] md:text-[10px] text-slate-400 font-bold tracking-tighter mt-1 md:mt-2">
                <span>5%</span>
                <span>20%</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-slate-400 font-bold text-[9px] md:text-[10px] tracking-widest uppercase">
                  Loan Tenure
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={tenure}
                    onChange={(e) => setTenure(Math.max(0, parseInt(e.target.value) || 0))}
                    className="pr-10 md:pr-12 pl-3 md:pl-4 py-1.5 md:py-2 bg-slate-50 border-none rounded-lg md:rounded-xl text-right font-bold text-slate-900 focus:ring-1 focus:ring-primary/20 w-24 md:w-32 text-sm md:text-base"
                  />
                  <span className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs md:text-base">Yrs</span>
                </div>
              </div>
              <input 
                type="range"
                min="1"
                max="30"
                step="1"
                value={tenure}
                onChange={(e) => setTenure(parseInt(e.target.value))}
                className="w-full h-1 md:h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[9px] md:text-[10px] text-slate-400 font-bold tracking-tighter mt-1 md:mt-2">
                <span>1 Yr</span>
                <span>30 Yrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Results Section */}
        <div className="lg:col-span-5 relative group">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10 group-hover:bg-primary/10 transition-all duration-700"></div>
          <div className="h-full bg-white/80 backdrop-blur-2xl rounded-2xl p-6 md:p-8 border border-white/50 shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-slate-400 font-bold text-[9px] md:text-[10px] tracking-widest uppercase mb-1 md:mb-2">Monthly EMI</p>
              <div className="flex items-baseline gap-1 text-primary mb-6 md:mb-8 leading-none font-sans text-3xl md:text-6xl font-black tracking-tight tabular-nums">
                <span>₹</span>
                <span>{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(results.emi)}</span>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    <span className="text-slate-500 text-xs md:text-sm font-bold">Principal Amount</span>
                  </div>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{formatCurrency(loanAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
                    <span className="text-slate-500 text-xs md:text-sm font-bold">Total Interest</span>
                  </div>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{formatCurrency(results.totalInterest)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-1 md:pt-2">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[8px] md:text-[10px]">Total Payable</span>
                  <span className="text-slate-900 text-lg md:text-2xl font-black">{formatCurrency(results.totalPayable)}</span>
                </div>
              </div>
            </div>

            {/* Visual Chart */}
            <div className="mt-8 md:mt-10 flex items-center justify-center">
              <div className="relative w-44 h-44 md:w-48 md:h-48">
                <div className="absolute inset-4 rounded-full bg-primary/10 blur-2xl" />
                <svg viewBox="0 0 160 160" className="relative w-full h-full -rotate-90">
                  <defs>
                    <linearGradient id="emiPrincipalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2F6FED" />
                      <stop offset="100%" stopColor="#5DA8FF" />
                    </linearGradient>
                    <linearGradient id="emiInterestGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF7A1A" />
                      <stop offset="100%" stopColor="#FFC266" />
                    </linearGradient>
                  </defs>

                  <circle
                    cx="80"
                    cy="80"
                    r={chartRadius}
                    fill="none"
                    stroke="#EEF2FF"
                    strokeWidth="14"
                  />

                  <circle
                    cx="80"
                    cy="80"
                    r={chartRadius}
                    fill="none"
                    stroke="url(#emiPrincipalGradient)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${principalArc} ${chartCircumference}`}
                    strokeDashoffset="0"
                    className="transition-all duration-700 ease-out"
                  />

                  <circle
                    cx="80"
                    cy="80"
                    r={chartRadius}
                    fill="none"
                    stroke="url(#emiInterestGradient)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${interestArc} ${chartCircumference}`}
                    strokeDashoffset={-principalArc}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center bg-white/90 backdrop-blur-sm rounded-full w-24 h-24 md:w-28 md:h-28 flex flex-col items-center justify-center border border-slate-100 shadow-lg">
                    <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-black text-slate-400">Interest</span>
                    <span className="text-xl md:text-2xl font-black tracking-tighter text-secondary leading-none">{interestShare}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Amortization Schedule */}
      <section className="mt-12 md:mt-24">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">Amortization Schedule</h3>
            <p className="text-slate-500 text-[10px] md:text-sm mt-0.5 md:mt-1 font-bold">Yearly breakdown of your loan repayment journey.</p>
          </div>
          <button
            type="button"
            onClick={downloadReport}
            className="text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-full leading-none active:scale-95"
          >
            Download Report
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="md:w-3.5 md:h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm no-scrollbar">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black tracking-widest uppercase text-slate-400">Year</th>
                <th className="px-4 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black tracking-widest uppercase text-slate-400">Principal</th>
                <th className="px-4 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black tracking-widest uppercase text-slate-400">Interest</th>
                <th className="px-4 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black tracking-widest uppercase text-slate-400">Total</th>
                <th className="px-4 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black tracking-widest uppercase text-slate-400 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {schedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 md:px-8 py-3 md:py-5 font-black text-slate-900 text-xs md:text-base">{row.year}</td>
                  <td className="px-4 md:px-8 py-3 md:py-5 text-slate-500 font-bold text-[10px] md:text-sm whitespace-nowrap">{formatCurrency(row.principal)}</td>
                  <td className="px-4 md:px-8 py-3 md:py-5 text-slate-500 font-bold text-[10px] md:text-sm whitespace-nowrap">{formatCurrency(row.interest)}</td>
                  <td className="px-4 md:px-8 py-3 md:py-5 text-slate-900 font-bold text-[10px] md:text-sm whitespace-nowrap">{formatCurrency(row.totalPayment)}</td>
                  <td className="px-4 md:px-8 py-3 md:py-5 text-right font-black text-primary group-hover:scale-105 transition-transform origin-right text-[10px] md:text-sm whitespace-nowrap">
                    {formatCurrency(row.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="mt-12 md:mt-24 bg-slate-900 rounded-2xl p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-primary/20 blur-[60px] md:blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-secondary/10 blur-[50px] md:blur-[80px] translate-y-1/2 -translate-x-1/2 rounded-full"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-5xl font-black tracking-tighter mb-4 md:mb-6">Ready to Lock in Your Rate?</h2>
          <p className="text-slate-400 text-sm md:text-lg mb-8 md:mb-12 font-bold">
            Get exclusive pre-approved home loan offers from our banking partners 
            at competitive rates specifically for Mumbai's premium properties.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <Link 
              href={`/contact?message=I would like to speak to an advisor regarding my home loan EMI calculation for a loan amount of ₹${(loanAmount / 100000).toFixed(1)} Lacs at ${interestRate}% interest for ${tenure} years.`}
              className="bg-primary hover:bg-primary/90 text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-black text-base md:text-lg shadow-xl transition-all active:scale-95 w-full sm:w-auto leading-none text-center"
            >
              Speak to Advisor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EMICalculator;
