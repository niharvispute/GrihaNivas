'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getErrorMessage } from '@/lib/api/errors';
import { toIndianPhoneE164 } from '@/lib/validation/phone';
import { submitContactForm } from '@/services/contactService';

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

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      desc: "The Pavilion, Worli Sea Face, South Mumbai, Maharashtra 400018",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      )
    },
    {
      title: "Phone Number",
      desc: "+91 22 1234 5678",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      )
    },
    {
      title: "Email Address",
      desc: "contact@bricksrealestate.com",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      )
    }
  ];

  return (
    <div className="w-full">
      {/* 🏙️ Hero Section */}
      <section className="px-3 md:px-8 max-w-screen-2xl mx-auto pt-4 md:pt-20 pb-6 md:pb-16">
        <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[3rem] bg-slate-50 p-6 md:p-28 flex flex-col items-center text-center shadow-inner">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfqT-o5cubMMfW3Rd96E_D7eazSloty3_kvSmsycyeOWkIV0FOFnhNphvkro3UIDPBbYlb_zCeAMuBbzTRdUlwBEdq8wrQs8tdykWW8wRfZoa6IRnq0VhoXF7__Ex9b01o1PyiCy519JtWzKfoixgpeHuxGsECiopUJDP7ZqRV7CX6stlx4gfdzkQnH3_msjf54YNwSh-GGDJmLYlhJepu8eE2lvSsWGfJlhe9KYst3dolP_ilmnnsmU4QUuQTPLdovb48EctzCno" 
              alt="Architectural Abstract" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-3 md:mb-6">CONNECT WITH US</span>
          <h1 className="text-3xl md:text-8xl font-black text-slate-900 tracking-tighter mb-3 md:mb-8 leading-none">
            Let&apos;s Start a <br className="hidden md:block"/> Conversation.
          </h1>
          <p className="text-slate-500 text-[11px] md:text-xl max-w-2xl leading-relaxed font-medium px-4">
            We’re here to help you find your masterpiece. Expertise at your service.
          </p>
        </div>
      </section>

      {/* 📬 Communication Grid */}
      <section className="px-3 md:px-8 max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 mb-12 md:mb-24">
        {/* Info Column */}
        <div className="lg:col-span-5 space-y-4 md:space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-6">
            {contactInfo.map((info, i) => (
              <div 
                key={i} 
                className={`bg-white p-4 md:p-10 rounded-[1.2rem] md:rounded-[2.5rem] shadow-sm border border-slate-50 hover:shadow-xl transition-all group ${i === 0 ? 'col-span-2' : 'col-span-1'}`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 text-left">
                  <div className="p-2.5 md:p-4 rounded-lg md:rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6 shrink-0">
                    {/* Scale down icons for mobile */}
                    <div className="scale-75 md:scale-100">
                      {info.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm md:text-xl font-black text-slate-900 mb-1 md:mb-2 tracking-tight">{info.title}</h3>
                    <p className="text-slate-500 text-[10px] md:text-base font-medium leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-none">
                      {info.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Working Hours */}
            <div className="col-span-2 lg:col-span-1 bg-slate-900 text-white p-5 md:p-10 rounded-[1.2rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all"></div>
              <h3 className="text-sm md:text-xl font-black mb-4 md:mb-8 flex items-center gap-2 md:gap-3 tracking-tight leading-none italic">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary md:w-6 md:h-6"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Hours
              </h3>
              <div className="space-y-3 md:space-y-6">
                {[
                  { day: "Mon - Fri", time: "09:00 - 19:00" },
                  { day: "Sat", time: "10:00 - 17:00" },
                  { day: "Sun", time: "Appointment", special: true }
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2 md:pb-4">
                    <span className="text-white/60 text-[9px] md:text-sm font-black uppercase tracking-widest">{row.day}</span>
                    <span className={`font-black text-[9px] md:text-sm ${row.special ? 'text-primary' : 'text-white'}`}>{row.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-7 bg-white p-8 md:p-16 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border border-slate-50 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-6 md:mb-10 tracking-tighter italic">Send us a message</h2>
          <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2 md:space-y-3">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Full Name</label>
                <input 
                  className="w-full px-6 md:px-8 py-3.5 md:py-5 rounded-xl md:rounded-2xl bg-slate-50 border-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-300 font-bold transition-all text-sm md:text-base" 
                  placeholder="John Doe" 
                  type="text"
                  value={form.name}
                  onChange={handleChange('name')}
                  required
                />
              </div>
              <div className="space-y-2 md:space-y-3">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Phone Number</label>
                <input 
                  className="w-full px-6 md:px-8 py-3.5 md:py-5 rounded-xl md:rounded-2xl bg-slate-50 border-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-300 font-bold transition-all text-sm md:text-base" 
                  placeholder="+91 00000 00000" 
                  type="tel"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  required
                />
              </div>
            </div>
            <div className="space-y-2 md:space-y-3">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email Address</label>
              <input 
                className="w-full px-6 md:px-8 py-3.5 md:py-5 rounded-xl md:rounded-2xl bg-slate-50 border-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-300 font-bold transition-all text-sm md:text-base" 
                placeholder="john@example.com" 
                type="email"
                value={form.email}
                onChange={handleChange('email')}
              />
            </div>
            <div className="space-y-2 md:space-y-3">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Message</label>
              <textarea 
                className="w-full px-6 md:px-8 py-3.5 md:py-5 rounded-xl md:rounded-2xl bg-slate-50 border-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-300 font-bold transition-all resize-none text-sm md:text-base" 
                placeholder="How can we assist you today?" 
                rows="4"
                value={form.message}
                onChange={handleChange('message')}
                required
              ></textarea>
            </div>
            <button 
              disabled={isSubmitting}
              className="w-full md:w-auto bg-primary text-white px-10 md:px-12 py-4 md:py-5 rounded-full font-black text-base md:text-lg tracking-tight hover:bg-primary/90 transition-all transform active:scale-95 flex items-center justify-center gap-2 md:gap-3 shadow-2xl shadow-primary/30 leading-none" 
              type="submit"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
            {feedback.message && (
              <p className={`text-xs md:text-sm font-medium ${feedback.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                {feedback.message}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* 🗺️ Map Section */}
      <section className="mb-16 md:mb-24 px-4 md:px-8 max-w-screen-2xl mx-auto">
        <div className="relative w-full h-[350px] md:h-[600px] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl group border-4 md:border-8 border-white">
          <div className="absolute top-6 left-6 md:top-12 md:left-12 z-20 bg-white/95 md:backdrop-blur-xl p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-white/50 max-w-[calc(100%-3rem)] md:max-w-sm">
            <span className="text-primary font-black text-[9px] md:text-[10px] tracking-[0.3em] uppercase mb-1 md:mb-2 block leading-none">FLAGSHIP OFFICE</span>
            <h4 className="text-xl md:text-2xl font-black text-slate-900 mb-1 tracking-tight">The Pavilion</h4>
            <p className="text-slate-500 font-medium text-[10px] md:text-sm mb-4 md:mb-6 leading-relaxed">Iconic Worli Sea Face, bridging tradition with the Mumbai skyline.</p>
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
      </section>

      {/* 🔗 FAQ Banner */}
      <section className="max-w-screen-2xl mx-auto px-4 md:px-8 mb-20 md:mb-32">
        <div className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-10 md:p-20 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 text-center md:text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 md:w-[30rem] h-80 md:h-[30rem] bg-primary/20 rounded-full blur-[10rem] opacity-40 group-hover:opacity-60 transition-all"></div>
          <div className="relative z-10 space-y-2 md:space-y-4">
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-none">Have more questions?</h2>
            <p className="text-white/60 font-medium text-sm md:text-lg max-w-xl">Browse our frequently asked questions about listing and investment processes.</p>
          </div>
          <Link 
            href="/faq" 
            className="px-8 md:px-12 py-3.5 md:py-5 border-2 border-primary text-primary font-black rounded-full hover:bg-primary hover:text-white transition-all duration-500 shadow-2xl shadow-primary/10 relative z-10 text-sm md:text-lg uppercase tracking-tight leading-none"
          >
            Go to FAQs
          </Link>
        </div>
      </section>

      {/* 📱 Floating Quick Actions */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 flex flex-col gap-3 md:gap-5 z-50">
        <button className="flex items-center gap-2 md:gap-4 bg-[#25D366] text-white p-4 md:px-8 md:py-4 rounded-full shadow-2xl hover:scale-110 transition-all">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8e9Jtjg617bja4_o5zZH83seL95RwHty4QVkxLjthnIfZ8R69xfdKHHPgljb-bg_JVXyd6gNYf5UU_o3Ix4Zk5bv6VjZzDIFEIzZzi10q_Dt60mEcnqEF4Sr1WhBKA5XlDf--c-QrmXR1LJaqZ-ZNwxQc72Jo6kPy3-EVmic4BySO2XS5ipOJvbMhho_fWu4BwTk69jCLwvG7WosjxfqVBWlrn20nMH662DhXDh0r91sZI1uwJKasz2NlG5wc-N5bFpfEIoSQLIk" 
            alt="WhatsApp" 
            className="w-5 h-5 md:w-6 md:h-6 invert brightness-0"
          />
          <span className="font-black text-sm uppercase tracking-widest hidden md:block">WhatsApp Chat</span>
        </button>
        <button className="flex items-center gap-2 md:gap-4 bg-primary text-white p-4 md:px-8 md:py-4 rounded-full shadow-2xl hover:scale-110 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span className="font-black text-sm uppercase tracking-widest hidden md:block">Call Now</span>
        </button>
      </div>
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
