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
      itemClassName="min-w-[270px] w-[270px] sm:min-w-[295px] sm:w-[295px] md:min-w-[315px] md:w-[315px]"
      sectionClassName="bg-[#f8f7f5]"
      renderItem={(builder) => <TrendingBuilderCard builder={builder} />}
    />
  );
}
