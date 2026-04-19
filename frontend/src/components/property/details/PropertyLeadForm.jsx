'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/api/errors';
import { toIndianPhoneE164 } from '@/lib/validation/phone';
import { createLead } from '@/services/leadService';

const DRAFT_KEY = 'lead_draft:property_interest';
const WHATSAPP_NUMBER = '919222456789'; // Replace with actual business number

export default function PropertyLeadForm({ property }) {
  const { user, openModal } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [queuedSubmit, setQueuedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const propertyType = property?.raw?.category === 'rent' ? 'rent' : 'buy';

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

  useEffect(() => {
    if (typeof window === 'undefined' || !hasLoadedDraft) return;
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form, hasLoadedDraft]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const submitLead = useCallback(async () => {
    const phone = toIndianPhoneE164(form.phone);
    if (!phone) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid Indian mobile number (e.g. 98765 43210).',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      await createLead({
        name: form.name.trim(),
        phone,
        email: form.email.trim() || undefined,
        leadType: propertyType,
        propertyId: property?.id || undefined,
        message: property?.title
          ? `Interested in property: ${property.title}`
          : 'Interested in property details',
      });

      setFeedback({
        type: 'success',
        message: 'Interest submitted! Our consultant will contact you within 2 hours.',
      });
      setForm({ name: '', phone: '', email: '' });
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(DRAFT_KEY);
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to submit your request right now.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, property?.id, property?.title, propertyType]);

  useEffect(() => {
    if (!user || !queuedSubmit || isSubmitting) return;
    setQueuedSubmit(false);
    void submitLead();
  }, [user, queuedSubmit, isSubmitting, submitLead]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setQueuedSubmit(true);
      setFeedback({ type: 'error', message: 'Please login to submit your interest.' });
      openModal('login');
      return;
    }
    await submitLead();
  };

  const whatsappMessage = property?.title
    ? `Hi! I'm interested in "${property.title}" on Mumbai Editorial. Can you share more details?`
    : `Hi! I'm interested in a property on Mumbai Editorial. Can you help me?`;

  return (
    <section id="lead-form" className="scroll-mt-28 sm:scroll-mt-32 bg-slate-50 p-5 sm:p-8 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="text-xl font-heading font-extrabold mb-1 text-slate-900">Inquire for Details</h3>
      <p className="text-sm text-slate-500 mb-6 font-medium">Our consultants will contact you within 2 hours.</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5 px-1">Full Name</label>
          <input
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm text-slate-700 font-medium transition-all placeholder:text-slate-400"
            placeholder="e.g. Rohit Sharma"
            type="text"
            autoComplete="name"
            enterKeyHint="next"
            value={form.name}
            onChange={handleChange('name')}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5 px-1">Phone Number</label>
          <input
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm text-slate-700 font-medium transition-all placeholder:text-slate-400"
            placeholder="98765 43210"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            enterKeyHint="next"
            value={form.phone}
            onChange={handleChange('phone')}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5 px-1">Email Address</label>
          <input
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm text-slate-700 font-medium transition-all placeholder:text-slate-400"
            placeholder="rohit@example.com"
            type="email"
            inputMode="email"
            autoComplete="email"
            enterKeyHint="done"
            value={form.email}
            onChange={handleChange('email')}
          />
        </div>

        {feedback.message && (
          <div
            className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
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
          disabled={isSubmitting}
          className="w-full bg-primary text-white py-3.5 sm:py-4 rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-primary/20 transition-all active:scale-95 mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          )}
          {isSubmitting ? 'Submitting...' : "I'm Interested"}
        </button>
      </form>

      {/* WhatsApp Alternative */}
      <div className="mt-4">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`}
          target="_blank"
          rel="noreferrer noopener"
          className="w-full flex items-center justify-center gap-2 border-2 border-[#25D366] text-[#25D366] py-3 sm:py-3.5 rounded-full font-bold text-sm hover:bg-[#25D366]/5 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Chat on WhatsApp
        </a>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-200 text-center">
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Your data is secure and confidential
        </p>
      </div>
    </section>
  );
}
