'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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
      <div className="space-y-4 mb-8 animate-pulse">
        {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
      </div>
    );
  }

  if (enquiries.length === 0) {
    return (
      <div className="bg-white rounded-4xl shadow-sm border border-slate-100 py-16 text-center mb-8">
        <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">inbox</span>
        <h3 className="font-heading font-black text-slate-900 text-lg mb-1">No enquiries yet</h3>
        <p className="text-slate-400 text-sm font-medium">Your submitted enquiries will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {enquiries.map((item) => {
        const leadType = item.leadType || 'buy';
        const statusKey = item.status || 'new';
        const isService = ['loan', 'agreement'].includes(leadType);
        const themeClass = STATUS_THEMES[statusKey] || STATUS_THEMES.new;
        const icon = TYPE_ICON[leadType] || 'home';
        const propertyTitle = item.propertyId?.title || item.message || 'General Enquiry';

        return (
          <div
            key={item._id}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-4 sm:p-6"
          >
            {/* Header with thumbnail and title */}
            <div className="flex gap-4 sm:gap-6 mb-4 sm:mb-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-inner flex items-center justify-center flex-none">
                {isService ? (
                  <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">{icon}</span>
                ) : item.propertyId?.heroImage?.url ? (
                  <img alt={propertyTitle} className="w-full h-full object-cover" src={item.propertyId.heroImage.url} />
                ) : (
                  <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">{icon}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-black text-slate-900 text-sm sm:text-base leading-snug mb-1 line-clamp-2 hover:text-primary transition-colors">
                  {propertyTitle}
                </h4>
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <span className="material-symbols-outlined text-xs">calendar_today</span>
                  {formatDate(item.createdAt)}
                </div>
              </div>
            </div>

            {/* Type and Status row */}
            <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-5 flex-wrap">
              <span className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-slate-200 whitespace-nowrap">
                {leadType.replace('_', ' ')}
              </span>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border ${themeClass} whitespace-nowrap`}>
                {statusKey}
              </span>
            </div>

            {/* Message section */}
            {item.message && (
              <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-100 text-[13px] sm:text-sm text-slate-600 font-medium leading-relaxed">
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Message</p>
                {item.message}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
