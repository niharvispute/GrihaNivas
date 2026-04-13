export default function BuilderEnquiryForm({ builder }) {
  return (
    <div className="lg:w-1/2">
      <div className="bg-white p-10 rounded-[2.5rem] text-zinc-900 shadow-2xl">
        <h3 className="text-3xl font-extrabold mb-2 font-headline uppercase tracking-tight">Enquire with {builder.name}</h3>
        <p className="text-zinc-500 mb-8 font-medium font-body">Leave your details and an investment expert will contact you within 24 hours.</p>
        <form className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 font-label">Full Name</label>
            <input 
              className="w-full bg-neutral-50 border-neutral-200 rounded-xl px-5 py-4 focus:ring-primary focus:border-primary font-body" 
              placeholder="John Doe" 
              type="text"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 font-label">Phone Number</label>
            <input 
              className="w-full bg-neutral-50 border-neutral-200 rounded-xl px-5 py-4 focus:ring-primary focus:border-primary font-body" 
              placeholder="+91 98765 43210" 
              type="tel"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 font-label">Message</label>
            <textarea 
              className="w-full bg-neutral-50 border-neutral-200 rounded-xl px-5 py-4 focus:ring-primary focus:border-primary font-body" 
              placeholder="I'm interested in the portfolio at Skyline Apex Group..." 
              rows="4"
            ></textarea>
          </div>
          <button 
            className="w-full bg-primary text-white py-5 rounded-xl font-bold text-lg hover:bg-primary-container transition-all shadow-xl shadow-primary/20 uppercase tracking-widest" 
            type="submit"
          >
            Enquire Now
          </button>
        </form>
      </div>
    </div>
  );
}
