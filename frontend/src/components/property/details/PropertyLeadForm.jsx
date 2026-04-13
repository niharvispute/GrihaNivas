'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/api/errors';
import { toIndianPhoneE164 } from '@/lib/validation/phone';
import { createLead } from '@/services/leadService';

const DRAFT_KEY = 'lead_draft:property_interest';

export default function PropertyLeadForm({ property }) {
  const { user, openModal } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [queuedSubmit, setQueuedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const propertyType = property?.raw?.category === 'rent' ? 'rent' : 'buy';

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
        message: 'Please enter a valid Indian mobile number in +91 format.',
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
        message: 'Interest submitted. Our consultant will contact you soon.',
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

  return (
    <section className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="text-xl font-heading font-extrabold mb-1 text-slate-900">Inquire for Details</h3>
      <p className="text-sm text-slate-500 mb-6 font-medium">Our consultants will contact you within 2 hours.</p>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 px-1">Full Name</label>
          <input 
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm text-slate-700 font-medium transition-all" 
            placeholder="e.g. Rohit Huge" 
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 px-1">Phone Number</label>
          <input 
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm text-slate-700 font-medium transition-all" 
            placeholder="+91 98765 43210" 
            type="tel"
            value={form.phone}
            onChange={handleChange('phone')}
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 px-1">Email Address</label>
          <input 
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm text-slate-700 font-medium transition-all" 
            placeholder="rohit@example.com" 
            type="email"
            value={form.email}
            onChange={handleChange('email')}
          />
        </div>
        <button disabled={isSubmitting} className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all active:scale-95 mt-4">
          {isSubmitting ? 'Submitting...' : 'I’m Interested'}
        </button>
        {feedback.message && (
          <p className={`text-xs font-medium ${feedback.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
            {feedback.message}
          </p>
        )}
      </form>
      
      <div className="mt-6 pt-6 border-t border-slate-200 text-center">
        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Your data is secure and confidential
        </p>
      </div>
    </section>
  );
}
