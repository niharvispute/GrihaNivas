import EnquiryHeader from '@/components/dashboard/enquiries/EnquiryHeader';
import EnquiryTable from '@/components/dashboard/enquiries/EnquiryTable';

export const metadata = {
  title: 'My Enquiries | Ghar Tracker',
  description: 'Monitor your property and service enquiries in real-time.',
};

export default function EnquiriesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <EnquiryHeader />
      <EnquiryTable />
    </div>
  );
}
