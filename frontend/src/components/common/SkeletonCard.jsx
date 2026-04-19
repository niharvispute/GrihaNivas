export default function SkeletonCard({ variant = 'vertical' }) {
  const isHorizontal = variant === 'horizontal';

  return (
    <div
      className={`bg-white rounded-moderate overflow-hidden shadow-sm animate-pulse flex ${
        isHorizontal ? 'flex-col lg:flex-row' : 'flex-col'
      }`}
    >
      {/* Image placeholder */}
      <div
        className={`bg-slate-100 shrink-0 ${
          isHorizontal ? 'w-full lg:w-1/2 h-80 lg:h-64' : 'h-72'
        }`}
      />

      {/* Content placeholder */}
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="space-y-2">
          <div className="h-5 bg-slate-100 rounded-full w-3/4" />
          <div className="h-3.5 bg-slate-100 rounded-full w-1/2" />
        </div>
        <div className="h-7 bg-slate-100 rounded-full w-1/3 mt-1" />
        <div className="border-t border-slate-50 pt-4 flex gap-4">
          <div className="h-4 bg-slate-100 rounded-full w-16" />
          <div className="h-4 bg-slate-100 rounded-full w-20" />
          <div className="h-4 bg-slate-100 rounded-full w-14" />
        </div>
        <div className="mt-auto h-11 bg-slate-100 rounded-full w-full" />
      </div>
    </div>
  );
}

export function SkeletonCarousel({ count = 3 }) {
  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-8 mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-12 h-1 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-3 w-32 bg-slate-200 rounded-full animate-pulse" />
        </div>
        <div className="h-10 w-80 bg-slate-100 rounded-full animate-pulse mb-3" />
        <div className="h-4 w-96 bg-slate-100 rounded-full animate-pulse" />
      </div>
      <div className="px-8 flex gap-8 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="min-w-[300px] md:min-w-[400px] lg:min-w-[450px] shrink-0">
            <SkeletonCard />
          </div>
        ))}
      </div>
    </section>
  );
}
