'use client';

import { useState, useEffect, useRef } from 'react';
import FileUploadZone from './FileUploadZone';

const BHK_OPTIONS = [
  { value: 'studio',    label: 'Studio' },
  { value: '1BHK',      label: '1 BHK' },
  { value: '2BHK',      label: '2 BHK' },
  { value: '3BHK',      label: '3 BHK' },
  { value: '4BHK',      label: '4 BHK' },
  { value: '4+BHK',     label: '4+ BHK' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'commercial', label: 'Commercial' },
];

const NUM_OPTIONS = ['1', '2', '3', '4', '5'];

const EMPTY_CONFIG = {
  bhkType: '2BHK',
  title: '',
  carpetAreaMin: '',
  carpetAreaMax: '',
  bathrooms: '2',
  balconies: '1',
  parking: '1',
  totalUnits: '',
  images: [],
  imageFiles: [],
};

export default function ConfigSidePanel({ isOpen, editingConfig, onSave, onClose }) {
  const [local, setLocal] = useState(() => ({
    ...(editingConfig || EMPTY_CONFIG),
    imageFiles: [],
    images: Array.isArray(editingConfig?.images) ? editingConfig.images : [],
  }));

  // Blob URLs for new file previews — tracked via ref for cleanup
  const [imagePreviews, setImagePreviews] = useState([]);
  const previewsRef = useRef([]);

  const updatePreviews = (newPreviews) => {
    previewsRef.current = newPreviews;
    setImagePreviews(newPreviews);
  };

  // Reset when panel opens or switches to a different config
  useEffect(() => {
    previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    updatePreviews([]);
    setLocal({
      ...(editingConfig || EMPTY_CONFIG),
      imageFiles: [],
      images: Array.isArray(editingConfig?.images) ? editingConfig.images : [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingConfig?._id, editingConfig?._tempId, isOpen]);

  // Revoke all blob URLs on unmount
  useEffect(() => {
    return () => previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const set = (key, val) => setLocal((prev) => ({ ...prev, [key]: val }));

  const handleAddImages = (files) => {
    const newUrls = Array.from(files).map((f) => URL.createObjectURL(f));
    updatePreviews([...previewsRef.current, ...newUrls]);
    setLocal((prev) => ({
      ...prev,
      imageFiles: [...(prev.imageFiles || []), ...Array.from(files)],
    }));
  };

  const handleRemoveImage = (index) => {
    const existingCount = (local.images || []).length;
    if (index < existingCount) {
      setLocal((prev) => ({
        ...prev,
        images: (prev.images || []).filter((_, i) => i !== index),
      }));
    } else {
      const fileIdx = index - existingCount;
      URL.revokeObjectURL(previewsRef.current[fileIdx]);
      updatePreviews(previewsRef.current.filter((_, i) => i !== fileIdx));
      setLocal((prev) => ({
        ...prev,
        imageFiles: (prev.imageFiles || []).filter((_, i) => i !== fileIdx),
      }));
    }
  };

  const handleSave = () => {
    if (!local.bhkType || !local.carpetAreaMin) return;
    onSave(local);
  };

  const allImagePreviews = [
    ...(local.images || []).map((url) => ({ url, isImage: true })),
    ...imagePreviews.map((url) => ({ url, isImage: true })),
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-20" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-18 bottom-0 w-105 bg-white shadow-2xl z-30 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-800">
            {editingConfig?._id || editingConfig?._tempId ? 'Edit Configuration' : 'Add Configuration'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              BHK Type <span className="text-red-500">*</span>
            </label>
            <select
              value={local.bhkType}
              onChange={(e) => set('bhkType', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              {BHK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Configuration Title</label>
            <input
              type="text"
              value={local.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. 2 BHK Premium"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Carpet Area Min (sq.ft) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={local.carpetAreaMin}
                onChange={(e) => set('carpetAreaMin', e.target.value)}
                placeholder="e.g. 720"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Carpet Area Max (sq.ft)</label>
              <input
                type="number"
                value={local.carpetAreaMax}
                onChange={(e) => set('carpetAreaMax', e.target.value)}
                placeholder="e.g. 850"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'bathrooms', label: 'Bathrooms', opts: NUM_OPTIONS },
              { key: 'balconies', label: 'Balconies', opts: ['0', ...NUM_OPTIONS] },
              { key: 'parking',   label: 'Parking',   opts: ['0', ...NUM_OPTIONS] },
            ].map(({ key, label, opts }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
                <select
                  value={local[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  {opts.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Available Units</label>
            <input
              type="number"
              value={local.totalUnits}
              onChange={(e) => set('totalUnits', e.target.value)}
              placeholder="e.g. 24"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Unit Photos */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Unit Photos</label>
            <p className="text-[11px] text-slate-400 mb-2">Photos specific to this BHK type — shown on the unit detail page</p>
            <FileUploadZone
              accept="image/*"
              multiple
              maxSizeMB={5}
              label="Upload Unit Photos"
              hint="Drag & drop or click · Max 5MB each"
              previewUrls={allImagePreviews}
              onFilesChange={handleAddImages}
              onRemove={handleRemoveImage}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!local.bhkType || !local.carpetAreaMin}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </>
  );
}
