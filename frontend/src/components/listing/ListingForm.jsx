'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/api/errors';
import { toIndianPhoneE164 } from '@/lib/validation/phone';
import { createLead } from '@/services/leadService';

const DRAFT_KEY = 'lead_draft:list_property';

export default function ListingForm() {
  const { user, openModal } = useAuth();
  const [propertyType, setPropertyType] = useState('Apartment');
  const [form, setForm] = useState({
    ownerName: '',
    phone: '',
    email: '',
    location: '',
    bhk: '2',
    expectedPrice: '',
    description: '',
  });
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [queuedSubmit, setQueuedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const propertyTypes = ['Apartment', 'Penthouse', 'Villa'];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (parsed.form && typeof parsed.form === 'object') {
          setForm((prev) => ({ ...prev, ...parsed.form }));
        }
        if (typeof parsed.propertyType === 'string' && parsed.propertyType) {
          setPropertyType(parsed.propertyType);
        }
      }
    } catch (_error) {}
    setHasLoadedDraft(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !hasLoadedDraft) return;
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ form, propertyType }));
  }, [form, propertyType, hasLoadedDraft]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const parseAmount = (value) => {
    const numeric = Number(String(value || '').replace(/[^\d]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const submitLead = useCallback(async () => {
    const phone = toIndianPhoneE164(form.phone);

    if (!phone) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid Indian mobile number in +91 format.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const expectedPrice = parseAmount(form.expectedPrice);
      const summaryParts = [
        `Property type: ${propertyType}`,
        `BHK: ${form.bhk}`,
        form.description ? `Description: ${form.description.trim()}` : '',
      ].filter(Boolean);

      await createLead({
        name: form.ownerName.trim(),
        phone,
        email: form.email.trim() || undefined,
        leadType: 'list_property',
        preferredLocations: form.location.trim() ? [form.location.trim()] : undefined,
        budgetMax: expectedPrice || undefined,
        message: summaryParts.join(' | '),
      });

      setFeedback({
        type: 'success',
        message: 'Property submission received. Our team will contact you soon.',
      });
      setForm({
        ownerName: '',
        phone: '',
        email: '',
        location: '',
        bhk: '2',
        expectedPrice: '',
        description: '',
      });
      setPropertyType('Apartment');
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(DRAFT_KEY);
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to submit property right now.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, propertyType]);

  useEffect(() => {
    if (!user || !queuedSubmit || isSubmitting) return;
    setQueuedSubmit(false);
    void submitLead();
  }, [user, queuedSubmit, isSubmitting, submitLead]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      setQueuedSubmit(true);
      setFeedback({ type: 'error', message: 'Please login to submit your property details.' });
      openModal('login');
      return;
    }

    await submitLead();
  };

  return (
    <section className="py-24 bg-slate-50" id="submit-form">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 md:p-16 shadow-2xl shadow-primary/5 border border-slate-100">
          <div className="mb-12">
            <h2 className="font-heading text-3xl font-extrabold tracking-tight mb-2 text-slate-900">Submit Property</h2>
            <p className="text-slate-500 font-bold">Confidential and secure property assessment.</p>
          </div>
          
          <form className="space-y-10" onSubmit={handleSubmit}>
            {/* Owner Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Owner Name</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-slate-300 font-medium text-slate-700" 
                  placeholder="Full legal name" 
                  type="text"
                  value={form.ownerName}
                  onChange={handleChange('ownerName')}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Phone Number</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-slate-300 font-medium text-slate-700" 
                  placeholder="+91 00000 00000" 
                  type="tel"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Email Address</label>
              <input 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-slate-300 font-medium text-slate-700" 
                placeholder="email@example.com" 
                type="email"
                value={form.email}
                onChange={handleChange('email')}
              />
            </div>

            {/* Property Type Tabs */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Property Type</label>
              <div className="flex flex-wrap gap-3">
                {propertyTypes.map((type) => (
                  <button 
                    key={type}
                    onClick={() => setPropertyType(type)}
                    className={`px-6 py-2 rounded-full font-heading font-bold text-sm transition-all ${
                      propertyType === type 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`} 
                    type="button"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Location</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">location_on</span>
                  <input 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 pl-12 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-slate-300 font-medium text-slate-700" 
                    placeholder="e.g. Worli, South Mumbai" 
                    type="text"
                    value={form.location}
                    onChange={handleChange('location')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">BHK</label>
                <select
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium text-slate-700"
                  value={form.bhk}
                  onChange={handleChange('bhk')}
                >
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Expected Price (₹)</label>
              <input 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-slate-300 font-medium text-slate-700" 
                placeholder="e.g. 5,00,00,000" 
                type="text"
                value={form.expectedPrice}
                onChange={handleChange('expectedPrice')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Description</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-slate-300 font-medium text-slate-700" 
                placeholder="Tell us more about the view, amenities, and floor level..." 
                rows="4"
                value={form.description}
                onChange={handleChange('description')}
              ></textarea>
            </div>

            {/* Upload Area */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Property Images</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center group hover:border-primary/50 transition-all cursor-pointer bg-slate-50 hover:bg-white">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-4 group-hover:text-primary transition-all">cloud_upload</span>
                <p className="font-heading font-bold text-slate-700">Drag and drop images</p>
                <p className="text-sm text-slate-400 mt-1 font-bold">PNG, JPG up to 10MB each (Min. 5 images recommended)</p>
                <button className="mt-6 text-primary font-heading font-bold text-sm underline underline-offset-4 hover:text-primary/80" type="button">Browse Files</button>
              </div>
            </div>

            <button disabled={isSubmitting} className="w-full bg-primary text-white p-6 rounded-full font-heading font-bold text-xl shadow-xl shadow-primary/20 hover:scale-[0.98] transition-all">
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </button>

            {feedback.message && (
              <p className={`text-sm font-bold ${feedback.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                {feedback.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
