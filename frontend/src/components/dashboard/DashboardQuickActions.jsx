import Link from 'next/link';

const STATUS_STYLES = {
  new: { label: 'Under Review', badge: 'bg-blue-50 text-blue-700' },
  reviewing: { label: 'In Review', badge: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Published', badge: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Rejected', badge: 'bg-rose-50 text-rose-700' },
  closed: { label: 'Closed', badge: 'bg-slate-100 text-slate-600' },
};

export default function DashboardQuickActions({ hasListings = false, latestListing = null, listingsCount = 0 }) {
  const listingStatus = STATUS_STYLES[latestListing?.status] || STATUS_STYLES.new;

  const actions = [
    {
      title: "Browse Properties",
      desc: "Find your dream home",
      icon: "travel_explore",
      href: "/buy",
      primary: true
    },
    ...(hasListings
      ? [
          {
            title: 'My Property Status',
            desc: `${listingStatus.label} • ${listingsCount} ${listingsCount === 1 ? 'listing' : 'listings'}`,
            icon: 'domain',
            href: '/account/listings',
            primary: false,
            statusBadge: listingStatus,
          },
        ]
      : []),
    {
      title: "EMI Calculator",
      desc: "Plan your finances",
      icon: "calculate",
      href: "/emi-calculator",
      primary: false
    },
    {
      title: "List Property",
      desc: "Sell or rent your space",
      icon: "add_business",
      href: "/list-property",
      primary: false
    }
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-base font-heading font-black text-slate-900 mb-4">Quick Actions</h2>
      {actions.map((action, idx) => (
        <Link
          key={idx}
          href={action.href}
          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all active:scale-[0.98] group relative overflow-hidden ${
            action.primary
              ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/30'
              : 'bg-white text-slate-900 border border-slate-100 hover:border-primary/30 hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform ${
              action.primary ? 'bg-white/20' : 'bg-slate-50 text-primary'
            }`}>
              <span className="material-symbols-outlined text-xl">{action.icon}</span>
            </div>
            <div className="text-left">
              <p className="font-heading font-bold text-xs">{action.title}</p>
              <p className={`text-[10px] font-medium ${action.primary ? 'text-white/70' : 'text-slate-400'}`}>{action.desc}</p>
            </div>
          </div>
          {action.statusBadge && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${action.statusBadge.badge}`}>
              {action.statusBadge.label}
            </span>
          )}
          <span className={`material-symbols-outlined transition-transform group-hover:translate-x-1 ${
            action.primary ? 'text-white/50' : 'text-slate-300'
          }`}>chevron_right</span>

          {action.primary && (
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
          )}
        </Link>
      ))}
    </div>
  );
}
