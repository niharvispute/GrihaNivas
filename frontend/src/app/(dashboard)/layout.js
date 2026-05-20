import UserSidebar from '@/components/layout/UserSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import AuthGuard from '@/components/auth/AuthGuard';
import { SidebarProvider } from '@/context/SidebarContext';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="min-h-screen bg-[#f8f7f5]">
          <UserSidebar />
          <div className="flex flex-col min-h-screen md:ml-64">
            <DashboardHeader />
            <main className="flex-1 p-3 sm:p-5 md:p-6 w-full">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
