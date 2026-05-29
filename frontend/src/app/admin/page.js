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
      icon: "person_add",
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/admin/leads",
    },
    {
      label: "Properties Listed",
      value: loading ? '…' : (stats?.properties?.total ?? '—'),
      icon: "home_work",
      color: "text-pink-600",
      bg: "bg-pink-50",
      href: "/admin/properties",
    },
    {
      label: "New Leads",
      value: loading ? '…' : (stats?.leads?.new ?? '—'),
      icon: "mark_email_unread",
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/admin/leads",
    },
    {
      label: "Leads Closed",
      value: loading ? '…' : (stats?.leads?.closed ?? '—'),
      icon: "assignment_turned_in",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/admin/leads",
    },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Admin <span className="text-primary">Console</span></h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-[0.2em] text-[10px]">GrihaNivas Management Dashboard</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((stat, i) => (
          <Link key={i} href={stat.href} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-lg hover:shadow-slate-200/80 hover:border-primary/20 transition-all duration-500 group cursor-pointer">
            <div className="flex justify-between items-start">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                <span className="material-symbols-outlined text-xl">{stat.icon}</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 text-base group-hover:text-primary transition-colors">arrow_forward</span>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-900 mt-1 tracking-tighter">{stat.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg hover:shadow-slate-200/80 transition-all duration-500">
        <div className="px-7 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Leads</h2>
            <p className="text-slate-400 text-xs font-bold mt-0.5">Latest submissions across the platform</p>
          </div>
          <Link href="/admin/leads" className="text-primary text-[10px] font-black flex items-center gap-1.5 hover:translate-x-1 transition-all uppercase tracking-widest">
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        <div className="overflow-x-auto px-4 pb-4 mt-4">
          {loading ? (
            <div className="space-y-3 p-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-11 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 my-4">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">person_add</span>
              <p className="text-slate-500 font-bold text-sm">No leads yet — submissions will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead._id} className="bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group rounded-2xl">
                    <td className="px-4 py-3 rounded-l-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white text-primary flex items-center justify-center font-black text-[10px] shadow-sm border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">
                          {getInitials(lead.name)}
                        </div>
                        <span className="text-xs font-black text-slate-900">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {(lead.leadType || '').replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-600">{lead.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLOR[lead.status] || STATUS_COLOR.new}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 rounded-r-2xl text-right">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() => setOpenActionFor((prev) => (prev === lead._id ? null : lead._id))}
                          className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                        >
                          <span className="material-symbols-outlined text-base">more_horiz</span>
                        </button>
                        {openActionFor === lead._id && (
                          <div className="absolute right-0 top-10 z-20 w-36 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-2xl shadow-slate-200/60">
                            <button
                              type="button"
                              onClick={() => handleViewLead(lead._id)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                            >
                              <span className="material-symbols-outlined text-base text-primary">visibility</span>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.users?.total ?? '—', icon: 'group', href: '/admin/users' },
            { label: 'Active Blogs', value: stats.blogs?.total ?? '—', icon: 'article', href: '/admin/blogs' },
            { label: 'Total Banners', value: stats.banners?.total ?? '—', icon: 'panorama', href: '/admin/banners' },
            { label: 'Testimonials', value: stats.testimonials?.total ?? '—', icon: 'star', href: '/admin/testimonials' },
          ].map((c, i) => (
            <Link key={i} href={c.href} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-lg hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-xl">{c.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{c.label}</p>
                <h4 className="text-lg font-black text-slate-900">{c.value}</h4>
              </div>
            </Link>
          ))}
        </div>
      )}

      {(loadingLeadDetail || viewingLead) && (
        <div className="fixed inset-0 z-70 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Lead Details</h3>
              <button
                type="button"
                onClick={() => { setViewingLead(null); setLoadingLeadDetail(false); }}
                className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {loadingLeadDetail ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-slate-100 rounded-xl" />)}
                </div>
              ) : viewingLead ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    <div className={`${full ? 'md:col-span-2' : ''} rounded-2xl border border-slate-100 bg-slate-50 p-3`}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
      <p className="text-xs font-bold text-slate-800 wrap-break-word">{String(value)}</p>
    </div>
  );
}
