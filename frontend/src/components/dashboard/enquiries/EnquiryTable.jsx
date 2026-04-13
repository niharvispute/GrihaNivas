'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { authedApiFetch } from '@/lib/api/authedRequest';

const STATUS_THEMES = {
  new:       'bg-blue-50 text-blue-600 border-blue-100',
  contacted: 'bg-amber-50 text-amber-600 border-amber-100',
  qualified: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  closed:    'bg-slate-50 text-slate-500 border-slate-100',
};

const TYPE_ICON = {
  loan:      'payments',
  agreement: 'description',
  rent:      'apartment',
  buy:       'home',
  list_property: 'sell',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function EnquiryTable() {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    authedApiFetch('/api/leads/my-enquiries', { query: { limit: 20 } })
      .then((res) => setEnquiries(res.data || []))
      .catch(() => setEnquiries([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-10 animate-pulse space-y-4 mb-8">
        {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-slate-100 rounded-xl" />)}
      </div>
    );
  }

  if (enquiries.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 py-16 text-center mb-8">
        <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">inbox</span>
        <h3 className="font-heading font-black text-slate-900 text-lg mb-1">No enquiries yet</h3>
        <p className="text-slate-400 text-sm font-medium">Your submitted enquiries will appear here.</p>
      </div>
    );
  }

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
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {enquiries.map((item) => {
              const leadType = item.leadType || 'buy';
              const statusKey = item.status || 'new';
              const isService = ['loan', 'agreement', 'list_property'].includes(leadType);
              const themeClass = STATUS_THEMES[statusKey] || STATUS_THEMES.new;
              const icon = TYPE_ICON[leadType] || 'home';
              const propertyTitle = item.propertyId?.title || item.message || 'General Enquiry';

              return (
                <tr key={item._id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-inner flex items-center justify-center">
                        {isService ? (
                          <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
                        ) : item.propertyId?.heroImage?.url ? (
                          <img alt={propertyTitle} className="w-full h-full object-cover" src={item.propertyId.heroImage.url} />
                        ) : (
                          <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
                        )}
                      </div>
                      <span className="font-heading font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors">
                        {propertyTitle}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                      {leadType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-slate-500">{formatDate(item.createdAt)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${themeClass}`}>
                      {statusKey}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-slate-400 font-medium max-w-xs truncate" title={item.message}>{item.message || '—'}</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
