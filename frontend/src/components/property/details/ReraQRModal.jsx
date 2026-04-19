'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReraQRModal({ isOpen, onClose, reraId, reraUrl, propertyName }) {
  if (!isOpen) return null;

  const verificationData = reraUrl || reraId || propertyName || 'RERA Verification';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg h-[80dvh] max-h-[80dvh] bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl shadow-black/20 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-primary px-5 sm:px-8 py-5 sm:py-8 text-white relative">
            <button 
              onClick={onClose}
              className="absolute top-3 sm:top-6 right-3 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close RERA modal"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">close</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <span className="material-symbols-outlined text-white/80">verified</span>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.22em] sm:tracking-[0.3em] opacity-80">Official Verification</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight italic">RERA Certified</h2>
          </div>

          {/* Body */}
          <div className="px-4 sm:px-8 py-4 sm:py-6 flex-1 overflow-y-auto flex flex-col items-center text-center">
            <div className="p-3 sm:p-4 bg-slate-50 rounded-4xl border-4 border-slate-100 mb-5 sm:mb-6">
              <div className="relative p-2 bg-white rounded-2xl shadow-inner border border-slate-200">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verificationData)}&color=b80049`}
                  alt="RERA QR Code"
                  width={192}
                  height={192}
                  unoptimized
                  className="w-32 h-32 sm:w-44 sm:h-44 block"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <span className="text-primary font-black text-2xl tracking-tighter italic">BRICKS</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 max-w-sm w-full">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Project Name</p>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight wrap-break-word">{propertyName}</h3>
              </div>
              
              <div className="flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">RERA Registration ID</p>
                <span className="px-4 sm:px-6 py-2 bg-primary/5 text-primary text-xs sm:text-sm font-black rounded-full border border-primary/10 italic break-all">
                  {reraId || 'Not Provided'}
                </span>
              </div>

              {reraUrl ? (
                <a
                  href={reraUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full border border-primary/20 text-primary text-[11px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest hover:bg-primary/5 transition-colors"
                >
                  Open RERA Page
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              ) : null}

              <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed pt-3 border-t border-slate-100">
                This project is officially registered with the Maharashtra Real Estate Regulatory Authority. 
                Scan the QR code to view the registration details and project timeline from the listing data.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-4 sm:p-6 flex justify-center">
            <button 
              onClick={onClose}
              className="w-full sm:w-auto sm:px-12 py-3 sm:py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
            >
              Continue Exploring
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
