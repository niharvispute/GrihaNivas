export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-neutral-500 mt-1">Welcome back to the Mumbai Editorial console.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-moderate shadow-sm border border-neutral-100">
          <p className="text-neutral-500 text-sm font-medium">Total Leads</p>
          <h3 className="text-2xl font-extrabold text-primary">1,284</h3>
        </div>
        <div className="bg-white p-6 rounded-moderate shadow-sm border border-neutral-100">
          <p className="text-neutral-500 text-sm font-medium">Properties</p>
          <h3 className="text-2xl font-extrabold text-neutral-900">452</h3>
        </div>
        <div className="bg-white p-6 rounded-moderate shadow-sm border border-neutral-100">
          <p className="text-neutral-500 text-sm font-medium">Visits</p>
          <h3 className="text-2xl font-extrabold text-neutral-900">45,820</h3>
        </div>
        <div className="bg-white p-6 rounded-moderate shadow-sm border border-neutral-100">
          <p className="text-neutral-500 text-sm font-medium">Closed</p>
          <h3 className="text-2xl font-extrabold text-neutral-900">96</h3>
        </div>
      </div>

      <div className="bg-white p-12 rounded-moderate border border-neutral-100 shadow-sm text-center">
        <p className="text-slate-400 font-medium tracking-tight uppercase text-xs">Administrative insights coming soon...</p>
      </div>
    </div>
  );
}
