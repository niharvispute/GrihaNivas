export default function BuilderFAQ({ builder }) {
  const faqs = Array.isArray(builder?.faqs) ? builder.faqs : [];
  if (faqs.length === 0) return null;

  return (
    <div className="w-full lg:w-1/2">
      <h2 className="text-3xl! sm:text-4xl! font-extrabold mb-8 sm:mb-12 font-headline uppercase tracking-tight">Common Inquiries</h2>
      <div className="space-y-4 sm:space-y-6">
        {faqs.map((faq, i) => (
          <details key={i} className="group bg-zinc-800/50 rounded-2xl border border-zinc-700 open:bg-zinc-800 transition-all duration-300">
            <summary className="p-4 sm:p-6 cursor-pointer flex justify-between items-center gap-3 list-none font-bold text-base sm:text-lg font-headline tracking-tight">
              {faq.question}
              <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
            </summary>
            <div className="p-4 sm:p-6 pt-0 text-zinc-400 leading-relaxed font-body text-sm sm:text-base">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
