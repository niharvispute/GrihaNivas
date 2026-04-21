'use client';

import { useState, useEffect, useCallback } from 'react';
import { listLeads, updateLeadStatus, getLeadById, deleteLead, addLeadNote, exportLeads } from '@/services/leadService';
import ExportButton from '@/components/admin/ExportButton';

const STATUS_STYLES = {
  new:       { bg: 'bg-blue-50 text-blue-700',    dot: 'bg-blue-600' },
  contacted: { bg: 'bg-amber-50 text-amber-700',  dot: 'bg-amber-600' },
  qualified: { bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-600' },
  closed:    { bg: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
};
const NEXT_STATUS = { new: 'contacted', contacted: 'qualified', qualified: 'closed' };
const PREV_STATUS = { contacted: 'new', qualified: 'contacted', closed: 'qualified' };

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export default function LeadCRMPage() {
  const [leads, setLeads] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [leadType, setLeadType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [openActionFor, setOpenActionFor] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [loadingLeadDetail, setLoadingLeadDetail] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [revertingId, setRevertingId] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const query = { page, limit: 15 };
      if (search) query.search = search;
      if (leadType) query.leadType = leadType;
      if (status) query.status = status;
      const res = await listLeads(query, { map: false });
      setLeads(res.items || []);
      setMeta(res.meta || null);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [search, leadType, status, page]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleAdvanceStatus = async (lead) => {
    const next = NEXT_STATUS[lead.status];
    if (!next) return;
    setUpdatingId(lead._id);
    try {
      await updateLeadStatus(lead._id, next);
      setLeads((prev) => prev.map((l) => l._id === lead._id ? { ...l, status: next } : l));
    } catch {
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

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

  const handleDeleteLead = async (leadId) => {
    setOpenActionFor(null);
    const ok = window.confirm('Delete this lead? This action cannot be undone.');
    if (!ok) return;

    setDeletingId(leadId);
    try {
      await deleteLead(leadId);
      setLeads((prev) => prev.filter((lead) => lead._id !== leadId));
      setMeta((prev) => (prev ? { ...prev, total: Math.max((prev.total || 1) - 1, 0) } : prev));
    } catch {
      alert('Failed to delete lead.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !viewingLead) return;
    setAddingNote(true);
    try {
      const note = await addLeadNote(viewingLead._id, noteText.trim());
      setViewingLead((prev) => ({ ...prev, notes: [...(prev.notes || []), note] }));
      setNoteText('');
    } catch {
      alert('Failed to add note.');
    } finally {
      setAddingNote(false);
    }
  };

  const handleRevertStatus = async (lead) => {
    const prev = PREV_STATUS[lead.status];
    if (!prev) return;
    setRevertingId(lead._id);
    try {
      await updateLeadStatus(lead._id, prev);
      setLeads((prevLeads) =>
        prevLeads.map((l) => l._id === lead._id ? { ...l, status: prev } : l)
      );
      if (viewingLead?._id === lead._id) setViewingLead((v) => ({ ...v, status: prev }));
    } catch {
      alert('Failed to revert status.');
    } finally {
      setRevertingId(null);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Lead CRM</h1>
          <p className="text-slate-500 font-bold mt-2">Centralized portal for lead tracking, segmentation, and conversion metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          {meta && (
            <span className="bg-slate-50 border border-slate-100 text-slate-600 px-6 py-3 rounded-2xl text-sm font-black">
              {meta.total} total leads
            </span>
          )}
          <ExportButton
            onExport={() => {
              const query = {};
              if (search) query.search = search;
              if (leadType) query.leadType = leadType;
              if (status) query.status = status;
              return exportLeads(query);
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-55">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Quick Search</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full bg-slate-50 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Name, phone, or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        <div className="w-48">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Lead Type</label>
          <select
            className="w-full appearance-none bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
            value={leadType}
            onChange={(e) => { setLeadType(e.target.value); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
            <option value="loan">Loan</option>
            <option value="agreement">Agreement</option>
          </select>
        </div>
        <div className="w-48">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Status</label>
          <select
            className="w-full appearance-none bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-50 overflow-hidden">
        {loading ? (
          <div className="p-10 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl" />)}
          </div>
        ) : leads.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">inbox</span>
            <p className="text-slate-400 font-bold">No leads found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2 px-6 pb-6">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-5">Name</th>
                  <th className="px-6 py-5">Contact</th>
                  <th className="px-6 py-5">Type</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const style = STATUS_STYLES[lead.status] || STATUS_STYLES.new;
                  const nextStatus = NEXT_STATUS[lead.status];
                  const busy = updatingId === lead._id;
                  const deleting = deletingId === lead._id;
                  return (
                    <tr key={lead._id} className="bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group rounded-3xl">
                      <td className="px-6 py-5 rounded-l-3xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-white text-primary flex items-center justify-center font-black text-xs shadow-sm border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">
                            {getInitials(lead.name)}
                          </div>
                          <span className="text-sm font-black text-slate-900">{lead.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-700">{lead.phone}</p>
                        {lead.email && <p className="text-[10px] text-slate-400 font-medium">{lead.email}</p>}
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full">
                          {(lead.leadType || '').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-500">{formatDate(lead.createdAt)}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${style.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right rounded-r-3xl">
                        <div className="flex items-center justify-end gap-2">
                          {nextStatus && (
                            <button
                              onClick={() => handleAdvanceStatus(lead)}
                              disabled={busy || deleting}
                              className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                            >
                              {busy ? '…' : `→ ${nextStatus}`}
                            </button>
                          )}

                          {PREV_STATUS[lead.status] && (
                            <button
                              onClick={() => handleRevertStatus(lead)}
                              disabled={busy || deleting || revertingId === lead._id}
                              title={`Revert to ${PREV_STATUS[lead.status]}`}
                              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100 transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-lg">
                                {revertingId === lead._id ? 'sync' : 'undo'}
                              </span>
                            </button>
                          )}

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenActionFor((prev) => (prev === lead._id ? null : lead._id))}
                              className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-primary hover:border-primary/20 transition-all"
                              aria-label="Lead options"
                            >
                              <span className="material-symbols-outlined text-lg">more_horiz</span>
                            </button>

                            {openActionFor === lead._id && (
                              <div className="absolute right-0 top-11 z-20 w-44 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-200/60">
                                <button
                                  type="button"
                                  onClick={() => handleViewLead(lead._id)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                >
                                  <span className="material-symbols-outlined text-lg text-primary">visibility</span>
                                  <span>View</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLead(lead._id)}
                                  disabled={deleting}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                                >
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                  <span>{deleting ? 'Deleting…' : 'Delete'}</span>
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

      {/* Lead View Modal */}
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
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: 'Name', value: viewingLead.name },
                    { label: 'Phone', value: viewingLead.phone },
                    { label: 'Email', value: viewingLead.email },
                    { label: 'Lead Type', value: (viewingLead.leadType || '').replace('_', ' ') },
                    { label: 'Status', value: viewingLead.status },
                    { label: 'Submitted On', value: viewingLead.createdAt ? formatDate(viewingLead.createdAt) : null },
                    { label: 'Budget Min', value: viewingLead.budgetMin },
                    { label: 'Budget Max', value: viewingLead.budgetMax },
                    { label: 'Monthly Income', value: viewingLead.monthlyIncome },
                    { label: 'Source', value: viewingLead.source },
                    {
                      label: 'Preferred Locations',
                      value: Array.isArray(viewingLead.preferredLocations) ? viewingLead.preferredLocations.join(', ') : null,
                      full: true,
                    },
                    { label: 'Property', value: viewingLead.propertyId?.title, full: true },
                    {
                      label: 'Assigned To',
                      value: viewingLead.assignedTo
                        ? [viewingLead.assignedTo.name, viewingLead.assignedTo.email].filter(Boolean).join(' • ')
                        : null,
                      full: true,
                    },
                    { label: 'Message', value: viewingLead.message, full: true },
                  ]
                    .filter((field) => hasValue(field.value))
                    .map((field) => (
                      <Info key={field.label} label={field.label} value={field.value} full={field.full} />
                    ))}
                </div>

                {/* Notes Section */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                    Activity Notes ({(viewingLead.notes || []).length})
                  </h4>

                  {/* Existing notes */}
                  {(viewingLead.notes || []).length > 0 ? (
                    <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-1">
                      {viewingLead.notes.map((note, i) => (
                        <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                          <p className="text-sm font-medium text-slate-700 leading-relaxed">{note.text}</p>
                          <p className="text-[10px] font-bold text-amber-500 mt-2 uppercase tracking-widest">
                            {note.addedAt ? formatDate(note.addedAt) : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic mb-5">No notes yet.</p>
                  )}

                  {/* Add new note */}
                  <div className="flex gap-3">
                    <textarea
                      rows={2}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add a note (call outcome, follow-up, etc.)"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 resize-none placeholder:text-slate-400"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={addingNote || !noteText.trim()}
                      className="px-5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed self-stretch"
                    >
                      {addingNote ? '…' : 'Add'}
                    </button>
                  </div>
                </div>
                </>
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
