'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const WHATSAPP_NUMBER = '919222456789'; // Replace with actual business number
const CALL_NUMBER = '+919222456789'; // Replace with actual business number

export default function WhatsAppCTA({ propertyTitle }) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const popupRef = useRef(null);

  const message = propertyTitle
    ? `Hi! I'm interested in "${propertyTitle}" listed on Mumbai Editorial. Could you share more details?`
    : `Hi! I found your listing on Mumbai Editorial and I'd like to know more about available properties.`;

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="hidden sm:flex fixed bottom-6 right-6 z-50 flex-col items-end gap-2">

      {/* Services Button + Popup */}
      <div className="relative" ref={popupRef}>
        {servicesOpen && (
          <div className="absolute bottom-14 right-0 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden w-44 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-4 pt-3 pb-1.5">Our Services</p>
            <Link
              href="/home-loan"
              onClick={() => setServicesOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-primary/5 hover:text-primary text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance
              </span>
              <span className="text-xs font-black tracking-tight">Home Loan</span>
            </Link>
            <Link
              href="/rent-agreement"
              onClick={() => setServicesOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-primary/5 hover:text-primary text-slate-700 transition-colors border-t border-slate-100"
            >
              <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                description
              </span>
              <span className="text-xs font-black tracking-tight">Rent Agreement</span>
            </Link>
            <div className="h-2" />
          </div>
        )}

        <button
          type="button"
          aria-label="Services"
          onClick={() => setServicesOpen((o) => !o)}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95 ${
            servicesOpen
              ? 'bg-primary text-white shadow-primary/40'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-primary hover:text-primary hover:shadow-xl'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: servicesOpen ? "'FILL' 1" : "'FILL' 0" }}
          >
            home_repair_service
          </span>
        </button>
      </div>

      {/* Phone + WhatsApp in a row */}
      <div className="flex items-center gap-2">
        <a
          href={`tel:${CALL_NUMBER}`}
          aria-label="Call us"
          className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 hover:border-primary hover:text-primary hover:shadow-xl transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 5.55 5.55l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.92z"/>
          </svg>
        </a>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Chat on WhatsApp"
          className="w-12 h-12 rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/40 flex items-center justify-center hover:shadow-[#25D366]/60 hover:scale-105 active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
