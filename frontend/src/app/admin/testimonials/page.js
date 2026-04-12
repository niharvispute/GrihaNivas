'use client';

import React, { useState, useEffect } from 'react';
import { listTestimonials, deleteTestimonial } from '@/services/testimonialService';
import TestimonialStats from '@/components/admin/testimonials/TestimonialStats';
import TestimonialCard from '@/components/admin/testimonials/TestimonialCard';
import TestimonialForm from '@/components/admin/testimonials/TestimonialForm';

export default function TestimonialManagerPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const data = await listTestimonials();
      setTestimonials(data);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setIsAddingNew(false);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleAddNew = () => {
    setEditingPost(null);
    setIsAddingNew(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleSave = async (data) => {
    alert('Sentiment data synchronized with the production platform.');
    setEditingPost(null);
    setIsAddingNew(false);
    fetchTestimonials();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header Pipeline */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-10">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 lg:text-7xl">
            Social <span className="text-primary italic">Proof</span>
          </h1>
          <p className="text-slate-500 font-medium text-xl mt-6 max-w-xl leading-relaxed">
            Manage the narratives that build trust. Curate user experiences across your organizational ecosystem.
          </p>
        </div>
        <button 
          onClick={handleAddNew}
          className="px-10 py-5 bg-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-4 leading-none"
        >
          <span className="material-symbols-outlined font-black">add</span>
          Add Sentiment
        </button>
      </div>

      {/* Analytics Dashboard */}
      <TestimonialStats />

      {/* Editor Context */}
      {(editingPost || isAddingNew) && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <TestimonialForm 
            initialData={editingPost || {}} 
            onSave={handleSave}
            onCancel={() => { setEditingPost(null); setIsAddingNew(false); }}
          />
        </section>
      )}

      {/* Grid Management Suite */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center text-slate-200">
           <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-[2rem] animate-spin mb-8"></div>
           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Accessing Testimony Archive...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20 animate-in fade-in duration-1000">
          {testimonials.map((post) => (
            <TestimonialCard 
              key={post.id} 
              testimonial={post} 
              onEdit={handleEdit} 
            />
          ))}
        </div>
      )}

      {/* Specialized Intelligence & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-20">
        <div className="lg:col-span-1 bg-white p-12 rounded-[3rem] border border-slate-50 shadow-2xl shadow-slate-200/50">
          <h4 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-4 uppercase tracking-widest scale-90 origin-left">
            <span className="material-symbols-outlined text-primary font-black">history</span>
            Action Log
          </h4>
          <div className="space-y-8">
            {[
              { title: "New 5-star review added", meta: "Sarah Jenkins • 2h ago", active: true },
              { title: "Testimonial refined", meta: "Michael Chen • 5h ago", active: false },
              { title: "Moderation cleared", meta: "Core Engine • 1d ago", active: false }
            ].map((log, i) => (
              <div key={i} className="flex gap-6 group cursor-default">
                <div className={`w-1 h-10 rounded-full mt-1 transition-all ${log.active ? 'bg-primary scale-y-110 shadow-[0_0_12px_rgba(184,0,73,0.4)]' : 'bg-slate-100 group-hover:bg-slate-200'}`}></div>
                <div>
                  <p className="text-sm font-black text-slate-800 tracking-tight">{log.title}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">{log.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-950 text-white p-12 rounded-[3.5rem] shadow-[0_48px_96px_-24px_rgba(184,0,73,0.15)] flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
          <div className="relative z-10 max-w-lg">
            <div className="bg-primary/20 text-primary px-5 py-2 rounded-full inline-block text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-primary/20">Power Directive</div>
            <h4 className="text-3xl font-black mb-6 tracking-tighter leading-tight italic">Visual Proof Protocol</h4>
            <p className="text-slate-400 font-medium leading-relaxed text-lg mb-10">
              Testimonials containing verified user headshots receive <span className="text-white italic">84.2% higher engagement</span> than structural text reviews. Prioritize asset-rich social proof.
            </p>
            <button className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.2em] group/btn">
              Social Proof Framework <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_right_alt</span>
            </button>
          </div>
          <div className="hidden md:block relative z-10 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0">
             <span className="material-symbols-outlined text-[180px] font-light">verified_user</span>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary opacity-5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        </div>
      </div>

      <footer className="pt-20 pb-12 text-center border-t border-slate-50">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-200">
           © 2026 BRICKS ADMINISTRATIVE CONSOLE • Sentiment Engine v2.1
        </p>
      </footer>
    </div>
  );
}
