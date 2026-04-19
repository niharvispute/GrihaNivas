export default function BuilderAbout({ builder }) {
  const description = Array.isArray(builder?.description)
    ? builder.description
    : builder?.description
      ? [builder.description]
      : [];
  const featuredImages = Array.isArray(builder?.featuredImages) ? builder.featuredImages : [];

  return (
    <section className="py-14 sm:py-18 lg:py-24 container mx-auto px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
        <div className="lg:w-1/2">
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block font-label">The Legacy</span>
          <h2 className="text-3xl! sm:text-4xl! md:text-5xl! font-extrabold text-zinc-900 mb-6 sm:mb-8 leading-tight font-headline">
            {builder.aboutHeadline || `About ${builder.name}`}
          </h2>
          <div className="space-y-5 sm:space-y-6 text-zinc-600 text-base sm:text-lg leading-relaxed font-body">
            {description.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            <div className="flex gap-6 sm:gap-8 pt-2 sm:pt-4 flex-wrap">
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
          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {featuredImages.map((img, i) => (
              <img 
                key={i}
                src={img} 
                alt={`Architecture ${i + 1}`} 
                className={`rounded-2xl h-56 sm:h-64 lg:h-80 w-full object-cover shadow-2xl ${i === 1 ? 'sm:mt-10 lg:mt-12' : ''}`} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
