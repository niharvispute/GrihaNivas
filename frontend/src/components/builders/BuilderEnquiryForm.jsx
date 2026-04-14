import LeadForm from '@/components/forms/LeadForm';

export default function BuilderEnquiryForm({ builder }) {
  return (
    <div className="lg:w-1/2">
      <div className="bg-white p-10 rounded-[2.5rem] text-zinc-900 shadow-2xl">
        <LeadForm
          title={`Enquire with ${builder.name}`}
          leadType="buy"
        />
      </div>
    </div>
  );
}
