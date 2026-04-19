'use client';

const WHATSAPP_NUMBER = '919222456789'; // Replace with actual business number

export default function MobileStickyBar({ property }) {
  const whatsappMessage = property?.title
    ? `Hi! I'm interested in "${property.title}" on Mumbai Editorial. Can you share more details?`
    : `Hi! I'm interested in a property on Mumbai Editorial. Can you help me?`;

  const scrollToForm = () => {
    const el = document.getElementById('lead-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/92 backdrop-blur-xl border-t border-slate-200/90 shadow-2xl px-3 sm:px-4 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] flex items-center gap-2.5 sm:gap-3">
      <button
        onClick={scrollToForm}
        type="button"
        className="min-h-11 flex-1 bg-primary text-white py-3 rounded-full font-bold text-sm tracking-tight hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
      >
        Enquire Now
      </button>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Chat on WhatsApp"
        className="min-h-11 flex-1 flex items-center justify-center gap-2 border-2 border-[#25D366] text-[#25D366] py-3 px-4 rounded-full font-bold text-sm hover:bg-[#25D366]/5 transition-all whitespace-nowrap"
      >
        WhatsApp
      </a>
    </div>
  );
}
