'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/api/errors';
import { toIndianPhoneE164 } from '@/lib/validation/phone';
import { validateName, validateEmail, validatePhone, validateMessage, collectErrors } from '@/lib/validation/formValidation';
import { createLead } from '@/services/leadService';
import SuccessModal from '@/components/common/SuccessModal';

const DRAFT_KEY = 'lead_draft:generic';

export default function LeadForm({
  title = 'Inquire About This Property',
  leadType = 'buy',
  propertyId,
  projectId,
}) {
  const baseId = useId();
  const nameInputId = `${baseId}-name`;
  const emailInputId = `${baseId}-email`;
  const phoneInputId = `${baseId}-phone`;
  const messageInputId = `${baseId}-message`;
  const { user, openModal } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [queuedSubmit, setQueuedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Load session draft
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        setForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch (_error) {}
    setHasLoadedDraft(true);
  }, []);

  // Pre-fill from authenticated user
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || user.displayName || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
    }));
  }, [user]);

  // Persist draft to session
  useEffect(() => {
    if (typeof window === 'undefined' || !hasLoadedDraft) return;
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form, hasLoadedDraft]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (fieldErrors[field]) setFieldErrors((fe) => ({ ...fe, [field]: null }));
  };

  const submitLead = useCallback(async () => {
    const { errors, hasError } = collectErrors({
      name: validateName(form.name),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      message: validateMessage(form.message),
    });
    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    const phone = toIndianPhoneE164(form.phone);
    if (!phone) {
      setFieldErrors((fe) => ({ ...fe, phone: 'Please enter a valid Indian mobile number.' }));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      await createLead({
        name: form.name.trim(),
        phone,
        email: form.email.trim() || undefined,
        leadType,
        propertyId: propertyId || undefined,
        projectId: projectId || undefined,
        message: form.message.trim() || undefined,
      });

      setShowSuccess(true);
      setFeedback({ type: '', message: '' });
      setForm({ name: '', email: '', phone: '', message: '' });
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(DRAFT_KEY);
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to submit inquiry right now. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, leadType, propertyId, projectId]);

  useEffect(() => {
    if (!user || !queuedSubmit || isSubmitting) return;
    setQueuedSubmit(false);
    void submitLead();
  }, [user, queuedSubmit, isSubmitting, submitLead]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setQueuedSubmit(true);
      setFeedback({ type: 'error', message: 'Please login to submit your enquiry.' });
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
      title="Inquiry Submitted!"
      message="Our team will contact you shortly."
    />
    <div className="bg-white p-7 rounded-moderate shadow-2xl border border-slate-50">
      <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">{title}</h3>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor={nameInputId} className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Full Name</label>
          <input
            id={nameInputId}
            name="name"
            type="text"
            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 transition-all placeholder:text-slate-400 ${fieldErrors.name ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-primary/20 focus:border-primary/30'}`}
            placeholder="Suresh Patil"
            value={form.name}
            onChange={handleChange('name')}
            autoComplete="name"
            suppressHydrationWarning
          />
          {fieldErrors.name && <p className="mt-1 text-xs font-bold text-red-600">{fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor={emailInputId} className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Email Address</label>
          <input
            id={emailInputId}
            name="email"
            type="email"
            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 transition-all placeholder:text-slate-400 ${fieldErrors.email ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-primary/20 focus:border-primary/30'}`}
            placeholder="suresh@example.com"
            value={form.email}
            onChange={handleChange('email')}
            autoComplete="email"
            suppressHydrationWarning
          />
          {fieldErrors.email && <p className="mt-1 text-xs font-bold text-red-600">{fieldErrors.email}</p>}
        </div>
        <div>
          <label htmlFor={phoneInputId} className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
            Phone Number <span className="text-primary normal-case font-bold tracking-normal">*</span>
          </label>
          <input
            id={phoneInputId}
            name="phone"
            type="tel"
            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 transition-all placeholder:text-slate-400 ${fieldErrors.phone ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-primary/20 focus:border-primary/30'}`}
            placeholder="98765 43210"
            value={form.phone}
            onChange={handleChange('phone')}
            autoComplete="tel"
            suppressHydrationWarning
          />
          {fieldErrors.phone && <p className="mt-1 text-xs font-bold text-red-600">{fieldErrors.phone}</p>}
        </div>
        <div>
          <label htmlFor={messageInputId} className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Message</label>
          <textarea
            id={messageInputId}
            name="message"
            rows="4"
            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 transition-all resize-none placeholder:text-slate-400 ${fieldErrors.message ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-primary/20 focus:border-primary/30'}`}
            placeholder="Tell us your budget, preferred area, and possession timeline."
            value={form.message}
            onChange={handleChange('message')}
            suppressHydrationWarning
          />
          {fieldErrors.message && <p className="mt-1 text-xs font-bold text-red-600">{fieldErrors.message}</p>}
        </div>

        {feedback.message && (
          <div
            className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
              feedback.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-100'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}
          >
            <span className="material-symbols-outlined text-base mt-0.5">
              {feedback.type === 'error' ? 'error' : 'check_circle'}
            </span>
            {feedback.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white font-black py-4 rounded-full shadow-lg hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          )}
          {isSubmitting ? 'Sending...' : 'Send Inquiry'}
        </button>

        <p className="text-[11px] text-center text-slate-600 leading-relaxed">
          By submitting, you agree to our{' '}
          <a href="/terms" className="underline text-slate-700 hover:text-primary transition-colors">Terms</a>{' '}
          and{' '}
          <a href="/privacy" className="underline text-slate-700 hover:text-primary transition-colors">Privacy Policy</a>.
        </p>
      </form>
    </div>
    </>
  );
}
