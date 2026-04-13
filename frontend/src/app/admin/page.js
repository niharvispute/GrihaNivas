'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminDashboardStats } from '@/services/dashboardService';
import { listLeads, getLeadById } from '@/services/leadService';

const STATUS_COLOR = {
  new:       'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  qualified: 'bg-emerald-100 text-emerald-700',
  closed:    'bg-slate-100 text-slate-500',
};

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openActionFor, setOpenActionFor] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [loadingLeadDetail, setLoadingLeadDetail] = useState(false);

  useEffect(() => {
    Promise.all([
      getAdminDashboardStats().catch(() => null),
      listLeads({ limit: 5, sortBy: 'newest' }, { map: false }).catch(() => ({ items: [] })),
    ]).then(([dashStats, leadsRes]) => {
      setStats(dashStats);
      setRecentLeads(leadsRes?.items || leadsRes?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleViewLead = async (leadId) => {
    setOpenActionFor(null);
    setLoadingLeadDetail(true);
    try {
      const lead = await getLeadById(leadId);
      setViewingLead(lead);
    } catch {
      alert('Failed to fetch lead details.');
    } finally {
      setLoadingLeadDetail(false);
    }
  };

  const kpis = [
    {
      label: "Total Leads",
      value: loading ? '…' : (stats?.leads?.total ?? '—'),
      grow: null,
      icon: "person_add",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Properties Listed",
      value: loading ? '…' : (stats?.properties?.total ?? '—'),
      grow: null,
      icon: "home_work",
      color: "text-pink-600",
      bg: "bg-pink-50"
    },
    {
      label: "New Leads",
      value: loading ? '…' : (stats?.leads?.new ?? '—'),
      grow: null,
      icon: "mark_email_unread",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      label: "Leads Closed",
      value: loading ? '…' : (stats?.leads?.closed ?? '—'),
      grow: null,
      icon: "assignment_turned_in",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
  ];

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Admin <span className="text-primary italic">Console</span></h1>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Mumbai Editorial Management Dashboard</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {kpis.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col gap-6 hover:shadow-2xl hover:scale-[1.02] transition-all group">
            <div className="flex justify-between items-start">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-[3rem] border border-slate-50 shadow-sm overflow-hidden hover:shadow-2xl transition-all">
        <div className="px-10 py-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">Recent Leads</h2>
            <p className="text-slate-400 text-sm font-bold mt-1">Latest submissions across the platform</p>
          </div>
          <Link href="/admin/leads" className="text-primary text-[10px] font-black flex items-center gap-2 hover:translate-x-1 transition-all uppercase tracking-widest">
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        <div className="overflow-x-auto px-6 pb-6 mt-6">
          {loading ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-slate-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-bold">No leads yet.</div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead._id} className="bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group rounded-3xl">
                    <td className="px-6 py-5 rounded-l-3xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white text-primary flex items-center justify-center font-black text-xs shadow-sm border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">
                          {getInitials(lead.name)}
                        </div>
                        <span className="text-sm font-black text-slate-900">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {(lead.leadType || '').replace('_', ' ')}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-600">{lead.phone}</td>
                    <td className="px-6 py-5 rounded-r-3xl">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLOR[lead.status] || STATUS_COLOR.new}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() => setOpenActionFor((prev) => (prev === lead._id ? null : lead._id))}
                          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">more_horiz</span>
                        </button>
                        {openActionFor === lead._id && (
                          <div className="absolute right-0 top-11 z-20 w-40 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-200/60">
                            <button
                              type="button"
                              onClick={() => handleViewLead(lead._id)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                            >
                              <span className="material-symbols-outlined text-lg text-primary">visibility</span>
                              <span>View</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick stat cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', value: stats.users?.total ?? '—', icon: 'group' },
            { label: 'Active Blogs', value: stats.blogs?.total ?? '—', icon: 'article' },
            { label: 'Total Banners', value: stats.banners?.total ?? '—', icon: 'panorama' },
            { label: 'Testimonials', value: stats.testimonials?.total ?? '—', icon: 'star' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-4xl p-6 shadow-sm border border-slate-50 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">{c.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{c.label}</p>
                <h4 className="text-2xl font-black text-slate-900">{c.value}</h4>
              </div>
            </div>
          ))}
        </div>
      )}

      {(loadingLeadDetail || viewingLead) && (
        <div className="fixed inset-0 z-70 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-4xl border border-slate-100 shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Lead Details</h3>
              <button
                type="button"
                onClick={() => { setViewingLead(null); setLoadingLeadDetail(false); }}
                className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 max-h-[75vh] overflow-y-auto">
              {loadingLeadDetail ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}
                </div>
              ) : viewingLead ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: 'Name', value: viewingLead.name },
                    { label: 'Phone', value: viewingLead.phone },
                    { label: 'Email', value: viewingLead.email },
                    { label: 'Lead Type', value: (viewingLead.leadType || '').replace('_', ' ') },
                    { label: 'Status', value: viewingLead.status },
                    { label: 'Submitted On', value: viewingLead.createdAt ? new Date(viewingLead.createdAt).toLocaleDateString('en-IN') : null },
                    { label: 'Message', value: viewingLead.message, full: true },
                  ]
                    .filter((field) => hasValue(field.value))
                    .map((field) => (
                      <Info key={field.label} label={field.label} value={field.value} full={field.full} />
                    ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value, full = false }) {
  return (
    <div className={`${full ? 'md:col-span-2' : ''} rounded-xl border border-slate-100 bg-slate-50 p-4`}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
      <p className="text-sm font-bold text-slate-800 wrap-break-word">{String(value)}</p>
    </div>
  );
}
