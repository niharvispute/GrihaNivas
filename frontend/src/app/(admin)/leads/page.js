'use client';

import { useState } from 'react';

export default function LeadCRMPage() {
  const [activeFilter, setActiveFilter] = useState('All Statuses');

  const leads = [
    { name: "Aryan Sharma", initials: "AS", email: "aryan.s@example.com", phone: "+91 98765 43210", type: "Buy", property: "Lodha World View", date: "Oct 24, 2024", status: "New", statusColor: "bg-blue-50 text-blue-700", dotColor: "bg-blue-600" },
    { name: "Rohan Mehta", initials: "RM", email: "rohan.mehta@gmail.com", phone: "+91 99887 76655", type: "Rent", property: "Trump Tower Worli", date: "Oct 22, 2024", status: "Contacted", statusColor: "bg-amber-50 text-amber-700", dotColor: "bg-amber-600" },
    { name: "Priya Varma", initials: "PV", email: "p.varma@outlook.com", phone: "+91 91234 56789", type: "Loan", property: "Oberoi Sky City", date: "Oct 20, 2024", status: "Qualified", statusColor: "bg-emerald-50 text-emerald-700", dotColor: "bg-emerald-600" },
    { name: "Karan Kapoor", initials: "KK", email: "karan.k@example.com", phone: "+91 98989 89898", type: "Agreement", property: "Godrej Horizon", date: "Oct 18, 2024", status: "Closed", statusColor: "bg-slate-100 text-slate-500", dotColor: "bg-slate-400" },
    { name: "Sneha Das", initials: "SD", email: "sneha_d@info.com", phone: "+91 95555 44444", type: "Buy", property: "Rustomjee Elements", date: "Oct 15, 2024", status: "New", statusColor: "bg-blue-50 text-blue-700", dotColor: "bg-blue-600" }
  ];

  const stats = [
    { label: "Total Leads", value: "1,284", grow: "+12%", trend: "up" },
    { label: "Conversion Rate", value: "8.4%", grow: "+2.1%", trend: "up" },
    { label: "Response Time", value: "2.4h", grow: "-15%", trend: "down" },
    { label: "Top Interest", value: "Marine Drive", grow: "", trend: "" }
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* 📋 Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Lead CRM</h1>
          <p className="text-slate-500 font-bold mt-2">Centralized portal for lead tracking, segmentation, and conversion metrics.</p>
        </div>
        <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-primary/90 transition-all active:scale-95 shadow-2xl shadow-primary/20">
          <span className="material-symbols-outlined text-[20px]">file_download</span>
          Export CSV
        </button>
      </div>

      {/* 🔍 Segmentation Console */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-wrap gap-8 items-end">
        <div className="flex-1 min-w-[280px]">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Quick Search</label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-300" placeholder="Name, phone, or email..." type="text"/>
          </div>
        </div>
        <div className="w-64">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Lead Type</label>
          <div className="relative group">
            <select className="w-full appearance-none bg-slate-50 border border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer">
              <option>All Types</option>
              <option>Buy</option>
              <option>Rent</option>
              <option>Loan</option>
              <option>Agreement</option>
            </select>
            <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-lg group-hover:text-primary transition-colors">keyboard_arrow_down</span>
          </div>
        </div>
        <div className="w-64">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Lifecycle Status</label>
          <div className="relative group">
            <select className="w-full appearance-none bg-slate-50 border border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
              <option>All Statuses</option>
              <option>New</option>
              <option>Contacted</option>
              <option>Qualified</option>
              <option>Closed</option>
            </select>
            <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-lg group-hover:text-primary transition-colors">filter_list</span>
          </div>
        </div>
        <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-sm">
          Apply Filter
        </button>
      </div>

      {/* 📁 Lead Intelligence Table */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-50 overflow-hidden hover:shadow-2xl transition-all">
        <div className="overflow-x-auto px-6 pb-6 mt-6">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-6 py-4">Client integrity</th>
                <th className="px-6 py-4">Communication</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4">Intent association</th>
                <th className="px-6 py-4">Ingestion</th>
                <th className="px-6 py-4 text-center">Status lifecycle</th>
                <th className="px-6 py-4 text-right">Console</th>
              </tr>
            </thead>
            <tbody className="space-y-4">
              {leads.map((lead, i) => (
                <tr key={i} className="bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group rounded-3xl">
                  <td className="px-6 py-6 rounded-l-3xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg group-hover:bg-primary transition-colors">
                        {lead.initials}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{lead.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{lead.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm font-bold text-slate-500">{lead.phone}</td>
                  <td className="px-6 py-6 text-xs font-black uppercase tracking-widest">
                    <span className="bg-slate-200/50 px-3 py-1.5 rounded-full">{lead.type}</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-sm font-black text-primary italic tracking-tight cursor-pointer hover:underline">{lead.property}</span>
                  </td>
                  <td className="px-6 py-6 text-sm font-bold text-slate-400">{lead.date}</td>
                  <td className="px-6 py-6 text-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${lead.statusColor}`}>
                      <span className={`w-2 h-2 rounded-full animate-pulse ${lead.dotColor}`}></span>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right rounded-r-3xl">
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-10 py-8 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing 5 of 1,284 leads</span>
          <div className="flex gap-3">
            <button className="w-10 h-10 flex items-center justify-center border border-slate-100 rounded-xl bg-white hover:border-primary transition-all shadow-sm">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {[1, 2, 3].map(page => (
              <button key={page} className={`w-10 h-10 flex items-center justify-center border rounded-xl font-black text-xs transition-all ${page === 1 ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-slate-100 bg-white text-slate-400 hover:border-primary'}`}>
                {page}
              </button>
            ))}
            <button className="w-10 h-10 flex items-center justify-center border border-slate-100 rounded-xl bg-white hover:border-primary transition-all shadow-sm">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📈 Performance Analytics Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col gap-6 hover:shadow-2xl hover:scale-[1.02] transition-all group">
            <div className="flex justify-between items-center">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
              {stat.grow && (
                <span className={`text-[10px] font-black flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-50 shadow-sm ${stat.trend === 'up' ? 'text-emerald-600' : 'text-primary'}`}>
                  {stat.grow} <span className="material-symbols-outlined text-[14px]">{stat.trend === 'up' ? 'arrow_upward' : 'arrow_downward'}</span>
                </span>
              )}
            </div>
            <h3 className={`font-black tracking-tighter ${i === 3 ? 'text-xl text-primary mt-1' : 'text-3xl text-slate-900 mt-2'}`}>{stat.value}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
