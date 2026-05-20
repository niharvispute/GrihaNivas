import MultiStageListingForm from '@/components/listing/MultiStageListingForm';
import Link from 'next/link';

export const metadata = {
  title: 'Showcase Your Property',
  description: 'Submit your estate for a premium editorial feature. Professional evaluation and global exposure in 5 steps.',
};

export default function ListPropertyPage() {
  return (
    <main className="overflow-x-hidden pt-0 lg:pt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-primary text-xs font-black uppercase tracking-widest transition-colors group"
        >
          <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Home
        </Link>
      </div>
      <MultiStageListingForm />
    </main>
  );
}
