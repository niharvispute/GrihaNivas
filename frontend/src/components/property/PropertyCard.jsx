import Link from 'next/link';
import Image from 'next/image';
import AddToCompareButton from './AddToCompareButton';
import WishlistButton from './WishlistButton';
import { SYSTEM_DEFAULT_CITY } from '@/lib/system/defaults';

export default function PropertyCard({ property, variant = 'vertical' }) {
  const isHorizontal = variant === 'horizontal';
  const detailKey = property?.slug || property?.id;
  const detailHref = detailKey ? `/property/${detailKey}` : '/buy';
  const hasNumericPrice = Number.isFinite(Number(property?.priceValue)) && Number(property.priceValue) > 0;
  const fallbackPriceText = typeof property?.price === 'string' ? property.price.trim() : '';
  const displayPrice = hasNumericPrice
    ? `₹${property.price}`
    : fallbackPriceText
      ? `₹${fallbackPriceText.replace(/^₹\s?/, '')}`
      : 'Price on Request';
  const configurationLabel =
    property?.bhk && property.bhk !== '-'
      ? `${property.bhk} BHK`
      : property?.raw?.category === 'commercial'
        ? 'Commercial'
        : 'Configuration on request';
  const areaLabel =
    property?.area && property.area !== 'N/A'
      ? `${property.area} sq.ft`
      : 'Area on request';
  const statusLabel = property?.status || property?.feature || 'Available';
  const locationLabel = property?.location || SYSTEM_DEFAULT_CITY;

  return (
    <article className={`group relative bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 flex ${isHorizontal ? 'flex-col lg:flex-row col-span-full' : 'flex-col h-full'}`}>
      <div className={`relative ${isHorizontal ? 'w-full lg:w-1/2 h-60 sm:h-72 lg:h-auto' : 'h-40 sm:h-48 md:h-56 flex-none'} overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50`}>
        {property.image ? (
          <Image
            src={property.image}
            alt={property.title}
            fill
            sizes={isHorizontal ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 100vw, 33vw'}
            unoptimized
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center px-4">
              <span className="material-symbols-outlined text-5xl text-slate-200">image_not_supported</span>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">No image</p>
            </div>
          </div>
        )}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex gap-2 flex-wrap">
          {property.isFeatured && (
            <span className="bg-gradient-to-r from-primary to-primary/80 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Featured
            </span>
          )}
          {property.isNew && !property.isFeatured && (
            <span className="bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-primary shadow-lg">New Launch</span>
          )}
          {property.isVerified && (
            <span className="bg-primary/90 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-lg">Verified</span>
          )}
        </div>
        <WishlistButton
          propertyId={property.id || property._id}
          initialSaved={property.isSaved}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10"
        />
      </div>

      <div className={`p-4 sm:p-5 md:p-6 flex flex-col grow gap-3 ${isHorizontal ? 'lg:p-8 lg:justify-center' : ''}`}>
        <div>
          <h3 className={`${isHorizontal ? 'text-2xl sm:text-3xl font-extrabold' : 'text-sm sm:text-base md:text-lg font-black'} text-slate-900 leading-tight mb-1 line-clamp-2`}>
            {property.title}
          </h3>
          <p className="text-slate-500 text-[11px] sm:text-xs flex items-center gap-1.5 truncate font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
            <span className="truncate">{locationLabel}</span>
          </p>
          <p className="text-primary font-black text-base sm:text-lg md:text-xl mt-2 tracking-tighter">
            {displayPrice}
          </p>
        </div>

        {isHorizontal && property.description && (
          <p className="text-slate-600 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed line-clamp-3">
            {property.description}
          </p>
        )}

        <div className={`grid ${isHorizontal ? 'grid-cols-3' : 'grid-cols-2'} gap-3 md:gap-4 py-3 md:py-4 border-t border-slate-100 flex-grow`}>
          <div>
            <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Configuration</p>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base sm:text-lg">apartment</span>
              <span className={`font-bold truncate text-slate-900 text-sm ${isHorizontal ? 'text-lg' : ''}`}>{configurationLabel}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Build Area</p>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base sm:text-lg">square_foot</span>
              <span className={`font-bold truncate text-slate-900 text-sm ${isHorizontal ? 'text-lg' : ''}`}>{areaLabel}</span>
            </div>
          </div>
        </div>

        <div className={`flex gap-2.5 mt-auto pt-2 ${isHorizontal ? 'flex-row' : 'flex-col'}`}>
          <Link
            href={detailHref}
            className={`flex-1 bg-gradient-to-r from-primary to-primary/85 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-black tracking-tighter hover:shadow-lg hover:shadow-primary/40 transition-all text-center text-[10px] sm:text-xs uppercase text-nowrap ${isHorizontal ? 'px-10' : ''}`}
          >
            {isHorizontal ? 'Inquire Now' : 'View Details'}
          </Link>
          {isHorizontal ? (
            <Link
              href={`${detailHref}#lead-form`}
              className="px-6 sm:px-8 border-2 border-primary text-primary py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm tracking-tighter hover:bg-primary/5 transition-all whitespace-nowrap"
            >
              Schedule Tour
            </Link>
          ) : (
            <Link
              href={detailHref}
              className="flex-1 border-2 border-slate-200 text-slate-700 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-black tracking-tighter hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-center text-[10px] sm:text-xs uppercase text-nowrap"
            >
              Availability
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
