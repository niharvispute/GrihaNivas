import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppCTA from '@/components/common/WhatsAppCTA';

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppCTA />
    </div>
  );
}
