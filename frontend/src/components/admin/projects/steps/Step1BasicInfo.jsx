'use client';

import { useEffect, useState } from 'react';
import { useProjectForm } from '@/context/ProjectFormContext';
import { listAdminBuilders } from '@/services/builderService';

const LISTING_TYPES = [
  { value: 'sale',        label: 'Sale' },
  { value: 'rent',        label: 'Rent' },
  { value: 'new_launch',  label: 'New Launch' },
  { value: 'commercial',  label: 'Commercial' },
];

const PROJECT_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial',  label: 'Commercial' },
  { value: 'mixed',       label: 'Mixed Use' },
  { value: 'plotting',    label: 'Plotting' },
];

const PROJECT_STATUSES = [
  { value: 'new_launch',          label: 'New Launch' },
  { value: 'under_construction',  label: 'Under Construction' },
  { value: 'ready_to_move',       label: 'Ready To Move' },
];

const BHK_OPTIONS = [
  { value: 'studio',    label: 'Studio' },
  { value: '1BHK',      label: '1 BHK' },
  { value: '2BHK',      label: '2 BHK' },
  { value: '3BHK',      label: '3 BHK' },
  { value: '4BHK',      label: '4 BHK' },
  { value: '4+BHK',     label: '4+ BHK' },
  { value: 'penthouse', label: 'Penthouse' },
];

function isValidIndianPhone(val) {
  const digits = String(val || '').replace(/\D/g, '');
  return digits.length === 10 && /^[6-9]/.test(digits);
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs font-semibold text-red-500">{msg}</p>;
}

