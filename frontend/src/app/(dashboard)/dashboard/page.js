export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Good morning, Alex</h1>
        <p className="text-slate-500 mt-1">Welcome back to your Bricks portal.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-moderate shadow-sm border border-neutral-100">
          <p className="text-sm font-semibold text-neutral-500 mb-1">Saved Properties</p>
          <h3 className="text-4xl font-extrabold text-primary">12</h3>
        </div>
        <div className="bg-white p-6 rounded-moderate shadow-sm border border-neutral-100">
          <p className="text-sm font-semibold text-neutral-500 mb-1">Enquiries Sent</p>
          <h3 className="text-4xl font-extrabold text-slate-900">5</h3>
        </div>
        <div className="bg-white p-6 rounded-moderate shadow-sm border border-neutral-100">
          <p className="text-sm font-semibold text-neutral-500 mb-1">Last Active</p>
          <h3 className="text-4xl font-extrabold text-slate-900">Today</h3>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-moderate border border-neutral-100 shadow-sm text-center">
        <p className="text-slate-500">More dashboard features coming soon...</p>
      </div>
    </div>
  );
}
