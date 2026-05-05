'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getErrorMessage } from '@/lib/api/errors';
import { useToast } from '@/context/ToastContext';
import {
  getAdminSystemConfig,
  getSystemAreas,
  getSystemConfig,
  getSystemOptions,
  updateAdminSystemConfig,
} from '@/services/systemService';

const toCsv = (list = []) => (Array.isArray(list) ? list.join(', ') : '');
const toLines = (list = []) => (Array.isArray(list) ? list.join('\n') : '');

const parseCsv = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const parseLines = (value) =>
  String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const createFormFromConfig = (config = {}) => ({
  city: String(config.city || 'Mumbai'),
  locale: String(config.locale || 'en-IN'),
  currency: String(config.currency || 'INR'),
  defaultCountryCode: String(config.defaultCountryCode || '+91'),
  allowDynamicAreas: Boolean(config.allowDynamicAreas),
  allowDynamicAmenities: Boolean(config.allowDynamicAmenities),
  areasText: toLines(config.areas || []),
  bhkValuesText: toCsv(config.bhkValues || []),
  amenityListText: toLines(config.amenityList || []),
  propertyTypesText: toCsv(config.propertyTypes || []),
  statusOptionsText: toCsv(config.statusOptions || []),
  furnishingOptionsText: toCsv(config.furnishingOptions || []),
});

const EMPTY_PREVIEW_DIFF = {
  config: [],
  areas: [],
  options: [],
};

const isObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const collectChangedPaths = (previous, next, basePath = '') => {
  if (Object.is(previous, next)) return [];

  const previousIsArray = Array.isArray(previous);
  const nextIsArray = Array.isArray(next);

  if (previousIsArray || nextIsArray) {
    if (!previousIsArray || !nextIsArray) {
      return [basePath || 'value'];
    }

    const maxLength = Math.max(previous.length, next.length);
    const changes = [];

    for (let index = 0; index < maxLength; index += 1) {
      const path = basePath ? `${basePath}[${index}]` : `[${index}]`;
      changes.push(...collectChangedPaths(previous[index], next[index], path));
    }

    return changes;
  }

  if (isObject(previous) || isObject(next)) {
    if (!isObject(previous) || !isObject(next)) {
      return [basePath || 'value'];
    }

    const keySet = new Set([...Object.keys(previous), ...Object.keys(next)]);
    const changes = [];

    keySet.forEach((key) => {
      const path = basePath ? `${basePath}.${key}` : key;
      changes.push(...collectChangedPaths(previous[key], next[key], path));
    });

    return changes;
  }

  return [basePath || 'value'];
};

