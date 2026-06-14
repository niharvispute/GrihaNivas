'use client';

import { useState } from 'react';
import Link from 'next/link';

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

// Static placeholder rows — replaced with real API data in Phase 1
const PLACEHOLDER_ROWS = [
  { _id: '1', name: 'Lodha Vista Residences', builder: 'Lodha Group', area: 'Powai', projectStatus: 'under_construction', listingStatus: 'active',   configs: '1,2,3 BHK', totalUnits: 520 },
  { _id: '2', name: 'Hiranandani Gardens',    builder: 'Hiranandani',  area: 'Thane', projectStatus: 'ready_to_move',     listingStatus: 'active',   configs: '2,3 BHK',   totalUnits: 310 },
  { _id: '3', name: 'Godrej Reserve',         builder: 'Godrej',       area: 'Kandivali', projectStatus: 'new_launch',    listingStatus: 'draft',    configs: '2,3,4 BHK', totalUnits: 0   },
];

export default function AdminProjectsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openActionFor, setOpenActionFor] = useState(null);

  const rows = PLACEHOLDER_ROWS.filter((r) => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.area.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.listingStatus === statusFilter;
    return matchSearch && matchStatus;
  });

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
            {rows.length === 0 ? (
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
                    <div className="font-semibold text-slate-800">{row.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{row.builder}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{row.area}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${PROJECT_STATUS_BADGE[row.projectStatus]}`}>
                      {PROJECT_STATUS_LABEL[row.projectStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[row.listingStatus]}`}>
                      {STATUS_LABEL[row.listingStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{row.configs}</td>
                  <td className="px-4 py-4 text-slate-600">{row.totalUnits || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2 relative">
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
                          <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">View Details</button>
                          <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Duplicate</button>
                          <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
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

      <p className="text-xs text-slate-400 mt-3 text-center">Showing placeholder data — live data wired in Phase 1</p>
    </div>
  );
}
