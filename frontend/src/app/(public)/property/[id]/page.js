import Link from 'next/link';
import { notFound } from 'next/navigation';
import PropertyGallery from '@/components/property/details/PropertyGallery';
import PropertyStickyInfo from '@/components/property/details/PropertyStickyInfo';
import PropertyHighlights from '@/components/property/details/PropertyHighlights';
import PropertyAbout from '@/components/property/details/PropertyAbout';
import PropertyAmenities from '@/components/property/details/PropertyAmenities';
import PropertyAppliances from '@/components/property/details/PropertyAppliances';
import PropertyFloorPlans from '@/components/property/details/PropertyFloorPlans';
import PropertyLeadForm from '@/components/property/details/PropertyLeadForm';
import PropertyBuilderProfile from '@/components/property/details/PropertyBuilderProfile';
import MobileStickyBar from '@/components/property/details/MobileStickyBar';
import SimilarPropertiesCarousel from '@/components/property/details/SimilarPropertiesCarousel';
import {
  getPropertyById,
  getPropertyBySlug,
  listProperties,
} from '@/services/propertyService';

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const property = await getPropertyBySlug(id).catch(() => getPropertyById(id));
    if (!property) return { title: 'Property Not Found' };

    const title = property.title || 'Property in Mumbai';
    const area = property.raw?.location?.area || 'Mumbai';
    const price = property.priceFormatted || '';
    const image = property.raw?.heroImage?.url || property.raw?.heroImage || null;

    return {
      title: `${title} in ${area}`,
      description: `${title} — ${area}, Mumbai. ${price ? `Starting at ${price}.` : ''} View details, photos, floor plans and more.`.trim(),
      openGraph: {
        title: `${title} | GrihaNivas`,
        description: `${title} in ${area}, Mumbai. ${price ? `Price: ${price}.` : ''}`,
        ...(image && { images: [{ url: image, width: 1200, height: 630, alt: title }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | GrihaNivas`,
        ...(image && { images: [image] }),
      },
    };
  } catch {
    return { title: 'Property Details' };
  }
}

export default async function PropertyDetailPage({ params }) {
  const { id } = await params;

  let property = null;
  try {
    property = await getPropertyBySlug(id);
  } catch {
    property = null;
  }

  if (!property) {
    try {
      property = await getPropertyById(id);
    } catch {
      property = null;
    }
  }

  if (!property) {
    notFound();
  }

  let similarProperties = [];
  try {
    const response = await listProperties({
      category: property?.raw?.category,
      limit: 6,
    });
    similarProperties = (response.items || [])
      .filter((item) => item.id !== property.id)
      .slice(0, 3);
  } catch {
    similarProperties = [];
  }

  const neighborhoodHighlights = property?.neighborhood?.highlights || [];
  const gallery = property?.gallery || [];
  const highlights = property?.highlights || [];
  const amenities = property?.amenities || [];
  const appliances = property?.appliances || [];
  const floorPlans = property?.floorPlans || [];
  const locationQuery =
    [property?.raw?.location?.address, property?.raw?.location?.area, property?.raw?.location?.city]
      .filter(Boolean)
      .join(', ') || property?.location;
  const mapEmbedUrl = locationQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&output=embed`
    : null;

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bricksmumbai.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description || property.longDescription,
    url: `${SITE_URL}/property/${property.slug || property.id}`,
    image: property.raw?.heroImage?.url || property.raw?.heroImage || undefined,
    offers: property.raw?.price
      ? { '@type': 'Offer', price: property.raw.price, priceCurrency: 'INR' }
      : undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.raw?.location?.area,
      streetAddress: property.raw?.location?.address,
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
  };

  return (
    <main className="pt-2 sm:pt-7 lg:pt-8 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 sm:mb-8 px-1 overflow-x-auto no-scrollbar">
        <ol className="inline-flex items-center space-x-2">
          <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li className="flex items-center">
            <svg className="w-3 h-3 mx-1 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            <Link href="/buy" className="hover:text-primary transition-colors">Listings</Link>
          </li>
          <li className="flex items-center">
            <svg className="w-3 h-3 mx-1 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            <span className="text-primary truncate max-w-50">{property.title}</span>
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="mb-8 sm:mb-16 lg:mb-20 space-y-5 sm:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="max-w-4xl space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black tracking-tight text-slate-900 leading-tight">
              {property.title}
            </h1>
            <p className="text-slate-500 flex items-center gap-2 font-bold text-sm md:text-base">
              <svg className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{property.location || locationQuery || 'Mumbai'}</span>
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">
              {property?.category === 'rent' ? 'Monthly Rent' : 'Expected Price'}
            </p>
            <p className="text-4xl lg:text-5xl font-heading font-black text-slate-900 tracking-tighter">
              {property.price ? `₹${property.price}` : 'POA'}
              {property?.category === 'rent' && <span className="text-lg ml-1 font-bold text-slate-400">/mo</span>}
            </p>
          </div>
        </div>

        <PropertyGallery images={gallery} property={property} />
      </section>

      {/* Main Content Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 space-y-8 sm:space-y-16 lg:space-y-20">
          <PropertyHighlights highlights={highlights} />
          <PropertyAbout description={property.longDescription || property.description} />
          <PropertyAppliances appliances={appliances} />
          <PropertyAmenities amenities={amenities} />
          {property?.raw?.category !== 'rent' && (
            <PropertyFloorPlans floorPlans={floorPlans} brochureUrl={property?.brochureUrl} />
          )}
          
          {/* Neighborhood Placeholder */}
          <section>
            <h2 className="text-2xl font-heading font-black mb-6 sm:mb-8 text-slate-900">Neighborhood & Location</h2>
            <div className="rounded-2xl overflow-hidden shadow-lg h-72 sm:h-96 relative mb-8 border border-slate-100">
              {mapEmbedUrl ? (
                <iframe
                  title="Property Neighborhood Map"
                  src={mapEmbedUrl}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-white flex flex-col items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-5xl">map</span>
                  <p className="mt-3 text-xs font-bold uppercase tracking-widest">Location details unavailable</p>
                </div>
              )}
              {neighborhoodHighlights.length > 0 && (
                <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 bg-white/90 backdrop-blur-md p-3 sm:p-6 rounded-2xl grid grid-cols-2 lg:flex lg:flex-wrap gap-4 sm:gap-8 border border-white shadow-xl">
                  {neighborhoodHighlights.map((nh, idx) => (
                    <div key={idx} className="flex items-center gap-2 md:gap-3">
                      <span className="material-symbols-outlined text-primary text-lg sm:text-xl">{nh.icon}</span>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 sm:mb-1">{nh.label}</p>
                        <p className="font-bold text-slate-700 text-[11px] sm:text-sm truncate">{nh.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column Sidebar */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          <PropertyLeadForm property={property} />
          <PropertyBuilderProfile builder={property.builder} />
        </div>
      </div>

      <SimilarPropertiesCarousel properties={similarProperties} />

      {/* Mobile Sticky Bar — visible only on mobile, fixed at bottom */}
      <MobileStickyBar property={property} />
    </main>
  );
}
