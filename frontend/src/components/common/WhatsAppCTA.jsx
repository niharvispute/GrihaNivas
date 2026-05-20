'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/api';

const WHATSAPP_NUMBER = '919137950050';
const CALL_NUMBER = '+919137950050';

const SUPPRESS_PATHS = ['/privacy', '/terms', '/faqs'];

export default function WhatsAppCTA({ propertyTitle }) {
  const pathname = usePathname();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offer, setOffer] = useState(null);
  const popupRef = useRef(null);

  const message = propertyTitle
    ? `Hi! I'm interested in "${propertyTitle}" listed on GrihaNivas. Could you share more details?`
    : `Hi! I found your listing on GrihaNivas and I'd like to know more about available properties.`;

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    apiFetch('/api/offers')
      .then((res) => {
        const data = res.data;
        if (data?.showOnFrontend) setOffer(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when offer popup is open
  useEffect(() => {
    document.body.style.overflow = offerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [offerOpen]);

  if (SUPPRESS_PATHS.includes(pathname)) return null;

  return (
    <>
      <div className="hidden sm:flex fixed bottom-6 right-6 z-50 flex-col items-center gap-2">

        {/* Offer Button — only when active offer exists */}
        {offer && (
          <button
            type="button"
            aria-label="View current offer"
            onClick={() => setOfferOpen(true)}
            className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95 bg-primary text-white hover:scale-105 relative"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30 pointer-events-none" />
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_offer
            </span>
          </button>
        )}

        {/* Services Button + Popup — hidden; links available in footer */}
        <div className="relative hidden" ref={popupRef}>
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
            className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center overflow-hidden transition-all duration-300 active:scale-95 ${
              servicesOpen
                ? 'bg-primary text-white'
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

        {/* Phone */}
        <a
          href={`tel:${CALL_NUMBER}`}
          aria-label="Call us"
          className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 hover:border-primary hover:text-primary hover:shadow-xl transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 5.55 5.55l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.92z"/>
          </svg>
        </a>

        {/* WhatsApp */}
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

      {/* Offer Popup Modal */}
      {offerOpen && offer && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setOfferOpen(false); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setOfferOpen(false)} />

          {/* Modal */}
          <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl bg-white animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* Header */}
            <div className="relative bg-primary px-6 pt-6 pb-8 shrink-0 overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
              <div className="absolute top-4 right-16 w-16 h-16 bg-white/5 rounded-full pointer-events-none" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="material-symbols-outlined text-white/80 text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      local_offer
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
                      Special Offer
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tighter leading-tight">
                    {offer.headline}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOfferOpen(false)}
                  aria-label="Close offer"
                  className="shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors mt-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Cards — scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-4 bg-slate-50">
              {offer.cards.map((card, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
                >
                  <h3 className="text-base font-black text-slate-900 tracking-tight mb-1.5">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-bold leading-relaxed">
                    {card.desc}
                  </p>
                  {card.buttonUrl && (
                    <a
                      href={card.buttonUrl}
                      target={card.buttonUrl.startsWith('http') ? '_blank' : '_self'}
                      rel="noreferrer noopener"
                      onClick={() => setOfferOpen(false)}
                      className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full bg-primary text-white text-xs font-black uppercase tracking-widest shadow-md hover:bg-primary/90 transition-colors"
                    >
                      Learn More
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setOfferOpen(false)}
                className="w-full py-3 rounded-full border-2 border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:border-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
