export default function BuilderStats({ builder }) {
  const ongoingProjects = Number.isFinite(Number(builder?.ongoingProjects))
    ? Number(builder.ongoingProjects)
    : 'N/A';
  const completedDeliveries = Number.isFinite(Number(builder?.completedDeliveries))
    ? Number(builder.completedDeliveries)
    : 'N/A';

  return (
    <section className="bg-zinc-900 py-14 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          <div className="group p-6 sm:p-8 lg:p-10 rounded-3xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-all text-center">
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-2 group-hover:scale-110 transition-transform font-headline">
              {builder.totalProjects}
            </h3>
            <p className="text-zinc-400 font-medium uppercase tracking-widest font-label text-sm">Total Projects</p>
          </div>
          <div className="group p-6 sm:p-8 lg:p-10 rounded-3xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-center">
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary mb-2 group-hover:scale-110 transition-transform font-headline">
              {ongoingProjects}
            </h3>
            <p className="text-zinc-400 font-medium uppercase tracking-widest font-label text-sm">Ongoing Projects</p>
          </div>
          <div className="group p-6 sm:p-8 lg:p-10 rounded-3xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-all text-center sm:col-span-2 lg:col-span-1">
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-2 group-hover:scale-110 transition-transform font-headline">
              {completedDeliveries}
            </h3>
            <p className="text-zinc-400 font-medium uppercase tracking-widest font-label text-sm">Completed Deliveries</p>
          </div>
        </div>
      </div>
    </section>
  );
}
