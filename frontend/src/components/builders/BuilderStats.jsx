export default function BuilderStats({ builder }) {
  const ongoingProjects = Number.isFinite(Number(builder?.ongoingProjects))
    ? Number(builder.ongoingProjects)
    : 'N/A';
  const completedDeliveries = Number.isFinite(Number(builder?.completedDeliveries))
    ? Number(builder.completedDeliveries)
    : 'N/A';

  return (
    <section className="bg-zinc-900 py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group p-10 rounded-3xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-all text-center">
            <h3 className="text-6xl font-extrabold text-white mb-2 group-hover:scale-110 transition-transform font-headline">
              {builder.totalProjects}
            </h3>
            <p className="text-zinc-400 font-medium uppercase tracking-widest font-label text-sm">Total Projects</p>
          </div>
          <div className="group p-10 rounded-3xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-center">
            <h3 className="text-6xl font-extrabold text-primary mb-2 group-hover:scale-110 transition-transform font-headline">
              {ongoingProjects}
            </h3>
            <p className="text-zinc-400 font-medium uppercase tracking-widest font-label text-sm">Ongoing Projects</p>
          </div>
          <div className="group p-10 rounded-3xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-all text-center">
            <h3 className="text-6xl font-extrabold text-white mb-2 group-hover:scale-110 transition-transform font-headline">
              {completedDeliveries}
            </h3>
            <p className="text-zinc-400 font-medium uppercase tracking-widest font-label text-sm">Completed Deliveries</p>
          </div>
        </div>
      </div>
    </section>
  );
}
