'use client';

export default function HomeLoanForm({ title = "Apply for Home Loan" }) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl relative border border-slate-50">
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary rounded-full blur-3xl opacity-10"></div>
      <form className="space-y-6 relative">
        <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tighter">{title}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Full Name</label>
            <input 
              className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900" 
              placeholder="e.g. Rahul Sharma" 
              type="text"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Phone Number</label>
            <input 
              className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900" 
              placeholder="+91 98765 43210" 
              type="tel"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Email Address</label>
          <input 
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900" 
            placeholder="rahul@example.com" 
            type="email"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Monthly Income</label>
            <input 
              className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900" 
              placeholder="₹ 1,50,000" 
              type="text"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Loan Amount Required</label>
            <input 
              className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900" 
              placeholder="₹ 75,00,000" 
              type="text"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Preferred Bank (Optional)</label>
          <div className="relative">
            <select className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all appearance-none font-bold text-slate-900 cursor-pointer">
              <option>No preference</option>
              <option>State Bank of India</option>
              <option>HDFC Bank</option>
              <option>ICICI Bank</option>
              <option>Axis Bank</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <button 
          className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
          type="submit"
        >
          Check Eligibility
        </button>
        
        <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed font-bold uppercase tracking-widest">
          No hidden fees • 256-bit Secure Encryption
        </p>
      </form>
    </div>
  );
}