export default function AdminSystemConfigPage() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewRefreshing, setPreviewRefreshing] = useState(false);
  const [form, setForm] = useState(() => createFormFromConfig());
  const [lastUpdatedAt, setLastUpdatedAt] = useState('');
  const [preview, setPreview] = useState({
    config: null,
    areas: [],
    options: null,
  });
  const [previewDiff, setPreviewDiff] = useState(EMPTY_PREVIEW_DIFF);
  const previewRef = useRef({
    config: null,
    areas: [],
    options: null,
  });

  const patchForm = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const config = await getAdminSystemConfig();
      setForm(createFormFromConfig(config));
      setLastUpdatedAt(config?.updatedAt || '');
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to load system config'), 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchPreview = useCallback(
    async ({ background = false, trackDiff = false, clearDiff = false } = {}) => {
      if (background) {
        setPreviewRefreshing(true);
      } else {
        setPreviewLoading(true);
      }

      if (clearDiff) {
        setPreviewDiff(EMPTY_PREVIEW_DIFF);
      }

      try {
        const [config, areas, options] = await Promise.all([
          getSystemConfig(),
          getSystemAreas(),
          getSystemOptions(),
        ]);

        const nextPreview = {
          config,
          areas,
          options,
        };

        if (trackDiff) {
          const previousPreview = previewRef.current;
          setPreviewDiff({
            config: collectChangedPaths(previousPreview?.config, nextPreview.config),
            areas: collectChangedPaths(previousPreview?.areas, nextPreview.areas),
            options: collectChangedPaths(previousPreview?.options, nextPreview.options),
          });
        }

        setPreview(nextPreview);
        previewRef.current = nextPreview;
      } catch (error) {
        addToast(getErrorMessage(error, 'Failed to load public preview'), 'error');
      } finally {
        if (background) {
          setPreviewRefreshing(false);
        } else {
          setPreviewLoading(false);
        }
      }
    },
    [addToast]
  );

  useEffect(() => {
    fetchConfig();
    fetchPreview({ clearDiff: true });
  }, [fetchConfig, fetchPreview]);

  const payload = useMemo(
    () => ({
      city: form.city.trim(),
      locale: form.locale.trim(),
      currency: form.currency.trim().toUpperCase(),
      defaultCountryCode: form.defaultCountryCode.trim(),
      allowDynamicAreas: Boolean(form.allowDynamicAreas),
      allowDynamicAmenities: Boolean(form.allowDynamicAmenities),
      areas: parseLines(form.areasText),
      bhkValues: parseCsv(form.bhkValuesText),
      amenityList: parseLines(form.amenityListText),
      propertyTypes: parseCsv(form.propertyTypesText),
      statusOptions: parseCsv(form.statusOptionsText),
      furnishingOptions: parseCsv(form.furnishingOptionsText),
    }),
    [form]
  );

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const updated = await updateAdminSystemConfig(payload);
      setForm(createFormFromConfig(updated));
      setLastUpdatedAt(updated?.updatedAt || new Date().toISOString());
      await fetchPreview({ background: true, trackDiff: true });
      addToast('System config updated successfully', 'success');
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to update system config'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReload = async () => {
    await Promise.all([fetchConfig(), fetchPreview({ background: true, clearDiff: true })]);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">System Settings</h1>
          <p className="text-slate-500 font-bold mt-2">
            Manage global city, options, and dynamic list behavior for the public app.
          </p>
        </div>
        {lastUpdatedAt ? (
          <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-100 px-5 py-3 text-xs font-black text-slate-600 uppercase tracking-wider">
            <span className="material-symbols-outlined text-base">history</span>
            Updated {new Date(lastUpdatedAt).toLocaleString('en-IN')}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((line) => (
            <div key={line} className="h-14 rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          <section className="rounded-2xl border border-slate-100 bg-white p-8 space-y-6">
            <h2 className="text-lg font-black tracking-tight text-slate-900">General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <Field
                label="Default City"
                value={form.city}
                onChange={(value) => patchForm({ city: value })}
              />
              <Field
                label="Locale"
                value={form.locale}
                onChange={(value) => patchForm({ locale: value })}
              />
              <Field
                label="Currency"
                value={form.currency}
                onChange={(value) => patchForm({ currency: value })}
              />
              <Field
                label="Country Code"
                value={form.defaultCountryCode}
                onChange={(value) => patchForm({ defaultCountryCode: value })}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-8 space-y-6">
            <h2 className="text-lg font-black tracking-tight text-slate-900">Dynamic Data Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleCard
                label="Allow Dynamic Areas"
                description="Merge configured areas with approved property areas."
                checked={form.allowDynamicAreas}
                onChange={(checked) => patchForm({ allowDynamicAreas: checked })}
              />
              <ToggleCard
                label="Allow Dynamic Amenities"
                description="Merge configured amenities with approved property amenities."
                checked={form.allowDynamicAmenities}
                onChange={(checked) => patchForm({ allowDynamicAmenities: checked })}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-8 space-y-6">
            <h2 className="text-lg font-black tracking-tight text-slate-900">Areas and Amenities</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <TextAreaField
                label="Areas (one per line)"
                value={form.areasText}
                onChange={(value) => patchForm({ areasText: value })}
                placeholder="South Mumbai\nBandra West\nWorli"
              />
              <TextAreaField
                label="Amenities (one per line)"
                value={form.amenityListText}
                onChange={(value) => patchForm({ amenityListText: value })}
                placeholder="Gym\nSwimming Pool\nClubhouse"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-8 space-y-6">
            <h2 className="text-lg font-black tracking-tight text-slate-900">Option Sets</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Field
                label="BHK Values (comma separated)"
                value={form.bhkValuesText}
                onChange={(value) => patchForm({ bhkValuesText: value })}
              />
              <Field
                label="Property Types (comma separated)"
                value={form.propertyTypesText}
                onChange={(value) => patchForm({ propertyTypesText: value })}
              />
              <Field
                label="Status Options (comma separated)"
                value={form.statusOptionsText}
                onChange={(value) => patchForm({ statusOptionsText: value })}
              />
              <Field
                label="Furnishing Options (comma separated)"
                value={form.furnishingOptionsText}
                onChange={(value) => patchForm({ furnishingOptionsText: value })}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">Effective Public Preview</h2>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  This mirrors the data currently returned by public system endpoints.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchPreview({ background: true })}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
              >
                {previewRefreshing ? 'Refreshing...' : 'Refresh Preview'}
              </button>
            </div>

            {previewLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-40 rounded-2xl bg-slate-100" />
                <div className="h-40 rounded-2xl bg-slate-100" />
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <PreviewCard
                  title="GET /api/system/config"
                  payload={preview.config || {}}
                  changedPaths={previewDiff.config}
                />
                <PreviewCard
                  title="GET /api/system/areas"
                  payload={preview.areas || []}
                  changedPaths={previewDiff.areas}
                />
                <div className="xl:col-span-2">
                  <PreviewCard
                    title="GET /api/system/options"
                    payload={preview.options || {}}
                    changedPaths={previewDiff.options}
                  />
                </div>
              </div>
            )}
          </section>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReload}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
            >
              Reload
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder = '' }) {
  return (
    <label className="block rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder = '' }) {
  return (
    <label className="block rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={8}
        className="w-full resize-y bg-transparent text-sm font-bold text-slate-800 outline-none"
      />
    </label>
  );
}

function ToggleCard({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 cursor-pointer">
      <span>
        <span className="block text-sm font-black text-slate-800 tracking-tight">{label}</span>
        <span className="block text-xs font-bold text-slate-500 mt-1">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary/30"
      />
    </label>
  );
}

function PreviewCard({ title, payload, changedPaths = [] }) {
  const hasChanges = changedPaths.length > 0;
  const visibleChanges = changedPaths.slice(0, 12);

  return (
    <article className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
      <header className="px-4 py-3 border-b border-slate-100 bg-white">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <p className="text-[11px] font-black tracking-wide uppercase text-slate-600">{title}</p>
          {hasChanges ? (
            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
              {changedPaths.length} changed
            </span>
          ) : null}
        </div>
      </header>
      {hasChanges ? (
        <div className="px-4 py-3 border-b border-slate-100 bg-amber-50/60">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 mb-2">Changed Keys</p>
          <div className="flex flex-wrap gap-1.5">
            {visibleChanges.map((path) => (
              <span
                key={path}
                className="inline-flex items-center rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-amber-800 border border-amber-200"
              >
                {path}
              </span>
            ))}
            {changedPaths.length > visibleChanges.length ? (
              <span className="inline-flex items-center rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-amber-800 border border-amber-200">
                +{changedPaths.length - visibleChanges.length} more
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
      <pre className="text-xs leading-5 text-slate-700 p-4 overflow-x-auto">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </article>
  );
}