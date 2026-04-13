'use client';

import { useState, useEffect } from 'react';
import ProfileHero from '@/components/dashboard/profile/ProfileHero';
import ProfileForm from '@/components/dashboard/profile/ProfileForm';
import ProfileStats from '@/components/dashboard/profile/ProfileStats';
import { getMyProfile } from '@/services/userService';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="h-10 w-64 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-4xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-4xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">Account <span className="text-primary">Settings</span></h1>
        <p className="text-slate-400 mt-2 font-bold uppercase tracking-[0.2em] text-[10px]">Manage your digital real estate identity</p>
      </div>

      <ProfileHero user={user} onUpdate={setUser} />
      <ProfileForm user={user} onUpdate={setUser} />
      <ProfileStats user={user} />
    </div>
  );
}
