'use client';

import { useState } from 'react';
import { useProjectForm } from '@/context/ProjectFormContext';
import UnitFormModal from '../UnitFormModal';
import BulkImportPanel from '../BulkImportPanel';

const BHK_LABEL = {
  studio: 'Studio', '1BHK': '1 BHK', '2BHK': '2 BHK', '3BHK': '3 BHK',
  '4BHK': '4 BHK', '4+BHK': '4+ BHK', penthouse: 'Penthouse', commercial: 'Commercial',
};

function ConfigPricingCard({ cfg, pricing, onChange }) {
  const [editMode, setEditMode] = useState(false);
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-lg">
            {BHK_LABEL[cfg.bhkType] || cfg.bhkType}
          </span>
          <span className="text-sm text-slate-600">{cfg.carpetAreaMin}–{cfg.carpetAreaMax} sq.ft</span>
          {!editMode && (
            <span className="text-sm text-slate-600">
              {pricing.priceMin ? `${formatPrice(pricing.priceMin)} – ${formatPrice(pricing.priceMax)}` : 'Price not set'}
            </span>
          )}
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          {editMode ? 'Done' : 'Edit Pricing'}
        </button>
      </div>
      {editMode && (
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Price Min (₹)</label>
            <input type="number" value={pricing.priceMin || ''} onChange={(e) => onChange('priceMin', e.target.value)} placeholder="e.g. 12500000" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Price Max (₹)</label>
            <input type="number" value={pricing.priceMax || ''} onChange={(e) => onChange('priceMax', e.target.value)} placeholder="e.g. 15500000" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_BADGE = {
  available: 'bg-green-100 text-green-700',
  hold:      'bg-orange-100 text-orange-700',
  booked:    'bg-blue-100 text-blue-700',
  sold:      'bg-slate-100 text-slate-500',
};

function formatPrice(n) {
  if (!n) return '—';
  const num = Number(n);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
}

// Static placeholder units — replaced by API data in Phase 1
const PLACEHOLDER_UNITS = [
  { _id: 'u1', tower: 'Tower A', floor: 12, unitNumber: '1203', bhkType: '2BHK', carpetArea: 820,  facing: 'East',  price: 24500000, status: 'available' },
  { _id: 'u2', tower: 'Tower B', floor: 13, unitNumber: '1301', bhkType: '3BHK', carpetArea: 1180, facing: 'West',  price: 37500000, status: 'hold' },
  { _id: 'u3', tower: 'Tower C', floor: 9,  unitNumber: '904',  bhkType: '1BHK', carpetArea: 510,  facing: 'North', price: 14200000, status: 'booked' },
  { _id: 'u4', tower: 'Tower A', floor: 10, unitNumber: '1002', bhkType: '2BHK', carpetArea: 720,  facing: 'East',  price: 21000000, status: 'sold' },
];

export default function Step4PricingInventory() {
  const { formData, updateFormData } = useProjectForm();
  const d   = formData.step4;
  const d2  = formData.step2;
  const configs = d2?.configurations || [];

  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit]     = useState(null);
  const [openActionFor, setOpenActionFor] = useState(null);
  const [towerFilter, setTowerFilter]     = useState('');
  const [statusFilter, setStatusFilter]   = useState('');

  const set = (key, val) => updateFormData('step4', { [key]: val });

  const setConfigPrice = (tempId, field, val) => {
    set('configPricing', {
      ...(d.configPricing || {}),
      [tempId]: { ...(d.configPricing?.[tempId] || {}), [field]: val },
    });
  };

  const handleSaveUnit = (unit) => {
    // Phase 0: store locally — Phase 1 calls API
    const units = [...(d.units || [])];
    if (unit._id) {
      const idx = units.findIndex((u) => u._id === unit._id);
      if (idx !== -1) units[idx] = unit;
    } else {
      units.push({ ...unit, _id: `tmp_${Date.now()}` });
    }
    set('units', units);
    setUnitModalOpen(false);
    setEditingUnit(null);
  };

  const handleDeleteUnit = (id) => {
    set('units', (d.units || []).filter((u) => u._id !== id));
    setOpenActionFor(null);
  };

  // Show placeholder units if no real units yet (Phase 0 visual)
  const displayUnits = (d.units?.length > 0 ? d.units : PLACEHOLDER_UNITS).filter((u) => {
    const matchTower  = !towerFilter  || u.tower === towerFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchTower && matchStatus;
  });

  const towers = [...new Set(PLACEHOLDER_UNITS.map((u) => u.tower))];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Pricing &amp; Inventory</h2>
        <p className="text-slate-500 mt-1 text-sm">Set pricing, manage unit inventory, and bulk import.</p>
      </div>

      {/* Project Price Summary */}
      <section className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Project Price Summary</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500 text-sm">info</span>
          <p className="text-xs text-blue-700">Project price range can be auto-calculated from active configurations (Phase 1)</p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {[
            { key: 'priceMin',            label: 'Starting Price (₹)',       placeholder: '1,25,00,000' },
            { key: 'priceMax',            label: 'Maximum Price (₹)',        placeholder: '4,25,00,000' },
            { key: 'pricePerSqft',        label: 'Price per Sq.Ft (₹)',      placeholder: '18,500' },
            { key: 'maintenanceCharges',  label: 'Maintenance / Other',      placeholder: '₹3.50 / sq.ft / month' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
              <input
                type={key === 'maintenanceCharges' ? 'text' : 'number'}
                value={d[key] || ''}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Configuration Pricing */}
      {configs.length > 0 && (
        <section className="mb-8">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Configuration Pricing</h3>
          <div className="grid grid-cols-1 gap-3">
            {configs.map((cfg) => (
              <ConfigPricingCard
                key={cfg._tempId}
                cfg={cfg}
                pricing={d.configPricing?.[cfg._tempId] || {}}
                onChange={(field, val) => setConfigPrice(cfg._tempId, field, val)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Unit Inventory */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700">Unit Inventory</h3>
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              title="Download Inventory — wired in Phase 1"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Download
            </button>
            <button
              onClick={() => { setEditingUnit(null); setUnitModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Unit
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <select value={towerFilter} onChange={(e) => setTowerFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white focus:outline-none">
            <option value="">All Towers</option>
            {towers.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white focus:outline-none">
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="hold">Hold</option>
            <option value="booked">Booked</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Tower','Floor','Unit No.','Config','Area','Facing','Price','Status',''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayUnits.map((unit) => (
                <tr key={unit._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{unit.tower || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{unit.floor ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{unit.unitNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{BHK_LABEL[unit.bhkType] || unit.bhkType || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{unit.carpetArea ? `${unit.carpetArea} sq.ft` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{unit.facing || '—'}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{formatPrice(unit.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[unit.status]}`}>
                      {unit.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 relative">
                      <button
                        onClick={() => { setEditingUnit(unit); setUnitModalOpen(true); }}
                        className="p-1 text-slate-400 hover:text-primary rounded-lg"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        onClick={() => setOpenActionFor(openActionFor === unit._id ? null : unit._id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-base">more_vert</span>
                      </button>
                      {openActionFor === unit._id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1">
                          <button onClick={() => handleDeleteUnit(unit._id)} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50">Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {d.units?.length === 0 && (
          <p className="text-xs text-slate-400 text-center mt-2">Showing placeholder data — live data wired in Phase 1</p>
        )}
      </section>

      {/* Bulk Import */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <BulkImportPanel />
      </section>

      <UnitFormModal
        isOpen={unitModalOpen}
        editingUnit={editingUnit}
        configurations={configs}
        onSave={handleSaveUnit}
        onClose={() => { setUnitModalOpen(false); setEditingUnit(null); }}
      />
    </div>
  );
}
