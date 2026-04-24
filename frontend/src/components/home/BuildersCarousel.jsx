'use client';

import SectionCarousel from './SectionCarousel';
import TrendingBuilderCard from './TrendingBuilderCard';

export default function BuildersCarousel({ builders }) {
  if (!builders?.length) return null;
  return (
    <SectionCarousel
      title="The Master Builders"
      subtitle="Discover the visionaries behind Mumbai's most iconic skylines and architectural marvels."
      items={builders}
      itemClassName="w-full min-w-full md:w-[calc(50%-0.875rem)] md:min-w-[calc(50%-0.875rem)] lg:w-[calc(33.333%-1rem)] lg:min-w-[calc(33.333%-1rem)]"
      renderItem={(builder) => <TrendingBuilderCard builder={builder} />}
    />
  );
}
