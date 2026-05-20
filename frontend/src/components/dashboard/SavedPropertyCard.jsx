import Image from 'next/image';
import Link from 'next/link';
import { resolveImageAlt, resolveImageSrc } from '@/lib/system/media';

export default function SavedPropertyCard({ property, onUnsave }) {
  const detailHref = `/property/${property.slug || property.id}`;
  const imageSrc = resolveImageSrc(property?.image);
  const imageAlt = resolveImageAlt(property?.title, 'Saved property image');

  return (
    <div className="group flex flex-col lg:flex-row bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
      {/* Image Section */}
      <div className="relative w-full sm:w-40 lg:w-80 h-40 sm:h-48 lg:h-auto overflow-hidden flex-shrink-0">
        {imageSrc ? (
          <Image
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 160px, 320px"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            src={imageSrc}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
            <span className="material-symbols-outlined text-4xl">image</span>
          </div>
        )}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex gap-2">
          <span className="bg-primary text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full tracking-widest uppercase shadow-lg">
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
      <div className="flex-1 p-4 sm:p-5 lg:p-6 flex flex-col justify-between">
        <div>
          <div className="mb-2 sm:mb-4">
            <h3 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-heading font-black text-slate-900 leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2">
              {property.title}
            </h3>
            <div className="flex flex-row items-baseline gap-1.5 mt-1 sm:mt-2">
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-heading font-black text-primary tracking-tighter">₹{property.price}</span>
              {property.priceSuffix && (
                <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {property.priceSuffix}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center text-[8px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4 bg-slate-50 w-fit px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-100">
            <span className="material-symbols-outlined text-xs sm:text-sm mr-1 sm:mr-1.5 text-primary">location_on</span>
            <span className="truncate">{property.location}</span>
          </div>

          {/* Specs - Hidden on mobile, shown on sm+ */}
          <div className="hidden sm:flex flex-wrap gap-2 text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
              <span className="material-symbols-outlined text-sm md:text-base text-primary">bed</span>
              {property.bhk} BHK
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
              <span className="material-symbols-outlined text-sm md:text-base text-primary">square_foot</span>
              {property.area} sq.ft
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <span className="material-symbols-outlined text-sm md:text-base">check_circle</span>
              {property.status || 'Ready'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 lg:mt-6 pt-3 sm:pt-4 border-t border-slate-50">
          <Link href={detailHref} className="flex-1 text-center border-2 border-slate-100 text-slate-600 font-heading font-black uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs py-2 sm:py-2.5 lg:py-3.5 rounded-full hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]">
            Details
          </Link>
          <Link
            href={`${detailHref}#lead-form`}
            className="flex-1 bg-primary text-white font-heading font-black uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs py-2 sm:py-2.5 lg:py-3.5 rounded-full shadow-lg hover:scale-105 transition-all active:scale-[0.98] text-center"
          >
            Enquire
          </Link>
        </div>
      </div>
    </div>
  );
}
