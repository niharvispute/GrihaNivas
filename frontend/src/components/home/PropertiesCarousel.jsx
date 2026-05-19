'use client';

import SectionCarousel from './SectionCarousel';
import PropertyCard from '@/components/property/PropertyCard';

export default function PropertiesCarousel({ properties }) {
  return (
    <SectionCarousel
      title="Trending Projects in Mumbai"
      subtitle="Discover verified projects with best-value inventory and quick brochure access."
      items={properties}
      emptyMessage="No properties listed yet — exciting listings coming soon."
      itemClassName="min-w-[270px] w-[270px] sm:min-w-[295px] sm:w-[295px] md:min-w-[315px] md:w-[315px]"
      sectionClassName="bg-white"
      renderItem={(prop) => <PropertyCard property={prop} />}
    />
  );
}
