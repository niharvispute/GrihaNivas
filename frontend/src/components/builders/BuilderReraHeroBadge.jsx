'use client';

import { useState } from 'react';
import Image from 'next/image';
import ReraQRModal from '@/components/property/details/ReraQRModal';

export default function BuilderReraHeroBadge({ reraNumber, reraUrl, builderName }) {
  const [open, setOpen] = useState(false);
  const qrData = reraUrl || reraNumber || builderName || 'RERA';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all group w-fit"
      >
        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-emerald-100 shrink-0">
          <Image
            src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(qrData)}&color=059669`}
            alt="RERA QR"
            width={18}
            height={18}
            unoptimized
            className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"
          />
        </div>
        <div className="leading-none text-left">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-emerald-600 text-[11px]">verified</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">MahaRERA Registered</span>
          </div>
          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{reraNumber}</p>
        </div>
        <span className="material-symbols-outlined text-emerald-400 text-sm ml-1 group-hover:text-emerald-600 transition-colors">qr_code_2</span>
      </button>

      <ReraQRModal
        isOpen={open}
        onClose={() => setOpen(false)}
        reraId={reraNumber}
        reraUrl={reraUrl}
        propertyName={builderName}
      />
    </>
  );
}
