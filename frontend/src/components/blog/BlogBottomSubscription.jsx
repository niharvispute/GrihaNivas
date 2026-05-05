'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/lib/api/errors';
import { subscribeNewsletter } from '@/services/contactService';

export default function BlogBottomSubscription() {
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
        source: 'blog_bottom',
      });

      setFeedback({
        type: 'success',
        message: 'Subscribed successfully. Weekly insights are on the way.',
      });
      setEmail('');
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to subscribe right now.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 sm:gap-10 lg:gap-12">
      <div className="max-w-xl">
        <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
          Subscribe to <br />
          <span className="text-primary ">Mumbai Insights</span>
        </h3>
        <p className="text-slate-500 font-medium text-sm sm:text-base lg:text-lg leading-relaxed">
          Get the latest market analysis and exclusive penthouse listings delivered to your inbox weekly.
        </p>
      </div>
      <div className="w-full md:w-auto">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row w-full md:w-auto gap-3 sm:gap-4">
          <div className="flex-1 md:w-80 relative">
            <input
              className={`w-full bg-white border-none rounded-full px-6 sm:px-8 py-4 sm:py-5 text-sm font-bold shadow-2xl shadow-slate-200/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                feedback.type === 'error' ? 'ring-2 ring-rose-500/20' : ''
              }`}
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        
        {feedback.message && (
          <div className={`mt-4 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300 ${
            feedback.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <span className="material-symbols-outlined text-sm">
              {feedback.type === 'error' ? 'error' : 'check_circle'}
            </span>
            {feedback.message}
          </div>
        )}
      </div>
    </div>
  );
}
