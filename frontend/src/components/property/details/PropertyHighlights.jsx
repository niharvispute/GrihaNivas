export default function PropertyHighlights({ highlights }) {
  if (!highlights) return null;

  return (
    <section>
      <h2 className="text-2xl font-heading font-black mb-6 sm:mb-8 text-slate-900">Property Highlights</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
        {highlights.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2.5 sm:gap-4 p-2 rounded-xl border border-transparent">
            <div className="p-2 sm:p-3 bg-slate-50 rounded-xl shrink-0 group-hover:bg-primary/5 transition-colors">
              <span className="material-symbols-outlined text-primary text-xl sm:text-2xl">{item.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5 sm:mb-1">{item.label}</p>
              <p className="font-heading font-bold text-slate-800 text-xs sm:text-base leading-snug break-words">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

