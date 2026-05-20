'use client';

import { useState, useEffect } from 'react';
import { updateMyProfile } from '@/services/userService';

export default function ProfileForm({ user, onUpdate }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    try {
      const payload = { name: name.trim() };
      const updated = await updateMyProfile(payload, { map: true });
      onUpdate?.(updated);
      setFeedback('success');
    } catch {
      setFeedback('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 border-b border-slate-50">
        <h3 className="text-sm sm:text-base md:text-lg font-heading font-black text-slate-900">Personal Information</h3>
      </div>
      <div className="p-4 sm:p-6 md:p-8">
        <form className="space-y-4 sm:space-y-6 md:space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
            {/* Full Name */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Full Name</label>
              <input
                className="w-full px-4 py-2.5 sm:py-3 md:py-3.5 rounded-xl border border-slate-100 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-slate-50 focus:bg-white font-sans text-slate-700 font-bold text-xs sm:text-sm"
                placeholder="Enter your full name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Mobile Number (Locked) */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Mobile Number</label>
              <div className="relative group">
                <input
                  className="w-full px-4 py-2.5 sm:py-3 md:py-3.5 pr-10 rounded-xl border border-slate-50 bg-slate-50/50 text-slate-400 font-sans font-bold cursor-not-allowed text-xs sm:text-sm"
                  disabled
                  type="text"
                  value={user?.phone || ''}
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 text-base sm:text-lg">lock</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] sm:text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center leading-relaxed z-20">
                  Mobile number is verified and locked for security.
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Email Address</label>
              <div className="relative group">
                <input
                  className="w-full px-4 py-2.5 sm:py-3 md:py-3.5 pr-10 rounded-xl border border-slate-50 bg-slate-50/50 text-slate-400 font-sans font-bold cursor-not-allowed text-xs sm:text-sm"
                  placeholder="Email cannot be changed"
                  type="email"
                  value={user?.email || ''}
                  disabled
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 text-base sm:text-lg">lock</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-slate-900 text-white text-[9px] sm:text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center leading-relaxed z-20">
                  Email is locked after account creation for security.
                </div>
              </div>
            </div>
          </div>

          {feedback === 'success' && (
            <p className="text-emerald-600 text-xs sm:text-sm font-bold">Profile updated successfully.</p>
          )}
          {feedback === 'error' && (
            <p className="text-red-500 text-xs sm:text-sm font-bold">Failed to update profile. Please try again.</p>
          )}

          <div className="pt-2 sm:pt-4 flex justify-center sm:justify-end">
            <button
              className="w-full sm:w-auto px-6 sm:px-12 py-2.5 sm:py-3.5 bg-primary text-white font-heading font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-full shadow-lg hover:scale-105 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
