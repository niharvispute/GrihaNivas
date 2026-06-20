'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toIndianPhoneE164 } from '@/lib/validation/phone';
import {
  validateOwnerName,
  validatePhone,
  validateEmail,
  validateNumericOptional,
  collectErrors,
} from '@/lib/validation/formValidation';
import { createLead } from '@/services/leadService';
import { getErrorMessage } from '@/lib/api/errors';

const PROJECT_TYPES = ['Residential', 'Commercial', 'Mixed Use', 'Plotting'];
const PROJECT_TYPE_VALUE = {
  Residential: 'residential',
  Commercial: 'commercial',
  'Mixed Use': 'mixed',
  Plotting: 'plotting',
};

export default function ProjectApplicationForm({ onBack }) {
  const router = useRouter();
  const [form, setForm] = useState({
    ownerName: '',
    phone: '',
    email: '',
    projectName: '',
    builderName: '',
    city: 'Mumbai',
    locality: '',
    approxUnits: '',
    projectType: 'Residential',
    reraNumber: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: null }));
  };

  const handleToggle = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, hasError } = collectErrors({
      ownerName: validateOwnerName(form.ownerName),
      phone: validatePhone(form.phone),
      email: validateEmail(form.email, { required: false }),
      approxUnits: validateNumericOptional(form.approxUnits, 'Approx. units'),
    });
    if (hasError) {
      setErrors(validationErrors);
      return;
    }

    const phone = toIndianPhoneE164(form.phone);
    if (!phone) {
      setErrors((er) => ({ ...er, phone: 'Please enter a valid Indian mobile number.' }));
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);
    try {
      await createLead({
        name: form.ownerName.trim(),
        phone,
        email: form.email.trim() || undefined,
        leadType: 'project_application',
        message: form.message.trim() || undefined,
        projectApplication: {
          projectName: form.projectName.trim() || undefined,
          builderName: form.builderName.trim() || undefined,
          city: form.city.trim() || undefined,
          locality: form.locality.trim() || undefined,
          approxUnits: form.approxUnits ? Number(form.approxUnits) : undefined,
          projectType: PROJECT_TYPE_VALUE[form.projectType] || undefined,
          reraNumber: form.reraNumber.trim() || undefined,
        },
      });
      setIsSubmitted(true);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="bg-white w-full max-w-lg rounded-2xl p-8 md:p-12 text-center shadow-2xl border border-slate-100">
          <div className="mb-8 relative inline-block">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4">Application Received!</h2>
          <p className="text-slate-500 font-bold mb-10 leading-relaxed text-sm md:text-base">
            Thanks for telling us about your project. Our team will personally contact you within 24 hours to take this forward.
          </p>
          <button onClick={() => router.push('/')} className="w-full py-5 bg-primary text-white rounded-full font-black text-sm uppercase tracking-widest shadow-2xl">
            Continue Exploring
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white md:bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto w-full px-6 md:px-12 py-10 md:py-16">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-primary text-xs font-black uppercase tracking-widest transition-colors mb-8 group"
        >
          <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back
        </button>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-2 md:mb-4">List a Full Project</h1>
          <p className="text-slate-500 text-sm md:text-base font-bold">
            Building a tower, society, or multi-unit development? Share a few basic details and our team will personally
            contact you to set up the complete project listing.
          </p>
        </div>

        {submitError && (
          <div className="mb-8 p-4 rounded-2xl border bg-rose-50 border-rose-100 text-rose-600 flex items-start gap-3">
            <span className="material-symbols-outlined text-xl mt-0.5">error</span>
            <p className="text-xs font-bold leading-relaxed">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="space-y-3 md:space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Your Name</label>
              <input
                className={`w-full bg-white border-2 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 outline-none transition-all ${errors.ownerName ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-slate-50 focus:ring-primary/5 focus:border-primary'}`}
                placeholder="Full Name"
                value={form.ownerName}
                onChange={handleChange('ownerName')}
              />
              {errors.ownerName && <p className="text-xs font-bold text-red-600">{errors.ownerName}</p>}
            </div>
            <div className="space-y-3 md:space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Number</label>
              <input
                className={`w-full bg-white border-2 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 outline-none transition-all ${errors.phone ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-slate-50 focus:ring-primary/5 focus:border-primary'}`}
                placeholder="+91 00000 00000"
                value={form.phone}
                onChange={handleChange('phone')}
              />
              {errors.phone && <p className="text-xs font-bold text-red-600">{errors.phone}</p>}
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email (optional)</label>
            <input
              type="email"
              className={`w-full bg-white border-2 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 outline-none transition-all ${errors.email ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-slate-50 focus:ring-primary/5 focus:border-primary'}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange('email')}
            />
            {errors.email && <p className="text-xs font-bold text-red-600">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="space-y-3 md:space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Name</label>
              <input
                className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                placeholder="e.g. Skyline Heights"
                value={form.projectName}
                onChange={handleChange('projectName')}
              />
            </div>
            <div className="space-y-3 md:space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Builder / Developer</label>
              <input
                className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                placeholder="Company name"
                value={form.builderName}
                onChange={handleChange('builderName')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="space-y-3 md:space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
              <input
                className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                placeholder="Mumbai"
                value={form.city}
                onChange={handleChange('city')}
              />
            </div>
            <div className="space-y-3 md:space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Locality / Area</label>
              <input
                className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                placeholder="e.g. Andheri West"
                value={form.locality}
                onChange={handleChange('locality')}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Type</label>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {PROJECT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleToggle('projectType', type)}
                  className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest border-2 transition-all ${form.projectType === type ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 md:border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="space-y-3 md:space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Approx. Total Units</label>
              <input
                type="number"
                className={`w-full bg-white border-2 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 outline-none transition-all ${errors.approxUnits ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-slate-50 focus:ring-primary/5 focus:border-primary'}`}
                placeholder="e.g. 120"
                value={form.approxUnits}
                onChange={handleChange('approxUnits')}
              />
              {errors.approxUnits && <p className="text-xs font-bold text-red-600">{errors.approxUnits}</p>}
            </div>
            <div className="space-y-3 md:space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">RERA Number (optional)</label>
              <input
                className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                placeholder="e.g. MahaRERA No."
                value={form.reraNumber}
                onChange={handleChange('reraNumber')}
              />
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Anything else we should know? (optional)</label>
            <textarea
              rows="4"
              className="w-full bg-white border-2 border-slate-50 rounded-2xl p-6 font-bold placeholder:text-slate-300 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all resize-none"
              placeholder="Tell us a bit more about the project..."
              value={form.message}
              onChange={handleChange('message')}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50 transition-all active:scale-95"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'} <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
