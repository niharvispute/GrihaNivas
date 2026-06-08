'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

// ─── Property Purchase helpers ────────────────────────────────────────────────

const DEFAULT_RATES = {
  buy: { maleRate: 6, femaleRate: 5, jointRate: 5, registrationCharge: 30000 },
  rent: { maleRate: 2, femaleRate: 2, jointRate: 2, registrationCharge: 1000 },
};

const computePurchaseResult = (propertyValue, buyerType, rateSet) => {
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

// ─── Leave & License helpers (mirrors backend formula exactly) ────────────────

const computeRentResult = (form, dhc) => {
  const months = Number(form.licensePeriodMonths) || 0;

  let totalRent = 0;
  if (form.rentType === 'fixed') {
    totalRent = (Number(form.fixedMonthlyRent) || 0) * months;
  } else {
    totalRent = form.varyingRentRows.reduce((sum, row) => {
      const from = Number(row.fromMonth) || 0;
      const to = Number(row.toMonth) || 0;
      const slabMonths = to >= from ? to - from + 1 : 0;
      return sum + (Number(row.monthlyRent) || 0) * slabMonths;
    }, 0);
  }

  const periodYears = months / 12;
  const refDeposit = Number(form.refundableDeposit) || 0;
  const nonRefDeposit = Number(form.nonRefundableDeposit) || 0;
  const notionalInterest = refDeposit * 0.1 * periodYears;
  const stampableAmount = totalRent + nonRefDeposit + notionalInterest;
  const stampDuty = Math.ceil(stampableAmount * 0.0025);
  const registrationFee = form.propertyArea === 'urban' ? 1000 : 500;
  const dhcAmount = Number(dhc) || 300;

  return {
    totalRent: Math.round(totalRent),
    notionalInterest: Math.round(notionalInterest),
    stampableAmount: Math.round(stampableAmount),
    stampDuty,
    registrationFee,
    dhc: dhcAmount,
    totalPayable: stampDuty + registrationFee + dhcAmount,
  };
};

const EMPTY_ROW = () => ({ fromMonth: '', toMonth: '', monthlyRent: '' });

// ─── Shared ───────────────────────────────────────────────────────────────────

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

const FAQS = [
  {
    q: 'What are the current stamp duty rates in Mumbai?',
    a: "As of 2024, the standard stamp duty rate in Mumbai for buying is 6% (which includes a 1% Metro Cess). For female buyers, there is a 1% concession, bringing the rate down to 5%.",
  },
  {
    q: 'Are there any tax benefits on stamp duty?',
    a: "Yes, under Section 80C of the Income Tax Act, you can claim a deduction of up to ₹1.5 Lakhs on the amount paid for stamp duty and registration charges during the year of purchase.",
  },
  {
    q: 'When should I pay the stamp duty?',
    a: "Stamp duty must be paid before or at the time of executing the sale deed. Delay in payment can lead to significant penalties, often ranging from 2% to 200% of the deficit amount.",
  },
  {
    q: 'What is the Ready Reckoner Rate and how does it affect my calculation?',
    a: "The Ready Reckoner Rate (RRR) is the minimum property valuation fixed annually by the Maharashtra Government. Stamp duty is calculated on the higher of either your agreement value or the RRR.",
  },
  {
    q: 'How is stamp duty calculated for a Leave & License agreement?',
    a: "For rental agreements, stamp duty is 0.25% of the stampable amount — which includes total rent, non-refundable deposit, and notional interest (10% p.a.) on the refundable deposit. Registration is a flat ₹1,000 (urban) or ₹500 (rural).",
  },
  {
    q: 'How can I legally reduce my stamp duty liability in Mumbai?',
    a: "Three legitimate methods: (a) Register in a woman's name — female buyers pay 5% vs 6%; (b) Claim Section 80C deduction — up to ₹1.5 Lakhs on stamp duty and registration charges; (c) For joint registrations where the primary owner is female, the female rate applies.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const LabelTag = ({ children }) => (
  <label className="block text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 mb-2 md:mb-3">
    {children}
  </label>
);

const ToggleGroup = ({ options, value, onChange, cols = 2 }) => (
  <div className={`grid grid-cols-${cols} gap-2 md:gap-4`}>
    {options.map((opt) => (
      <button
        key={opt.id}
        type="button"
        onClick={() => onChange(opt.id)}
        className={`py-2.5 md:py-3 px-4 rounded-xl border-2 font-bold text-sm md:text-base transition-all active:scale-95 ${
          value === opt.id
            ? 'border-primary bg-primary/5 text-primary shadow-md md:shadow-lg'
            : 'border-slate-100 text-slate-500 hover:border-slate-200'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const MoneyInput = ({ value, onChange, placeholder = '0', prefix = '₹', suffix }) => (
  <div className="relative group">
    {prefix && (
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 group-focus-within:text-primary transition-colors">
        {prefix}
      </span>
    )}
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full bg-slate-50 border border-slate-100 rounded-xl py-3 md:py-3.5 ${prefix ? 'pl-8' : 'pl-4'} ${suffix ? 'pr-20' : 'pr-4'} text-base md:text-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-slate-300`}
    />
    {suffix && (
      <span className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
        {suffix}
      </span>
    )}
  </div>
);

const ResultRow = ({ label, sub, value, large, accent }) => (
  <div className="flex justify-between items-end">
    <div className="space-y-0.5 md:space-y-1">
      <span className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest block leading-none">{label}</span>
      {sub && <span className="text-slate-600 text-xs md:text-base font-bold">{sub}</span>}
    </div>
    <span className={`font-black ${large ? 'text-2xl md:text-4xl text-slate-900' : accent ? 'text-xl md:text-3xl text-primary' : 'text-lg md:text-xl text-slate-900'}`}>
      {formatCurrency(value)}
    </span>
  </div>
);

// ─── Purchase Calculator ──────────────────────────────────────────────────────

const PurchaseCalculator = ({ allRates, propertyValue, setPropertyValue }) => {
  const [buyerType, setBuyerType] = useState('male');
  const [propertyType, setPropertyType] = useState('buy');

  const currentRates = allRates[propertyType];
  const results = computePurchaseResult(propertyValue, buyerType, currentRates);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
      {/* Inputs */}
      <div className="lg:col-span-7 p-6 md:p-10 border-b lg:border-r lg:border-b-0 border-slate-100">
        <div className="space-y-6 md:space-y-8">
          <div>
            <LabelTag>Property Value (INR)</LabelTag>
            <MoneyInput
              value={propertyValue.toLocaleString('en-IN')}
              onChange={(e) => setPropertyValue(parseInt(e.target.value.replace(/,/g, '')) || 0)}
              placeholder="50,000,000"
            />
          </div>

          <div>
            <LabelTag>Buyer Type</LabelTag>
            <ToggleGroup
              options={[{ id: 'male', label: 'Male' }, { id: 'female', label: 'Female' }, { id: 'joint', label: 'Joint' }]}
              value={buyerType}
              onChange={setBuyerType}
              cols={3}
            />
          </div>

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

      {/* Results */}
      <div className="lg:col-span-5 bg-slate-50/50 p-6 md:p-10 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-primary/5 blur-3xl -z-10 rounded-full" />
        <div>
          <h3 className="text-lg md:text-xl font-black text-slate-900 mb-6 md:mb-10 tracking-tight">Summary of Charges</h3>
          <div className="space-y-6 md:space-y-8">
            <ResultRow label="Stamp Duty" sub={`at ${results.stampDutyRateLabel} Rate`} value={results.stampDuty} accent />
            <ResultRow label="Registration" sub="Flat Charge" value={results.registrationCharges} />
            <div className="pt-6 md:pt-10 border-t border-slate-200">
              <ResultRow label="Total Payable" value={results.totalPayable} large />
            </div>
          </div>
        </div>

        <div className="mt-10 md:mt-16 space-y-3 md:space-y-4">
          <Link href="/home-loan" className="w-full py-3 md:py-3.5 rounded-xl bg-primary text-white font-black text-center text-sm md:text-base shadow-lg hover:bg-primary/90 transition-all leading-none block">
            Apply for Home Loan
          </Link>
          <Link
            href={`/contact?message=I would like to consult an expert regarding stamp duty and registration for a property valued at ₹${(propertyValue / 10000000).toFixed(2)} Cr.`}
            className="w-full py-3 md:py-3.5 rounded-xl border-2 border-primary text-primary font-black text-center text-sm md:text-base hover:bg-primary/5 transition-all leading-none block"
          >
            Contact Expert
          </Link>
        </div>
      </div>
    </section>
  );
};

// ─── Leave & License Calculator ───────────────────────────────────────────────

const LicenseCalculator = ({ dhc, propertyValue }) => {
  const [form, setForm] = useState({
    licensePeriodMonths: '',
    rentType: 'fixed',
    fixedMonthlyRent: '',
    varyingRentRows: [EMPTY_ROW()],
    refundableDeposit: '',
    nonRefundableDeposit: '',
    propertyArea: '',
    fromDate: '',
    toDate: '',
  });
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    const months = Number(form.licensePeriodMonths);
    if (!form.fromDate || !months || months < 1) return;
    const from = new Date(form.fromDate);
    from.setMonth(from.getMonth() + months);
    from.setDate(from.getDate() - 1); // last day of agreement
    const toDate = from.toISOString().split('T')[0];
    setForm((f) => ({ ...f, toDate }));
  }, [form.fromDate, form.licensePeriodMonths]);

  const updateRow = (idx, key, val) =>
    setForm((f) => {
      const rows = [...f.varyingRentRows];
      rows[idx] = { ...rows[idx], [key]: val };
      return { ...f, varyingRentRows: rows };
    });

  const addRow = () => setForm((f) => ({ ...f, varyingRentRows: [...f.varyingRentRows, EMPTY_ROW()] }));

  const removeRow = (idx) =>
    setForm((f) => ({
      ...f,
      varyingRentRows: f.varyingRentRows.filter((_, i) => i !== idx),
    }));

  const validate = () => {
    const e = {};
    if (!form.licensePeriodMonths || Number(form.licensePeriodMonths) < 1)
      e.licensePeriodMonths = 'Enter license period';
    if (form.rentType === 'fixed' && (!form.fixedMonthlyRent || Number(form.fixedMonthlyRent) < 0))
      e.fixedMonthlyRent = 'Enter monthly rent';
    if (form.rentType === 'varying' && form.varyingRentRows.length === 0)
      e.varyingRentRows = 'Add at least one rent slab';
    if (!form.propertyArea)
      e.propertyArea = 'Select property area';
    return e;
  };

  const handleCalculate = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setResults(computeRentResult(form, dhc));
  };

  const inputCls = (err) =>
    `w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-slate-300 ${
      err ? 'border-rose-300' : 'border-slate-100'
    }`;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
      {/* Inputs */}
      <div className="lg:col-span-7 p-6 md:p-12 border-b lg:border-r lg:border-b-0 border-slate-100">
        <div className="space-y-8 md:space-y-10">

          {/* License Period */}
          <div>
            <LabelTag>License Period (months) *</LabelTag>
            <div className="relative group">
              <input
                type="number"
                min="1"
                max="120"
                value={form.licensePeriodMonths}
                onChange={(e) => set('licensePeriodMonths', e.target.value)}
                placeholder="11"
                className={`w-full bg-slate-50 border rounded-xl py-3 md:py-3.5 px-4 text-base md:text-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-slate-300 ${errors.licensePeriodMonths ? 'border-rose-300' : 'border-slate-100'}`}
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">months</span>
            </div>
            {errors.licensePeriodMonths && <p className="mt-1.5 text-xs font-bold text-rose-500">{errors.licensePeriodMonths}</p>}
          </div>

          {/* From / To Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <LabelTag>From Date</LabelTag>
              <input
                type="date"
                value={form.fromDate}
                onChange={(e) => set('fromDate', e.target.value)}
                className={inputCls(false)}
              />
            </div>
            <div>
              <LabelTag>To Date {form.toDate && form.fromDate && form.licensePeriodMonths ? <span className="text-primary normal-case tracking-normal font-bold">(auto)</span> : null}</LabelTag>
              <input
                type="date"
                value={form.toDate}
                onChange={(e) => set('toDate', e.target.value)}
                className={`${inputCls(false)} ${form.toDate && form.fromDate && form.licensePeriodMonths ? 'text-primary' : ''}`}
              />
            </div>
          </div>

          {/* Rent Type */}
          <div>
            <LabelTag>Select Rent Type</LabelTag>
            <ToggleGroup
              options={[{ id: 'fixed', label: 'Fixed Rent' }, { id: 'varying', label: 'Varying Rent' }]}
              value={form.rentType}
              onChange={(v) => set('rentType', v)}
              cols={2}
            />
          </div>

          {/* Fixed Monthly Rent */}
          {form.rentType === 'fixed' && (
            <div>
              <LabelTag>Average Monthly Rent *</LabelTag>
              <MoneyInput
                value={form.fixedMonthlyRent}
                onChange={(e) => set('fixedMonthlyRent', e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="25,000"
              />
              {errors.fixedMonthlyRent && <p className="mt-1.5 text-xs font-bold text-rose-500">{errors.fixedMonthlyRent}</p>}
            </div>
          )}

          {/* Varying Rent Rows */}
          {form.rentType === 'varying' && (
            <div>
              <LabelTag>Rent Slabs *</LabelTag>
              <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-[9px] font-black tracking-widest uppercase text-slate-400 px-1">
                  <span>From Month</span>
                  <span>To Month</span>
                  <span>Monthly Rent (₹)</span>
                  <span />
                </div>
                {form.varyingRentRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                    <input
                      type="number"
                      min="1"
                      value={row.fromMonth}
                      onChange={(e) => updateRow(idx, 'fromMonth', e.target.value)}
                      placeholder="1"
                      className={inputCls(false)}
                    />
                    <input
                      type="number"
                      min="1"
                      value={row.toMonth}
                      onChange={(e) => updateRow(idx, 'toMonth', e.target.value)}
                      placeholder="6"
                      className={inputCls(false)}
                    />
                    <input
                      type="number"
                      min="0"
                      value={row.monthlyRent}
                      onChange={(e) => updateRow(idx, 'monthlyRent', e.target.value)}
                      placeholder="25000"
                      className={inputCls(false)}
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      disabled={form.varyingRentRows.length === 1}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-2 text-primary font-black text-sm hover:text-primary/70 transition-colors mt-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  Add Slab
                </button>
              </div>
              {errors.varyingRentRows && <p className="mt-1.5 text-xs font-bold text-rose-500">{errors.varyingRentRows}</p>}
            </div>
          )}

          {/* Deposits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <LabelTag>Refundable Deposit (Rs)</LabelTag>
              <MoneyInput
                value={form.refundableDeposit}
                onChange={(e) => set('refundableDeposit', e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
              />
            </div>
            <div>
              <LabelTag>Non-Refundable Deposit (Rs)</LabelTag>
              <MoneyInput
                value={form.nonRefundableDeposit}
                onChange={(e) => set('nonRefundableDeposit', e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Property Area */}
          <div>
            <LabelTag>Property in Area *</LabelTag>
            <ToggleGroup
              options={[{ id: 'urban', label: 'Urban' }, { id: 'rural', label: 'Rural' }]}
              value={form.propertyArea}
              onChange={(v) => set('propertyArea', v)}
              cols={2}
            />
            {errors.propertyArea && <p className="mt-1.5 text-xs font-bold text-rose-500">{errors.propertyArea}</p>}
          </div>

          {/* Calculate */}
          <button
            type="button"
            onClick={handleCalculate}
            className="w-full py-3 md:py-3.5 rounded-xl bg-primary text-white font-black text-sm md:text-base shadow-lg hover:bg-primary/90 active:scale-95 transition-all leading-none"
          >
            Calculate
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-5 bg-slate-50/50 p-6 md:p-10 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-primary/5 blur-3xl -z-10 rounded-full" />

        <div>
          <h3 className="text-lg md:text-xl font-black text-slate-900 mb-6 md:mb-10 tracking-tight">
            {results ? 'Breakdown' : 'Charges Breakdown'}
          </h3>

          {!results ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-primary/5 flex items-center justify-center mb-4 md:mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary md:w-10 md:h-10"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="8" x2="16" y1="10" y2="10"/><line x1="8" x2="12" y1="14" y2="14"/></svg>
              </div>
              <p className="font-black text-slate-400 text-sm md:text-base">Fill in the details and click Calculate</p>
            </div>
          ) : (
            <div className="space-y-5 md:space-y-6">
              <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 space-y-4">
                <p className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-400">Computation</p>
                <div className="space-y-3">
                  {[
                    { label: 'Total Rent', value: results.totalRent },
                    { label: 'Non-Refundable Deposit', value: results.nonRefundableDeposit ?? 0 },
                    { label: 'Notional Interest (10% p.a.)', value: results.notionalInterest },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between text-sm font-bold">
                      <span className="text-slate-500">{r.label}</span>
                      <span className="text-slate-700">{formatCurrency(r.value)}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-black">
                    <span className="text-slate-700">Stampable Amount</span>
                    <span className="text-slate-900">{formatCurrency(results.stampableAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <ResultRow label="Stamp Duty" sub="at 0.25% (rounded up)" value={results.stampDuty} accent />
                <ResultRow label="Registration Fees" sub={form.propertyArea === 'urban' ? 'Urban — Flat' : 'Rural — Flat'} value={results.registrationFee} />
                <ResultRow label="DHC" sub="Document Handling Charges" value={results.dhc} />
                <div className="pt-5 md:pt-8 border-t border-slate-200">
                  <ResultRow label="Total Payable" value={results.totalPayable} large />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 md:mt-12 space-y-3 md:space-y-4">
          <Link
            href="/contact?message=I need help with my Leave and License agreement stamp duty."
            className="w-full py-3 md:py-3.5 rounded-xl bg-primary text-white font-black text-center text-sm md:text-base shadow-lg hover:bg-primary/90 transition-all leading-none block"
          >
            Get Agreement Help
          </Link>
          <Link
            href="/contact"
            className="w-full py-3 md:py-3.5 rounded-xl border-2 border-primary text-primary font-black text-center text-sm md:text-base hover:bg-primary/5 transition-all leading-none block"
          >
            Contact Expert
          </Link>
        </div>
      </div>
    </section>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const StampDutyCalculator = () => {
  const [activeTab, setActiveTab] = useState('purchase');
  const [allRates, setAllRates] = useState(DEFAULT_RATES);
  const [dhc, setDhc] = useState(300);
  const [propertyValue, setPropertyValue] = useState(50000000);

  useEffect(() => {
    apiFetch('/api/stamp-duty')
      .then((res) => {
        const data = res.data || {};
        setAllRates({
          buy: { ...DEFAULT_RATES.buy, ...(data.buy || {}) },
          rent: { ...DEFAULT_RATES.rent, ...(data.rent || {}) },
        });
        if (data.dhc != null) setDhc(data.dhc);
      })
      .catch(() => {});
  }, []);

  const tabs = [
    { id: 'purchase', label: 'Property Purchase' },
    { id: 'license', label: 'Leave & License' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 font-sans">
      {/* Header */}
      <header className="mb-8 md:mb-12 text-center">
        <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 mb-2 md:mb-4 px-2">
          Stamp Duty & Registration
        </h1>
        <p className="text-slate-500 text-sm md:text-xl font-bold max-w-3xl mx-auto px-4">
          Calculate precise property charges for your Mumbai real estate investment based on the latest rates.
        </p>
      </header>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 md:mb-8 bg-slate-100 rounded-2xl p-1.5 max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 md:py-4 rounded-xl font-black text-sm md:text-base transition-all ${
              activeTab === tab.id
                ? 'bg-white text-primary shadow-md'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Calculator */}
      {activeTab === 'purchase' ? (
        <PurchaseCalculator allRates={allRates} propertyValue={propertyValue} setPropertyValue={setPropertyValue} />
      ) : (
        <LicenseCalculator dhc={dhc} propertyValue={propertyValue} />
      )}

      {/* Disclaimer */}
      <p className="mt-6 md:mt-8 text-center text-slate-400 text-[10px] md:text-xs font-bold px-4">
        * Estimates based on current Mumbai municipal rates. Ready Reckoner Rates may apply.
      </p>

      {/* Info Section */}
      <section className="mt-16 md:mt-32 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start px-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 md:mb-8 tracking-tighter">Understanding Stamp Duty</h2>
          <div className="space-y-4 md:space-y-6 text-slate-500 leading-relaxed font-bold text-sm md:text-lg">
            <p>
              Stamp duty is a mandatory legal tax paid for asset acquisition.
              In Mumbai, these are set by the State Government of Maharashtra.
            </p>
            <p>
              Calculations are based on the higher value between the transaction price and the{' '}
              <span className="text-primary font-bold">Ready Reckoner Rate</span>.
            </p>
          </div>
        </div>
        <div className="bg-primary/5 rounded-2xl p-6 md:p-10 border border-primary/10">
          <h3 className="text-lg md:text-xl font-black text-primary mb-4 md:mb-6">Key Considerations</h3>
          <ul className="space-y-4 md:space-y-6">
            {[
              { text: 'Calculations apply to the higher of sale value or govt rate.' },
              { text: 'Rates differ slightly across various Mumbai sectors.' },
              { text: 'Women buyers receive a 1% concession in Maharashtra.' },
              { text: 'Leave & License stamp duty is 0.25% of total stampable amount.' },
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

      {/* FAQ Section */}
      <section className="mt-16 md:mt-32 max-w-4xl mx-auto px-2">
        <h2 className="text-2xl md:text-4xl font-black text-center text-slate-900 mb-8 md:mb-16 tracking-tighter">Expert Insights & FAQs</h2>
        <div className="space-y-3 md:space-y-6">
          {FAQS.map((faq, i) => (
            <details key={i} className="group bg-slate-50 rounded-2xl p-5 md:p-8 border border-slate-100 cursor-pointer transition-all hover:bg-white">
              <summary className="flex justify-between items-center text-base md:text-xl font-black text-slate-900 list-none group-open:text-primary transition-colors">
                {faq.q}
                <div className="bg-white p-1.5 md:p-2 rounded-full shadow-sm group-open:rotate-180 transition-transform shrink-0 ml-4">
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

      {/* CTA Section */}
      <section className="mt-16 md:mt-32 relative h-80 md:h-125 rounded-2xl overflow-hidden group shadow-2xl bg-slate-900">
        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-primary/20" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #b80049 0%, transparent 60%)' }} />
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-24 md:max-w-3xl">
          <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-3 md:mb-6">Concierge Advisory</span>
          <h2 className="text-3xl md:text-6xl font-black text-white mb-4 md:mb-8 leading-tight tracking-tighter">
            Complexity, <br />Simplified.
          </h2>
          <p className="text-slate-300 text-sm md:text-xl mb-6 md:mb-12 font-bold leading-relaxed max-w-sm md:max-w-none">
            Our experts manage the intricacies of Mumbai real estate documentation, ensuring a seamless transition.
          </p>
          <div className="flex">
            <Link
              href={`/contact?message=I would like to request a professional consultation regarding property documentation and stamp duty.`}
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
