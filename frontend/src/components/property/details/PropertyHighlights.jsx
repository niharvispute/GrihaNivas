export default function PropertyHighlights({ highlights }) {
  if (!highlights) return null;

  return (
    <section>
      <h2 className="text-2xl font-heading font-extrabold mb-6 sm:mb-8 text-slate-900">Property Highlights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {highlights.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 sm:gap-4 p-2 rounded-xl border border-transparent">
            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl shrink-0">
              <span className="material-symbols-outlined text-primary">{item.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="font-heading font-bold text-slate-800 wrap-break-word">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

