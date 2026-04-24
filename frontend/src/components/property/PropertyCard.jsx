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
    <article className={`group relative bg-white rounded-xl md:rounded-3xl overflow-hidden shadow-sm md:shadow-md hover:shadow-2xl transition-all duration-500 flex ${isHorizontal ? 'flex-col lg:flex-row col-span-full' : 'flex-col h-full w-[300px] mx-auto md:w-full'}`}>
      <div className={`relative ${isHorizontal ? 'w-full lg:w-1/2 h-60 sm:h-72 lg:h-auto' : 'h-32 sm:h-48 md:h-56 flex-none'} overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50`}>
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

      <div className={`p-3 sm:p-5 md:p-6 flex flex-col grow gap-2 sm:gap-3 ${isHorizontal ? 'lg:p-8 lg:justify-center' : ''}`}>
        <div>
          <h3 className={`${isHorizontal ? 'text-2xl sm:text-3xl font-extrabold' : 'text-[13px] sm:text-base md:text-lg font-black'} text-slate-900 leading-tight mb-0.5 line-clamp-1 sm:line-clamp-2 uppercase`}>
            {property.title}
          </h3>
          <p className="text-slate-500 text-[10px] sm:text-xs flex items-center gap-1 truncate font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
            <span className="truncate">{locationLabel}</span>
          </p>
          <p className="text-primary font-black text-[14px] sm:text-lg md:text-xl mt-1.5 tracking-tighter">
            {displayPrice}
          </p>
        </div>

        {isHorizontal && property.description && (
          <p className="text-slate-600 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed line-clamp-3">
            {property.description}
          </p>
        )}

        <div className={`grid ${isHorizontal ? 'grid-cols-3' : 'grid-cols-2'} gap-2 sm:gap-4 py-2 sm:py-4 border-t border-slate-100 flex-grow mt-1`}>
          <div>
            <p className="text-[8px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider mb-0.5">Config</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-sm sm:text-lg">apartment</span>
              <span className={`font-black truncate text-slate-900 text-[11px] sm:text-sm ${isHorizontal ? 'text-lg' : ''}`}>{configurationLabel}</span>
            </div>
          </div>
          <div>
            <p className="text-[8px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider mb-0.5">Area</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-sm sm:text-lg">square_foot</span>
              <span className={`font-black truncate text-slate-900 text-[11px] sm:text-sm ${isHorizontal ? 'text-lg' : ''}`}>{areaLabel}</span>
            </div>
          </div>
        </div>

        <div className={`flex gap-2 mt-auto pt-1 ${isHorizontal ? 'flex-row' : 'flex-row'}`}>
          {!isHorizontal && (
            <div className="w-[25%] sm:w-[30%]">
              <AddToCompareButton
                propertyId={property.id || property._id}
                variant="icon"
                className="rounded-lg h-9 sm:h-11"
              />
            </div>
          )}
          <Link
            href={detailHref}
            className={`bg-gradient-to-r from-primary to-primary/85 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl font-black tracking-tighter hover:shadow-lg hover:shadow-primary/40 transition-all text-center text-[9px] sm:text-xs uppercase text-nowrap ${isHorizontal ? 'flex-1 px-10' : 'w-[75%] sm:w-[70%] h-9 sm:h-11 flex items-center justify-center'}`}
          >
            {isHorizontal ? 'Inquire Now' : 'Details'}
          </Link>
          {isHorizontal ? (
            <Link
              href={`${detailHref}#lead-form`}
              className="flex-1 px-6 sm:px-8 border-2 border-primary text-primary py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm tracking-tighter hover:bg-primary/5 transition-all whitespace-nowrap"
            >
              Schedule Tour
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
