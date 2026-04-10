import ListingHero from '@/components/listing/ListingHero';
import ListingBenefits from '@/components/listing/ListingBenefits';
import HowItWorks from '@/components/listing/HowItWorks';
import ListingForm from '@/components/listing/ListingForm';
import ListingTrust from '@/components/listing/ListingTrust';
import ListingFaq from '@/components/listing/ListingFaq';

export const metadata = {
  title: 'List Your Property | Bricks Mumbai',
  description: 'Submit your luxury property for an editorial showcase. Reach thousands of verified home seekers in Mumbai.',
};

export default function ListPropertyPage() {
  return (
    <main className="overflow-x-hidden">
      <ListingHero />
      <ListingBenefits />
      <HowItWorks />
      <ListingForm />
      <ListingTrust />
      <ListingFaq />
    </main>
  );
}
