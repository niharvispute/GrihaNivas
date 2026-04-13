'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/api/errors';
import { toIndianPhoneE164 } from '@/lib/validation/phone';
import { createLead } from '@/services/leadService';

const DRAFT_KEY = 'lead_draft:generic';

export default function LeadForm({
  title = 'Inquire About This Property',
  leadType = 'buy',
  propertyId,
}) {
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
        leadType,
        propertyId: propertyId || undefined,
        message: form.message.trim() || undefined,
      });

      setFeedback({
        type: 'success',
        message: 'Inquiry submitted successfully. Our team will contact you shortly.',
      });
      setForm({ name: '', email: '', phone: '', message: '' });
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(DRAFT_KEY);
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to submit inquiry right now.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, leadType, propertyId]);

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
    <div className="bg-white p-8 rounded-moderate shadow-xl border border-slate-100">
      <h3 className="text-xl font-bold text-slate-900 mb-6">{title}</h3>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
          <input 
            type="text" 
            className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange('name')}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
          <input 
            type="email" 
            className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="john@example.com"
            value={form.email}
            onChange={handleChange('email')}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Phone Number</label>
          <input 
            type="tel" 
            className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={handleChange('phone')}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Message</label>
          <textarea 
            rows="4"
            className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            placeholder="I am interested in this property..."
            value={form.message}
            onChange={handleChange('message')}
          ></textarea>
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-primary text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          {isSubmitting ? 'Sending...' : 'Send Inquiry'}
        </button>
        {feedback.message && (
          <p className={`text-xs font-medium ${feedback.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
            {feedback.message}
          </p>
        )}
        <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed">
          By submitting this form, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </div>
  );
}
