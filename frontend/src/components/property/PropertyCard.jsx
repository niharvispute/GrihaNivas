import Link from 'next/link';
import CloudinaryImage from '@/components/CloudinaryImage';
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
  const locationLabel = property?.location || SYSTEM_DEFAULT_CITY;

  return (
    <article className={`group relative bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-primary/25 shadow-sm hover:shadow-lg hover:shadow-slate-200/80 transition-all duration-500 flex ${isHorizontal ? 'flex-col lg:flex-row col-span-full' : 'flex-col h-full'}`}>
      {/* Image */}
      <div className={`relative ${isHorizontal ? 'w-full lg:w-2/5 h-52 sm:h-64 lg:h-auto' : 'h-44 sm:h-48 flex-none'} overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50`}>
        {property.image ? (
          <CloudinaryImage
            src={property.image}
            alt={property.title}
            fill
            sizes={isHorizontal ? '(max-width: 1024px) 100vw, 40vw' : '(max-width: 1024px) 100vw, 33vw'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center px-4">
              <span className="material-symbols-outlined text-3xl text-slate-200">image_not_supported</span>
            </div>
          </div>
        )}
        {property.isFeatured && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-primary to-primary/80 text-white px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Featured
          </span>
        )}
        <WishlistButton
          propertyId={property.id || property._id}
          initialSaved={property.isSaved}
          className="absolute top-2 right-2 z-10 scale-75"
        />
      </div>

      {/* Content */}
      <div className={`p-3 sm:p-4 md:p-5 flex flex-col grow gap-2 sm:gap-3 ${isHorizontal ? 'lg:p-6 lg:justify-center' : 'min-h-[190px]'}`}>
        {/* Title + Price */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className={`${isHorizontal ? 'text-lg sm:text-xl font-extrabold' : 'text-xs sm:text-sm font-black'} text-slate-900 leading-tight line-clamp-1 uppercase tracking-tight`}>
              {property.title}
            </h3>
            <p className="text-slate-400 text-[11px] sm:text-xs flex items-center gap-1 mt-1 font-bold truncate">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
              <span className="truncate">{locationLabel}</span>
            </p>
          </div>
          <p className={`text-primary font-black tracking-tighter shrink-0 ${isHorizontal ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'}`}>
            {displayPrice}
          </p>
        </div>

        {isHorizontal && property.description && (
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
            {property.description}
          </p>
        )}

        {/* Stats — compact inline row */}
        <div className="grid grid-cols-2 gap-3 py-2 sm:py-3 border-t border-slate-100">
          <span className="min-w-0">
            <span className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Config</span>
            <span className="mt-1 flex items-center gap-1 text-xs sm:text-sm font-black text-slate-900 truncate">
              <span className="material-symbols-outlined text-primary text-sm sm:text-base">apartment</span>
              {configurationLabel}
            </span>
          </span>
          <span className="min-w-0 border-l border-slate-100 pl-3">
            <span className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Area</span>
            <span className="mt-1 flex items-center gap-1 text-xs sm:text-sm font-black text-slate-900 truncate">
              <span className="material-symbols-outlined text-primary text-sm sm:text-base">square_foot</span>
              {areaLabel}
            </span>
          </span>
        </div>

        {/* CTA */}
        {isHorizontal ? (
          <div className="flex gap-2 mt-2">
            <Link
              href={detailHref}
              className="flex-1 bg-primary text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all text-center"
            >
              Inquire Now
            </Link>
            <Link
              href={`${detailHref}#lead-form`}
              className="flex-1 border border-primary text-primary py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-primary/5 transition-all text-center"
            >
              Schedule Tour
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-auto">
            <Link
              href={detailHref}
              className="w-full h-9 sm:h-10 flex items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-tighter hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              View Property
            </Link>
            <AddToCompareButton
              propertyId={property.id || property._id}
              variant="row"
              className="w-full h-9 sm:h-10 rounded-lg text-[10px] sm:text-xs font-black tracking-tighter"
            />
          </div>
        )}
      </div>
    </article>
  );
}
