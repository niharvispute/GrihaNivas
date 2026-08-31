'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/api/errors';
import { toIndianPhoneE164 } from '@/lib/validation/phone';
import { createLead } from '@/services/leadService';
import SuccessModal from '@/components/common/SuccessModal';

const DRAFT_KEY = 'lead_draft:loan';

// Monthly Income / Loan Amount are currency fields: keep only digits so
// letters and special characters can never be entered, and cap the length to
// avoid absurd values. Grouping separators are added purely for display.
const DIGITS_ONLY_MAX = 12;
const toDigits = (value) => String(value ?? '').replace(/\D/g, '').slice(0, DIGITS_ONLY_MAX);
const formatIndianDigits = (digits) =>
  digits ? Number(digits).toLocaleString('en-IN') : '';

export default function HomeLoanForm({ title = "Apply for Home Loan" }) {
  const { user, openModal } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    monthlyIncome: '',
    loanAmount: '',
    preferredBank: 'No preference',
  });
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [queuedSubmit, setQueuedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [phoneError, setPhoneError] = useState('');
  const [amountErrors, setAmountErrors] = useState({ monthlyIncome: '', loanAmount: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        // A draft saved before these fields were digits-only can still hold
        // letters, so scrub the amounts on restore.
        setForm((prev) => ({
          ...prev,
          ...parsed,
          monthlyIncome: toDigits(parsed.monthlyIncome),
          loanAmount: toDigits(parsed.loanAmount),
        }));
      }
    } catch (_error) {}
    setHasLoadedDraft(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !hasLoadedDraft) return;
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form, hasLoadedDraft]);

  const parseAmount = (value) => {
    const numeric = Number(String(value || '').replace(/[^\d]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (field === 'phone') setPhoneError('');
  };

  // Strips anything that is not a digit as the user types, so alphabets and
  // special characters are rejected at entry instead of silently at submit.
  const handleAmountChange = (field) => (event) => {
    const digits = toDigits(event.target.value);
    setForm((prev) => ({ ...prev, [field]: digits }));
    setAmountErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
  };

  const submitLead = useCallback(async () => {
    const phone = toIndianPhoneE164(form.phone);

    if (!phone) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid 10-digit Indian mobile number.',
      });
      return;
    }

    // Defensive: entry is already digits-only, but never send a non-numeric
    // amount if anything (an old draft, autofill) slipped through.
    const nextAmountErrors = { monthlyIncome: '', loanAmount: '' };
    if (form.monthlyIncome && toDigits(form.monthlyIncome) !== String(form.monthlyIncome)) {
      nextAmountErrors.monthlyIncome = 'Enter numbers only.';
    }
    if (form.loanAmount && toDigits(form.loanAmount) !== String(form.loanAmount)) {
      nextAmountErrors.loanAmount = 'Enter numbers only.';
    }
    if (nextAmountErrors.monthlyIncome || nextAmountErrors.loanAmount) {
      setAmountErrors(nextAmountErrors);
      setFeedback({ type: 'error', message: 'Monthly income and loan amount must be numbers.' });
      return;
    }
    setAmountErrors(nextAmountErrors);

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const monthlyIncome = parseAmount(form.monthlyIncome);
      const loanAmount = parseAmount(form.loanAmount);

      await createLead({
        name: form.name.trim(),
        phone,
        email: form.email.trim() || undefined,
        leadType: 'loan',
        monthlyIncome: monthlyIncome || undefined,
        budgetMax: loanAmount || undefined,
        message: `Preferred bank: ${form.preferredBank}`,
      });

      setShowSuccess(true);
      setFeedback({ type: '', message: '' });
      setForm({
        name: '',
        phone: '',
        email: '',
        monthlyIncome: '',
        loanAmount: '',
        preferredBank: 'No preference',
      });
      setAmountErrors({ monthlyIncome: '', loanAmount: '' });
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(DRAFT_KEY);
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to submit loan request right now.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form]);

  useEffect(() => {
    if (!user || !queuedSubmit || isSubmitting) return;
    setQueuedSubmit(false);
    void submitLead();
  }, [user, queuedSubmit, isSubmitting, submitLead]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      setQueuedSubmit(true);
      setFeedback({ type: 'error', message: 'Please login to submit your loan request.' });
      openModal('login');
      return;
    }

    await submitLead();
  };

  return (
    <>
    <SuccessModal
      isOpen={showSuccess}
      onClose={() => setShowSuccess(false)}
      title="Request Submitted!"
      message="Our loan expert will call you soon."
    />
    <div className="bg-white p-10 rounded-2xl shadow-2xl relative border border-slate-50 overflow-hidden">
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary rounded-full blur-3xl opacity-10"></div>
      <form className="space-y-6 relative" onSubmit={handleSubmit}>
        <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tighter">{title}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Full Name</label>
            <input 
              className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900" 
              placeholder="e.g. Rahul Sharma" 
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Phone Number</label>
            <input
              className={`w-full bg-slate-50 rounded-2xl p-4 focus:ring-2 transition-all font-medium text-slate-900 border ${phoneError ? 'border-red-400 focus:ring-red-100' : 'border-transparent focus:ring-primary/20'}`}
              placeholder="+91 98765 43210"
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              required
            />
            {phoneError && <p className="text-xs font-bold text-red-600">{phoneError}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Email Address</label>
          <input 
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900" 
            placeholder="rahul@example.com" 
            type="email"
            value={form.email}
            onChange={handleChange('email')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Monthly Income</label>
            <input 
              className={`w-full bg-slate-50 border rounded-2xl p-4 focus:ring-2 transition-all font-medium text-slate-900 ${
                amountErrors.monthlyIncome
                  ? 'border-red-400 focus:ring-red-100'
                  : 'border-transparent focus:ring-primary/20'
              }`}
              placeholder="₹ 1,50,000" 
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-invalid={amountErrors.monthlyIncome ? 'true' : undefined}
              value={formatIndianDigits(form.monthlyIncome)}
              onChange={handleAmountChange('monthlyIncome')}
            />
            {amountErrors.monthlyIncome && (
              <p className="px-1 text-xs font-bold text-red-600">{amountErrors.monthlyIncome}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Loan Amount Required</label>
            <input 
              className={`w-full bg-slate-50 border rounded-2xl p-4 focus:ring-2 transition-all font-medium text-slate-900 ${
                amountErrors.loanAmount
                  ? 'border-red-400 focus:ring-red-100'
                  : 'border-transparent focus:ring-primary/20'
              }`}
              placeholder="₹ 75,00,000" 
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-invalid={amountErrors.loanAmount ? 'true' : undefined}
              value={formatIndianDigits(form.loanAmount)}
              onChange={handleAmountChange('loanAmount')}
            />
            {amountErrors.loanAmount && (
              <p className="px-1 text-xs font-bold text-red-600">{amountErrors.loanAmount}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Preferred Bank (Optional)</label>
          <div className="relative">
            <select
              className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all appearance-none font-bold text-slate-900 cursor-pointer"
              value={form.preferredBank}
              onChange={handleChange('preferredBank')}
            >
              <option value="No preference">No preference</option>
              <option>State Bank of India</option>
              <option>HDFC Bank</option>
              <option>ICICI Bank</option>
              <option>Axis Bank</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <button 
          disabled={isSubmitting}
          className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-primary/90 transition-all active:scale-95"
          type="submit"
        >
          {isSubmitting ? 'Submitting...' : 'Check Eligibility'}
        </button>
        {feedback.message && (
          <p className={`text-xs font-bold ${feedback.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
            {feedback.message}
          </p>
        )}
        
        <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed font-bold uppercase tracking-widest">
          No hidden fees • 256-bit Secure Encryption
        </p>
      </form>
    </div>
    </>
  );
}
