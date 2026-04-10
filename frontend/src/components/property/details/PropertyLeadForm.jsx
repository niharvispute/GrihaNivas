export default function PropertyLeadForm() {
  return (
    <section className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="text-xl font-heading font-extrabold mb-1 text-slate-900">Inquire for Details</h3>
      <p className="text-sm text-slate-500 mb-6 font-medium">Our consultants will contact you within 2 hours.</p>
      
      <form className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 px-1">Full Name</label>
          <input 
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm text-slate-700 font-medium transition-all" 
            placeholder="e.g. Rohit Huge" 
            type="text"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 px-1">Phone Number</label>
          <input 
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm text-slate-700 font-medium transition-all" 
            placeholder="+91 98765 43210" 
            type="tel"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 px-1">Email Address</label>
          <input 
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm text-slate-700 font-medium transition-all" 
            placeholder="rohit@example.com" 
            type="email"
          />
        </div>
        <button className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all active:scale-95 mt-4">
          I’m Interested
        </button>
      </form>
      
      <div className="mt-6 pt-6 border-t border-slate-200 text-center">
        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Your data is secure and confidential
        </p>
      </div>
    </section>
  );
}
