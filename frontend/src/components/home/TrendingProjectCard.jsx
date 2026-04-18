import Link from 'next/link';
import Image from 'next/image';
import WishlistButton from '@/components/property/WishlistButton';

export default function TrendingProjectCard({ property }) {
  const detailKey = property?.slug || property?.id;
  const detailHref = detailKey ? `/property/${detailKey}` : '/buy';
  const locationLabel = property?.location || 'Mumbai';
  const projectTitle = property?.title || 'Project';
  const hasNumericPrice = Number.isFinite(Number(property?.priceValue)) && Number(property.priceValue) > 0;
  const fallbackPriceText = typeof property?.price === 'string' ? property.price.trim() : '';
  const displayPrice = hasNumericPrice
    ? `₹ ${property.price}`
    : fallbackPriceText
      ? `₹ ${fallbackPriceText.replace(/^₹\s?/, '')}`
      : 'Price on Request';

  const configurationLabel =
    property?.bhk && property.bhk !== '-'
      ? `${property.bhk} BHK Apartment for Sale in`
      : 'Apartment for Sale in';

  return (
    <article className="group rounded-2xl overflow-hidden">
      <div className="relative h-44 rounded-2xl overflow-hidden mb-2.5">
        <Link href={detailHref} className="block w-full h-full">
        {property?.image ? (
          <Image
            src={property.image}
            alt={projectTitle}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 300px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-100" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-slate-900/25 via-slate-900/0 to-transparent" />

        <div className="absolute left-2.5 bottom-2.5 bg-white text-slate-900 px-2.5 py-1.5 rounded-lg text-[12px] leading-none font-extrabold shadow-sm">
          {displayPrice}
        </div>

        </Link>

        <WishlistButton
          propertyId={property?.id || property?._id}
          initialSaved={property?.isSaved}
          className="absolute top-2.5 right-2.5"
        />
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        {property?.isVerified && (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            RERA Verified
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Trending
        </span>
      </div>

      <h3 className="text-xl leading-tight font-semibold text-slate-900 tracking-[-0.01em] mb-1 line-clamp-1">
        {projectTitle}
      </h3>
      <p className="text-base text-slate-700 mb-0.5 line-clamp-1">
        {configurationLabel}
      </p>
      <p className="text-base text-slate-800 font-medium mb-3.5 line-clamp-1">{locationLabel}</p>

      <div className="space-y-2">
        <a
          href="tel:+919999999999"
          className="w-full h-10 rounded-full border border-primary/30 text-primary text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-primary/5 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.63a2 2 0 0 1-.45 2.11L8.1 9.91a16 16 0 0 0 6 6l1.45-1.19a2 2 0 0 1 2.11-.45c.85.3 1.73.51 2.63.63A2 2 0 0 1 22 16.92z"/></svg>
          Quick Call
        </a>

        <Link
          href={detailHref}
          className="w-full h-10 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Download Brochure
        </Link>
      </div>
    </article>
  );
}