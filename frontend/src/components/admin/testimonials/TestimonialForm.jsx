'use client';

import React, { useState } from 'react';

const TestimonialForm = ({ initialData = {}, onSave, onCancel, saving = false }) => {
  const [name, setName] = useState(initialData.name || '');
  const [designation, setDesignation] = useState(initialData.designation || '');
  const [company, setCompany] = useState(initialData.company || '');
  const [rating, setRating] = useState(Number(initialData.rating || 5));
  const [testimonial, setTestimonial] = useState(initialData.content || initialData.testimonial || '');
  const [order, setOrder] = useState(Number(initialData.order || 0));
  const [isActive, setIsActive] = useState(initialData.isActive !== false);
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: initialData.id,
      name,
      designation,
      company,
      rating,
      testimonial,
      order,
      isActive,
      imageFile,
    });
  };

  return (
    <section className="bg-white rounded-2xl shadow-[0_48px_96px_-24px_rgba(0,0,0,0.12)] border border-slate-50 overflow-hidden transition-all duration-700 animate-in fade-in slide-in-from-bottom-6">
      <div className="p-12 border-b border-slate-50 bg-slate-50/20">
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Editor Suite</h3>
        <p className="text-slate-500 font-bold">Capture user sentiment and curate social proof with precision.</p>
      </div>
      
      <form key={initialData.id || 'new'} className="p-12" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Form Fields: Left Side */}
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Full Name</label>
                <input 
                  className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300" 
                  placeholder="e.g. Client Name" 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Satisfaction Rating</label>
                <div className="relative group">
                  <select 
                    className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none font-bold text-slate-900"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Designation</label>
                <input
                  className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300"
                  placeholder="e.g. Homebuyer"
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Company</label>
                <input
                  className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300"
                  placeholder="e.g. Acme Corp"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Narrative Content</label>
              <textarea 
                className="w-full px-8 py-6 rounded-2xl bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none font-medium text-slate-700 leading-relaxed text-lg min-h-55 placeholder:text-slate-200" 
                placeholder="Share the client's journey and experience with Bricks..." 
                value={testimonial}
                onChange={(e) => setTestimonial(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Display Order</label>
                <input
                  className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-slate-900"
                  type="number"
                  min="0"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value || 0))}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1">Visibility</label>
                <label className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none shadow-inner flex items-center gap-3 font-bold text-slate-900">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Active (show on website)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Asset Pipeline: Right Side */}
          <div className="lg:col-span-4 flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 px-1 mb-4">Identity Visualization</label>
            <label className="flex-1 border-4 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center p-12 text-center group hover:bg-slate-50 hover:border-primary/20 transition-all cursor-pointer">
               <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl text-primary mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <span className="material-symbols-outlined text-4xl">upload_file</span>
               </div>
               <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2 font-headline">Import Avatar</p>
               <p className="text-xs font-bold text-slate-400 leading-relaxed">SVG, PNG, or JPG formats <br/>(Optimized for 800px max)</p>
              {imageFile && <p className="text-[10px] font-bold text-primary mt-4 break-all">{imageFile.name}</p>}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > 2 * 1024 * 1024) {
                    alert('Image must be smaller than 2 MB.');
                    e.target.value = '';
                    return;
                  }
                  setImageFile(file);
                }}
              />
            </label>
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
                type="submit"
                disabled={saving}
                className="flex-1 md:flex-none px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest bg-primary text-white shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 leading-none disabled:opacity-60 disabled:hover:scale-100"
              >
                {saving ? 'Saving...' : 'Sync Testimonial'}
              </button>
           </div>
        </div>
      </form>
    </section>
  );
};

export default TestimonialForm;
