import MultiStageListingForm from '@/components/listing/MultiStageListingForm';

export const metadata = {
  title: 'Showcase Your Property | Bricks Mumbai',
  description: 'Submit your estate for a premium editorial feature. Professional evaluation and global exposure in 5 steps.',
};

export default function ListPropertyPage() {
  return (
    <main className="overflow-x-hidden pt-0 lg:pt-0">
      <MultiStageListingForm />
    </main>
  );
}
