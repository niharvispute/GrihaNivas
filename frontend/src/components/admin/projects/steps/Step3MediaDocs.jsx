'use client';

import { useState } from 'react';
import { useProjectForm } from '@/context/ProjectFormContext';
import FileUploadZone from '../FileUploadZone';

const BHK_LABEL = {
  studio: 'Studio', '1BHK': '1 BHK', '2BHK': '2 BHK', '3BHK': '3 BHK',
  '4BHK': '4 BHK', '4+BHK': '4+ BHK', penthouse: 'Penthouse', commercial: 'Commercial',
};

export default function Step3MediaDocs() {
  const { formData, updateFormData } = useProjectForm();
  const d = formData.step3;
  const bhkConfigs = formData.step1?.configurations || [];

  const [activeTab, setActiveTab] = useState(bhkConfigs[0] || null);

  const set = (key, val) => updateFormData('step3', { [key]: val });

  // Hero image
  const heroPreview = d.heroImage
    ? [{ url: d.heroImage instanceof File ? URL.createObjectURL(d.heroImage) : d.heroImage.url }]
    : [];

  // Gallery
  const galleryPreviews = (d.gallery || []).map((f) => ({
    url: f instanceof File ? URL.createObjectURL(f) : f.url,
  }));

  const handleGalleryAdd = (files) => {
    const current = d.gallery || [];
    if (current.length + files.length > 20) {
      alert('Maximum 20 gallery images allowed');
      return;
    }
    set('gallery', [...current, ...Array.from(files)]);
  };

  const removeGallery = (idx) => {
    const updated = [...(d.gallery || [])];
    const removed = updated.splice(idx, 1)[0];
    const patch = { gallery: updated };
    // Track already-uploaded images so the backend can delete them from Cloudinary
    if (removed && !(removed instanceof File) && removed.publicId) {
      patch.removedGalleryPublicIds = [...(d.removedGalleryPublicIds || []), removed.publicId];
    }
    updateFormData('step3', patch);
  };

  // Config floor plans
  const getFloorPlanPreviews = (bhk) => {
    const plans = d.configFloorPlans?.[bhk] || [];
    return plans.map((f) => ({
      url: f instanceof File ? URL.createObjectURL(f) : f.url,
    }));
  };

  const handleFloorPlanAdd = (bhk, files) => {
    const current = d.configFloorPlans?.[bhk] || [];
    set('configFloorPlans', {
      ...d.configFloorPlans,
      [bhk]: [...current, ...Array.from(files)],
    });
  };

  const removeFloorPlan = (bhk, idx) => {
    const updated = [...(d.configFloorPlans?.[bhk] || [])];
    updated.splice(idx, 1);
    set('configFloorPlans', { ...d.configFloorPlans, [bhk]: updated });
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Media &amp; Documents</h2>
        <p className="text-slate-500 mt-1 text-sm">Upload project images, floor plans, and brochure.</p>
      </div>

      {/* Hero Image */}
      <section className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-1">Hero Image</h3>
        <p className="text-xs text-slate-400 mb-3">Recommended: 1600 × 900px · JPG/PNG · Max 5MB</p>
        <FileUploadZone
          accept="image/*"
          maxSizeMB={5}
          label="Upload Hero Image"
          previewUrls={heroPreview}
          onFilesChange={(files) => set('heroImage', files[0])}
          onRemove={() => set('heroImage', null)}
        />
      </section>

      {/* Gallery */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-slate-700">Project Gallery</h3>
          <span className="text-xs text-slate-400">{(d.gallery || []).length} / 20</span>
        </div>
        <p className="text-xs text-slate-400 mb-3">Up to 20 images · JPG/PNG · Max 5MB each</p>

        {/* Gallery grid */}
        {galleryPreviews.length > 0 && (
          <div className="grid grid-cols-5 gap-3 mb-3">
            {galleryPreviews.map((img, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeGallery(i)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <span className="material-symbols-outlined text-white text-xl">delete</span>
                </button>
              </div>
            ))}
            {(d.gallery || []).length < 20 && (
              <FileUploadZone
                accept="image/*"
                maxSizeMB={5}
                multiple
                onFilesChange={handleGalleryAdd}
                label=""
                hint=""
                className="aspect-square"
              />
            )}
          </div>
        )}

        {(d.gallery || []).length === 0 && (
          <FileUploadZone
            accept="image/*"
            maxSizeMB={5}
            multiple
            label="Upload Gallery Images"
            hint="Select multiple images at once"
            onFilesChange={handleGalleryAdd}
          />
        )}
      </section>

      {/* Master Plan + Brochure */}
      <section className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Master Plan &amp; Brochure</h3>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1.5">Master Plan</p>
            <p className="text-xs text-slate-400 mb-2">JPG/PNG · Max 5MB</p>
            <FileUploadZone
              accept="image/*"
              maxSizeMB={5}
              label="Upload Master Plan"
              previewUrls={
                d.masterPlan
                  ? [{ url: d.masterPlan instanceof File ? URL.createObjectURL(d.masterPlan) : d.masterPlan.url }]
                  : []
              }
              onFilesChange={(files) => set('masterPlan', files[0])}
              onRemove={() => set('masterPlan', null)}
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1.5">Project Brochure</p>
            <p className="text-xs text-slate-400 mb-2">PDF · Max 20MB</p>
            <FileUploadZone
              accept="application/pdf,image/*"
              maxSizeMB={20}
              label="Upload Brochure"
              hint="PDF · Max 20MB"
              previewUrls={
                d.brochure
                  ? [{
                      url: d.brochure instanceof File ? URL.createObjectURL(d.brochure) : d.brochure.url,
                      name: d.brochure instanceof File ? d.brochure.name : 'brochure.pdf',
                      isImage: false,
                    }]
                  : []
              }
              onFilesChange={(files) => set('brochure', files[0])}
              onRemove={() => set('brochure', null)}
            />
          </div>
        </div>
      </section>

      {/* Video URL */}
      <section className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-1">Project Video</h3>
        <p className="text-xs text-slate-400 mb-3">Optional YouTube or Vimeo URL</p>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">link</span>
          <input
            type="url"
            value={d.videoUrl}
            onChange={(e) => set('videoUrl', e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </section>

      {/* Configuration Floor Plans */}
      <section>
        <h3 className="text-sm font-bold text-slate-700 mb-1">Configuration Floor Plans</h3>
        <p className="text-xs text-slate-400 mb-4">Upload floor plans per BHK configuration</p>

        {bhkConfigs.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
            <span className="material-symbols-outlined text-3xl block mb-1">architecture</span>
            <p className="text-sm">No configurations added — go back to Step 2 to add BHK configs</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200 mb-5">
              {bhkConfigs.map((bhk) => (
                <button
                  key={bhk}
                  onClick={() => setActiveTab(bhk)}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                    activeTab === bhk
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {BHK_LABEL[bhk] || bhk}
                    {(d.configFloorPlans?.[bhk]?.length || 0) > 0 && (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold leading-none">
                        {d.configFloorPlans[bhk].length}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>

            {/* Active tab content */}
            {activeTab && (
              <div>
                <p className="text-xs text-slate-500 mb-3">
                  Floor plans for <strong>{BHK_LABEL[activeTab] || activeTab}</strong>
                </p>
                <FileUploadZone
                  accept="image/*"
                  maxSizeMB={5}
                  multiple
                  label={`Upload ${BHK_LABEL[activeTab] || activeTab} Floor Plans`}
                  hint="JPG/PNG · Max 5MB each"
                  previewUrls={getFloorPlanPreviews(activeTab)}
                  onFilesChange={(files) => handleFloorPlanAdd(activeTab, files)}
                  onRemove={(idx) => removeFloorPlan(activeTab, idx)}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
