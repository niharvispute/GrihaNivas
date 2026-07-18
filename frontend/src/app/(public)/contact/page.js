'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getErrorMessage } from '@/lib/api/errors';
import { toIndianPhoneE164 } from '@/lib/validation/phone';
import { submitContactForm } from '@/services/contactService';
import { SITE_CONTACT } from '@/lib/siteContact';
import {
  validateName,
  validatePhone,
  validateEmail,
  validateMessage,
  collectErrors,
} from '@/lib/validation/formValidation';

function ContactForm() {
  const searchParams = useSearchParams();
  const propertyTitle = searchParams.get('property');
  const prefilledMessage = searchParams.get('message');
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  useEffect(() => {
    if (propertyTitle) {
      setForm(prev => ({
        ...prev,
        message: `I'm interested in enquiring about "${propertyTitle}". Please provide more details.`
      }));
    } else if (prefilledMessage) {
      setForm(prev => ({
        ...prev,
        message: prefilledMessage
      }));
    }
  }, [propertyTitle, prefilledMessage]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear a field's error as soon as the user edits it.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validateAll = () => {
    const { errors: found, hasError } = collectErrors({
      name: validateName(form.name),
      phone: validatePhone(form.phone),
      email: validateEmail(form.email, { required: false }),
      message: validateMessage(form.message, { required: true }),
    });
    setErrors(found);
    return !hasError;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateAll()) {
      setFeedback({ type: 'error', message: 'Please fix the highlighted fields and try again.' });
      return;
    }

    const phone = toIndianPhoneE164(form.phone);
    if (!phone) {
      setErrors((prev) => ({ ...prev, phone: 'Please enter a valid Indian mobile number in +91 format.' }));
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      await submitContactForm({
        name: form.name.trim(),
        phone,
        email: form.email.trim() || undefined,
        message: form.message.trim(),
      });

      setFeedback({
        type: 'success',
        message: 'Message sent successfully. We will get back to you shortly.',
      });
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to send your message right now.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      title: "Office Address",
      desc: SITE_CONTACT.addressOneLine,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      )
    },
    {
      title: "Phone Number",
      desc: SITE_CONTACT.phoneDisplay,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      )
    },
    {
      title: "Email Address",
      desc: SITE_CONTACT.email,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      )
    }
  ];

  return (
    <div className="w-full">
      {/* 🏙️ Hero Section */}
      <section className="px-3 md:px-8 max-w-screen-2xl mx-auto pt-4 md:pt-20 pb-6 md:pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-slate-50 p-6 md:p-16 flex flex-col items-center text-center shadow-inner">
          <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none opacity-[0.04]" style={{backgroundImage: 'radial-gradient(circle at 60% 40%, #b80049 0%, transparent 70%)'}}></div>
          <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-3 md:mb-6">CONNECT WITH US</span>
          <h1 className="text-3xl md:text-8xl font-black text-slate-900 tracking-tighter mb-3 md:mb-8 leading-none">
            Let&apos;s Start a <br className="hidden md:block"/> Conversation.
          </h1>
          <p className="text-slate-500 text-[11px] md:text-xl max-w-2xl leading-relaxed font-bold px-4">
            We’re here to help you find your masterpiece. Expertise at your service.
          </p>
        </div>
      </section>

      {/* 📬 Communication Grid */}
      <section className="px-3 md:px-8 max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 mb-12 md:mb-24">
        {/* Info Column */}
        <div className="lg:col-span-5 flex flex-col gap-5 md:gap-8">
          <div className="flex flex-col gap-4 md:gap-8">
            {contactInfo.map((info, i) => (
              <div 
                key={i} 
                className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-50 hover:shadow-xl transition-all group"
              >
                <div className="flex items-start md:items-center gap-4 md:gap-6 text-left">
                  <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6 shrink-0">
                    <div className="scale-90 md:scale-100">
                      {info.icon}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base md:text-xl font-black text-slate-900 mb-1 md:mb-2 tracking-tight uppercase ">{info.title}</h3>
                    <p className="text-slate-500 text-xs md:text-base font-bold leading-relaxed ">
                      {info.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Working Hours */}
            <div className="bg-slate-900 text-white p-6 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all"></div>
              <h3 className="text-base md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3 tracking-tight leading-none  uppercase">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary md:w-6 md:h-6"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Operations Hours
              </h3>
              <div className="space-y-4 md:space-y-6">
                {SITE_CONTACT.hours.map((row, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-white/10 pb-3 md:pb-4">
                    <span className="text-white/50 text-[10px] md:text-sm font-black uppercase tracking-widest ">{row.day}</span>
                    <span className={`font-black text-[11px] md:text-sm ${row.special ? 'text-primary' : 'text-white'} `}>{row.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-7 bg-white p-8 md:p-16 rounded-2xl shadow-2xl border border-slate-50 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-6 md:mb-10 tracking-tighter ">Send us a message</h2>
          <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2 md:space-y-3">
                <label htmlFor="contact-name" className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Full Name</label>
                <input
                  id="contact-name"
                  className={`w-full px-6 md:px-8 py-3.5 md:py-5 rounded-xl md:rounded-2xl bg-slate-50 border focus:ring-1 placeholder:text-slate-300 font-bold transition-all text-sm md:text-base ${errors.name ? 'border-red-400 focus:ring-red-200' : 'border-transparent focus:ring-primary/20'}`}
                  placeholder="Suresh Patil"
                  type="text"
                  value={form.name}
                  onChange={handleChange('name')}
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'contact-name-error' : undefined}
                  required
                />
                {errors.name && <p id="contact-name-error" role="alert" className="text-xs font-bold text-red-600">{errors.name}</p>}
              </div>
              <div className="space-y-2 md:space-y-3">
                <label htmlFor="contact-phone" className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Phone Number</label>
                <input
                  id="contact-phone"
                  className={`w-full px-6 md:px-8 py-3.5 md:py-5 rounded-xl md:rounded-2xl bg-slate-50 border focus:ring-1 placeholder:text-slate-300 font-bold transition-all text-sm md:text-base ${errors.phone ? 'border-red-400 focus:ring-red-200' : 'border-transparent focus:ring-primary/20'}`}
                  placeholder="+91 00000 00000"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  aria-invalid={errors.phone ? 'true' : 'false'}
                  aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                  required
                />
                {errors.phone && <p id="contact-phone-error" role="alert" className="text-xs font-bold text-red-600">{errors.phone}</p>}
              </div>
            </div>
            <div className="space-y-2 md:space-y-3">
              <label htmlFor="contact-email" className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email Address</label>
              <input
                id="contact-email"
                className={`w-full px-6 md:px-8 py-3.5 md:py-5 rounded-xl md:rounded-2xl bg-slate-50 border focus:ring-1 placeholder:text-slate-300 font-bold transition-all text-sm md:text-base ${errors.email ? 'border-red-400 focus:ring-red-200' : 'border-transparent focus:ring-primary/20'}`}
                placeholder="suresh@example.com"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'contact-email-error' : undefined}
              />
              {errors.email && <p id="contact-email-error" role="alert" className="text-xs font-bold text-red-600">{errors.email}</p>}
            </div>
            <div className="space-y-2 md:space-y-3">
              <label htmlFor="contact-message" className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Message</label>
              <textarea
                id="contact-message"
                className={`w-full px-6 md:px-8 py-3.5 md:py-5 rounded-xl md:rounded-2xl bg-slate-50 border focus:ring-1 placeholder:text-slate-300 font-bold transition-all resize-none text-sm md:text-base ${errors.message ? 'border-red-400 focus:ring-red-200' : 'border-transparent focus:ring-primary/20'}`}
                placeholder="How can we assist you today?"
                rows="4"
                value={form.message}
                onChange={handleChange('message')}
                aria-invalid={errors.message ? 'true' : 'false'}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                required
              ></textarea>
              {errors.message && <p id="contact-message-error" role="alert" className="text-xs font-bold text-red-600">{errors.message}</p>}
            </div>
            <button 
              disabled={isSubmitting}
              className="w-full md:w-auto bg-primary text-white px-10 md:px-12 py-4 md:py-5 rounded-full font-black text-base md:text-lg tracking-tight hover:bg-primary/90 transition-all transform active:scale-95 flex items-center justify-center gap-2 md:gap-3 shadow-2xl leading-none" 
              type="submit"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
            {feedback.message && (
              <p role="alert" aria-live="polite" className={`text-xs md:text-sm font-bold ${feedback.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                {feedback.message}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* 🗺️ Map Section */}
      {/* <section className="mb-16 md:mb-24 px-4 md:px-8 max-w-screen-2xl mx-auto">
        <div className="relative w-full h-[350px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl group border-4 md:border-8 border-white">
          <div className="absolute top-6 left-6 md:top-12 md:left-12 z-20 bg-white/95 md:backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-2xl border border-white/50 max-w-[calc(100%-3rem)] md:max-w-sm">
            <span className="text-primary font-black text-[9px] md:text-[10px] tracking-[0.3em] uppercase mb-1 md:mb-2 block leading-none">FLAGSHIP OFFICE</span>
            <h4 className="text-xl md:text-2xl font-black text-slate-900 mb-1 tracking-tight">The Pavilion</h4>
            <p className="text-slate-500 font-bold text-[10px] md:text-sm mb-4 md:mb-6 leading-relaxed">Iconic Worli Sea Face, bridging tradition with the Mumbai skyline.</p>
            <button className="text-primary font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
              Get Directions <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="md:w-4 md:h-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
          <img 
            className="w-full h-full object-cover grayscale-[0.3] md:group-hover:grayscale-0 transition-all duration-1000" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCicRvtEWgqHAmXm3CDCKKG6VtJ6_K8ykUippbGZF0j7Kp6_JDkF218D__VOR9ZuD2gnxPndIsGt1Ev1NwrToqITFMeXJVTWMeqiY8gafCqv4JSy0hR8aM9rsuvY31WYiqUhASorg9op07kDJMRmICGA7oZVJA-UOiWPy-dS8NRK81TNsNiNtRVb8XQpyUySqWtSDXgbAuvUgQlAQB7Od4FLKQzeEDFEGp-UYAfVMgIkryRxHWed_id_1heeU_8574bI-dLfjWFVkc" 
            alt="Mumbai Map"
          />
        </div>
      </section> */}

      {/* 🔗 FAQ Banner */}
      <section className="max-w-screen-2xl mx-auto px-4 md:px-8 mb-20 md:mb-32">
        <div className="bg-slate-900 rounded-2xl p-10 md:p-20 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 text-center md:text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 md:w-[30rem] h-80 md:h-[30rem] bg-primary/20 rounded-full blur-[10rem] opacity-40 group-hover:opacity-60 transition-all"></div>
          <div className="relative z-10 space-y-2 md:space-y-4">
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-none">Have more questions?</h2>
            <p className="text-white/60 font-bold text-sm md:text-lg max-w-xl">Browse our frequently asked questions about listing and investment processes.</p>
          </div>
          <Link
            href="/faqs"
            className="px-8 md:px-12 py-3.5 md:py-5 border-2 border-primary text-primary font-black rounded-full hover:bg-primary hover:text-white transition-all duration-500 shadow-2xl relative z-10 text-sm md:text-lg uppercase tracking-tight leading-none"
          >
            Go to FAQs
          </Link>
        </div>
      </section>

      
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContactForm />
    </Suspense>
  );
}
