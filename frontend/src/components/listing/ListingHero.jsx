import Link from 'next/link';

export default function ListingHero() {
  return (
    <section className="relative h-[700px] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          alt="Mumbai Skyline" 
          className="w-full h-full object-cover object-center" 
          src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=2000" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="max-w-2xl">
          <span className="font-bold text-primary tracking-[0.2em] text-xs uppercase mb-4 block">Elevate Your Asset</span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-900 leading-[1.1] mb-8 font-heading">
            List Your <br/><span className="text-primary">Property</span> with Us
          </h1>
          <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed font-medium">
            Access Mumbai's most exclusive network of high-net-worth buyers and tenants through our curated editorial showcase.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="#submit-form" 
              className="bg-primary text-white px-10 py-4 rounded-full font-bold text-lg text-center hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Get Started
            </Link>
            <button className="flex items-center justify-center gap-2 px-10 py-4 rounded-full font-bold text-lg border-2 border-slate-200 hover:bg-slate-50 transition-all text-slate-600">
              View Guide 
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
