import Image from 'next/image';

export default function PropertyBuilderProfile({ builder }) {
  if (!builder) return null;

  return (
    <section className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center p-2 shadow-inner border border-slate-100 overflow-hidden relative">
          {builder.logo ? (
            <Image
              src={builder.logo}
              alt={builder.name}
              fill
              sizes="64px"
              unoptimized
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-xl font-bold text-primary">{builder.name[0]}</span>
          )}
        </div>
        <div>
          <h4 className="font-heading font-black text-lg text-slate-800">{builder.name}</h4>
          <p className="text-[11px] sm:text-xs text-slate-400 font-bold">Est. 1990 • {builder.projects} Projects Delivered</p>
        </div>
      </div>
      
      <p className="text-sm text-slate-500 leading-relaxed mb-6 font-bold">
        {builder.description}
      </p>
      
      <div className="flex flex-wrap gap-2">
        <span className="bg-tertiary text-primary px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Trusted Builder
        </span>
        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          {builder.experience} Experience
        </span>
      </div>
    </section>
  );
}
