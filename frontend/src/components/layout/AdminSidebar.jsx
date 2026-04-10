import Link from 'next/link';

export default function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col py-6 bg-neutral-900 text-white z-50">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xl font-bold text-white tracking-tight">Bricks Admin</span>
        </div>
        <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">Console</p>
      </div>

      <nav className="flex-1 space-y-1">
        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg mx-2 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link href="/admin/properties" className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg mx-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="font-medium">Properties</span>
        </Link>
        <Link href="/admin/leads" className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg mx-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
          <span className="font-medium">Leads</span>
        </Link>
        <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg mx-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span className="font-medium">Users</span>
        </Link>
      </nav>

      <div className="mt-auto px-4">
        <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              AU
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-bold truncate">Admin User</p>
              <p className="text-neutral-500 text-[10px] truncate">admin@bricks.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
