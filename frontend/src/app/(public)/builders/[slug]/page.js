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
    return {
      title: `${builder.name} | Bricks - Mumbai Editorial`,
      description: builder.tagline,
    };
  } catch {
    return { title: 'Builder Not Found' };
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
      
      <main className="pt-16">
        {/* Dynamic Profile Sections */}
        <BuilderHero builder={builder} />
        
        <BuilderAbout builder={builder} />
        
        <BuilderStats builder={builder} />
        
        <BuilderPortfolio builder={builder} properties={properties} />
        
        <BuilderTestimonials builder={builder} />
        
        {/* FAQ & Lead Form Section */}
        <section className="py-24 bg-zinc-900 text-white overflow-hidden relative">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row gap-20">
              <BuilderFAQ builder={builder} />
              <BuilderEnquiryForm builder={builder} />
            </div>
          </div>
          
          {/* Decorative decorative layer */}
          <div className="absolute -bottom-64 -right-64 w-lg h-128 bg-primary/10 rounded-full blur-3xl"></div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
