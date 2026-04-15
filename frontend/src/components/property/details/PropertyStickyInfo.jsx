'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import WishlistButton from '@/components/property/WishlistButton';
import ReraQRModal from './ReraQRModal';

export default function PropertyStickyInfo({ property }) {
  const [isReraModalOpen, setIsReraModalOpen] = useState(false);

  return (
    <div className="sticky top-32 bg-white p-8 rounded-2xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.06)] border border-slate-100">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-extrabold tracking-tight mb-2 text-slate-900">{property.title}</h1>
        <p className="text-slate-500 flex items-center gap-1 font-medium text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          {property.location}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-heading font-black text-primary">₹{property.price}</span>
          <span className="text-slate-400 text-sm font-medium">{property.priceSuffix === 'Price on Request' ? 'Estimated' : 'Price'}</span>
        </div>
        
        {/* RERA Badge Component (Trigger) */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsReraModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl cursor-pointer border border-emerald-100 transition-all group"
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-emerald-50">
             <img 
               src="https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=RERA&color=059669" 
               alt="QR" 
               className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity"
             />
          </div>
          <div className="leading-none">
             <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-emerald-600 text-[12px]">verified</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 italic">RERA</span>
             </div>
             <p className="text-[8px] font-bold text-emerald-600/60 uppercase">Verify</p>
          </div>
        </motion.div>
      </div>

      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-8 bg-primary/5 inline-block px-3 py-1 rounded-full">Editorial Verified Collection</p>

      <div className="flex gap-4 p-4 bg-slate-50 rounded-xl mb-8 border border-slate-100">
        <div className="flex-1 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">BHK</p>
          <p className="font-heading font-bold text-slate-800">{property.bhk} BHK</p>
        </div>
        <div className="w-px bg-slate-200"></div>
        <div className="flex-1 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Area</p>
          <p className="font-heading font-bold text-slate-800">{property.area} sq.ft</p>
        </div>
      </div>

      <div className="space-y-4">
        <button className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download Brochure
        </button>
        <button className="w-full border-2 border-primary text-primary py-4 rounded-full font-bold text-lg hover:bg-tertiary transition-all">
          Contact Expert
        </button>
        
        <div className="flex gap-4 pt-4">
          <WishlistButton
            propertyId={property.id || property._id}
            initialSaved={property.isSaved}
            variant="row"
          />
          <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <svg className="text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>
            <span className="text-sm font-semibold text-slate-600">Compare</span>
          </button>
        </div>
      </div>

      <ReraQRModal 
        isOpen={isReraModalOpen} 
        onClose={() => setIsReraModalOpen(false)} 
        reraId={property?.raw?.reraNumber}
        propertyName={property?.title}
      />
    </div>
  );
}
