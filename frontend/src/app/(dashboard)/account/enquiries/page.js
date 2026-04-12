import EnquiryHeader from '@/components/dashboard/enquiries/EnquiryHeader';
import EnquiryTable from '@/components/dashboard/enquiries/EnquiryTable';
import StatusGuide from '@/components/dashboard/enquiries/StatusGuide';
import ConciergePromo from '@/components/dashboard/enquiries/ConciergePromo';

export const metadata = {
  title: 'My Enquiries | Bricks Tracker',
  description: 'Monitor your property and service enquiries in real-time.',
};

export default function EnquiriesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <EnquiryHeader />
      <EnquiryTable />
      <StatusGuide />
      <ConciergePromo />
    </div>
  );
}
