import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppCTA from '@/components/common/WhatsAppCTA';

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="h-20 bg-white" />}>
        <Header />
      </Suspense>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppCTA />
    </div>
  );
}
