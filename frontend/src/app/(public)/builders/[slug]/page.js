import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BuilderHero from '@/components/builders/BuilderHero';
import BuilderAbout from '@/components/builders/BuilderAbout';
import BuilderStats from '@/components/builders/BuilderStats';
import BuilderPortfolio from '@/components/builders/BuilderPortfolio';
import BuilderTestimonials from '@/components/builders/BuilderTestimonials';
import BuilderFAQ from '@/components/builders/BuilderFAQ';
import BuilderEnquiryForm from '@/components/builders/BuilderEnquiryForm';
import { getBuilderBySlug } from '@/services/builderService';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const { builder } = await getBuilderBySlug(slug, { limit: 1 });
    const image = builder.logo?.url || builder.logo || null;
    return {
      title: `${builder.name} — Mumbai Properties`,
      description: builder.tagline || `Explore properties by ${builder.name} in Mumbai. View portfolio, testimonials, and enquire today.`,
      openGraph: {
        title: `${builder.name} | Bricks Mumbai`,
        description: builder.tagline || `Properties by ${builder.name} in Mumbai.`,
        ...(image && { images: [{ url: image, width: 1200, height: 630, alt: builder.name }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${builder.name} | Bricks Mumbai`,
        ...(image && { images: [image] }),
      },
    };
  } catch {
    return { title: 'Builder Profile' };
  }
}

export default async function BuilderDetailPage({ params }) {
  const { slug } = await params;
  let payload;

  try {
    payload = await getBuilderBySlug(slug, { limit: 12 });
  } catch {
    payload = null;
  }

  if (!payload?.builder) {
    notFound();
  }

  const builder = payload.builder;
  const properties = payload.properties || [];

  return (
    <div className="min-h-screen bg-background text-on-background antialiased">
      {/* <Header /> */}
      
      <main className="pt-0">
        {/* Dynamic Profile Sections */}
        <BuilderHero builder={builder} />
        
        <BuilderAbout builder={builder} />
        
        <BuilderStats builder={builder} />
        
        <BuilderPortfolio builder={builder} properties={properties} />
        
        <BuilderTestimonials builder={builder} />
        
        {/* FAQ & Lead Form Section */}
        <section className="py-14 sm:py-16 lg:py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
              <BuilderFAQ builder={builder} />
              <BuilderEnquiryForm builder={builder} />
            </div>
          </div>
          
          {/* Decorative decorative layer */}
          <div className="absolute -bottom-64 -right-64 w-lg h-128 bg-primary/10 rounded-full blur-3xl"></div>
        </section>
      </main>

    </div>
  );
}
