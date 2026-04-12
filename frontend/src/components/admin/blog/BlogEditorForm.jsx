'use client';

import React from 'react';

const BlogEditorForm = ({ initialData = {}, onSave, onCancel }) => {
  return (
    <div className="bg-white rounded-[3rem] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="p-12 border-b border-slate-50 bg-slate-50/10">
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Editor Suite</h3>
        <p className="text-slate-500 font-medium">Compose, optimize, and publish your real estate narrative.</p>
      </div>
      
      <form key={initialData.id || 'new'} className="p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Left Column: Core Identity */}
          <div className="space-y-8">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Post Title</label>
              <input 
                className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300" 
                placeholder="The Future of Mumbai Luxury..." 
                type="text"
                defaultValue={initialData.title}
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Category Segment</label>
              <div className="relative group">
                <select className="w-full px-8 py-5 rounded-[1.25rem] bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none font-bold text-slate-900">
                  <option>Market Trends</option>
                  <option>Legal Guides</option>
                  <option>Investment Tips</option>
                  <option>Area Spotlight</option>
                </select>
                <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-primary transition-colors">expand_more</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Focus SEO Keyword</label>
              <input 
                className="w-full px-8 py-5 rounded-[1.25rem] bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300" 
                placeholder="e.g., south mumbai penthouses" 
                type="text"
                defaultValue={initialData.keyword}
              />
            </div>
          </div>

          {/* Right Column: Search Optimization */}
          <div className="space-y-3 flex flex-col h-full">
            <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Meta Narrative (Short Summary)</label>
            <textarea 
              className="w-full flex-1 min-h-[220px] px-8 py-6 rounded-[2rem] bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none font-medium text-slate-600 leading-relaxed placeholder:text-slate-300" 
              placeholder="Write a specialized summary for search engine snippets..."
              defaultValue={initialData.excerpt}
            ></textarea>
          </div>
        </div>

        {/* Content Canvas */}
        <div className="mb-12">
          <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1 mb-4 block text-center">Manuscript Canvas</label>
          <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-slate-100 transition-all">
            <div className="bg-slate-50/50 p-4 border-b border-slate-50 flex gap-4 flex-wrap justify-center">
              {[
                { icon: 'format_bold', label: 'Bold' },
                { icon: 'format_italic', label: 'Italic' },
                { icon: 'format_underlined', label: 'Underline' },
                { icon: 'format_list_bulleted', label: 'Bullets' },
                { icon: 'image', label: 'Asset' },
                { icon: 'link', label: 'Reference' },
              ].map(btn => (
                <button 
                  key={btn.icon}
                  className="p-3 hover:bg-white hover:text-primary hover:shadow-md rounded-xl transition-all text-slate-400" 
                  type="button"
                  title={btn.label}
                >
                  <span className="material-symbols-outlined text-sm font-black">{btn.icon}</span>
                </button>
              ))}
            </div>
            <textarea 
              className="w-full min-h-[500px] p-12 border-none focus:ring-0 outline-none text-slate-800 leading-[1.8] font-medium text-lg placeholder:text-slate-200" 
              placeholder="Begin your editorial journey here..."
              defaultValue={initialData.content}
            ></textarea>
          </div>
        </div>

        {/* Action Infrastructure */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-50">
          <button 
            type="button"
            onClick={onCancel}
            className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-slate-500 transition-colors"
          >
            Discard Changes
          </button>
          <div className="flex gap-6 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest border-2 border-primary/10 text-primary hover:bg-primary/5 transition-all active:scale-95 leading-none" type="button">
              Save as Draft
            </button>
            <button 
              onClick={() => onSave(initialData)}
              className="flex-1 md:flex-none px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest bg-primary text-white shadow-2xl shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition-all active:scale-95 leading-none" 
              type="button"
            >
              Publish Insight
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogEditorForm;
