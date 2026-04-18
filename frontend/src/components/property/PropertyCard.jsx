import Link from 'next/link';
import Image from 'next/image';
import AddToCompareButton from './AddToCompareButton';
import WishlistButton from './WishlistButton';

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
  const locationLabel = property?.location || 'Mumbai';

  return (
    <article className={`group relative bg-white rounded-moderate overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex ${isHorizontal ? 'flex-col lg:flex-row col-span-full' : 'flex-col'}`}>
      <div className={`relative ${isHorizontal ? 'w-full lg:w-1/2 h-80 lg:h-auto' : 'h-72'} overflow-hidden`}>
        {property.image ? (
          <Image
            src={property.image}
            alt={property.title}
            fill
            sizes={isHorizontal ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 100vw, 33vw'}
            unoptimized
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-slate-100 via-slate-50 to-white flex items-center justify-center border-b border-slate-100">
            <div className="text-center px-4">
              <span className="material-symbols-outlined text-4xl text-slate-300">image_not_supported</span>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">No image uploaded</p>
            </div>
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          {property.isFeatured && (
            <span className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Featured Property
            </span>
          )}
          {property.isNew && !property.isFeatured && (
            <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-primary">New Launch</span>
          )}
          {property.isVerified && (
            <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Verified</span>
          )}
        </div>
        <WishlistButton
          propertyId={property.id || property._id}
          initialSaved={property.isSaved}
          className="absolute top-4 right-4"
        />
      </div>

      <div className={`p-6 flex flex-col grow ${isHorizontal ? 'lg:p-8 lg:justify-center' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`${isHorizontal ? 'text-3xl font-extrabold' : 'text-xl font-bold'} text-slate-900 leading-tight mb-1 tracking-tight`}>
              {property.title}
            </h3>
            <p className="text-slate-500 text-sm flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {locationLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="text-primary font-black text-2xl tracking-tighter">
              {displayPrice}
            </p>
            {hasNumericPrice && property.priceSuffix && (
              <p className={`text-[10px] font-bold uppercase tracking-wider ${property.priceSuffix === 'Price on Request' ? 'bg-primary/10 text-primary px-2 py-0.5 rounded' : 'text-slate-400'}`}>
                {property.priceSuffix}
              </p>
            )}
          </div>
        </div>

        {isHorizontal && property.description && (
          <p className="text-slate-600 text-base mb-8 leading-relaxed line-clamp-3">
            {property.description}
          </p>
        )}

        <div className={`grid ${isHorizontal ? 'grid-cols-3' : 'flex flex-wrap'} gap-4 mb-8 text-xs text-slate-500 border-t border-slate-100 pt-4 mt-auto`}>
          <div className="flex flex-col gap-1">
            {isHorizontal && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuration</span>}
            <div className="flex items-center gap-1">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
              <span className={`font-bold ${isHorizontal ? 'text-lg text-slate-900' : ''}`}>{configurationLabel}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {isHorizontal && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Build Area</span>}
            <div className="flex items-center gap-1">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              <span className={`font-bold ${isHorizontal ? 'text-lg text-slate-900' : ''}`}>{areaLabel}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {isHorizontal && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status / Feature</span>}
            <div className="flex items-center gap-1">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              <span className={`font-bold ${isHorizontal ? 'text-lg text-slate-900' : ''}`}>{statusLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href={detailHref} className={`grow bg-primary text-white py-4 rounded-full font-bold tracking-tight hover:bg-primary/90 transition-all text-center ${isHorizontal ? 'text-base px-10' : 'text-sm'}`}>
            {isHorizontal ? 'Inquire Now' : 'View Details'}
          </Link>
          {isHorizontal ? (
            <Link
              href={`${detailHref}#lead-form`}
              className="px-8 border-2 border-primary text-primary py-4 rounded-full font-bold text-sm tracking-tight hover:bg-primary/5 transition-all whitespace-nowrap"
            >
              Schedule a Tour
            </Link>
          ) : (
            <AddToCompareButton
              propertyId={property.id || property._id}
              initialAdded={property.isCompared}
            />
          )}
        </div>
      </div>
    </article>
  );
}
