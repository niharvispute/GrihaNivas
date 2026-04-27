'use client';

import React, { useState, useEffect } from 'react';
import { listTestimonials, deleteTestimonial, createTestimonial, updateTestimonial, exportTestimonials } from '@/services/testimonialService';
import TestimonialStats from '@/components/admin/testimonials/TestimonialStats';
import TestimonialCard from '@/components/admin/testimonials/TestimonialCard';
import TestimonialForm from '@/components/admin/testimonials/TestimonialForm';
import ExportButton from '@/components/admin/ExportButton';

export default function TestimonialManagerPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name.trim());
      if (data.designation?.trim()) formData.append('designation', data.designation.trim());
      if (data.company?.trim()) formData.append('company', data.company.trim());
      formData.append('rating', String(data.rating));
      formData.append('testimonial', data.testimonial.trim());
      formData.append('isActive', String(data.isActive));
      formData.append('order', String(data.order || 0));
      if (data.imageFile) formData.append('image', data.imageFile);

      if (data.id) {
        await updateTestimonial(data.id, formData);
      } else {
        await createTestimonial(formData);
      }

      setEditingPost(null);
      setIsAddingNew(false);
      await fetchTestimonials();
    } catch {
      alert('Failed to save testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post) => {
    if (!post?.id) return;
    if (!window.confirm(`Delete testimonial from ${post.name}?`)) return;
    setDeletingId(post.id);
    try {
      await deleteTestimonial(post.id);
      setTestimonials((prev) => prev.filter((item) => item.id !== post.id));
      if (editingPost?.id === post.id) {
        setEditingPost(null);
        setIsAddingNew(false);
      }
    } catch {
      alert('Failed to delete testimonial.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header Pipeline */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-10">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 lg:text-7xl">
            Social <span className="text-primary ">Proof</span>
          </h1>
          <p className="text-slate-500 font-bold text-xl mt-6 max-w-xl leading-relaxed">
            Manage the narratives that build trust. Curate user experiences across your organizational ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ExportButton onExport={() => exportTestimonials()} />
          <button
            onClick={handleAddNew}
            className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-4 leading-none"
          >
            <span className="material-symbols-outlined font-black">add</span>
            Add Sentiment
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <TestimonialStats testimonials={testimonials} />

      {/* Editor Context */}
      {(editingPost || isAddingNew) && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <TestimonialForm 
            key={editingPost?.id || 'new'}
            initialData={editingPost || {}} 
            onSave={handleSave}
            saving={saving}
            onCancel={() => { setEditingPost(null); setIsAddingNew(false); }}
          />
        </section>
      )}

      {/* Grid Management Suite */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center text-slate-200">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8"></div>
           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Accessing Testimony Archive...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20 animate-in fade-in duration-1000">
          {testimonials.map((post) => (
            <TestimonialCard 
              key={post.id} 
              testimonial={post} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              deleting={deletingId === post.id}
            />
          ))}
        </div>
      )}

      <footer className="pt-20 pb-12 text-center border-t border-slate-50">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-200">
           © 2026 BRICKS ADMINISTRATIVE CONSOLE • Sentiment Engine v2.1
        </p>
      </footer>
    </div>
  );
}
