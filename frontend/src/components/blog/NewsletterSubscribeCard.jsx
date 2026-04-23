'use client';

import { useId, useState } from 'react';
import { getErrorMessage } from '@/lib/api';
import { subscribeNewsletter } from '@/services/contactService';

export default function NewsletterSubscribeCard() {
  const emailInputId = useId();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your email address.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      await subscribeNewsletter({
        email: email.trim(),
        source: 'blog_sidebar',
      });

      setFeedback({
        type: 'success',
        message: 'Subscribed successfully. Weekly insights are on the way.',
      });
      setEmail('');
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to subscribe right now. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-primary p-6 sm:p-7 lg:p-9 rounded-4xl sm:rounded-5xl lg:rounded-[3rem] text-white shadow-2xl shadow-primary/40 relative overflow-hidden group">
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-6 opacity-40"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      <h3 className="text-xl sm:text-2xl font-black mb-3 tracking-tighter leading-none uppercase italic">Subscribe for <br /> Insights</h3>
      <p className="text-white/90 text-[11px] sm:text-xs mb-6 sm:mb-7 leading-relaxed font-bold">Join 5,000+ investors receiving our weekly analysis.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label htmlFor={emailInputId} className="sr-only">Email address</label>
        <input
          id={emailInputId}
          name="email"
          className="w-full px-5 sm:px-6 py-3.5 sm:py-4 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-white/40 focus:border-white/40 text-[13px] font-bold transition-all"
          placeholder="Your email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          suppressHydrationWarning
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 sm:py-4 rounded-full bg-white text-primary font-black text-xs hover:scale-[1.03] transition-all shadow-2xl shadow-black/10 uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
        </button>
      </form>

      {feedback.message && (
        <p className={`mt-4 text-[11px] font-bold ${feedback.type === 'error' ? 'text-red-100' : 'text-emerald-100'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}
