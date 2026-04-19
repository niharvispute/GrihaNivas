import Link from 'next/link';

export default function SavedPropertyCard({ property, onUnsave }) {
  const detailHref = `/property/${property.slug || property.id}`;

  return (
    <div className="group flex flex-col lg:flex-row bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
      {/* Image Section */}
      <div className="relative w-full sm:w-40 lg:w-80 h-40 sm:h-48 lg:h-auto overflow-hidden flex-shrink-0">
        <img
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          src={property.image}
        />
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex gap-2">
          <span className="bg-primary text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full tracking-widest uppercase shadow-lg shadow-primary/20">
            {property.type || 'BUY'}
          </span>
        </div>
        <button
          onClick={onUnsave}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-primary shadow-sm hover:scale-110 active:scale-95 transition-all"
          title="Remove from saved"
        >
          <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
        </button>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        <div>
          <div className="mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-2xl lg:text-2xl font-heading font-black text-slate-900 leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2">
              {property.title}
            </h3>
            <div className="flex flex-col sm:flex-col gap-1 mt-2">
              <span className="text-lg sm:text-2xl lg:text-2xl font-heading font-black text-primary tracking-tighter">₹{property.price}</span>
              {property.priceSuffix && (
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {property.priceSuffix}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center text-slate-400 text-[9px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6 bg-slate-50 w-fit px-2 sm:px-3 py-1.5 rounded-lg border border-slate-100">
            <span className="material-symbols-outlined text-sm mr-1.5 sm:mr-2 text-primary">location_on</span>
            <span className="truncate">{property.location}</span>
          </div>

          {/* Specs - Hidden on mobile, shown on sm+ */}
          <div className="hidden sm:flex flex-wrap gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-100">
              <span className="material-symbols-outlined text-base sm:text-lg text-primary">bed</span>
              {property.bhk} BHK
            </div>
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-100">
              <span className="material-symbols-outlined text-base sm:text-lg text-primary">square_foot</span>
              {property.area} sq.ft
            </div>
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-emerald-50 text-emerald-600 rounded-lg sm:rounded-xl border border-emerald-100">
              <span className="material-symbols-outlined text-base sm:text-lg">check_circle</span>
              {property.status || 'Ready'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-4 mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 lg:pt-6 border-t border-slate-50">
          <Link href={detailHref} className="flex-1 text-center border-2 border-slate-100 text-slate-600 font-heading font-black uppercase tracking-widest text-[10px] sm:text-xs py-2 sm:py-3 lg:py-4 rounded-full hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]">
            Details
          </Link>
          <Link
            href={`${detailHref}#lead-form`}
            className="flex-1 bg-primary text-white font-heading font-black uppercase tracking-widest text-[10px] sm:text-xs py-2 sm:py-3 lg:py-4 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all active:scale-[0.98] text-center"
          >
            Enquire
          </Link>
        </div>
      </div>
    </div>
  );
}
