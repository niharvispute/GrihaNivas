export default function BuilderTestimonials({ builder }) {
  return (
    <section className="py-24 container mx-auto px-6 bg-white">
      <h2 className="text-4xl font-extrabold text-zinc-900 mb-16 text-center font-headline uppercase tracking-tight">What Our Residents Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {builder.testimonials.map((testi) => (
          <div key={testi.id} className="relative bg-white p-10 rounded-[2.5rem] shadow-xl border border-neutral-100 group hover:-translate-y-2 transition-all duration-300">
            <div className="absolute -top-6 left-10">
              <img 
                src={testi.avatar} 
                alt={testi.author} 
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover" 
              />
            </div>
            <div className="pt-4">
              <div className="flex text-primary mb-4">
                {[...Array(testi.rating)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="text-zinc-600 italic mb-6 font-body text-base leading-relaxed">"{testi.content}"</p>
              <div>
                <p className="font-bold text-zinc-900 font-headline uppercase tracking-tight">{testi.author}</p>
                <p className="text-sm text-zinc-400 font-label">{testi.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
