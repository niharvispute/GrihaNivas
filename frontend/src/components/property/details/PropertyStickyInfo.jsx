'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import WishlistButton from '@/components/property/WishlistButton';
import AddToCompareButton from '@/components/property/AddToCompareButton';
import ReraQRModal from './ReraQRModal';

export default function PropertyStickyInfo({ property }) {
  const [isReraModalOpen, setIsReraModalOpen] = useState(false);
  const reraId = property?.reraNumber || property?.raw?.reraNumber || '';
  const reraUrl = property?.reraUrl || property?.raw?.reraUrl || '';
  const brochureUrl = property?.brochureUrl || property?.raw?.brochure?.url || '';
  const qrData = reraUrl || reraId || property?.title || 'RERA';

  const isRent = property?.raw?.category === 'rent';
  const rentPerMonth = property?.raw?.rentPerMonth || property?.rentPerMonth;
  const hasNumericPrice = Number.isFinite(Number(property?.priceValue)) && Number(property.priceValue) > 0;
  const hasNumericRent = Number.isFinite(Number(rentPerMonth)) && Number(rentPerMonth) > 0;

  const configurationLabel =
    property?.bhk && property.bhk !== '-'
      ? `${property.bhk} BHK`
      : property?.raw?.category === 'commercial'
        ? 'Commercial'
        : 'On Request';
  const areaLabel = property?.area && property.area !== 'N/A' ? `${property.area} sq.ft` : 'On Request';
  return (
    <div className="sticky top-32 bg-white p-8 rounded-2xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.06)] border border-slate-100">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-heading font-black text-primary">
            {isRent
              ? (hasNumericRent ? `₹${rentPerMonth}` : 'Rent on Request')
              : (hasNumericPrice ? `₹${property.price}` : 'Price on Request')}
          </span>
          <span className="text-slate-400 text-sm font-bold">
            {isRent
              ? (hasNumericRent ? '/month' : 'Market')
              : (hasNumericPrice ? 'Price' : 'Market')}
          </span>
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
            <Image
              src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(qrData)}&color=059669`}
              alt="QR"
              width={20}
              height={20}
              unoptimized
              className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <div className="leading-none">
             <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-emerald-600 text-[12px]">verified</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 ">RERA</span>
             </div>
             <p className="text-[8px] font-bold text-emerald-600/60 uppercase">Verify</p>
          </div>
        </motion.div>
      </div>

      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-8 bg-primary/5 inline-block px-3 py-1 rounded-full">Editorial Verified Collection</p>

      <div className="flex gap-4 p-4 bg-slate-50 rounded-xl mb-8 border border-slate-100">
        <div className="flex-1 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">BHK</p>
          <p className="font-heading font-bold text-slate-800">{configurationLabel}</p>
        </div>
        <div className="w-px bg-slate-200"></div>
        <div className="flex-1 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Area</p>
          <p className="font-heading font-bold text-slate-800">{areaLabel}</p>
        </div>
      </div>

      <div className="space-y-4">
        {brochureUrl ? (
          <a
            href={brochureUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-primary text-white py-4 rounded-full font-black text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Brochure
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="w-full bg-slate-200 text-slate-500 py-4 rounded-full font-black text-lg flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Brochure Not Available
          </button>
        )}
        <Link href="#lead-form" className="block w-full">
          <button className="w-full border-2 border-primary text-primary py-4 rounded-full font-black text-lg hover:bg-tertiary transition-all">
            Contact Expert
          </button>
        </Link>
        
        <div className="flex gap-4 pt-4">
          <WishlistButton
            propertyId={property.id || property._id}
            initialSaved={property.isSaved}
            variant="row"
          />
          <AddToCompareButton
            propertyId={property.id || property._id}
            variant="row"
          />
        </div>
      </div>

      <ReraQRModal 
        isOpen={isReraModalOpen} 
        onClose={() => setIsReraModalOpen(false)} 
        reraId={reraId}
        reraUrl={reraUrl}
        propertyName={property?.title}
      />
    </div>
  );
}
