import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 font-sans text-sm leading-relaxed">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-12 px-8 py-16 max-w-screen-2xl mx-auto text-slate-600">
        {/* Column 1: Company */}
        <div className="col-span-2 md:col-span-1">
          <div className="text-xl font-bold text-slate-900 mb-6">Mumbai Editorial</div>
          <p className="text-slate-500 mb-6 max-w-xs leading-relaxed">
            Curating Mumbai's most exclusive real estate opportunities with an architectural lens.
          </p>
          <div className="flex gap-4">
             <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all cursor-pointer">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
             </span>
             {/* Add more icons as needed */}
          </div>
        </div>

        {/* Column 2: Properties */}
        <div>
          <h4 className="font-bold text-slate-900 mb-6">Properties</h4>
          <ul className="space-y-4">
            <li><Link href="/buy" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Buy</Link></li>
            <li><Link href="/rent" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Rent</Link></li>
            <li><Link href="/builders" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Builders</Link></li>
            <li><Link href="/launches" className="hover:translate-x-1 hover:text-primary transition-all inline-block">New Launch</Link></li>
          </ul>
        </div>

        {/* Column 3: Services */}
        <div>
          <h4 className="font-bold text-slate-900 mb-6">Services</h4>
          <ul className="space-y-4">
            <li><Link href="/loan" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Home Loan</Link></li>
            <li><Link href="/emi-calculator" className="hover:translate-x-1 hover:text-primary transition-all inline-block">EMI Calc</Link></li>
            <li><Link href="/stamp-duty" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Stamp Duty</Link></li>
            <li><Link href="/agreement" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Rent Agreement</Link></li>
          </ul>
        </div>

        {/* Column 4: Resources */}
        <div>
          <h4 className="font-bold text-slate-900 mb-6">Resources</h4>
          <ul className="space-y-4">
            <li><Link href="/blogs" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Blogs</Link></li>
            <li><Link href="/faqs" className="hover:translate-x-1 hover:text-primary transition-all inline-block">FAQs</Link></li>
            <li><Link href="/privacy" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Privacy</Link></li>
            <li><Link href="/terms" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Terms</Link></li>
          </ul>
        </div>

        {/* Column 5: Contact Info */}
        <div className="col-span-2 md:col-span-1">
          <h4 className="font-bold text-slate-900 mb-6">Contact</h4>
          <ul className="space-y-4 text-slate-500">
            <li className="flex items-start gap-3">
              <svg className="mt-1 text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Level 4, Maker Maxity, <br/>BKC, Mumbai 400051</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>+91 22 4567 8900</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 py-8 px-8 max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-slate-400 text-xs">© 2024 Mumbai Editorial Real Estate. All rights reserved.</div>
        <div className="flex gap-8 text-xs font-semibold text-slate-500 uppercase tracking-widest">
          <Link href="/about" className="hover:text-primary transition-colors">About</Link>
          <Link href="/careers" className="hover:text-primary transition-colors">Careers</Link>
          <Link href="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
