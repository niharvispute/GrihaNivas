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
      itemClassName="w-full min-w-full md:w-[calc(50%-0.875rem)] md:min-w-[calc(50%-0.875rem)] lg:w-[calc(33.333%-1rem)] lg:min-w-[calc(33.333%-1rem)]"
      sectionClassName="bg-white"
      renderItem={(prop) => <PropertyCard property={prop} />}
    />
  );
}
