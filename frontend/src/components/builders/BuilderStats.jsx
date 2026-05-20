export default function BuilderStats({ builder }) {
  const ongoingProjects = Number.isFinite(Number(builder?.ongoingProjects))
    ? Number(builder.ongoingProjects)
    : 'N/A';
  const completedDeliveries = Number.isFinite(Number(builder?.completedDeliveries))
    ? Number(builder.completedDeliveries)
    : 'N/A';

  return (
    <section className="bg-zinc-900 py-10 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          <div className="group p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-2xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-all text-center">
            <h3 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform font-headline">
              {builder.totalProjects}
            </h3>
            <p className="text-zinc-300 font-black uppercase tracking-[0.15em] font-label text-[9px] sm:text-sm">Total Projects</p>
          </div>
          <div className="group p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-2xl bg-primary/20 border border-primary/40 hover:bg-primary/30 transition-all text-center">
            <h3 className="text-2xl sm:text-5xl lg:text-6xl font-black text-primary mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform font-headline">
              {ongoingProjects}
            </h3>
            <p className="text-zinc-300 font-black uppercase tracking-[0.15em] font-label text-[9px] sm:text-sm">Ongoing</p>
          </div>
          <div className="group p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-2xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-all text-center col-span-2 lg:col-span-1">
            <h3 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform font-headline">
              {completedDeliveries}
            </h3>
            <p className="text-zinc-300 font-black uppercase tracking-[0.15em] font-label text-[9px] sm:text-sm">Completed Deliveries</p>
          </div>
        </div>
      </div>
    </section>
  );
}
