'use client';

import React from 'react';

const TestimonialForm = ({ initialData = {}, onSave, onCancel }) => {
  return (
    <section className="bg-white rounded-[3.5rem] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.12)] border border-slate-50 overflow-hidden transition-all duration-700 animate-in fade-in slide-in-from-bottom-6">
      <div className="p-12 border-b border-slate-50 bg-slate-50/20">
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Editor Suite</h3>
        <p className="text-slate-500 font-medium">Capture user sentiment and curate social proof with precision.</p>
      </div>
      
      <form key={initialData.id || 'new'} className="p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Form Fields: Left Side */}
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Full Name</label>
                <input 
                  className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300" 
                  placeholder="e.g. Vikram Oberoi" 
                  type="text"
                  defaultValue={initialData.name}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Satisfaction Rating</label>
                <div className="relative group">
                  <select 
                    className="w-full px-8 py-5 rounded-[1.25rem] bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none font-bold text-slate-900"
                    defaultValue={initialData.rating || 5}
                  >
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Great)</option>
                    <option value="3">3 Stars (Average)</option>
                    <option value="2">2 Stars (Poor)</option>
                    <option value="1">1 Star (Dissatisfied)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-primary transition-colors">expand_more</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Narrative Content</label>
              <textarea 
                className="w-full px-8 py-6 rounded-[2.5rem] bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none font-medium text-slate-700 leading-relaxed text-lg min-h-[220px] placeholder:text-slate-200" 
                placeholder="Share the client's journey and experience with Bricks..." 
                defaultValue={initialData.content}
              ></textarea>
            </div>
          </div>

          {/* Asset Pipeline: Right Side */}
          <div className="lg:col-span-4 flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1 mb-4">Identity Visualization</label>
            <div className="flex-1 border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50 flex flex-col items-center justify-center p-12 text-center group hover:bg-slate-50 hover:border-primary/20 transition-all cursor-pointer">
               <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl text-primary mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <span className="material-symbols-outlined text-4xl">upload_file</span>
               </div>
               <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2 font-headline">Import Avatar</p>
               <p className="text-xs font-medium text-slate-400 leading-relaxed">SVG, PNG, or JPG formats <br/>(Optimized for 800px max)</p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="mt-16 pt-10 border-t border-slate-50 flex items-center justify-between gap-6">
           <button 
              type="button"
              onClick={onCancel}
              className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-slate-500 transition-colors"
            >
              Discard Submission
           </button>
           <div className="flex gap-6 w-full md:w-auto">
              <button 
                type="button" 
                onClick={() => onSave(initialData)}
                className="flex-1 md:flex-none px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest bg-primary text-white shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 leading-none"
              >
                Sync Testimonial
              </button>
           </div>
        </div>
      </form>
    </section>
  );
};

export default TestimonialForm;
