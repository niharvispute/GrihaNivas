'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { listProperties, deleteProperty, getPropertyById, updateProperty } from '@/services/propertyService';

const CATEGORY_LABEL = { buy: 'Buy', rent: 'Rent', commercial: 'Commercial', new_launch: 'New Launch' };

function formatPrice(price) {
  if (!price) return '—';
  if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `${(price / 100000).toFixed(2)} L`;
  return price.toLocaleString('en-IN');
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export default function PropertyManagementPage() {
  const [properties, setProperties] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [openActionFor, setOpenActionFor] = useState(null);
  const [viewingProperty, setViewingProperty] = useState(null);
  const [loadingPropertyDetail, setLoadingPropertyDetail] = useState(false);
  const [togglingFeatured, setTogglingFeatured] = useState(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const query = { page, limit: 12 };
      if (category) query.category = category;
      if (search) query.search = search;
      const res = await listProperties(query, { map: false });
      setProperties(res.items || []);
      setMeta(res.meta || null);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, page]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleDelete = async (id, title) => {
    setOpenActionFor(null);
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteProperty(id);
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert('Failed to delete property.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewProperty = async (id) => {
    setOpenActionFor(null);
    setLoadingPropertyDetail(true);
    try {
      const property = await getPropertyById(id, { map: false });
      setViewingProperty(property);
    } catch {
      alert('Failed to fetch property details.');
    } finally {
      setLoadingPropertyDetail(false);
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    setTogglingFeatured(id);
    try {
      await updateProperty(id, { isFeatured: !currentStatus });
      setProperties((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isFeatured: !currentStatus } : p))
      );
    } catch {
      alert('Failed to update featured status.');
    } finally {
      setTogglingFeatured(null);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Properties</h1>
          <p className="text-slate-500 font-bold mt-2">Manage your active real estate listings and portfolio.</p>
        </div>
        {meta && (
          <span className="bg-slate-50 border border-slate-100 text-slate-600 px-6 py-3 rounded-2xl text-sm font-black">
            {meta.total} total listings
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-55">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Search</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full bg-slate-50 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Title, area…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        <div className="w-48">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Category</label>
          <select
            className="w-full appearance-none bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
            <option value="commercial">Commercial</option>
            <option value="new_launch">New Launch</option>
          </select>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-50 overflow-hidden">
        {loading ? (
          <div className="p-10 space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">home_work</span>
            <p className="text-slate-400 font-bold">No properties found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2 p-6">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-5">Property</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Location</th>
                  <th className="px-6 py-5">BHK</th>
                  <th className="px-6 py-5">Price</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Featured</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => {
                  const heroUrl = prop.heroImage?.url || null;
                  return (
                    <tr key={prop._id} className="bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group rounded-3xl">
                      <td className="px-6 py-5 rounded-l-3xl">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                            {heroUrl
                              ? <img src={heroUrl} alt={prop.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              : <span className="material-symbols-outlined text-slate-300 text-2xl">image</span>
                            }
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{prop.title}</p>
                            {prop.reraNumber && <p className="text-[10px] text-slate-400 font-medium">RERA: {prop.reraNumber}</p>}
                            {Array.isArray(prop.feature) && prop.feature.length > 0 && (
                              <p className="text-[10px] text-slate-400 font-medium">Features: {prop.feature.length}</p>
                            )}
                            {prop.reraUrl && (
                              <a
                                href={prop.reraUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold text-primary hover:underline"
                              >
                                RERA Link
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full">
                          {CATEGORY_LABEL[prop.category] || prop.category}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-600">{prop.location?.area || '—'}</td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-600">{prop.bhk ? `${prop.bhk} BHK` : 'N/A'}</td>
                      <td className="px-6 py-5 text-sm font-black text-primary">₹{formatPrice(prop.price)}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${prop.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {prop.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => handleToggleFeatured(prop._id, prop.isFeatured)}
                          disabled={togglingFeatured === prop._id}
                          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${prop.isFeatured ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-slate-50 text-slate-300 border border-slate-100 hover:border-amber-200 hover:text-amber-300'}`}
                        >
                          {togglingFeatured === prop._id ? (
                            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: prop.isFeatured ? "'FILL' 1" : "'FILL' 0" }}>
                              star
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-5 text-right rounded-r-3xl">
                        <div className="flex justify-end">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenActionFor((prev) => (prev === prop._id ? null : prop._id))}
                              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                              title="More"
                            >
                              <span className="material-symbols-outlined text-lg">more_horiz</span>
                            </button>

                            {openActionFor === prop._id && (
                              <div className="absolute right-0 top-11 z-20 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-200/60">
                                <button
                                  type="button"
                                  onClick={() => handleViewProperty(prop._id)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                >
                                  <span className="material-symbols-outlined text-lg text-primary">visibility</span>
                                  <span>View</span>
                                </button>
                                <Link
                                  href={`/property/${prop.slug || prop._id}`}
                                  target="_blank"
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                >
                                  <span className="material-symbols-outlined text-lg text-primary">open_in_new</span>
                                  <span>Open Public</span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(prop._id, prop.title)}
                                  disabled={deletingId === prop._id}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-40"
                                >
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                  <span>{deletingId === prop._id ? 'Deleting…' : 'Delete'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${p === page ? 'bg-primary text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-500 hover:border-primary hover:text-primary'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {(loadingPropertyDetail || viewingProperty) && (
        <div className="fixed inset-0 z-70 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-4xl border border-slate-100 shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Property Details</h3>
              <button
                type="button"
                onClick={() => { setViewingProperty(null); setLoadingPropertyDetail(false); }}
                className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 max-h-[75vh] overflow-y-auto">
              {loadingPropertyDetail ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}
                </div>
              ) : viewingProperty ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: 'Title', value: viewingProperty.title, full: true },
                    { label: 'Category', value: CATEGORY_LABEL[viewingProperty.category] || viewingProperty.category },
                    { label: 'Price', value: hasValue(viewingProperty.price) ? `₹${formatPrice(viewingProperty.price)}` : null },
                    { label: 'BHK', value: viewingProperty.bhk },
                    { label: 'Bathrooms', value: viewingProperty.bathrooms },
                    { label: 'Area (sq.ft)', value: viewingProperty.areaSqft },
                    { label: 'Furnishing', value: viewingProperty.furnishing },
                    { label: 'RERA Number', value: viewingProperty.reraNumber },
                    { label: 'RERA URL', value: viewingProperty.reraUrl, full: true },
                    { label: 'Location Area', value: viewingProperty.location?.area },
                    { label: 'City', value: viewingProperty.location?.city },
                    { label: 'Address', value: viewingProperty.location?.address, full: true },
                    { label: 'Description', value: viewingProperty.description, full: true },
                    {
                      label: 'Hero Features',
                      value: Array.isArray(viewingProperty.feature)
                        ? viewingProperty.feature.join(' | ')
                        : viewingProperty.feature,
                      full: true,
                    },
                    {
                      label: 'Amenities',
                      value: Array.isArray(viewingProperty.amenities) ? viewingProperty.amenities.join(', ') : null,
                      full: true,
                    },
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
