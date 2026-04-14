export default function BuilderAbout({ builder }) {
  const description = Array.isArray(builder?.description)
    ? builder.description
    : builder?.description
      ? [builder.description]
      : [];
  const featuredImages = Array.isArray(builder?.featuredImages) ? builder.featuredImages : [];

  return (
    <section className="py-24 container mx-auto px-6">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2">
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block font-label">The Legacy</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-8 leading-tight font-headline">
            {builder.aboutHeadline || `About ${builder.name}`}
          </h2>
          <div className="space-y-6 text-zinc-600 text-lg leading-relaxed font-body">
            {description.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            <div className="flex gap-8 pt-4 flex-wrap">
              <div>
                <h4 className="font-bold text-zinc-900 font-headline">Quality Standards</h4>
                <p className="text-sm font-body">{builder.qualityStandards}</p>
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 font-headline">Innovation</h4>
                <p className="text-sm font-body">{builder.innovation}</p>
              </div>
            </div>
          </div>
        </div>

        {featuredImages.length > 0 && (
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
            {featuredImages.map((img, i) => (
              <img 
                key={i}
                src={img} 
                alt={`Architecture ${i + 1}`} 
                className={`rounded-2xl h-80 w-full object-cover shadow-2xl ${i === 1 ? 'mt-12' : ''}`} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
