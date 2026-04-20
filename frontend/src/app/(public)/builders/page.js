import BuilderCard from '@/components/builders/BuilderCard';
import BuilderFilterBar from '@/components/builders/BuilderFilterBar';
import FeaturedBuildersCarousel from '@/components/builders/FeaturedBuildersCarousel';
import { listBuilders } from '@/services/builderService';

export const metadata = {
  title: 'Explore Builders | Bricks - Mumbai Editorial',
  description: 'Discover trusted real estate developers crafting the future of modern living across Mumbai.',
};

export default async function ExploreBuildersPage({ searchParams }) {
  const params = await searchParams;
  const query = {
    page: Number(params?.page || 1),
    limit: 20,
    search: params?.search || undefined,
    isFeatured:
      params?.isFeatured === 'true'
        ? true
        : params?.isFeatured === 'false'
          ? false
          : undefined,
  };

  const [response, featuredResponse] = await Promise.all([
    listBuilders(query),
    listBuilders({ page: 1, limit: 4, isFeatured: true }),
  ]);

  const builders = response?.items || [];
  const featuredBuilders = (featuredResponse?.items || []).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-1.5 sm:pt-4 pb-16 sm:pb-20 max-w-screen-2xl mx-auto px-4 sm:px-6">
        {/* Dynamic Search & Filter Bar */}
        <BuilderFilterBar 
          initialSearch={params?.search || ''} 
          initialIsFeatured={params?.isFeatured === 'true'} 
          initialCity={params?.city || ''}
        />

        <FeaturedBuildersCarousel builders={featuredBuilders} />

        {/* Builder Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6 lg:gap-8">
          {builders.map((builder) => (
            <BuilderCard key={builder.id} builder={builder} />
          ))}
        </section>

        {builders.length === 0 && (
          <p className="text-sm font-medium text-zinc-500 text-center py-12">
            No builders match this search yet.
          </p>
        )}

        {/* Pagination placeholder */}
        <div className="mt-10 sm:mt-16 flex justify-center">
          <button className="group flex items-center gap-2 bg-on-background bg-zinc-900 text-white px-7 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold hover:bg-zinc-800 transition-all active:scale-95 shadow-xl uppercase tracking-widest text-[11px] sm:text-xs">
            <span>Load More Builders</span>
            <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">expand_more</span>
          </button>
        </div>
      </main>
    </div>
  );
}
