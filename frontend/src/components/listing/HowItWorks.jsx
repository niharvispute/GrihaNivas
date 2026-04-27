export default function HowItWorks() {
  const steps = [
    { number: "1", title: "Submit", description: "Fill in property details via our secure portal." },
    { number: "2", title: "Contact", description: "Our team validates your listing via a quick call." },
    { number: "3", title: "Listed", description: "Your property goes live on our premium catalog." },
    { number: "4", title: "Leads", description: "Start receiving verified buyer inquiries directly." }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="font-heading text-4xl font-extrabold tracking-tighter mb-4 text-slate-900">How It Works</h2>
          <div className="w-20 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-100 -translate-y-1/2 z-0"></div>
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 bg-white flex flex-col items-center text-center p-8 group">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-heading font-bold text-xl mb-6 ring-8 ring-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                {step.number}
              </div>
              <h4 className="font-heading font-bold mb-2 text-slate-800 text-lg">{step.title}</h4>
              <p className="text-sm text-slate-500 font-bold leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
