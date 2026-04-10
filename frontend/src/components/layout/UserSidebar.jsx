import Link from 'next/link';

export default function UserSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col p-4 bg-white border-r border-neutral-200 z-50">
      {/* Brand Logo */}
      <div className="px-4 py-6">
        <span className="text-2xl font-bold text-primary font-headline">Bricks Portal</span>
      </div>

      {/* Header Profile */}
      <div className="flex flex-col items-center gap-2 mb-8 px-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl ring-2 ring-primary/20">
          AJ
        </div>
        <div className="text-center">
          <p className="font-headline text-base font-bold text-on-surface text-slate-900">Alex Johnson</p>
          <p className="text-xs text-neutral-500 font-medium">Standard User</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-primary/5 text-primary rounded-lg border-r-4 border-primary font-semibold text-sm transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          <span>My Dashboard</span>
        </Link>
        <Link href="/dashboard/saved" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-100 rounded-lg text-sm transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
          <span>Saved Properties</span>
        </Link>
        <Link href="/dashboard/enquiries" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-100 rounded-lg text-sm transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>My Enquiries</span>
        </Link>
      </nav>

      {/* Logout */}
      <div className="mt-auto">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-neutral-600 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
