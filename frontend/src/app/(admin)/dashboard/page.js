'use client';

import { useState } from 'react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('All');

  const stats = [
    { label: "Total Leads", value: "1,284", grow: "+12%", icon: "person_add", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Properties Listed", value: "452", grow: "+5%", icon: "home_work", color: "text-pink-600", bg: "bg-pink-50" },
    { label: "Website Visits", value: "45,820", grow: "+18%", icon: "visibility", color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Leads Closed", value: "96", grow: "+8%", icon: "assignment_turned_in", color: "text-emerald-600", bg: "bg-emerald-50" }
  ];

  const recentLeads = [
    { name: "Rahul Sharma", initials: "RS", type: "Buy", property: "Lodha World View", status: "Qualified", statusColor: "bg-emerald-100 text-emerald-700" },
    { name: "Priya Mehta", initials: "PM", type: "Rent", property: "Piramal Aranya", status: "Contacted", statusColor: "bg-amber-100 text-amber-700" },
    { name: "Amit Patel", initials: "AP", type: "Loan", property: "Rustomjee Seasons", status: "New", statusColor: "bg-blue-100 text-blue-700" },
    { name: "Sneha Gupta", initials: "SG", type: "List Property", property: "Godrej Horizon", status: "Closed", statusColor: "bg-slate-100 text-slate-500" }
  ];

  const chartData = [
    { label: "Buy", value: 100, color: "bg-primary" },
    { label: "Rent", value: 87, color: "bg-primary/70" },
    { label: "Loan", value: 50, color: "bg-slate-200" },
    { label: "Agreement", value: 45, color: "bg-slate-200" },
    { label: "List Prop", value: 38, color: "bg-slate-200" }
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* 👋 Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Dashboard</h1>
          <p className="text-slate-500 font-bold mt-2">Welcome back to the Bricks administrative console.</p>
        </div>
        <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-3xl px-6 py-4 shadow-xl shadow-slate-200/50 cursor-pointer hover:border-primary transition-all group">
          <span className="material-symbols-outlined text-primary group-hover:rotate-12 transition-transform">calendar_today</span>
          <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Current Month (Oct 2024)</span>
          <span className="material-symbols-outlined text-slate-400">expand_more</span>
        </div>
      </div>

      {/* 📊 KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col gap-6 hover:shadow-2xl hover:scale-[1.02] transition-all group">
            <div className="flex justify-between items-start">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
                {stat.grow} <span className="material-symbols-outlined text-[14px]">trending_up</span>
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 🚀 Bento Layout: Analytics & Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Leads Analytics (Chart) */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-50 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all">
          <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-[0.1em]">Leads Analytics</h2>
            <button className="text-primary text-[10px] font-black flex items-center gap-2 hover:translate-x-1 transition-all uppercase tracking-widest">
              View Report <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="p-10 flex-1 flex items-end justify-between h-[320px] gap-8">
            {chartData.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-6 h-full justify-end group/bar">
                <div 
                  className={`w-full ${bar.color} rounded-t-3xl transition-all duration-700 group-hover/bar:brightness-90 relative`}
                  style={{ height: `${bar.value}%` }}
                >
                  <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-xl transition-all">
                    {bar.value}%
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Property Spotlight Card */}
        <div className="bg-primary rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-primary/30 group hover:scale-[1.02] transition-all">
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/20 px-4 py-2 rounded-full mb-10 inline-block">Editor's Choice</span>
            <h2 className="text-4xl font-black leading-tight mb-4 tracking-tighter">Lodha World View</h2>
            <p className="text-white/70 text-lg font-medium mb-10 leading-relaxed">Currently the most viewed property in South Mumbai with 24 active leads.</p>
            <div className="flex -space-x-3 mb-10">
              {[1, 2, 3].map(i => (
                <img 
                  key={i} 
                  className="w-10 h-10 rounded-full border-4 border-primary bg-primary-light" 
                  src={`https://i.pravatar.cc/100?u=${i+20}`} 
                  alt="Client" 
                />
              ))}
              <div className="w-10 h-10 rounded-full border-4 border-primary bg-white/20 flex items-center justify-center text-[10px] font-black">+21</div>
            </div>
          </div>
          <div className="relative z-10">
            <button className="w-full bg-white text-primary py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-xl">
              Manage Prospectus
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform"></div>
        </div>
      </div>

      {/* 📁 Active Management Portal (Table) */}
      <div className="bg-white rounded-[3rem] border border-slate-50 shadow-sm overflow-hidden hover:shadow-2xl transition-all">
        <div className="px-10 py-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">Recent Leads</h2>
            <p className="text-slate-400 text-sm font-bold mt-1 tracking-tight">Manage and track your latest incoming inquiries across MMR.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 flex items-center justify-center text-slate-400 bg-white border border-slate-100 rounded-2xl hover:text-primary hover:border-primary transition-all shadow-sm">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
            <button className="w-12 h-12 flex items-center justify-center text-slate-400 bg-white border border-slate-100 rounded-2xl hover:text-primary hover:border-primary transition-all shadow-sm">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto px-6 pb-6 mt-6">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-6 py-4">Client Integrity</th>
                <th className="px-6 py-4">Lead classification</th>
                <th className="px-6 py-4">Associated Property</th>
                <th className="px-6 py-4">Engagement Status</th>
                <th className="px-6 py-4 text-right">Console</th>
              </tr>
            </thead>
            <tbody className="space-y-4">
              {recentLeads.map((lead, i) => (
                <tr key={i} className="bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group rounded-3xl">
                  <td className="px-6 py-6 rounded-l-3xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white text-primary flex items-center justify-center font-black text-sm shadow-sm border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">
                        {lead.initials}
                      </div>
                      <span className="text-sm font-black text-slate-900 tracking-tight">{lead.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm font-bold text-slate-500">{lead.type}</td>
                  <td className="px-6 py-6 text-sm font-black text-slate-900 italic tracking-tight">{lead.property}</td>
                  <td className="px-6 py-6">
                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${lead.statusColor}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right rounded-r-3xl">
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                      <span className="material-symbols-outlined">open_in_new</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-10 py-8 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing 4 of 1,284 leads</span>
          <div className="flex gap-3">
            <button className="w-10 h-10 flex items-center justify-center border border-slate-100 rounded-xl bg-white hover:border-primary transition-all shadow-sm">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-primary bg-primary text-white rounded-xl font-black text-xs shadow-lg shadow-primary/20">1</button>
            <button className="w-10 h-10 flex items-center justify-center border border-slate-100 rounded-xl bg-white hover:border-primary transition-all shadow-sm">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* ➕ Global Action FAB */}
      <button className="fixed bottom-12 right-12 w-20 h-20 bg-slate-950 text-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
        <span className="material-symbols-outlined text-3xl">add</span>
        <span className="absolute right-full mr-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-2xl">
          Create New Lead
        </span>
      </button>
    </div>
  );
}
