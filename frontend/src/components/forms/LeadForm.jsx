'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/lib/api/errors';
import { createLead } from '@/services/leadService';

export default function LeadForm({
  title = 'Inquire About This Property',
  leadType = 'buy',
  propertyId,
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      await createLead({
        name: form.name.trim(),
        phone: form.phone.trim(),
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
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to submit inquiry right now.'),
      });
    } finally {
      setIsSubmitting(false);
    }
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
