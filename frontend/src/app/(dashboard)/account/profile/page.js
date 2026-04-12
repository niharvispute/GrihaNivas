import ProfileHero from '@/components/dashboard/profile/ProfileHero';
import ProfileForm from '@/components/dashboard/profile/ProfileForm';
import ProfileStats from '@/components/dashboard/profile/ProfileStats';

export const metadata = {
  title: 'My Profile | Bricks',
  description: 'Manage your personal account settings and preferences.',
};

export default function ProfilePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">Account <span className="text-primary">Settings</span></h1>
        <p className="text-slate-400 mt-2 font-bold uppercase tracking-[0.2em] text-[10px]">Manage your digital real estate identity</p>
      </div>

      <ProfileHero />
      <ProfileForm />
      <ProfileStats />
    </div>
  );
}
