import Image from 'next/image';

export default function ListingTrust() {
  const badges = [
    { title: "MahaRERA", label: "Registered Partner", icon: "verified" },
    { title: "NAR-INDIA", label: "Accredited Member", icon: "stars" },
    { title: "Data Secured", label: "End-to-End Encryption", icon: "shield" },
    { title: "Award Winner '23", label: "Best Luxury Platform", icon: "workspace_premium" }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <span className="font-bold text-primary tracking-[0.2em] text-xs uppercase mb-4 block">Trusted Excellence</span>
            <h2 className="font-heading text-4xl font-extrabold tracking-tighter mb-8 text-slate-900 leading-tight">What Property <br/>Owners Say</h2>
            <div className="relative p-10 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="material-symbols-outlined text-primary/10 text-8xl absolute top-6 right-8 pointer-events-none">format_quote</span>
              <p className="font-sans text-xl  text-slate-700 mb-8 leading-relaxed relative z-10">
                &ldquo;The editorial approach of Grihanivas completely changed the demographic of inquiries I was getting. Within two weeks, I closed a deal for my Altamount Road apartment at my asking price.&rdquo;
              </p>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full overflow-hidden shadow-md relative">
                  <Image
                    alt="Vikram Malhotra"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                    fill
                    sizes="48px"
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-heading font-bold text-slate-900">Vikram Malhotra</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Luxury Portfolio Owner</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="grid grid-cols-2 gap-8">
              {badges.map((badge, idx) => (
                <div key={idx} className="bg-slate-50 p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                  <div className="h-16 flex items-center justify-center mb-4 opacity-70 text-primary group-hover:scale-110 transition-transform">
                    {badge.icon === 'verified' || badge.icon === 'stars' ? (
                       <span className="font-heading font-black text-2xl text-slate-400 tracking-tighter group-hover:text-primary">{badge.title}</span>
                    ) : (
                       <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary">{badge.icon}</span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{badge.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
