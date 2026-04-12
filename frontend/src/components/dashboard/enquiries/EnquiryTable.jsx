export default function EnquiryTable() {
  const enquiries = [
    {
      id: 1,
      name: "Marine Drive Penthouse",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200",
      type: "Buy",
      date: "Oct 24, 2023",
      status: "Qualified",
      note: "Documents verified, ready for site visit.",
      theme: "emerald"
    },
    {
      id: 2,
      name: "The Sky Loft - Studio B",
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=200",
      type: "Rent",
      date: "Oct 22, 2023",
      status: "Contacted",
      note: "Call scheduled for tomorrow at 10 AM.",
      theme: "blue"
    },
    {
      id: 3,
      name: "Home Loan Assistance",
      type: "Loan",
      date: "Oct 20, 2023",
      status: "New",
      note: "Awaiting agent assignment.",
      theme: "orange",
      isService: true,
      serviceIcon: "payments"
    },
    {
      id: 4,
      name: "Lease Agreement Service",
      type: "Agreement",
      date: "Oct 15, 2023",
      status: "Closed",
      note: "Agreement signed and delivered.",
      theme: "slate",
      isService: true,
      serviceIcon: "description"
    }
  ];

  const statusThemes = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    slate: "bg-slate-50 text-slate-500 border-slate-100"
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Property / Service</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Type</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Submitted</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Note</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {enquiries.map((item) => (
              <tr key={item.id} className="hover:bg-primary/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-inner flex items-center justify-center">
                      {item.isService ? (
                        <span className="material-symbols-outlined text-primary text-2xl">{item.serviceIcon}</span>
                      ) : (
                        <img alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={item.image} />
                      )}
                    </div>
                    <span className="font-heading font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors">{item.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                    {item.type}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-bold text-slate-500">{item.date}</span>
                </td>
                <td className="px-8 py-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusThemes[item.theme]}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm text-slate-400 font-medium max-w-xs truncate" title={item.note}>{item.note}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/5 transition-all">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
