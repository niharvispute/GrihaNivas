'use client';

export default function SuccessModal({ isOpen, onClose, title = 'Submitted!', message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
        {message && <p className="text-slate-500 font-bold text-sm leading-relaxed mb-6">{message}</p>}
        <button
          onClick={onClose}
          className="bg-primary text-white px-8 py-3 rounded-full font-black text-sm hover:bg-primary/90 transition-all active:scale-95"
        >
          Done
        </button>
      </div>
    </div>
  );
}
