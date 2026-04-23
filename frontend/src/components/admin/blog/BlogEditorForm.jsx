'use client';

import { useState } from 'react';
import Image from 'next/image';

const CATEGORIES = [
  { value: 'market_trends', label: 'Market Trends' },
  { value: 'buying_guide', label: 'Buying Guide' },
  { value: 'legal', label: 'Legal' },
  { value: 'investment', label: 'Investment' },
  { value: 'lifestyle', label: 'Lifestyle' },
];

const CATEGORY_NORMALIZE_MAP = {
  market_trends: 'market_trends',
  'market trends': 'market_trends',
  'market-insights': 'market_trends',
  buying_guide: 'buying_guide',
  'buying guide': 'buying_guide',
  'buying-guide': 'buying_guide',
  legal: 'legal',
  investment: 'investment',
  lifestyle: 'lifestyle',
};

const normalizeCategory = (value) => {
  if (!value || typeof value !== 'string') return 'market_trends';
  const key = value.trim().toLowerCase();
  return CATEGORY_NORMALIZE_MAP[key] || 'market_trends';
};

export default function BlogEditorForm({ initialData = {}, onSave, onCancel, isSaving = false }) {
  const initialCategory = normalizeCategory(initialData?.raw?.category || initialData.category);
  const [form, setForm] = useState({
    title: initialData.title || '',
    category: initialCategory,
    keyword: initialData.keyword || initialData?.raw?.keywords?.[0] || '',
    excerpt: initialData.excerpt || initialData?.raw?.seoDescription || '',
    content: initialData.content || '',
    featuredImageFile: null,
  });

  const set = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const buildPayload = (isPublished) => ({
    title: form.title.trim(),
    category: normalizeCategory(form.category),
    content: form.content,
    seoDescription: form.excerpt?.trim() || undefined,
    isPublished,
    featuredImageFile: form.featuredImageFile || undefined,
  });

  const handlePublish = () => {
    if (form.title.trim().length < 5) {
      alert('Post title is required.');
      return;
    }
    if (form.content.trim().length < 100) {
      alert('Published post content must be at least 100 characters.');
      return;
    }
    onSave(buildPayload(true));
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="p-12 border-b border-slate-50 bg-slate-50/10">
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Editor Suite</h3>
        <p className="text-slate-500 font-medium">Compose, optimize, and publish your real estate narrative.</p>
      </div>

      <div className="p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">
                Post Title <span className="text-red-400">*</span>
              </label>
              <input
                className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300"
                placeholder="The Future of Mumbai Luxury..."
                type="text"
                value={form.title}
                onChange={set('title')}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Category Segment</label>
              <div className="relative group">
                <select
                  className="w-full px-8 py-5 rounded-[1.25rem] bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none font-bold text-slate-900"
                  value={form.category}
                  onChange={set('category')}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-primary transition-colors">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Focus SEO Keyword</label>
              <input
                className="w-full px-8 py-5 rounded-[1.25rem] bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300"
                placeholder="e.g., south mumbai penthouses"
                type="text"
                value={form.keyword}
                onChange={set('keyword')}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">
                Banner Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  if (file && file.size > 2 * 1024 * 1024) {
                    alert('Image must be smaller than 2 MB.');
                    event.target.value = '';
                    return;
                  }
                  setForm((prev) => ({ ...prev, featuredImageFile: file }));
                }}
                className="w-full px-6 py-4 rounded-[1.25rem] bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-primary hover:file:bg-primary/20"
              />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">
                This image is used as the blog banner and card thumbnail.
              </p>
              {!form.featuredImageFile && initialData?.image && (
                <div className="relative w-full max-w-sm h-36">
                  <Image
                    src={initialData.image}
                    alt={form.title || 'Current blog banner'}
                    fill
                    sizes="384px"
                    className="object-cover rounded-2xl border border-slate-100 shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3 flex flex-col h-full">
            <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">
              Meta Narrative (Short Summary)
            </label>
            <textarea
              className="w-full flex-1 min-h-[220px] px-8 py-6 rounded-[2rem] bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none font-medium text-slate-600 leading-relaxed placeholder:text-slate-300"
              placeholder="Write a short summary for search engine snippets..."
              value={form.excerpt}
              onChange={set('excerpt')}
            />
          </div>
        </div>

        {/* Content Canvas */}
        <div className="mb-12">
          <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1 mb-4 block text-center">
            Manuscript Canvas <span className="text-red-400">*</span>
          </label>
          <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-slate-100">
            <textarea
              className="w-full min-h-[500px] p-12 border-none focus:ring-0 outline-none text-slate-800 leading-[1.8] font-medium text-lg placeholder:text-slate-200 resize-y"
              placeholder="Begin your editorial journey here..."
              value={form.content}
              onChange={set('content')}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-50">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-slate-500 transition-colors"
          >
            Discard Changes
          </button>
          <div className="flex gap-6 w-full md:w-auto">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onSave(buildPayload(false))}
              className="flex-1 md:flex-none px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest border-2 border-primary/10 text-primary hover:bg-primary/5 transition-all active:scale-95 leading-none disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handlePublish}
              className="flex-1 md:flex-none px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest bg-primary text-white shadow-2xl shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition-all active:scale-95 leading-none disabled:opacity-50"
            >
              {isSaving ? 'Publishing…' : 'Publish Insight'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
