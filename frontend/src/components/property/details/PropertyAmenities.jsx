export default function PropertyAmenities({ amenities }) {
  if (!amenities) return null;

  return (
    <section>
      <h2 className="text-2xl font-heading font-black mb-6 sm:mb-8 text-slate-900">World-Class Amenities</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-6">
        {amenities.map((item, idx) => (
          <div key={idx} className="p-3 sm:p-6 bg-slate-50 rounded-2xl flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 ">
            <span className="material-symbols-outlined text-2xl sm:text-4xl text-primary mb-2 sm:mb-4">{item.icon}</span>
            <p className="font-black font-heading text-slate-700 text-[10px] sm:text-base tracking-tighter uppercase">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
