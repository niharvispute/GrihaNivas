import Link from 'next/link';

export default function SavedPropertyCard({ property, onUnsave }) {
  const detailHref = `/property/${property.slug || property.id}`;

  return (
    <div className="group flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
      {/* Image Section */}
      <div className="relative w-full md:w-80 h-56 md:h-auto overflow-hidden">
        <img 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          src={property.image} 
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-lg shadow-primary/20">
            {property.type || 'BUY'}
          </span>
        </div>
        <button
          onClick={onUnsave}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-primary shadow-sm hover:scale-110 active:scale-95 transition-all"
          title="Remove from saved"
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
        </button>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-8 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
            <h3 className="text-2xl font-heading font-black text-slate-900 leading-tight tracking-tight group-hover:text-primary transition-colors">
              {property.title}
            </h3>
            <div className="text-right flex flex-col items-end">
              <span className="text-2xl font-heading font-black text-primary tracking-tighter">₹{property.price}</span>
              {property.priceSuffix && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {property.priceSuffix}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
            <span className="material-symbols-outlined text-sm mr-2 text-primary">location_on</span>
            {property.location}
          </div>

          <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="material-symbols-outlined text-lg text-primary">bed</span>
              {property.bhk} BHK
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="material-symbols-outlined text-lg text-primary">square_foot</span>
              {property.area} sq.ft
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {property.status || 'Ready'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-50">
          <Link href={detailHref} className="flex-1 text-center border-2 border-slate-100 text-slate-600 font-heading font-black uppercase tracking-widest text-xs py-4 rounded-full hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]">
            View Details
          </Link>
          <button className="flex-1 bg-primary text-white font-heading font-black uppercase tracking-widest text-xs py-4 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all active:scale-[0.98]">
            Enquire Now
          </button>
        </div>
      </div>
    </div>
  );
}