export default function Step1BasicInfo() {
  const { formData, updateFormData } = useProjectForm();
  const d = formData.step1;

  const [builders, setBuilders] = useState([]);
  const [buildersError, setBuildersError] = useState(null);
  const [loadingBuilders, setLoadingBuilders] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      setLoadingBuilders(true);
      setBuildersError(null);
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const { items } = await listAdminBuilders({ limit: 200 });
          if (!cancelled) {
            setBuilders(items);
            setLoadingBuilders(false);
          }
          return;
        } catch (err) {
          const status = err?.status;
          const transient = status === 429 || status === 408 || status === 0 || (status >= 500 && status <= 599);
          if (transient && attempt < 2) {
            await sleep(500 * 2 ** attempt);
            continue;
          }
          if (!cancelled) {
            setBuildersError(err?.message || 'Failed to load builders');
            setLoadingBuilders(false);
          }
          return;
        }
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const set = (key, val) => updateFormData('step1', { [key]: val });

  const clearError = (key) => setErrors((prev) => ({ ...prev, [key]: undefined }));

  const validateField = (key, val) => {
    if (key === 'projectName') {
      if (!String(val || '').trim()) return 'Project name is required.';
    }
    if (key === 'builderId') {
      if (!val) return 'Please select a builder / developer.';
    }
    if (key === 'contactPhone') {
      if (val && !isValidIndianPhone(val)) return 'Enter a valid 10-digit Indian mobile number starting with 6–9.';
    }
    if (key === 'contactPerson') {
      const v = String(val || '').trim();
      if (v && v.length < 2) return 'Name must be at least 2 characters.';
      if (v && /[0-9]/.test(v)) return 'Name cannot contain numbers.';
      if (v && /[^a-zA-Z\s.'\-]/.test(v)) return 'Name can only contain letters, spaces, or . \' -';
    }
    if (key === 'reraUrl') {
      if (val && !/^https?:\/\/.+/.test(val.trim())) return 'Must be a full URL starting with https://';
    }
    return null;
  };

  const handleBlur = (key, val) => {
    const err = validateField(key, val);
    setErrors((prev) => ({ ...prev, [key]: err || undefined }));
  };

  const handleBuilderChange = (id) => {
    const b = builders.find((x) => x._id === id);
    updateFormData('step1', { builderId: id, builderName: b?.name || '' });
    const err = validateField('builderId', id);
    setErrors((prev) => ({ ...prev, builderId: err || undefined }));
  };

  const toggleBhk = (val) => {
    const current = d.configurations || [];
    set('configurations', current.includes(val) ? current.filter((v) => v !== val) : [...current, val]);
  };

  const inputClass = (key) =>
    `w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${
      errors[key]
        ? 'border-red-400 focus:ring-red-200 bg-red-50'
        : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
    }`;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Basic Information</h2>
        <p className="text-slate-500 mt-1 text-sm">Set up project identity, type, and available configurations.</p>
      </div>

      {/* Listing Type */}
      <section className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Listing Type</label>
        <div className="flex gap-2 flex-wrap">
          {LISTING_TYPES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('listingType', opt.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                d.listingType === opt.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-slate-200 text-slate-600 hover:border-primary/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Project Details */}
      <section className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Project Details</h3>
        <div className="grid grid-cols-2 gap-5">

          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={d.projectName}
              onChange={(e) => { set('projectName', e.target.value); clearError('projectName'); }}
              onBlur={(e) => handleBlur('projectName', e.target.value)}
              placeholder="e.g. Nahar Amrit Shakti"
              className={inputClass('projectName')}
            />
            <FieldError msg={errors.projectName} />
          </div>

          {/* Builder */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Builder / Developer <span className="text-red-500">*</span>
            </label>
            <select
              value={d.builderId}
              onChange={(e) => handleBuilderChange(e.target.value)}
              disabled={loadingBuilders}
              className={`${inputClass('builderId')} bg-white disabled:opacity-60`}
            >
              <option value="">{loadingBuilders ? 'Loading builders…' : 'Select Builder'}</option>
              {builders.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
            {buildersError && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-2">
                <span>{buildersError}</span>
                <button
                  type="button"
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="font-bold text-primary underline underline-offset-2 hover:no-underline"
                >
                  Retry
                </button>
              </p>
            )}
            <FieldError msg={errors.builderId} />
          </div>

          {/* Contact Person Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Person Name</label>
            <input
              type="text"
              value={d.contactPerson}
              onChange={(e) => {
                // Strip digits immediately as user types
                const val = e.target.value.replace(/[0-9]/g, '');
                set('contactPerson', val);
                clearError('contactPerson');
              }}
              onBlur={(e) => handleBlur('contactPerson', e.target.value)}
              placeholder="e.g. Rajesh Sharma"
              className={inputClass('contactPerson')}
            />
            <FieldError msg={errors.contactPerson} />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Number</label>
            <input
              type="tel"
              value={d.contactPhone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                set('contactPhone', digits);
                clearError('contactPhone');
              }}
              onBlur={(e) => handleBlur('contactPhone', e.target.value)}
              placeholder="e.g. 9876543210"
              maxLength={10}
              className={inputClass('contactPhone')}
            />
            {d.contactPhone && !errors.contactPhone && isValidIndianPhone(d.contactPhone) && (
              <p className="mt-1 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span> Valid mobile number
              </p>
            )}
            <FieldError msg={errors.contactPhone} />
          </div>

          {/* RERA Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">RERA Number</label>
            <input
              type="text"
              value={d.reraNumber}
              onChange={(e) => set('reraNumber', e.target.value)}
              placeholder="e.g. P51800012345"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* RERA URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">RERA URL</label>
            <input
              type="url"
              value={d.reraUrl}
              onChange={(e) => { set('reraUrl', e.target.value); clearError('reraUrl'); }}
              onBlur={(e) => handleBlur('reraUrl', e.target.value)}
              placeholder="https://maharera.mahaonline.gov.in/…"
              className={inputClass('reraUrl')}
            />
            <FieldError msg={errors.reraUrl} />
          </div>

        </div>
      </section>

      {/* Project Type */}
      <section className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Project Type</label>
        <div className="flex gap-2 flex-wrap">
          {PROJECT_TYPES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('projectType', opt.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                d.projectType === opt.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-slate-200 text-slate-600 hover:border-primary/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Project Status */}
      <section className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Project Status</label>
        <div className="flex gap-2 flex-wrap">
          {PROJECT_STATUSES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('projectStatus', opt.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                d.projectStatus === opt.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-slate-200 text-slate-600 hover:border-primary/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Configurations Available */}
      <section className="mb-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Configurations Available</label>
        <p className="text-xs text-slate-400 mb-3">Multi-select — drives tabs in Step 3 floor plans</p>
        <div className="flex gap-2 flex-wrap">
          {BHK_OPTIONS.map((opt) => {
            const selected = (d.configurations || []).includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleBhk(opt.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                  selected
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-200 text-slate-600 hover:border-primary/40'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
