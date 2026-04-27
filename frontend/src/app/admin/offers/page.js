'use client';

import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/api/errors';
import { useToast } from '@/context/ToastContext';
import { apiFetch } from '@/lib/api';
import { authedApiFetch } from '@/lib/api/authedRequest';

const EMPTY_CARD = { title: '', desc: '', buttonUrl: '' };

const EMPTY_OFFER = {
  headline: '',
  cards: [{ ...EMPTY_CARD }],
  showOnFrontend: false,
};

export default function AdminOffersPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [offer, setOffer] = useState(null);
  const [form, setForm] = useState(EMPTY_OFFER);

  const fetchOffer = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/offers');
      const data = res.data;
      if (data) {
        setOffer(data);
        setForm({
          headline: data.headline || '',
          cards: data.cards?.length ? data.cards : [{ ...EMPTY_CARD }],
          showOnFrontend: data.showOnFrontend ?? false,
        });
      } else {
        setOffer(null);
        setForm(EMPTY_OFFER);
      }
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to load offer'), 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchOffer(); }, [fetchOffer]);

  const patchForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const patchCard = (index, key, value) =>
    setForm((prev) => {
      const cards = [...prev.cards];
      cards[index] = { ...cards[index], [key]: value };
      return { ...prev, cards };
    });

  const addCard = () =>
    setForm((prev) => ({ ...prev, cards: [...prev.cards, { ...EMPTY_CARD }] }));

  const removeCard = (index) =>
    setForm((prev) => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index),
    }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.headline.trim()) {
      addToast('Offer headline is required', 'error');
      return;
    }
    const validCards = form.cards.filter((c) => c.title.trim() && c.desc.trim());
    if (!validCards.length) {
      addToast('At least one complete card (title + description) is required', 'error');
      return;
    }
    setSaving(true);
    try {
      await authedApiFetch('/api/offers', {
        method: 'PUT',
        body: {
          headline: form.headline.trim(),
          cards: form.cards.map((c) => ({
            title: c.title.trim(),
            desc: c.desc.trim(),
            buttonUrl: c.buttonUrl.trim(),
          })),
          showOnFrontend: form.showOnFrontend,
        },
      });
      addToast('Offer saved successfully', 'success');
      fetchOffer();
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to save offer'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this offer? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await authedApiFetch('/api/offers', { method: 'DELETE' });
      addToast('Offer deleted', 'success');
      setOffer(null);
      setForm(EMPTY_OFFER);
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to delete offer'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Offers</h1>
          <p className="text-slate-500 font-bold mt-2">
            Create a festive or promotional offer that appears as a floating icon on the site.
          </p>
        </div>
        {offer && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            {deleting ? 'Deleting...' : 'Delete Offer'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-slate-100" />)}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">

          {/* Headline + Toggle */}
          <section className="rounded-2xl border border-slate-100 bg-white p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                  Offer Headline
                </label>
                <input
                  type="text"
                  value={form.headline}
                  onChange={(e) => patchForm('headline', e.target.value)}
                  placeholder="e.g. Gudipadwa Special Offers"
                  maxLength={200}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base font-black text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {/* Show on Frontend Toggle */}
              <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Show on Frontend</span>
                <button
                  type="button"
                  onClick={() => patchForm('showOnFrontend', !form.showOnFrontend)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
                    form.showOnFrontend ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      form.showOnFrontend ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-[10px] font-black uppercase tracking-widest ${form.showOnFrontend ? 'text-primary' : 'text-slate-400'}`}>
                  {form.showOnFrontend ? 'Visible' : 'Hidden'}
                </span>
              </div>
            </div>
          </section>

          {/* Offer Cards */}
          <section className="rounded-2xl border border-slate-100 bg-white p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">Offer Cards</h2>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  Each card shows a title, description, and an optional button in the popup.
                </p>
              </div>
              <button
                type="button"
                onClick={addCard}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Add Card
              </button>
            </div>

            <div className="space-y-4">
              {form.cards.map((card, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-6 space-y-4 relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Card {index + 1}
                    </span>
                    {form.cards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCard(index)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        aria-label="Remove card"
                      >
                        <span className="material-symbols-outlined text-lg">remove_circle</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                        Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => patchCard(index, 'title', e.target.value)}
                        placeholder="e.g. 0% Processing Fee"
                        maxLength={100}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                        Button URL <span className="text-slate-300">(optional)</span>
                      </label>
                      <input
                        type="url"
                        value={card.buttonUrl}
                        onChange={(e) => patchCard(index, 'buttonUrl', e.target.value)}
                        placeholder="https://... or /page-path"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={card.desc}
                      onChange={(e) => patchCard(index, 'desc', e.target.value)}
                      placeholder="Describe this offer in detail..."
                      maxLength={500}
                      rows={3}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={fetchOffer}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
            >
              Reload
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : offer ? 'Update Offer' : 'Create Offer'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
