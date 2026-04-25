import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import AuthGuard from '@/components/auth/AuthGuard';

export default function AdminLayout({ children }) {
  return (
    <AuthGuard requireAdmin>
      <div className="min-h-screen bg-neutral-50">
        <AdminSidebar />
        <div className="ml-64 flex flex-col min-h-screen">
          <AdminHeader />
          <main className="pt-20 px-6 pb-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
