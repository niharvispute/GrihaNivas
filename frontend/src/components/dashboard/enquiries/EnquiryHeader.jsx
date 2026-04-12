import Link from 'next/link';

export default function EnquiryHeader() {
  return (
    <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <nav className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 gap-2">
          <Link href="/account" className="hover:text-primary transition-colors">Dashboard</Link>
          <span className="text-slate-300">/</span>
          <span className="text-primary">My Enquiries</span>
        </nav>
        <h2 className="text-4xl font-heading font-black text-slate-900 tracking-tight">My Enquiries</h2>
      </div>
      <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 flex items-center gap-3 group hover:bg-primary/10 transition-all cursor-default shadow-sm shadow-primary/5">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total Submissions</span>
        <span className="text-2xl font-heading font-black text-primary group-hover:scale-110 transition-transform">12</span>
      </div>
    </div>
  );
}
