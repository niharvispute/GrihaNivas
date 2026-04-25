'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { adminListProperties } from '@/services/propertyService';
import { linkBuilderProperty } from '@/services/builderService';

const CATEGORY_LABELS = {
  buy: 'Buy',
  rent: 'Rent',
  commercial: 'Commercial',
  new_launch: 'New Launch',
};

function formatPrice(price) {
  if (!price) return '—';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function PropertyRow({ property, actionLabel, actionStyle, onAction, loading }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
          {property.heroImage?.url ? (
            <img
              src={property.heroImage.url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-slate-300 text-lg">apartment</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black text-slate-900 truncate leading-tight">{property.title}</p>
          <p className="text-[10px] text-slate-400 font-medium truncate">
            {property.location?.area || property.location?.city || '—'} •{' '}
            {CATEGORY_LABELS[property.category] || property.category} •{' '}
            {formatPrice(property.price)}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onAction(property._id)}
        disabled={loading}
        className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 ${actionStyle}`}
      >
        {loading ? '…' : actionLabel}
      </button>
    </div>
  );
}

export default function BuilderPropertyModal({ builder, onClose, onCountChange }) {
  const [tab, setTab] = useState('linked');
  const [linked, setLinked] = useState([]);
  const [available, setAvailable] = useState([]);
  const [linkedMeta, setLinkedMeta] = useState(null);
  const [availMeta, setAvailMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [linkedPage, setLinkedPage] = useState(1);
  const [availPage, setAvailPage] = useState(1);
  const [loadingLinked, setLoadingLinked] = useState(false);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const searchRef = useRef(null);

  const fetchLinked = useCallback(async () => {
    setLoadingLinked(true);
    try {
      const res = await adminListProperties({
        builder: builder._id,
        status: 'approved',
        search: search.trim() || undefined,
        page: linkedPage,
        limit: 10,
      });
      setLinked(res.items);
      setLinkedMeta(res.meta);
    } catch {
      setLinked([]);
    } finally {
      setLoadingLinked(false);
    }
  }, [builder._id, search, linkedPage]);

  const fetchAvailable = useCallback(async () => {
    setLoadingAvail(true);
    try {
      const res = await adminListProperties({
        noBuilder: 'true',
        status: 'approved',
        search: search.trim() || undefined,
        page: availPage,
        limit: 10,
      });
      setAvailable(res.items);
      setAvailMeta(res.meta);
    } catch {
      setAvailable([]);
    } finally {
      setLoadingAvail(false);
    }
  }, [search, availPage]);

  useEffect(() => {
    fetchLinked();
  }, [fetchLinked]);

  useEffect(() => {
    fetchAvailable();
  }, [fetchAvailable]);

  const handleAction = async (propertyId, action) => {
    setActionLoading(propertyId);
    setFeedback(null);
    try {
      await linkBuilderProperty(builder._id, propertyId, action);
      setFeedback({ type: 'success', message: action === 'link' ? 'Property linked.' : 'Property unlinked.' });
      await Promise.all([fetchLinked(), fetchAvailable()]);
      if (onCountChange) onCountChange(action === 'link' ? 1 : -1);
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'Action failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setLinkedPage(1);
    setAvailPage(1);
  };

  const activeItems = tab === 'linked' ? linked : available;
  const activeMeta = tab === 'linked' ? linkedMeta : availMeta;
  const activeLoading = tab === 'linked' ? loadingLinked : loadingAvail;
  const activePage = tab === 'linked' ? linkedPage : availPage;
  const setActivePage = tab === 'linked' ? setLinkedPage : setAvailPage;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-black text-slate-900">Manage Properties</h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{builder.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tabs + Search */}
        <div className="px-6 pt-4 pb-3 border-b border-slate-100 space-y-3 shrink-0">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTab('linked')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                tab === 'linked' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Linked ({linkedMeta?.total ?? linked.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('available')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                tab === 'available' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Available ({availMeta?.total ?? available.length})
            </button>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by title or area…"
              className="w-full bg-slate-50 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {feedback && (
            <p className={`text-[11px] font-bold px-3 py-2 rounded-lg ${
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            }`}>
              {feedback.message}
            </p>
          )}
        </div>

        {/* Property list */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {activeLoading ? (
            <div className="space-y-2 py-2 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-xl" />
              ))}
            </div>
          ) : activeItems.length === 0 ? (
            <div className="py-10 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-200 mb-2 block">
                {tab === 'linked' ? 'link_off' : 'search_off'}
              </span>
              <p className="text-slate-400 text-xs font-bold">
                {tab === 'linked'
                  ? 'No properties linked to this builder yet.'
                  : 'No available approved properties found.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {activeItems.map((property) => (
                <PropertyRow
                  key={property._id}
                  property={property}
                  actionLabel={tab === 'linked' ? 'Unlink' : 'Link'}
                  actionStyle={
                    tab === 'linked'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }
                  onAction={(id) => handleAction(id, tab === 'linked' ? 'unlink' : 'link')}
                  loading={actionLoading === property._id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {activeMeta && activeMeta.totalPages > 1 && (
          <div className="flex justify-center gap-1.5 p-4 border-t border-slate-100 shrink-0">
            {Array.from({ length: activeMeta.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setActivePage(p)}
                className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${
                  p === activePage
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
