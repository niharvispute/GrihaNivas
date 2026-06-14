'use client';

import { useState } from 'react';

const FACING_OPTIONS = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'];
const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'hold',      label: 'Hold' },
  { value: 'booked',    label: 'Booked' },
  { value: 'sold',      label: 'Sold' },
];

const EMPTY_UNIT = {
  tower: '',
  floor: '',
  unitNumber: '',
  configurationId: '',
  carpetArea: '',
  facing: 'East',
  price: '',
  status: 'available',
};

export default function UnitFormModal({ isOpen, editingUnit, configurations = [], onSave, onClose }) {
  const [form, setForm] = useState(() => ({ ...(editingUnit || EMPTY_UNIT) }));
  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  if (!isOpen) return null;

  const handleSave = () => {
    if (!form.unitNumber && !form.floor) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-800">
            {editingUnit ? 'Edit Unit' : 'Add Unit'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tower</label>
            <input
              type="text"
              value={form.tower}
              onChange={(e) => set('tower', e.target.value)}
              placeholder="e.g. Tower A"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Floor</label>
            <input
              type="number"
              value={form.floor}
              onChange={(e) => set('floor', e.target.value)}
              placeholder="e.g. 12"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Unit Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.unitNumber}
              onChange={(e) => set('unitNumber', e.target.value)}
              placeholder="e.g. 1203"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Configuration</label>
            <select
              value={form.configurationId}
              onChange={(e) => set('configurationId', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
            >
              <option value="">Select config</option>
              {configurations.map((c) => (
                <option key={c._id || c._tempId} value={c._id || c._tempId}>
                  {c.title || c.bhkType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Carpet Area (sq.ft)</label>
            <input
              type="number"
              value={form.carpetArea}
              onChange={(e) => set('carpetArea', e.target.value)}
              placeholder="e.g. 820"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Facing</label>
            <select
              value={form.facing}
              onChange={(e) => set('facing', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
            >
              {FACING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Price (₹)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="e.g. 24500000"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
            >
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.unitNumber}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {editingUnit ? 'Update Unit' : 'Add Unit'}
          </button>
        </div>
      </div>
    </div>
  );
}
