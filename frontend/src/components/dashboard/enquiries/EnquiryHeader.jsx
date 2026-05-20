import Link from 'next/link';

export default function EnquiryHeader() {
  return (
    <div className="flex flex-col md:flex-row items-end justify-between mb-4 sm:mb-6 md:mb-8 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <nav className="flex items-center text-[7px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5 sm:mb-2 gap-1.5 sm:gap-2">
          <Link href="/account" className="hover:text-primary transition-colors">Dashboard</Link>
          <span className="text-slate-300">/</span>
          <span className="text-primary">My Enquiries</span>
        </nav>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-black text-slate-900 tracking-tight">My Enquiries</h2>
      </div>
    </div>
  );
}
