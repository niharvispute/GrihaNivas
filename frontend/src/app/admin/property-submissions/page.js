'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  deletePropertySubmission,
  getPropertySubmissionById,
  listPropertySubmissions,
  updatePropertySubmissionStatus,
} from '@/services/propertySubmissionService';

const STATUS_STYLES = {
  new: { bg: 'bg-blue-50 text-blue-700', dot: 'bg-blue-600' },
  reviewing: { bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-600' },
  approved: { bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-600' },
  rejected: { bg: 'bg-rose-50 text-rose-700', dot: 'bg-rose-600' },
  closed: { bg: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
};

const STATUS_TRANSITIONS = {
  new: ['reviewing'],
  reviewing: ['new', 'approved', 'rejected'],
  approved: [],
  rejected: ['reviewing'],
  closed: [],
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function getMediaUrl(value) {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized || null;
  }

  if (value && typeof value === 'object' && typeof value.url === 'string') {
    const normalized = value.url.trim();
    return normalized || null;
  }

  return null;
}

export default function PropertySubmissionsPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [listingType, setListingType] = useState('');
  const [showApproved, setShowApproved] = useState(false);
  const [page, setPage] = useState(1);
  const [openActionFor, setOpenActionFor] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [closeWarningItem, setCloseWarningItem] = useState(null);
 
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const query = { page, limit: 15 };
      if (search) query.search = search;
      if (status) {
        query.status = status;
      } else if (!showApproved) {
        query.excludeStatus = 'approved';
      }
      if (listingType) query.listingType = listingType;
 
      const res = await listPropertySubmissions(query);
      setItems(res.items || []);
      setMeta(res.meta || null);
    } catch {
      setItems([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [search, status, listingType, page, showApproved]);
 
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const performStatusUpdate = async (item, nextStatus) => {
    setUpdatingId(item._id);
    try {
      await updatePropertySubmissionStatus(item._id, nextStatus);
      if (nextStatus === 'approved') {
        setItems((prev) => prev.filter((entry) => entry._id !== item._id));
        setMeta((prev) =>
          prev ? { ...prev, total: Math.max((prev.total || 1) - 1, 0) } : prev
        );
      } else {
        setItems((prev) =>
          prev.map((entry) =>
            entry._id === item._id ? { ...entry, status: nextStatus } : entry
          )
        );
      }
    } catch {
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (item, nextStatus) => {
    if (!nextStatus || nextStatus === item.status) return;
    if (
      nextStatus === 'closed' &&
      (item.status === 'approved' || item.status === 'rejected')
    ) {
      setCloseWarningItem({ item, nextStatus });
      return;
    }

    await performStatusUpdate(item, nextStatus);
  };

  const handleCloseWarningApprove = async () => {
    if (!closeWarningItem) return;
    const { item, nextStatus } = closeWarningItem;
    setCloseWarningItem(null);
    await performStatusUpdate(item, nextStatus);
  };

  const handleView = async (id) => {
    setOpenActionFor(null);
    setLoadingDetail(true);
    try {
      const detail = await getPropertySubmissionById(id);
      setViewingItem(detail);
    } catch {
      alert('Failed to fetch submission details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async (id) => {
    setOpenActionFor(null);
    const ok = window.confirm('Delete this property submission? This action cannot be undone.');
    if (!ok) return;

    setDeletingId(id);
    try {
      await deletePropertySubmission(id);
      setItems((prev) => prev.filter((entry) => entry._id !== id));
      setMeta((prev) =>
        prev ? { ...prev, total: Math.max((prev.total || 1) - 1, 0) } : prev
      );
    } catch {
      alert('Failed to delete submission.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Property Submissions</h1>
          <p className="text-slate-500 font-bold mt-2">Review and process owner listing requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setShowApproved((prev) => !prev); setPage(1); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${showApproved ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: showApproved ? "'FILL' 1" : "'FILL' 0" }}>
              check_circle
            </span>
            <span>Show Approved</span>
          </button>
          {meta && (
            <span className="bg-slate-50 border border-slate-100 text-slate-600 px-6 py-3 rounded-2xl text-sm font-black">
              {meta.total} submissions
            </span>
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-50 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-55">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Quick Search</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full bg-slate-50 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Owner, phone, locality, title..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="w-48">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Listing Type</label>
          <select
            className="w-full appearance-none bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
            value={listingType}
            onChange={(e) => { setListingType(e.target.value); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="Sale">Sale</option>
            <option value="Rent">Rent</option>
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
            <option value="reviewing">Reviewing</option>
            <option value="rejected">Rejected</option>
            <option value="approved">Approved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-50 overflow-hidden">
        {loading ? (
          <div className="p-10 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">inbox</span>
            <p className="text-slate-400 font-bold">No submissions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2 p-6">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-5">Owner</th>
                  <th className="px-6 py-5">Locality</th>
                  <th className="px-6 py-5">Type</th>
                  <th className="px-6 py-5">Feature / RERA</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const style = STATUS_STYLES[item.status] || STATUS_STYLES.new;
                  const transitionOptions = STATUS_TRANSITIONS[item.status] || [];
                  const busy = updatingId === item._id;
                  const deleting = deletingId === item._id;

                  return (
                    <tr key={item._id} className="bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group rounded-2xl">
                      <td className="px-6 py-5 rounded-l-2xl">
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-900">{item.ownerName}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{item.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-600">{item.locality}</td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full">
                          {item.listingType} / {item.buildingType}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-500">
                            Features: {Array.isArray(item.feature) ? item.feature.length : 0}
                          </p>
                          {item.reraUrl ? (
                            <a
                              href={item.reraUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-primary hover:underline"
                            >
                              Open RERA Link
                            </a>
                          ) : (
                            <p className="text-[10px] font-bold text-slate-400">No RERA URL</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-500">{formatDate(item.createdAt)}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${style.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {item.status}
                          </span>
                          {item.closedByOwner && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 w-fit">
                              <span className="material-symbols-outlined text-[11px]">person_off</span>
                              User deactivated
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right rounded-r-2xl">
                        <div className="flex items-center justify-end gap-2">
                          {transitionOptions.length > 0 && (
                            <select
                              key={`${item._id}-${item.status}`}
                              defaultValue=""
                              onChange={(event) => {
                                const nextStatus = event.target.value;
                                event.target.value = '';
                                if (nextStatus) {
                                  handleStatusChange(item, nextStatus);
                                }
                              }}
                              disabled={busy || deleting}
                              className="bg-primary/5 text-primary border border-primary/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                            >
                              <option value="">Move to…</option>
                              {transitionOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          )}

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenActionFor((prev) => (prev === item._id ? null : item._id))}
                              className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-primary hover:border-primary/20 transition-all"
                            >
                              <span className="material-symbols-outlined text-lg">more_horiz</span>
                            </button>

                            {openActionFor === item._id && (
                              <div className="absolute right-0 top-11 z-20 w-44 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-200/60">
                                <button
                                  type="button"
                                  onClick={() => handleView(item._id)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                >
                                  <span className="material-symbols-outlined text-lg text-primary">visibility</span>
                                  <span>View</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item._id)}
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

      {(loadingDetail || viewingItem) && (
        <div className="fixed inset-0 z-70 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Submission Details</h3>
              <button
                type="button"
                onClick={() => { setViewingItem(null); setLoadingDetail(false); }}
                className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8 max-h-[75vh] overflow-y-auto">
              {loadingDetail ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}
                </div>
              ) : viewingItem ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: 'Owner Name', value: viewingItem.ownerName },
                      { label: 'Phone', value: viewingItem.phone },
                      { label: 'Email', value: viewingItem.email },
                      { label: 'Listing Type', value: viewingItem.listingType },
                      { label: 'Building Type', value: viewingItem.buildingType },
                      { label: 'Property Type', value: viewingItem.propertyType },
                      { label: 'City', value: viewingItem.city },
                      { label: 'Locality', value: viewingItem.locality },
                      { label: 'Possession', value: viewingItem.possession },
                      {
                        label: 'Available From',
                        value: viewingItem.availableFrom
                          ? new Date(viewingItem.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : null,
                      },
                      { label: 'Age', value: viewingItem.age },
                      { label: 'Bathrooms', value: viewingItem.bathrooms },
                      { label: 'Balconies', value: viewingItem.balconies },
                      { label: 'Covered Parking', value: viewingItem.coveredParking },
                      { label: 'Open Parking', value: viewingItem.openParking },
                      { label: 'Price', value: viewingItem.price },
                      { label: 'Status', value: viewingItem.status },
                      {
                        label: 'Closed by Owner',
                        value: viewingItem.closedByOwner ? 'Yes — user deactivated this listing' : null,
                      },
                      {
                        label: 'Hero Features',
                        value: Array.isArray(viewingItem.feature)
                          ? viewingItem.feature.join(' | ')
                          : viewingItem.feature,
                        full: true,
                      },
                      { label: 'RERA URL', value: viewingItem.reraUrl, full: true },
                      {
                        label: 'Amenities',
                        value: Array.isArray(viewingItem.amenities) ? viewingItem.amenities.join(', ') : null,
                        full: true,
                      },
                      {
                        label: 'Appliances',
                        value: Array.isArray(viewingItem.appliances) && viewingItem.appliances.length > 0
                          ? viewingItem.appliances.join(', ')
                          : null,
                        full: true,
                      },
                      { label: 'Title', value: viewingItem.title, full: true },
                      { label: 'Description', value: viewingItem.description, full: true },
                      {
                        label: 'Image Count',
                        value: Array.isArray(viewingItem.images) ? viewingItem.images.length : 0,
                      },
                      {
                        label: 'Video',
                        value: viewingItem.videoMeta?.url || viewingItem.videoMeta?.name,
                        full: true,
                      },
                    ]
                      .filter((field) => hasValue(field.value))
                      .map((field) => (
                        <Info key={field.label} label={field.label} value={field.value} full={field.full} />
                      ))}
                  </div>

                  <SubmissionMediaPreview item={viewingItem} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {closeWarningItem && (
        <div className="fixed inset-0 z-80 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-100 bg-white p-7 shadow-2xl">
            <div className="mb-5 flex items-start gap-3">
              <span className="material-symbols-outlined text-2xl text-amber-500">warning</span>
              <div>
                <h3 className="text-xl font-black tracking-tight text-slate-900">Close Property Warning</h3>
                <p className="mt-2 text-sm font-bold text-slate-600">
                  If you close this property, it will not be visible on property listings and it will be deleted
                  from your database within 30 days.
                </p>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCloseWarningItem(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={handleCloseWarningApprove}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-black uppercase tracking-widest text-white hover:bg-rose-700"
              >
                Approve
              </button>
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

function SubmissionMediaPreview({ item }) {
  const imageUrls = Array.isArray(item?.images)
    ? item.images.map(getMediaUrl).filter(Boolean)
    : [];
  const videoUrl = getMediaUrl(item?.videoMeta?.url || item?.videoMeta);
  const [activeImageIndex, setActiveImageIndex] = useState(-1);

  const isLightboxOpen = activeImageIndex >= 0 && activeImageIndex < imageUrls.length;

  const closeLightbox = () => {
    setActiveImageIndex(-1);
  };

  const showPreviousImage = (event) => {
    if (event) event.stopPropagation();
    setActiveImageIndex((prev) => (prev <= 0 ? imageUrls.length - 1 : prev - 1));
  };

  const showNextImage = (event) => {
    if (event) event.stopPropagation();
    setActiveImageIndex((prev) => (prev >= imageUrls.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeLightbox();
        return;
      }

      if (event.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev <= 0 ? imageUrls.length - 1 : prev - 1));
        return;
      }

      if (event.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev >= imageUrls.length - 1 ? 0 : prev + 1));
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, imageUrls.length]);

  if (!imageUrls.length && !videoUrl) {
    return null;
  }

  return (
    <div className="space-y-8">
      {imageUrls.length > 0 && (
        <section className="space-y-4">
          <h4 className="text-base font-black tracking-tight text-slate-900">
            Uploaded Images ({imageUrls.length})
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imageUrls.map((url, index) => (
              <button
                type="button"
                key={`${url}-${index}`}
                onClick={() => setActiveImageIndex(index)}
                className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white"
                title="Open image slider"
              >
                <img
                  src={url}
                  alt={`Submission image ${index + 1}`}
                  className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {videoUrl && (
        <section className="space-y-4">
          <h4 className="text-base font-black tracking-tight text-slate-900">Uploaded Video</h4>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <video
              controls
              preload="metadata"
              className="w-full max-h-105 rounded-xl bg-black"
              src={videoUrl}
            >
              <a href={videoUrl} target="_blank" rel="noreferrer">
                Open uploaded video
              </a>
            </video>
          </div>
        </section>
      )}

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-90 flex items-center justify-center bg-slate-950/90 p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Submission image preview"
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              closeLightbox();
            }}
            className="absolute right-5 top-5 z-92 rounded-xl bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close image preview"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {imageUrls.length > 1 && (
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-4 md:left-8 z-92 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
              aria-label="Previous image"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          )}

          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={imageUrls[activeImageIndex]}
              alt={`Submission image ${activeImageIndex + 1}`}
              className="mx-auto max-h-[78vh] w-auto max-w-full rounded-2xl object-contain"
            />

            <div className="mt-4 flex items-center justify-between text-xs font-bold text-white/85">
              <span>
                Image {activeImageIndex + 1} of {imageUrls.length}
              </span>
              <a
                href={imageUrls[activeImageIndex]}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/30 px-3 py-1 hover:bg-white/10"
              >
                Open Original
              </a>
            </div>
          </div>

          {imageUrls.length > 1 && (
            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-4 md:right-8 z-92 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
              aria-label="Next image"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
