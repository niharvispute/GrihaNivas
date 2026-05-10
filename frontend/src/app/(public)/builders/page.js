import { Suspense } from 'react';
import BuilderCard from '@/components/builders/BuilderCard';
import BuilderFilterBar from '@/components/builders/BuilderFilterBar';
import FeaturedBuildersCarousel from '@/components/builders/FeaturedBuildersCarousel';
import { listBuilders } from '@/services/builderService';

export const metadata = {
  title: 'Explore Builders | Ghar - Grihavastu',
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
  const meta = response?.meta || {};
  const featuredBuilders = (featuredResponse?.items || []).slice(0, 4);
  const hasRateLimit = Boolean(response?.rateLimited || featuredResponse?.rateLimited);

  const hasMore = meta.totalPages > meta.currentPage;
  const showLoadMore = builders.length > 6 && hasMore;

  return (
    <div className="w-full">
      <main className="pb-16 sm:pb-20 pt-6 md:pt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dynamic Search & Filter Bar */}
        <Suspense fallback={<div className="h-12 bg-slate-50 rounded-full animate-pulse" />}>
          <BuilderFilterBar
            initialSearch={params?.search || ''}
            initialIsFeatured={params?.isFeatured === 'true'}
            initialCity={params?.city || ''}
          />
        </Suspense>

        {hasRateLimit && (
          <div className="mb-6 sm:mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs sm:text-sm font-bold text-amber-800">
            Too many requests were sent recently. Showing limited results for now. Please retry in a moment.
          </div>
        )}

        <FeaturedBuildersCarousel builders={featuredBuilders} />

        {/* Builder Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {builders.map((builder) => (
            <BuilderCard key={builder.id} builder={builder} />
          ))}
        </section>

        {builders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 md:py-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 mt-6">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">domain</span>
            <p className="text-slate-500 font-bold text-sm md:text-base">No builders match this search yet.</p>
          </div>
        )}

        {/* Pagination placeholder */}
        {showLoadMore && (
          <div className="mt-10 sm:mt-16 flex justify-center">
            <button className="group flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-white px-7 sm:px-10 py-3.5 sm:py-4 rounded-full font-black transition-all active:scale-95 shadow-xl uppercase tracking-widest text-[11px] sm:text-xs">
              <span>Load More Builders</span>
              <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">expand_more</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
