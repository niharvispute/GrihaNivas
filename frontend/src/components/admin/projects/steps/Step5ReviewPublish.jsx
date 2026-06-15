'use client';

import { useState } from 'react';
import { useProjectForm } from '@/context/ProjectFormContext';

const BHK_LABEL = {
  studio: 'Studio', '1BHK': '1 BHK', '2BHK': '2 BHK', '3BHK': '3 BHK',
  '4BHK': '4 BHK', '4+BHK': '4+ BHK', penthouse: 'Penthouse', commercial: 'Commercial',
};

function CharCounter({ value = '', max, label }) {
  const len = value.length;
  const pct = len / max;
  const color = pct > 1 ? 'text-red-500' : pct > 0.8 ? 'text-amber-500' : 'text-green-600';
  return (
    <div className="flex items-center justify-between mt-1">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-xs font-semibold ${color}`}>{len}/{max}</span>
    </div>
  );
}

function SectionHeader({ title, onEdit }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      {onEdit && (
        <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
          <span className="material-symbols-outlined text-sm">edit</span>
          Edit
        </button>
      )}
    </div>
  );
}

const LEAD_TOGGLES = [
  { key: 'enablePriceRequest',    label: 'Enable Price Request',     icon: 'payments' },
  { key: 'enableCallback',        label: 'Enable Callback',          icon: 'call' },
  { key: 'enableBrochureDownload',label: 'Enable Brochure Download', icon: 'download' },
  { key: 'whatsappCtaEnabled',    label: 'WhatsApp CTA Enabled',     icon: 'chat' },
  { key: 'enableSiteVisit',       label: 'Enable Site Visit',        icon: 'calendar_month' },
];

export default function Step5ReviewPublish() {
  const { formData, updateFormData, goToStep } = useProjectForm();
  const d1 = formData.step1;
  const d2 = formData.step2;
  const d3 = formData.step3;
  const d4 = formData.step4;
  const d5 = formData.step5;

  const set5 = (key, val) => updateFormData('step5', { [key]: val });
  const setLead = (key, val) => updateFormData('step5', { leadCapture: { ...d5.leadCapture, [key]: val } });

  // Auto-derive slug from project name if not manually set
  const derivedSlug = d5.slug || (d1.projectName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const setSlug = (val) => set5('slug', val);

  // Completion score based on required fields filled
  const checks = [
    !!d1.projectName,
    !!d1.builderId,
    !!d2.area,
    (d2.configurations || []).length > 0,
    !!d3.heroImage,
    !!d4.priceMin,
  ];
  const completionPct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  // Preview title truncation
  const seoTitle = d5.seoTitle || `${d1.projectName || 'Project'}, ${d2.area || 'Mumbai'} | Grihanivas`;
  const seoDesc  = d5.seoDescription || `Premium project in ${d2.area || 'Mumbai'} — ${(d2.configurations || []).map((c) => BHK_LABEL[c] || c).join(', ')} configurations.`;
  const seoSlug  = derivedSlug || 'project-slug';

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Review &amp; Publish</h2>
        <p className="text-slate-500 mt-1 text-sm">Review all details and publish your project.</p>
      </div>

      {/* Top bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Completion */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">Completion</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
            </div>
            <span className="text-sm font-bold text-slate-700">{completionPct}%</span>
          </div>
        </div>

        {/* Listing status */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">Listing Status</p>
          <select
            value={d5.listingStatus}
            onChange={(e) => set5('listingStatus', e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="active">Published</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* RERA verification */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">RERA Verification</p>
          <div className="flex items-center gap-2">
            {d5.reraVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                <span className="material-symbols-outlined text-sm">verified</span>
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">
                <span className="material-symbols-outlined text-sm">pending</span>
                Pending
              </span>
            )}
            <span className="text-xs text-slate-400">(wired in Phase 3)</span>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <section className="mb-6 bg-white border border-slate-200 rounded-xl p-5">
        <SectionHeader title="Project Overview" onEdit={() => goToStep(1)} />
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {[
            ['Project Name', d1.projectName || '—'],
            ['Builder',      d1.builderName || d1.builderId || '—'],
            ['RERA Number',  d1.reraNumber || '—'],
            ['Location',     d2.area ? `${d2.area}, ${d2.city}` : '—'],
            ['Project Type', d1.projectType || '—'],
            ['Status',       d1.projectStatus?.replace(/_/g, ' ') || '—'],
          ].map(([label, val]) => (
            <div key={label} className="flex gap-2">
              <span className="text-slate-500 w-28 flex-shrink-0">{label}:</span>
              <span className="font-semibold text-slate-800 capitalize">{val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Configuration Summary */}
      {(d2.configurations || []).length > 0 && (
        <section className="mb-6 bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader title="Configuration Summary" onEdit={() => goToStep(2)} />
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['BHK', 'Carpet Area', 'Price Range', 'Bathrooms', 'Parking', 'Units'].map((h) => (
                  <th key={h} className="text-left py-2 text-xs font-semibold text-slate-500 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d2.configurations.map((cfg) => {
                const pricing = d4.configPricing?.[cfg._tempId] || {};
                return (
                  <tr key={cfg._tempId} className="border-b border-slate-50">
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded">
                        {BHK_LABEL[cfg.bhkType] || cfg.bhkType}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{cfg.carpetAreaMin}–{cfg.carpetAreaMax || '?'} sq.ft</td>
                    <td className="py-3 pr-4 text-slate-600">
                      {pricing.priceMin ? `₹${(pricing.priceMin/10000000).toFixed(2)}Cr – ₹${(pricing.priceMax/10000000).toFixed(2)}Cr` : '—'}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{cfg.bathrooms || '—'}</td>
                    <td className="py-3 pr-4 text-slate-600">{cfg.parking || '—'}</td>
                    <td className="py-3 pr-4 text-slate-600">{cfg.totalUnits || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {/* Inventory Summary */}
      <section className="mb-6 bg-white border border-slate-200 rounded-xl p-5">
        <SectionHeader title="Inventory Summary" onEdit={() => goToStep(4)} />
        <div className="grid grid-cols-5 gap-3">
          {(() => {
            const units = d4.units || [];
            const countBy = (s) => units.filter((u) => u.status === s).length;
            return [
              { label: 'Total',     value: units.length || d2.totalUnits || 0, icon: 'home',          color: 'text-primary',   bg: 'bg-primary/5' },
              { label: 'Available', value: countBy('available'),               icon: 'check_circle',  color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Hold',      value: countBy('hold'),                    icon: 'pause_circle',  color: 'text-orange-600',bg: 'bg-orange-50' },
              { label: 'Booked',    value: countBy('booked'),                  icon: 'calendar_month',color: 'text-blue-600',  bg: 'bg-blue-50' },
              { label: 'Sold',      value: countBy('sold'),                    icon: 'sell',          color: 'text-slate-500', bg: 'bg-slate-50' },
            ];
          })().map(({ label, value, icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
              <span className={`material-symbols-outlined ${color} text-xl block mb-1`}>{icon}</span>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lead Capture Settings */}
      <section className="mb-6 bg-white border border-slate-200 rounded-xl p-5">
        <SectionHeader title="Lead Capture Settings" />
        <div className="space-y-3">
          {LEAD_TOGGLES.map(({ key, label, icon }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 text-lg">{icon}</span>
                <span className="text-sm text-slate-700">{label}</span>
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-semibold">Wired in Phase 3</span>
              </div>
              <button
                onClick={() => setLead(key, !d5.leadCapture?.[key])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  d5.leadCapture?.[key] ? 'bg-primary' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    d5.leadCapture?.[key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SEO Section */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <SectionHeader title="SEO Settings" />

        {/* Google preview */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5">
          <p className="text-xs text-slate-400 mb-2">Google Search Preview</p>
          <p className="text-xs text-green-700 mb-1">grihanivas.in › projects › {seoSlug}</p>
          <p className="text-base text-blue-700 hover:underline cursor-pointer font-medium leading-snug mb-1">
            {seoTitle.length > 60 ? seoTitle.slice(0, 60) + '…' : seoTitle}
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            {seoDesc.length > 155 ? seoDesc.slice(0, 155) + '…' : seoDesc}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">SEO Title</label>
            <input
              type="text"
              value={d5.seoTitle}
              onChange={(e) => set5('seoTitle', e.target.value)}
              placeholder={seoTitle}
              maxLength={80}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <CharCounter value={d5.seoTitle} max={70} label="Recommended max 70 chars" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">SEO Description</label>
            <textarea
              value={d5.seoDescription}
              onChange={(e) => set5('seoDescription', e.target.value)}
              placeholder={seoDesc}
              rows={3}
              maxLength={180}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
            <CharCounter value={d5.seoDescription} max={160} label="Recommended max 160 chars" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">URL Slug</label>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
              <span className="px-3.5 py-2.5 bg-slate-50 text-xs text-slate-400 border-r border-slate-200 whitespace-nowrap">
                grihanivas.in/projects/
              </span>
              <input
                type="text"
                value={derivedSlug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 px-3 py-2.5 text-sm text-slate-700 focus:outline-none"
              />
            </div>
            <CharCounter value={derivedSlug} max={75} label="Max 75 chars" />
          </div>
        </div>
      </section>
    </div>
  );
}
