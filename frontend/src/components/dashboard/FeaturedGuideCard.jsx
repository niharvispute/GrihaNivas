import Image from 'next/image';

export default function FeaturedGuideCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 group aspect-[4/3] lg:aspect-[4/3]">
      <Image
        fill
        sizes="(max-width: 1024px) 100vw, 400px"
        className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200"
        alt="Featured Guide"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent p-5 flex flex-col justify-end">
        <span className="bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full w-fit mb-2">
          Featured Guide
        </span>
        <h4 className="text-white font-heading text-lg font-black leading-tight mb-3 group-hover:text-primary transition-colors">
          5 Tips for Investing in Mumbai Real Estate 2024
        </h4>
        <button className="w-full py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white hover:text-slate-900 transition-all active:scale-[0.98]">
          Read Article
        </button>
      </div>
    </div>
  );
}
