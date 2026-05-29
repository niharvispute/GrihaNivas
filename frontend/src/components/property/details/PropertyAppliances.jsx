export default function PropertyAppliances({ appliances }) {
  if (!appliances || appliances.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-heading font-black mb-6 sm:mb-8 text-slate-900">Appliances Included</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
        {appliances.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center hover:bg-white hover:shadow-lg hover:border-primary/10 transition-all"
          >
            <span className="material-symbols-outlined text-2xl sm:text-3xl text-primary">{item.icon}</span>
            <p className="font-black text-[9px] sm:text-[10px] text-slate-600 uppercase tracking-[0.1em] leading-tight">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
