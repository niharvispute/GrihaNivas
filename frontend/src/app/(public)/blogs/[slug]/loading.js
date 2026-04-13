export default function BlogDetailLoading() {
  return (
    <div className="bg-white min-h-screen animate-pulse">
      {/* Hero skeleton */}
      <div className="w-full h-[420px] bg-slate-100" />

      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="h-4 bg-slate-100 rounded-full w-48 mb-12" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-8 bg-slate-100 rounded-full w-3/4" />
            <div className="h-8 bg-slate-100 rounded-full w-1/2" />
            <div className="space-y-3 mt-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-4 bg-slate-100 rounded-full" style={{ width: `${85 + (i % 3) * 5}%` }} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="h-48 bg-slate-100 rounded-[2rem]" />
            <div className="h-32 bg-slate-100 rounded-[2rem]" />
          </div>
        </div>
      </div>
    </div>
  );
}
