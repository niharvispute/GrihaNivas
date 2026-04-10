export default function ListingBenefits() {
  const benefits = [
    {
      icon: "trending_up",
      title: "Reach Thousands",
      description: "Exposure to our monthly audience of 500k+ qualified luxury home seekers."
    },
    {
      icon: "verified_user",
      title: "Verified Leads",
      description: "We pre-screen every inquiry to ensure you only deal with serious prospects."
    },
    {
      icon: "support_agent",
      title: "Expert Help",
      description: "Dedicated relationship managers to guide you through legalities and pricing."
    },
    {
      icon: "speed",
      title: "Quick Process",
      description: "Go from submission to active listing in less than 24 business hours."
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="group">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-primary transition-colors duration-500 border border-slate-100">
                <span className="material-symbols-outlined text-primary group-hover:text-white text-3xl">{benefit.icon}</span>
              </div>
              <h3 className="font-heading font-bold text-xl mb-3 text-slate-900">{benefit.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
