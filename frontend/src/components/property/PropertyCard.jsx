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
  const statusLabel = property?.status || property?.feature || 'Available';
  const locationLabel = property?.location || SYSTEM_DEFAULT_CITY;

  return (
    <article className={`group relative bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-primary/25 shadow-sm hover:shadow-lg hover:shadow-slate-200/80 transition-all duration-500 flex ${isHorizontal ? 'flex-col lg:flex-row col-span-full' : 'flex-col h-full w-[300px] mx-auto md:w-full'}`}>
      <div className={`relative ${isHorizontal ? 'w-full lg:w-1/2 h-52 sm:h-64 lg:h-auto' : 'h-36 sm:h-44 md:h-48 flex-none'} overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50`}>
        {property.image ? (
          <CloudinaryImage
            src={property.image}
            alt={property.title}
            fill
            sizes={isHorizontal ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 100vw, 33vw'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center px-4">
              <span className="material-symbols-outlined text-4xl sm:text-5xl text-slate-200">image_not_supported</span>
              <p className="mt-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-300">No image</p>
            </div>
          </div>
        )}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex gap-1.5 flex-wrap">
          {property.isFeatured && (
            <span className="bg-gradient-to-r from-primary to-primary/80 text-white px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Featured
            </span>
          )}
        </div>
        <WishlistButton
          propertyId={property.id || property._id}
          initialSaved={property.isSaved}
          className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 scale-75 sm:scale-100"
        />
      </div>

      <div className={`p-3 sm:p-4 md:p-5 flex flex-col grow gap-2 sm:gap-3 ${isHorizontal ? 'lg:p-6 lg:justify-center' : ''}`}>
        <div className={isHorizontal ? '' : 'flex flex-row items-start justify-between gap-2'}>
          <div className="min-w-0 flex-1">
            <h3 className={`${isHorizontal ? 'text-xl sm:text-2xl font-extrabold mb-0.5' : 'text-xs sm:text-sm font-black mb-0.5'} text-slate-900 leading-tight line-clamp-1 uppercase`}>
              {property.title}
            </h3>
            <p className="text-slate-500 text-[10px] sm:text-xs flex items-center gap-1 truncate font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
              <span className="truncate">{locationLabel}</span>
            </p>
          </div>
          <p className={`text-primary font-black tracking-tighter shrink-0 ${isHorizontal ? 'text-sm sm:text-base md:text-lg mt-1' : 'text-xs sm:text-sm'}`}>
            {displayPrice}
          </p>
        </div>

        {isHorizontal && property.description && (
          <p className="text-slate-600 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed line-clamp-3">
            {property.description}
          </p>
        )}

        <div className={`grid ${isHorizontal ? 'grid-cols-3' : 'grid-cols-2'} gap-2 sm:gap-3 py-2 sm:py-3 border-t border-slate-100 flex-grow`}>
          <div>
            <p className="text-[8px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider mb-0.5">Config</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-sm sm:text-base">apartment</span>
              <span className={`font-black truncate text-slate-900 text-xs sm:text-sm ${isHorizontal ? 'sm:text-base' : ''}`}>{configurationLabel}</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Area</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-sm sm:text-base">square_foot</span>
              <span className={`font-black truncate text-slate-900 text-xs sm:text-sm ${isHorizontal ? 'sm:text-base' : ''}`}>{areaLabel}</span>
            </div>
          </div>
        </div>

        {isHorizontal ? (
          <div className="flex gap-2 mt-auto pt-1">
            <Link
              href={detailHref}
              className="flex-1 px-10 bg-gradient-to-r from-primary to-primary/85 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl font-black tracking-tighter hover:shadow-lg hover:shadow-primary/40 transition-all text-center text-[9px] sm:text-xs uppercase text-nowrap"
            >
              Inquire Now
            </Link>
            <Link
              href={`${detailHref}#lead-form`}
              className="flex-1 px-6 sm:px-8 border-2 border-primary text-primary py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm tracking-tighter hover:bg-primary/5 transition-all whitespace-nowrap"
            >
              Schedule Tour
            </Link>
          </div>
        ) : (
          <div className="flex flex-col w-full gap-2 mt-auto pt-1">
            <Link
              href={detailHref}
              className="w-full h-9 sm:h-10 flex items-center justify-center bg-gradient-to-r from-primary to-primary/85 text-white rounded-lg font-black tracking-tighter hover:shadow-lg hover:shadow-primary/40 transition-all text-[10px] sm:text-xs uppercase"
            >
              View Property
            </Link>
            <AddToCompareButton
              propertyId={property.id || property._id}
              variant="row"
              className="w-full h-9 sm:h-10 rounded-lg text-[10px] sm:text-xs font-black tracking-tighter uppercase"
            />
          </div>
        )}
      </div>
    </article>
  );
}
