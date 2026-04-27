export default function StatusGuide() {
  const steps = [
    {
      title: "New",
      desc: "Your enquiry has been received and added to our priority processing queue.",
      icon: "fiber_new",
      theme: "bg-orange-50 text-orange-600 border-orange-100"
    },
    {
      title: "Contacted",
      desc: "Our real estate concierge has reached out to understand your needs in detail.",
      icon: "call",
      theme: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      title: "Qualified",
      desc: "Requirements matched. We're now proceeding with documentation or site visits.",
      icon: "verified_user",
      theme: "bg-emerald-50 text-emerald-600 border-emerald-100"
    },
    {
      title: "Closed",
      desc: "The transaction is complete or the enquiry has reached a final resolution.",
      icon: "task_alt",
      theme: "bg-slate-50 text-slate-500 border-slate-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {steps.map((step, idx) => (
        <div key={idx} className="bg-white/60 backdrop-blur-xl border border-white p-8 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-slate-200/80 transition-all duration-500 group">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform ${step.theme}`}>
            <span className="material-symbols-outlined text-2xl">{step.icon}</span>
          </div>
          <h4 className="font-heading font-black text-slate-900 mb-2">{step.title}</h4>
          <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">{step.desc}</p>
        </div>
      ))}
    </div>
  );
}
