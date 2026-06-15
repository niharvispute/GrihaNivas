'use client';

import { useState } from 'react';
import { useProjectForm } from '@/context/ProjectFormContext';
import { deleteConfiguration } from '@/services/projectService';
import ConfigSidePanel from '../ConfigSidePanel';

const BHK_LABEL = {
  studio: 'Studio', '1BHK': '1 BHK', '2BHK': '2 BHK', '3BHK': '3 BHK',
  '4BHK': '4 BHK', '4+BHK': '4+ BHK', penthouse: 'Penthouse', commercial: 'Commercial',
};

export default function Step2LocationConfig() {
  const { formData, updateFormData, projectId } = useProjectForm();
  const d = formData.step2;

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [deletingKey, setDeletingKey] = useState(null);
  const [configError, setConfigError] = useState(null);

  const cfgKey = (c) => c._id || c._tempId;

  const set = (key, val) => updateFormData('step2', { [key]: val });
  const setLoc = (key, val) => updateFormData('step2', { [key]: val });

  const openAddPanel = () => {
    setEditingConfig(null);
    setPanelOpen(true);
  };

  const openEditPanel = (cfg) => {
    setEditingConfig(cfg);
    setPanelOpen(true);
  };

  // Configs are stored locally and persisted in batch by the wizard on "Next"
  // (createConfiguration / updateConfiguration). Delete hits the API immediately
  // for already-persisted configs (those with a backend _id).
  const handleSaveConfig = (cfg) => {
    const configs = [...(d.configurations || [])];
    const key = cfg._id || cfg._tempId;
    if (key) {
      const idx = configs.findIndex((c) => (c._id || c._tempId) === key);
      if (idx !== -1) {
        configs[idx] = cfg;
      } else {
        configs.push(cfg);
      }
    } else {
      configs.push({ ...cfg, _tempId: `tmp_${Date.now()}` });
    }
    updateFormData('step2', { configurations: configs });
    setPanelOpen(false);
    setEditingConfig(null);
  };

  const handleDeleteConfig = async (cfg) => {
    setConfigError(null);
    if (cfg._id) {
      setDeletingKey(cfg._id);
      try {
        await deleteConfiguration(cfg._id);
      } catch (err) {
        setConfigError(err?.message || 'Failed to delete configuration');
        setDeletingKey(null);
        return;
      }
      setDeletingKey(null);
    }
    updateFormData('step2', {
      configurations: (d.configurations || []).filter((c) => cfgKey(c) !== cfgKey(cfg)),
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Location & Configuration</h2>
        <p className="text-slate-500 mt-1 text-sm">Set project address, scale, and BHK configurations.</p>
      </div>

      {/* Location */}
      <section className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Location Details</h3>
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Locality / Building Name</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">location_on</span>
              <input
                type="text"
                value={d.locality}
                onChange={(e) => setLoc('locality', e.target.value)}
                placeholder="Locality or Building Name e.g. Powai, Chandivali"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Area <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={d.area}
              onChange={(e) => setLoc('area', e.target.value)}
              placeholder="e.g. Powai"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">City</label>
            <input
              type="text"
              value={d.city}
              onChange={(e) => setLoc('city', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">State</label>
            <select
              value={d.state}
              onChange={(e) => setLoc('state', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
            >
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pincode</label>
            <input
              type="text"
              value={d.pincode}
              onChange={(e) => setLoc('pincode', e.target.value)}
              placeholder="400076"
              maxLength={6}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Complete Address</label>
            <textarea
              value={d.address}
              onChange={(e) => setLoc('address', e.target.value)}
              placeholder="Enter complete address of the project"
              rows={3}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Map placeholder */}
        <div className="mt-4 h-40 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center relative overflow-hidden">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-slate-400 block mb-1">map</span>
            <p className="text-sm text-slate-500">Map preview</p>
            <p className="text-xs text-slate-400">Geocoding wired in Phase 1</p>
          </div>
          <button className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm">
            <span className="material-symbols-outlined text-sm">my_location</span>
            Adjust Location
          </button>
        </div>
      </section>

      {/* Project Scale */}
      <section className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Project Scale</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { key: 'totalTowers', label: 'Total Towers',    icon: 'domain',          suffix: 'Towers' },
            { key: 'totalFloors', label: 'Total Floors',    icon: 'layers',           suffix: 'Floors' },
            { key: 'totalUnits',  label: 'Total Units',     icon: 'home',             suffix: 'Units' },
            { key: 'landArea',    label: 'Land Area (sq.ft)', icon: 'straighten',      suffix: 'sq.ft' },
          ].map(({ key, label, icon, suffix }) => (
            <div key={key} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
                <p className="text-xs font-semibold text-slate-500">{label}</p>
              </div>
              <input
                type="number"
                value={d[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder="0"
                className="w-full text-xl font-bold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-slate-300"
              />
              <p className="text-xs text-slate-400 mt-0.5">{suffix}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BHK Configurations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700">BHK Configurations</h3>
          <p className="text-xs text-slate-400">{(d.configurations || []).length} added</p>
        </div>

        {configError && (
          <div className="mb-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {configError}
          </div>
        )}

        <div className="space-y-3">
          {(d.configurations || []).length === 0 ? (
            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              <span className="material-symbols-outlined text-3xl block mb-1">apartment</span>
              <p className="text-sm">No configurations added yet</p>
              <p className="text-xs mt-0.5">Click "Add Configuration" to get started</p>
            </div>
          ) : (
            (d.configurations || []).map((cfg) => (
              <div key={cfgKey(cfg)} className="flex items-center justify-between px-5 py-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-lg">
                    {BHK_LABEL[cfg.bhkType] || cfg.bhkType}
                  </span>
                  {cfg.title && <span className="text-sm font-semibold text-slate-700">{cfg.title}</span>}
                  <span className="text-sm text-slate-500">
                    {cfg.carpetAreaMin}–{cfg.carpetAreaMax || '?'} sq.ft
                  </span>
                  {cfg.totalUnits && (
                    <span className="text-sm text-slate-500">{cfg.totalUnits} units</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditPanel(cfg)}
                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteConfig(cfg)}
                    disabled={deletingKey === cfg._id}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Add button */}
          <button
            onClick={openAddPanel}
            className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Configuration
          </button>
        </div>
      </section>

      <ConfigSidePanel
        isOpen={panelOpen}
        editingConfig={editingConfig}
        onSave={handleSaveConfig}
        onClose={() => { setPanelOpen(false); setEditingConfig(null); }}
      />
    </div>
  );
}
