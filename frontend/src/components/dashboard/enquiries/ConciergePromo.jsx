import Image from 'next/image';

export default function ConciergePromo() {
  return (
    <div className="mt-10 relative overflow-hidden h-64 rounded-[2.5rem] group shadow-2xl shadow-primary/10">
      <Image
        alt="Office Workspace"
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        className="object-cover transition-transform duration-1000 group-hover:scale-105"
        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-transparent flex flex-col justify-center px-12 md:px-20 relative z-10">
        <span className="bg-primary/20 text-primary-fixed-dim text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full w-fit mb-4 backdrop-blur-md border border-primary/20">
          Priority Support
        </span>
        <h3 className="text-3xl md:text-4xl font-heading font-black text-white mb-2 leading-tight">Need immediate <br/>assistance?</h3>
        <p className="text-slate-300 max-w-sm text-sm font-medium mb-8 leading-relaxed">
          Connect with our premium residential concierge for priority enquiry handling and expert guidance.
        </p>
        <button className="flex items-center gap-3 bg-white text-slate-900 px-8 py-3.5 rounded-full font-heading font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95 shadow-lg shadow-black/20 group/btn">
          Speak to Agent
          <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </div>
      
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-[100px] pointer-events-none"></div>
    </div>
  );
}
