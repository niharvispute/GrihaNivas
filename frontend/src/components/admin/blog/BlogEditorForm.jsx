'use client';

import { useState } from 'react';

const CATEGORIES = ['Market Trends', 'Legal Guides', 'Investment Tips', 'Area Spotlight', 'Interior Design'];

export default function BlogEditorForm({ initialData = {}, onSave, onCancel, isSaving = false }) {
  const [form, setForm] = useState({
    title: initialData.title || '',
    category: initialData.category || CATEGORIES[0],
    keyword: initialData.keyword || '',
    excerpt: initialData.excerpt || '',
    content: initialData.content || '',
  });

  const set = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handlePublish = () => {
    if (!form.title.trim()) {
      alert('Post title is required.');
      return;
    }
    if (!form.content.trim()) {
      alert('Post content cannot be empty.');
      return;
    }
    onSave({ ...initialData, ...form });
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
                    <option key={cat}>{cat}</option>
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
              onClick={() => onSave({ ...initialData, ...form, status: 'draft' })}
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
