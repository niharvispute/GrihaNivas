'use client';

import { useState, useEffect, useCallback } from 'react';
import { listUsers, deactivateUser, activateUser, getUserById, exportUsers } from '@/services/userService';
import ExportButton from '@/components/admin/ExportButton';

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState(null);
  const [openActionFor, setOpenActionFor] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const query = { page, limit: 15 };
      if (search) query.search = search;
      const res = await listUsers(query, { map: true });
      setUsers(res.items || []);
      setMeta(res.meta || null);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleActive = async (user) => {
    setOpenActionFor(null);
    setActionId(user.id);
    try {
      if (user.isActive) {
        await deactivateUser(user.id);
      } else {
        await activateUser(user.id);
      }
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    } catch {
      alert('Failed to update user status.');
    } finally {
      setActionId(null);
    }
  };

  const handleViewUser = async (userId) => {
    setOpenActionFor(null);
    setLoadingUserDetail(true);
    try {
      const user = await getUserById(userId, { map: false });
      setViewingUser(user);
    } catch {
      alert('Failed to fetch user details.');
    } finally {
      setLoadingUserDetail(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Users</h1>
          <p className="text-slate-500 font-bold mt-2">Manage and monitor the Grihavastu community.</p>
        </div>
        <div className="flex items-center gap-3">
          {meta && (
            <span className="bg-slate-50 border border-slate-100 text-slate-600 px-6 py-3 rounded-2xl text-sm font-black">
              {meta.total} members
            </span>
          )}
          <ExportButton
            onExport={() => exportUsers(search ? { search } : {})}
          />
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Search</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full bg-slate-50 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Name, email, or phone…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-50 overflow-hidden">
        {loading ? (
          <div className="p-10 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">group</span>
            <p className="text-slate-400 font-bold">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2 p-6">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-5">User</th>
                  <th className="px-6 py-5">Phone</th>
                  <th className="px-6 py-5">Joined</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group rounded-2xl">
                    <td className="px-6 py-5 rounded-l-3xl">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{user.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-600">{user.phone}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-500">{user.createdAt}</td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right rounded-r-3xl">
                      <div className="flex justify-end">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenActionFor((prev) => (prev === user.id ? null : user.id))}
                            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                            title="More"
                          >
                            <span className="material-symbols-outlined text-lg">more_horiz</span>
                          </button>

                          {openActionFor === user.id && (
                            <div className="absolute right-0 top-11 z-20 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-200/60">
                              <button
                                type="button"
                                onClick={() => handleViewUser(user.id)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                              >
                                <span className="material-symbols-outlined text-lg text-primary">visibility</span>
                                <span>View</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleActive(user)}
                                disabled={actionId === user.id}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-emerald-700 hover:bg-emerald-50'}`}
                              >
                                <span className="material-symbols-outlined text-lg">{user.isActive ? 'block' : 'check_circle'}</span>
                                <span>{actionId === user.id ? 'Working…' : user.isActive ? 'Deactivate' : 'Activate'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {(loadingUserDetail || viewingUser) && (
        <div className="fixed inset-0 z-70 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">User Details</h3>
              <button
                type="button"
                onClick={() => { setViewingUser(null); setLoadingUserDetail(false); }}
                className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 max-h-[75vh] overflow-y-auto">
              {loadingUserDetail ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}
                </div>
              ) : viewingUser ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: 'Name', value: viewingUser.name },
                    { label: 'Email', value: viewingUser.email },
                    { label: 'Phone', value: viewingUser.phone },
                    { label: 'Role', value: viewingUser.role },
                    { label: 'Status', value: viewingUser.isActive ? 'Active' : 'Inactive' },
                    { label: 'Verified', value: viewingUser.isVerified ? 'Yes' : 'No' },
                    { label: 'Joined', value: viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString('en-IN') : null },
                    { label: 'Saved Properties', value: viewingUser.savedProperties?.length },
                    { label: 'Compared Properties', value: viewingUser.comparedProperties?.length },
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
