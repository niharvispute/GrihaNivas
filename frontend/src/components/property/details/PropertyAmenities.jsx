export default function PropertyAmenities({ amenities }) {
  if (!amenities) return null;

  return (
    <section>
      <h2 className="text-2xl font-heading font-extrabold mb-6 sm:mb-8 text-slate-900">World-Class Amenities</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
        {amenities.map((item, idx) => (
          <div key={idx} className="p-4 sm:p-6 bg-slate-50 rounded-2xl flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
            <span className="material-symbols-outlined text-3xl sm:text-4xl text-primary mb-3 sm:mb-4">{item.icon}</span>
            <p className="font-bold font-heading text-slate-700 text-sm sm:text-base">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
