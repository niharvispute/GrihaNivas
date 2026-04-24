import Image from 'next/image';

export default function BuilderTestimonials({ builder }) {
  const testimonials = Array.isArray(builder?.testimonials) ? builder.testimonials : [];
  if (testimonials.length === 0) return null;

  return (
    <section className="py-14 sm:py-18 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-3xl! sm:text-4xl! font-extrabold text-zinc-900 mb-10 sm:mb-16 text-center font-headline uppercase tracking-tight">What Our Residents Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
        {testimonials.map((testi) => (
          <div key={testi.id} className="relative bg-white p-6 sm:p-8 lg:p-10 rounded-[1.75rem] sm:rounded-[2.5rem] shadow-xl border border-neutral-100 group hover:-translate-y-2 transition-all duration-300">
            <div className="absolute -top-6 left-6 sm:left-10">
              <Image
                src={testi.avatar}
                alt={testi.author}
                width={64}
                height={64}
                className="rounded-full border-4 border-white shadow-lg object-cover"
              />
            </div>
            <div className="pt-4">
              <div className="flex text-primary mb-4 flex-wrap">
                {[...Array(testi.rating)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="text-zinc-600 mb-6 font-body text-sm sm:text-base leading-relaxed">&quot;{testi.content}&quot;</p>
              <div>
                <p className="font-bold text-zinc-900 font-headline uppercase tracking-tight">{testi.author}</p>
                <p className="text-sm text-zinc-400 font-label">{testi.role}</p>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}
