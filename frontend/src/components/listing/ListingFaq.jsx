'use client';

import { useState } from 'react';

export default function ListingFaq() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How long does it take for my property to go live?",
      answer: "Once submitted, our team validates the details and schedules a verification call. Typically, your property goes live within 24 business hours of successful verification."
    },
    {
      question: "Are there any hidden listing fees?",
      answer: "No, listing your property on Bricks is completely transparent. We offer basic listing for free, with optional premium editorial packages for enhanced visibility."
    },
    {
      question: "Will you help with professional photography?",
      answer: "Yes, we have a network of professional architectural photographers. Depending on your property location and type, we can arrange a professional shoot for an additional fee."
    },
    {
      question: "What documents are required for verification?",
      answer: "We typically require proof of ownership, identity documents of the owner, and RERA registration details if applicable for the project."
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl font-extrabold tracking-tighter mb-4 text-slate-900">Common Questions</h2>
          <p className="text-slate-500 font-bold">Everything you need to know about the listing process.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-all">
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-all font-heading font-bold text-slate-800"
              >
                <span>{faq.question}</span>
                <span className={`material-symbols-outlined text-primary transition-transform duration-300 ${openIndex === idx ? 'rotate-45' : ''}`}>add</span>
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${openIndex === idx ? 'max-h-40' : 'max-h-0'}`}
              >
                <div className="px-6 pb-6 text-sm text-slate-500 font-bold leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
