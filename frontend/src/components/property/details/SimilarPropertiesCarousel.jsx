'use client';

import SectionCarousel from '@/components/home/SectionCarousel';
import TrendingProjectCard from '@/components/home/TrendingProjectCard';

export default function SimilarPropertiesCarousel({ properties = [] }) {
  if (!Array.isArray(properties) || properties.length === 0) {
    return (
      <section className="mt-16 sm:mt-24 lg:mt-32">
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">You May Also Like</h2>
        <p className="mt-6 text-sm font-medium text-slate-500">
          More similar listings will appear here soon.
        </p>
      </section>
    );
  }

  return (
    <div className="mt-6 sm:mt-10">
      <SectionCarousel
        title="You May Also Like"
        subtitle="Similar homes curated by location, category, and lifestyle fit."
        items={properties}
        itemClassName="w-full min-w-full max-w-full sm:w-[calc((100%-1.5rem)/2)] sm:min-w-[calc((100%-1.5rem)/2)] sm:max-w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-4rem)/3)] md:min-w-[calc((100%-4rem)/3)] md:max-w-[calc((100%-4rem)/3)] lg:w-[calc((100%-6rem)/4)] lg:min-w-[calc((100%-6rem)/4)] lg:max-w-[calc((100%-6rem)/4)]"
        renderItem={(property) => <TrendingProjectCard property={property} />}
      />
    </div>
  );
}
