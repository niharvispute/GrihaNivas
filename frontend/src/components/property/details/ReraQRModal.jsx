'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function ReraQRModal({ isOpen, onClose, reraId, propertyName }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-black/20 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-primary p-8 text-white relative">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-white/80">verified</span>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Official Verification</p>
            </div>
            <h2 className="text-3xl font-heading font-black tracking-tight italic">RERA Certified</h2>
          </div>

          {/* Body */}
          <div className="p-10 flex flex-col items-center text-center">
            <div className="p-4 bg-slate-50 rounded-[2rem] border-4 border-slate-100 mb-8">
              <div className="relative p-2 bg-white rounded-2xl shadow-inner border border-slate-200">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://maharera.mahaonline.gov.in/&color=b80049`} 
                  alt="RERA QR Code"
                  className="w-48 h-48 block"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <span className="text-primary font-black text-2xl tracking-tighter italic">BRICKS</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-w-sm">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Project Name</p>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{propertyName}</h3>
              </div>
              
              <div className="flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">RERA Registration ID</p>
                <span className="px-6 py-2 bg-primary/5 text-primary text-sm font-black rounded-full border border-primary/10 italic">
                  {reraId || 'P51800000000'}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed pt-4 border-t border-slate-100">
                This project is officially registered with the Maharashtra Real Estate Regulatory Authority. 
                Scan the QR code to view the certificate and project timeline on the official portal.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-6 flex justify-center">
            <button 
              onClick={onClose}
              className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
            >
              Continue Exploring
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
