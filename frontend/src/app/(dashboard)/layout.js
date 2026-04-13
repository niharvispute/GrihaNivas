import UserSidebar from '@/components/layout/UserSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-neutral-50">
        <UserSidebar />
        <div className="ml-64 flex flex-col min-h-screen">
          <DashboardHeader />
          <main className="p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
