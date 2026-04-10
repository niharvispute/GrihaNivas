export default function LeadForm({ title = "Inquire About This Property" }) {
  return (
    <div className="bg-white p-8 rounded-moderate shadow-xl border border-slate-100">
      <h3 className="text-xl font-bold text-slate-900 mb-6">{title}</h3>
      <form className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
          <input 
            type="text" 
            className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
          <input 
            type="email" 
            className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Phone Number</label>
          <input 
            type="tel" 
            className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="+91 98765 43210"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Message</label>
          <textarea 
            rows="4"
            className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            placeholder="I am interested in this property..."
          ></textarea>
        </div>
        <button 
          type="submit" 
          className="w-full bg-primary text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          Send Inquiry
        </button>
        <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed">
          By submitting this form, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </div>
  );
}
