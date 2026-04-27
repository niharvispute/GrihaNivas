import LeadForm from '@/components/forms/LeadForm';

export default function BuilderEnquiryForm({ builder }) {
  return (
    <div id="builder-contact-form" className="w-full lg:w-1/2 scroll-mt-24">
      <div className="rounded-2xl text-zinc-900 shadow-2xl overflow-hidden">
        <LeadForm
          title={`Enquire with ${builder.name}`}
          leadType="buy"
        />
      </div>
    </div>
  );
}
