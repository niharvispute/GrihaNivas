import LeadForm from '@/components/forms/LeadForm';

export default function BuilderEnquiryForm({ builder }) {
  return (
    <div id="builder-contact-form" className="lg:w-1/2 scroll-mt-24">
      <div className="bg-white  rounded-[2.5rem] text-zinc-900 shadow-2xl">
        <LeadForm
          title={`Enquire with ${builder.name}`}
          leadType="buy"
        />
      </div>
    </div>
  );
}
