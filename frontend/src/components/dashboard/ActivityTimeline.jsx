export default function ActivityTimeline() {
  const activities = [
    {
      id: 1,
      title: "Enquiry status updated for Sea View Residency",
      time: "10 mins ago",
      status: "Contacted",
      meta: "Broker: Skyline Realty",
      icon: "update",
      theme: "pink"
    },
    {
      id: 2,
      title: "Added Bandra West Penthouse to Saved",
      time: "2 hours ago",
      status: "Alert Set",
      meta: "New price alert enabled.",
      icon: "favorite",
      theme: "indigo"
    },
    {
      id: 3,
      title: "New property alert: Altamount Road Luxury",
      time: "5 hours ago",
      status: "New Match",
      meta: "Matched your \"Luxury Apartments\" search",
      icon: "notifications_active",
      theme: "amber"
    }
  ];

  const themeClasses = {
    pink: "bg-pink-100 text-pink-600",
    indigo: "bg-indigo-100 text-indigo-600",
    amber: "bg-amber-100 text-amber-600"
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center">
        <h2 className="text-xl font-heading font-black text-slate-900">Recent Activity</h2>
        <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
      </div>
      <div className="divide-y divide-slate-50">
        {activities.map((activity, idx) => (
          <div key={activity.id} className="p-8 flex gap-6 items-start hover:bg-slate-50/50 transition-colors group">
            <div className="relative mt-1">
              <div className={`w-12 h-12 rounded-full ${themeClasses[activity.theme]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-2xl">{activity.icon}</span>
              </div>
              {idx !== activities.length - 1 && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-px h-16 bg-slate-100"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <p className="font-heading font-bold text-slate-900 text-base">{activity.title}</p>
                <span className="text-[10px] uppercase font-bold text-slate-400">{activity.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest">
                  {activity.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">{activity.meta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
