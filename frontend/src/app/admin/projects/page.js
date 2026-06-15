'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  adminListProjects,
  deleteProject,
  setProjectStatus,
  toggleFeatured,
} from '@/services/projectService';

const STATUS_BADGE = {
  active:   'bg-green-100 text-green-700',
  draft:    'bg-amber-100 text-amber-700',
  inactive: 'bg-slate-100 text-slate-500',
};

const STATUS_LABEL = { active: 'Active', draft: 'Draft', inactive: 'Inactive' };

const PROJECT_STATUS_BADGE = {
  new_launch:          'bg-blue-100 text-blue-700',
  under_construction:  'bg-orange-100 text-orange-700',
  ready_to_move:       'bg-green-100 text-green-700',
};

const PROJECT_STATUS_LABEL = {
  new_launch:         'New Launch',
  under_construction: 'Under Construction',
  ready_to_move:      'Ready To Move',
};

export default function AdminProjectsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openActionFor, setOpenActionFor] = useState(null);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const debounceRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = {};
      if (search) query.search = search;
      if (statusFilter) query.listingStatus = statusFilter;
      const { items } = await adminListProjects(query);
      setRows(items);
    } catch (err) {
      setError(err?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  // Debounce search + status filter changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(load, 300);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [load]);

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await deleteProject(id);
      setConfirmDeleteId(null);
      setOpenActionFor(null);
      await load();
    } catch (err) {
      setError(err?.message || 'Failed to delete project');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleFeatured = async (row) => {
    setBusyId(row._id);
    try {
      await toggleFeatured(row._id, !row.isFeatured);
      await load();
    } catch (err) {
      setError(err?.message || 'Failed to update featured flag');
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusChange = async (row, listingStatus) => {
    setBusyId(row._id);
    try {
      // setProjectStatus expects a UI label or backend value; pass backend value directly
      await setProjectStatus(row._id, listingStatus);
      await load();
    } catch (err) {
      setError(err?.message || 'Failed to change status');
    } finally {
      setBusyId(null);
    }
  };

  const builderName = (row) =>
    (typeof row.builderId === 'object' && row.builderId?.name) || row.builderName || '—';

  const configsLabel = (row) => {
    if (Array.isArray(row.bhkConfigurations) && row.bhkConfigurations.length) {
      return row.bhkConfigurations.join(', ');
    }
    if (typeof row.configCount === 'number') return `${row.configCount} configs`;
    return '—';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage bulk property projects, configurations &amp; inventory</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Project
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={load} className="text-red-700 font-semibold hover:underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Project</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Location</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Status</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Listing</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Configs</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Units</th>
              <th className="text-right px-5 py-3.5 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td colSpan={7} className="px-5 py-4">
                    <div className="h-5 bg-slate-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-slate-400">
                  <span className="material-symbols-outlined text-4xl block mb-2">domain_disabled</span>
                  No projects found
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      {row.name}
                      {row.isFeatured && (
                        <span className="material-symbols-outlined text-amber-500 text-base" title="Featured">star</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{builderName(row)}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{row.location?.area || '—'}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${PROJECT_STATUS_BADGE[row.projectStatus] || 'bg-slate-100 text-slate-500'}`}>
                      {PROJECT_STATUS_LABEL[row.projectStatus] || row.projectStatus || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={row.listingStatus}
                      disabled={busyId === row._id}
                      onChange={(e) => handleStatusChange(row, e.target.value)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${STATUS_BADGE[row.listingStatus] || 'bg-slate-100 text-slate-500'}`}
                    >
                      {Object.entries(STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{configsLabel(row)}</td>
                  <td className="px-4 py-4 text-slate-600">{row.totalUnits || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2 relative">
                      <button
                        onClick={() => handleToggleFeatured(row)}
                        disabled={busyId === row._id}
                        className={`p-1.5 rounded-lg transition-colors ${row.isFeatured ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
                        title={row.isFeatured ? 'Unfeature' : 'Feature'}
                      >
                        <span className="material-symbols-outlined text-lg">{row.isFeatured ? 'star' : 'star_border'}</span>
                      </button>
                      <Link
                        href={`/admin/projects/${row._id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      <button
                        onClick={() => setOpenActionFor(openActionFor === row._id ? null : row._id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                      {openActionFor === row._id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                          <Link
                            href={`/admin/projects/${row._id}/edit`}
                            className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setConfirmDeleteId(row._id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800">Delete project?</h3>
            <p className="text-sm text-slate-500 mt-2">
              This permanently removes the project, its configurations and unit inventory. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={busyId === confirmDeleteId}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={busyId === confirmDeleteId}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
              >
                {busyId === confirmDeleteId ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
