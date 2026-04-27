'use client';

import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/api/errors';
import { useToast } from '@/context/ToastContext';
import { apiFetch } from '@/lib/api';
import { authedApiFetch } from '@/lib/api/authedRequest';

const EMPTY_RATE_SET = { maleRate: 6, femaleRate: 5, jointRate: 5, registrationCharge: 30000 };

const DEFAULT_FORM = {
  buy: { ...EMPTY_RATE_SET },
  rent: { maleRate: 2, femaleRate: 2, jointRate: 2, registrationCharge: 1000 },
};

export default function AdminStampDutyPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [activeTab, setActiveTab] = useState('buy');
  const [lastUpdatedAt, setLastUpdatedAt] = useState('');

  const patchTab = (tab, key, value) =>
    setForm((prev) => ({ ...prev, [tab]: { ...prev[tab], [key]: value } }));

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/stamp-duty');
      const data = res.data || {};
      setForm({
        buy: { ...EMPTY_RATE_SET, ...(data.buy || {}) },
        rent: { maleRate: 2, femaleRate: 2, jointRate: 2, registrationCharge: 1000, ...(data.rent || {}) },
      });
      setLastUpdatedAt(data.updatedAt || '');
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to load stamp duty config'), 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        buy: {
          maleRate: Number(form.buy.maleRate),
          femaleRate: Number(form.buy.femaleRate),
          jointRate: Number(form.buy.jointRate),
          registrationCharge: Number(form.buy.registrationCharge),
        },
        rent: {
          maleRate: Number(form.rent.maleRate),
          femaleRate: Number(form.rent.femaleRate),
          jointRate: Number(form.rent.jointRate),
          registrationCharge: Number(form.rent.registrationCharge),
        },
      };
      const res = await authedApiFetch('/api/stamp-duty', { method: 'PUT', body });
      const updated = res.data || {};
      setLastUpdatedAt(updated.updatedAt || new Date().toISOString());
      addToast('Stamp duty rates updated successfully', 'success');
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to update stamp duty rates'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentRates = form[activeTab];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Stamp Duty Rates</h1>
          <p className="text-slate-500 font-bold mt-2">
            Set the rates used by the public stamp duty calculator. Changes take effect immediately.
          </p>
        </div>
        {lastUpdatedAt ? (
          <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-100 px-5 py-3 text-xs font-black text-slate-600 uppercase tracking-wider">
            <span className="material-symbols-outlined text-base">history</span>
            Updated {new Date(lastUpdatedAt).toLocaleString('en-IN')}
          </span>
        ) : null}
      </div>

      {/* Property Type Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'buy', label: 'Buy', icon: 'home' },
          { id: 'rent', label: 'Rent', icon: 'key' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'bg-white text-primary shadow-md'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-8 space-y-6">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                {activeTab === 'buy' ? 'Buy' : 'Rent'} — Stamp Duty Rates (%)
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-1">
                Percentage of the property value charged as stamp duty for each buyer type.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <RateField
                label="Male Buyer Rate"
                suffix="%"
                value={currentRates.maleRate}
                onChange={(v) => patchTab(activeTab, 'maleRate', v)}
                min={0} max={20} step={0.1}
                hint="Standard rate for male buyers"
              />
              <RateField
                label="Female Buyer Rate"
                suffix="%"
                value={currentRates.femaleRate}
                onChange={(v) => patchTab(activeTab, 'femaleRate', v)}
                min={0} max={20} step={0.1}
                hint="Discounted rate for female buyers"
              />
              <RateField
                label="Joint Buyer Rate"
                suffix="%"
                value={currentRates.jointRate}
                onChange={(v) => patchTab(activeTab, 'jointRate', v)}
                min={0} max={20} step={0.1}
                hint="When a female is a co-owner"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-8 space-y-6">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                {activeTab === 'buy' ? 'Buy' : 'Rent'} — Registration Charge
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-1">
                Flat registration charge applied to {activeTab} property transactions (₹).
              </p>
            </div>

            <RateField
              label="Registration Charge"
              prefix="₹"
              value={currentRates.registrationCharge}
              onChange={(v) => patchTab(activeTab, 'registrationCharge', v)}
              min={0} max={500000} step={1000}
              hint="Flat charge regardless of property value"
              wide
            />
          </section>

          <section className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
            <h2 className="text-sm font-black tracking-tight text-slate-700 mb-4">
              Live Preview — {activeTab === 'buy' ? 'Buy' : 'Rent'} rates on ₹1 Cr property
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Male (₹1 Cr)', rate: currentRates.maleRate },
                { label: 'Female (₹1 Cr)', rate: currentRates.femaleRate },
                { label: 'Joint (₹1 Cr)', rate: currentRates.jointRate },
              ].map(({ label, rate }) => {
                const stampDuty = 10000000 * (Number(rate) / 100);
                const total = stampDuty + Number(currentRates.registrationCharge);
                const fmt = (v) =>
                  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
                return (
                  <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
                    <p className="text-lg font-black text-primary">{fmt(stampDuty)}</p>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                      + {fmt(Number(currentRates.registrationCharge))} reg. = {fmt(total)}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={fetchConfig}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
            >
              Reload
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save All Rates'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function RateField({ label, prefix, suffix, value, onChange, min, max, step, hint, wide = false }) {
  return (
    <label className={`block rounded-2xl border border-slate-100 bg-slate-50 p-5 ${wide ? 'md:max-w-xs' : ''}`}>
      <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</span>
      {hint && <span className="block text-[10px] text-slate-400 font-bold mb-3">{hint}</span>}
      <div className="flex items-center gap-2">
        {prefix && <span className="text-slate-500 font-bold text-sm">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        {suffix && <span className="text-slate-500 font-bold text-sm">{suffix}</span>}
      </div>
    </label>
  );
}
