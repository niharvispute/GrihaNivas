'use client';

import { useState } from 'react';
import { setPropertyHeroImage } from '@/services/propertyService';

export default function PropertyImageModal({ property, onClose, onHeroUpdated }) {
  const [currentHero, setCurrentHero] = useState(property.heroImage || null);
  const [settingId, setSettingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const allImages = [currentHero, ...(property.gallery || [])]
    .filter(Boolean)
    .filter((img, idx, arr) => arr.findIndex((i) => i.publicId === img.publicId) === idx);

  const isHero = (img) => img.publicId === currentHero?.publicId;

  const handleSetHero = async (img) => {
    if (isHero(img) || settingId) return;
    setSettingId(img.publicId);
    setFeedback(null);
    try {
      await setPropertyHeroImage(property._id, { url: img.url, publicId: img.publicId });
      setCurrentHero(img);
      setFeedback({ type: 'success', message: 'Main image updated successfully.' });
      if (onHeroUpdated) onHeroUpdated(img);
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to update image.' });
    } finally {
      setSettingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-black text-slate-900">Manage Images</h2>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5 truncate max-w-sm">{property.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Info + feedback */}
        <div className="px-6 pt-4 space-y-2 shrink-0">
          <p className="text-[11px] text-slate-500 font-bold bg-slate-50 px-3 py-2 rounded-xl">
            Click any image to set it as the <strong>main image</strong> — used on property cards and the detail page header.
          </p>
          {feedback && (
            <p className={`text-[11px] font-bold px-3 py-2 rounded-lg ${
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            }`}>
              {feedback.message}
            </p>
          )}
        </div>

        {/* Image grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {allImages.length === 0 ? (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-200 mb-3 block">image_not_supported</span>
              <p className="text-slate-400 text-sm font-bold">No images uploaded for this property.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allImages.map((img) => {
                const hero = isHero(img);
                const loading = settingId === img.publicId;
                return (
                  <button
                    key={img.publicId}
                    type="button"
                    disabled={hero || loading}
                    onClick={() => handleSetHero(img)}
                    className={`relative rounded-2xl overflow-hidden aspect-video group transition-all ${
                      hero
                        ? 'ring-2 ring-primary cursor-default shadow-lg shadow-primary/20'
                        : 'ring-1 ring-slate-200 hover:ring-primary/40 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />

                    {hero && (
                      <div className="absolute inset-0 bg-primary/10 flex items-end p-2">
                        <span className="inline-flex items-center gap-1 bg-primary text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">
                          <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          Main Image
                        </span>
                      </div>
                    )}

                    {!hero && !loading && (
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 flex items-center justify-center transition-all">
                        <span className="opacity-0 group-hover:opacity-100 bg-white text-slate-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-sm transition-all">
                          Set as Main
                        </span>
                      </div>
                    )}

                    {loading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 shrink-0">
          <p className="text-[10px] text-slate-400 font-bold">
            {allImages.length} image{allImages.length !== 1 ? 's' : ''} total
            {property.gallery?.length ? ` • ${property.gallery.length} in gallery` : ''}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-200 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
