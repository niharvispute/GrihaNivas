import KPISection from '@/components/dashboard/KPISection';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions';
import FeaturedGuideCard from '@/components/dashboard/FeaturedGuideCard';

export const metadata = {
  title: 'My Dashboard | Bricks',
  description: 'Manage your property enquiries, saved listings, and profile.',
};

export default function UserDashboardPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-10">
      {/* Header & Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">
            Good morning, <span className="text-primary underline decoration-primary/20 decoration-8 underline-offset-4">Alex</span>
          </h1>
          <p className="text-slate-400 mt-2 font-bold uppercase tracking-[0.2em] text-[10px]">
            Today is {currentDate}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white rounded-xl shadow-sm border border-slate-200 text-xs font-bold text-slate-600 hover:text-primary hover:border-primary transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">calendar_today</span>
            This Month
          </button>
          <button className="px-5 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 text-xs font-bold hover:scale-105 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filters
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <KPISection />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Activity Timeline */}
        <div className="lg:col-span-8">
          <ActivityTimeline />
        </div>

        {/* Right: Quick Actions & Featured Guide */}
        <div className="lg:col-span-4 space-y-10">
          <DashboardQuickActions />
          <FeaturedGuideCard />
        </div>
      </div>
    </div>
  );
}
