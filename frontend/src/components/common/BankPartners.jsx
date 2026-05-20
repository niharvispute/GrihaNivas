import React from 'react';

export default function BankPartners() {
  const partners = ['SBI', 'HDFC BANK', 'ICICI BANK', 'AXIS BANK', 'KOTAK', 'LIC HFL'];

  return (
    <section className="bg-slate-50 py-16 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-8">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10">
          Preferred Financial Partners
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          {partners.map((partner) => (
            <div 
              key={partner} 
              className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter hover:text-primary transition-colors cursor-default"
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
