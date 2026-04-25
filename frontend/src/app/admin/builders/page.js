'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import CloudinaryImage from '@/components/CloudinaryImage';
import {
  deleteAdminBuilder,
  listAdminBuilders,
  toggleAdminBuilderFeatured,
  exportAdminBuilders,
} from '@/services/builderService';
import ExportButton from '@/components/admin/ExportButton';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const FILTER_OPTIONS = {
  featured: {
    all: '',
    featured: 'true',
    regular: 'false',
  },
  active: {
    all: '',
    active: 'true',
    inactive: 'false',
  },
};

export default function AdminBuildersPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [openActionFor, setOpenActionFor] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchBuilders = useCallback(async () => {
    setLoading(true);
    try {
      const query = { page, limit: 12 };
      if (search.trim()) query.search = search.trim();
      if (FILTER_OPTIONS.featured[featuredFilter]) {
        query.isFeatured = FILTER_OPTIONS.featured[featuredFilter];
      }
      if (FILTER_OPTIONS.active[activeFilter]) {
        query.isActive = FILTER_OPTIONS.active[activeFilter];
      }

      const response = await listAdminBuilders(query);
      setItems(response.items || []);
      setMeta(response.meta || null);
    } catch {
      setItems([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [search, featuredFilter, activeFilter, page]);

  useEffect(() => {
    fetchBuilders();
  }, [fetchBuilders]);

  const handleToggleFeatured = async (builder) => {
    setOpenActionFor(null);
    setTogglingId(builder._id);
    try {
      const updated = await toggleAdminBuilderFeatured(builder._id, !builder.isFeatured);
      setItems((prev) =>
        prev.map((entry) =>
          entry._id === builder._id
            ? {
                ...entry,
                isFeatured: Boolean(updated?.isFeatured),
              }
            : entry
        )
      );
    } catch {
      alert('Failed to update featured status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (builder) => {
    setOpenActionFor(null);
    const linkedProperties = Number(builder.propertyCount || 0);
    const ok = window.confirm(
      linkedProperties > 0
        ? `Delete ${builder.name}? This will also delete ${linkedProperties} linked propert${linkedProperties === 1 ? 'y' : 'ies'}.`
        : `Delete ${builder.name}? This action cannot be undone.`
    );

    if (!ok) return;

    setDeletingId(builder._id);
    try {
      const result = await deleteAdminBuilder(builder._id);
      setItems((prev) => prev.filter((entry) => entry._id !== builder._id));
      setMeta((prev) =>
        prev
          ? {
              ...prev,
              total: Math.max((prev.total || 1) - 1, 0),
            }
          : prev
      );

      const deletedProperties = Number(result?.deletedProperties || linkedProperties || 0);
      if (deletedProperties > 0) {
        alert(`Builder deleted. ${deletedProperties} linked properties were also removed.`);
      }
    } catch {
      alert('Failed to delete builder.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Builders</h1>
          <p className="text-slate-500 font-bold mt-2">
            Manage all registered builders, feature them, and remove linked portfolios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {meta && (
            <span className="bg-slate-50 border border-slate-100 text-slate-600 px-6 py-3 rounded-2xl text-sm font-black">
              {meta.total} builders
            </span>
          )}
          <ExportButton
            onExport={() => {
              const query = {};
              if (search.trim()) query.search = search.trim();
              const featuredValue = FILTER_OPTIONS.featured[featuredFilter];
              if (featuredValue) query.isFeatured = featuredValue;
              const activeValue = FILTER_OPTIONS.active[activeFilter];
              if (activeValue) query.isActive = activeValue;
              return exportAdminBuilders(query);
            }}
          />
          <Link
            href="/admin/builders/new"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.18em] hover:bg-primary/90 transition-all"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Create Builder</span>
          </Link>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-55">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
            Search
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full bg-slate-50 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Builder name, slug, HQ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="w-52">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
            Featured
          </label>
          <select
            className="w-full appearance-none bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
            value={featuredFilter}
            onChange={(e) => {
              setFeaturedFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="featured">Featured Only</option>
            <option value="regular">Regular Only</option>
          </select>
        </div>

        <div className="w-52">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
            Status
          </label>
          <select
            className="w-full appearance-none bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-50 overflow-hidden">
        {loading ? (
          <div className="p-10 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">apartment</span>
            <p className="text-slate-400 font-bold">No builders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2 p-6">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-5">Builder</th>
                  <th className="px-6 py-5">Projects</th>
                  <th className="px-6 py-5">Linked Properties</th>
                  <th className="px-6 py-5">Featured</th>
                  <th className="px-6 py-5">Created</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((builder) => {
                  const isToggling = togglingId === builder._id;
                  const isDeleting = deletingId === builder._id;

                  return (
                    <tr
                      key={builder._id}
                      className="bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group rounded-3xl"
                    >
                      <td className="px-6 py-5 rounded-l-3xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                            {builder.logo?.url ? (
                              <CloudinaryImage
                                src={builder.logo.url}
                                alt={builder.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-slate-300">business</span>
                            )}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">{builder.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium truncate">
                              {builder.headquarters || 'Mumbai'} • /builders/{builder.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm font-bold text-slate-600">
                        {Number(builder.totalProjects || 0)} total
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full">
                          {Number(builder.propertyCount || 0)} linked
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(builder)}
                          disabled={isToggling || isDeleting}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
                            builder.isFeatured
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span>{isToggling ? 'Saving…' : builder.isFeatured ? 'Featured' : 'Mark Featured'}</span>
                        </button>
                      </td>

                      <td className="px-6 py-5 text-sm font-bold text-slate-500">{formatDate(builder.createdAt)}</td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            builder.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              builder.isActive ? 'bg-emerald-600' : 'bg-slate-400'
                            }`}
                          />
                          {builder.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right rounded-r-3xl">
                        <div className="flex justify-end">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenActionFor((prev) => (prev === builder._id ? null : builder._id))
                              }
                              className="w-9 h-9 rounded-xl border border-slate-100 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                            >
                              <span className="material-symbols-outlined text-lg">more_horiz</span>
                            </button>

                            {openActionFor === builder._id && (
                              <div className="absolute right-0 top-11 z-20 w-52 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-200/60">
                                <Link
                                  href={`/admin/builders/${builder._id}/edit`}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                >
                                  <span className="material-symbols-outlined text-lg text-primary">edit_square</span>
                                  <span>Edit</span>
                                </Link>

                                <Link
                                  href={`/builders/${builder.slug}`}
                                  target="_blank"
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                >
                                  <span className="material-symbols-outlined text-lg text-primary">open_in_new</span>
                                  <span>Open Public Page</span>
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(builder)}
                                  disabled={isDeleting}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                                >
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                  <span>{isDeleting ? 'Deleting…' : 'Delete Builder'}</span>
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

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
                p === page
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white border border-slate-100 text-slate-500 hover:border-primary hover:text-primary'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
