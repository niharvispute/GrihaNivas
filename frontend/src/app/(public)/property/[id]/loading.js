export default function PropertyDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8 animate-pulse">
      {/* Gallery skeleton */}
      <div className="w-full h-[480px] bg-slate-100 rounded-[2.5rem] mb-12" />

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main content */}
        <div className="flex-1 space-y-8">
          <div className="h-6 bg-slate-100 rounded-full w-1/3" />
          <div className="h-10 bg-slate-100 rounded-full w-3/4" />
          <div className="flex gap-4">
            <div className="h-8 bg-slate-100 rounded-full w-24" />
            <div className="h-8 bg-slate-100 rounded-full w-24" />
            <div className="h-8 bg-slate-100 rounded-full w-24" />
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-100 rounded-full w-full" />
            <div className="h-4 bg-slate-100 rounded-full w-5/6" />
            <div className="h-4 bg-slate-100 rounded-full w-4/6" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
            ))}
          </div>
        </div>
        {/* Sticky sidebar */}
        <div className="w-full lg:w-80 space-y-4">
          <div className="h-64 bg-slate-100 rounded-[2rem]" />
          <div className="h-48 bg-slate-100 rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}
