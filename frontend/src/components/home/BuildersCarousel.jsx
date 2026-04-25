'use client';

import SectionCarousel from './SectionCarousel';
import TrendingBuilderCard from './TrendingBuilderCard';

export default function BuildersCarousel({ builders }) {
  return (
    <SectionCarousel
      title="The Master Builders"
      subtitle="Discover the visionaries behind Mumbai's most iconic skylines and architectural marvels."
      items={builders}
      emptyMessage="No builders listed yet — our curated builder directory is coming soon."
      itemClassName="w-full min-w-full md:w-[calc(50%-0.875rem)] md:min-w-[calc(50%-0.875rem)] lg:w-[calc(33.333%-1rem)] lg:min-w-[calc(33.333%-1rem)]"
      sectionClassName="bg-[#f8f7f5]"
      renderItem={(builder) => <TrendingBuilderCard builder={builder} />}
    />
  );
}
