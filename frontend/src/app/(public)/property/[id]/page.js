import Link from 'next/link';
import { notFound } from 'next/navigation';
import PropertyGallery from '@/components/property/details/PropertyGallery';
import PropertyStickyInfo from '@/components/property/details/PropertyStickyInfo';
import PropertyHighlights from '@/components/property/details/PropertyHighlights';
import PropertyAbout from '@/components/property/details/PropertyAbout';
import PropertyAmenities from '@/components/property/details/PropertyAmenities';
import PropertyFloorPlans from '@/components/property/details/PropertyFloorPlans';
import PropertyLeadForm from '@/components/property/details/PropertyLeadForm';
import PropertyBuilderProfile from '@/components/property/details/PropertyBuilderProfile';
import MobileStickyBar from '@/components/property/details/MobileStickyBar';
import PropertyCard from '@/components/property/PropertyCard';
import {
  getPropertyById,
  getPropertyBySlug,
  listProperties,
} from '@/services/propertyService';

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
  const floorPlans = property?.floorPlans || [];
  const locationQuery =
    [property?.raw?.location?.address, property?.raw?.location?.area, property?.raw?.location?.city]
      .filter(Boolean)
      .join(', ') || property?.location;
  const mapEmbedUrl = locationQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&output=embed`
    : null;

  return (
    <main className="pt-8 pb-24 max-w-7xl mx-auto px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 px-1">
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
      <section className="mb-20 space-y-8">
        <div className="max-w-4xl space-y-3">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-slate-900">
            {property.title}
          </h1>
          <p className="text-slate-500 flex items-center gap-2 font-medium text-sm md:text-base">
            <svg className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{property.location || locationQuery || 'Mumbai'}</span>
          </p>
        </div>

        <PropertyGallery images={gallery} property={property} />
      </section>

      {/* Main Content Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-20">
          <PropertyHighlights highlights={highlights} />
          <PropertyAbout description={property.longDescription || property.description} />
          <PropertyAmenities amenities={amenities} />
          <PropertyFloorPlans floorPlans={floorPlans} brochureUrl={property?.brochureUrl} />
          
          {/* Neighborhood Placeholder */}
          <section>
            <h2 className="text-2xl font-heading font-extrabold mb-8 text-slate-900">Neighborhood & Location</h2>
            <div className="rounded-2xl overflow-hidden shadow-lg h-96 relative mb-8 border border-slate-100">
              {mapEmbedUrl ? (
                <iframe
                  title="Property Neighborhood Map"
                  src={mapEmbedUrl}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-slate-100 to-white flex flex-col items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-5xl">map</span>
                  <p className="mt-3 text-xs font-bold uppercase tracking-widest">Location details unavailable</p>
                </div>
              )}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-xl flex flex-wrap gap-8 border border-white shadow-xl">
                  {neighborhoodHighlights.map((nh, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">{nh.icon}</span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{nh.label}</p>
                        <p className="font-bold text-slate-700 text-sm">{nh.value}</p>
                      </div>
                    </div>
                 ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <PropertyLeadForm property={property} />
          <PropertyBuilderProfile builder={property.builder} />
        </div>
      </div>

      {/* Similar Properties Carousel (Simplified for now) */}
      <section className="mt-32">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-heading font-extrabold text-slate-900">You May Also Like</h2>
          <div className="flex gap-4">
            <button className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {similarProperties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>

        {similarProperties.length === 0 && (
          <p className="mt-6 text-sm font-medium text-slate-500">
            More similar listings will appear here soon.
          </p>
        )}
      </section>

      {/* Mobile Sticky Bar — visible only on mobile, fixed at bottom */}
      <MobileStickyBar property={property} />
    </main>
  );
}
