import Link from 'next/link';

export const metadata = {
  title: 'Frequently Asked Questions',
  description: 'Answers to common questions about buying, renting, financing, and documentation on GrihaNivas — Mumbai real estate platform.',
};

const FAQS = [
  {
    question: 'How do I schedule a property visit?',
    answer:
      'Use the inquiry form on any property page or call our team. We confirm available slots and share viewing details within one business day.',
  },
  {
    question: 'Are listings verified before publishing?',
    answer:
      'Yes. We review listing details, title declarations, and key project information before making properties visible on the platform.',
  },
  {
    question: 'Can I get assistance for home loans?',
    answer:
      'Yes. Our home loan advisory team helps with eligibility checks, lender options, and application support tailored to your profile.',
  },
  {
    question: 'Do you support rental agreement registration?',
    answer:
      'Yes. You can submit an agreement request and our team will guide you through document checks, drafting, and e-registration flow.',
  },
  {
    question: 'How often are new properties added?',
    answer:
      'Fresh inventory is added daily. You can use filters and sort options on listings to quickly discover the latest opportunities.',
  },
  {
    question: 'What is stamp duty in Mumbai and how is it calculated?',
    answer:
      'Stamp duty in Mumbai is a government tax on property transactions. Male buyers pay 6%, female buyers pay 5%, and joint purchases are charged at 5%. It is calculated on the higher of the agreement value or the Ready Reckoner Rate (RRR) set by the Maharashtra government. Registration charges are a flat ₹30,000 for buy transactions.',
  },
  {
    question: 'Is RERA registration mandatory for properties I see on GrihaNivas?',
    answer:
      'All under-construction projects listed on GrihaNivas must be RERA-registered under MahaRERA. You can verify any project\'s registration number at the MahaRERA portal. Completed and resale properties are not required to have active RERA registration.',
  },
  {
    question: 'What documents should I check before buying a property in Mumbai?',
    answer:
      'Key documents include the title deed, encumbrance certificate, approved building plan, occupation certificate (OC), completion certificate (CC), and RERA registration for new launches. Our advisory team can guide you through a document review before any purchase commitment.',
  },
];

export default function FaqsPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 lg:px-8 py-14">
      <header className="mb-12">
        <p className="text-[11px] font-black tracking-[0.22em] uppercase text-primary mb-4">Support</p>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-5">Frequently Asked Questions</h1>
        <p className="text-slate-500 max-w-3xl leading-relaxed text-lg font-bold">
          Answers to common questions about buying, renting, financing, and documentation on GrihaNivas.
        </p>
      </header>

      <section className="space-y-5">
        {FAQS.map((item) => (
          <details key={item.question} className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm open:shadow-md transition-shadow">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-6">
              <h2 className="text-lg font-black tracking-tight text-slate-900">{item.question}</h2>
              <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 group-open:rotate-180 transition-transform">
                <span className="material-symbols-outlined text-base leading-none">expand_more</span>
              </span>
            </summary>
            <p className="mt-4 text-slate-600 leading-relaxed text-sm">{item.answer}</p>
          </details>
        ))}
      </section>

      <section className="mt-14 rounded-2xl bg-slate-900 px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-white font-black text-lg tracking-tight mb-1">Still have questions?</p>
          <p className="text-slate-400 text-sm font-bold">Our advisory team responds within one business day.</p>
        </div>
        <Link
          href="/contact"
          className="shrink-0 px-8 py-4 rounded-full bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-2xl"
        >
          Contact Us
        </Link>
      </section>
    </main>
  );
}
