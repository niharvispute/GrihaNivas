import Link from 'next/link';

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/mumbaieditorial',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/919137950050',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/mumbaieditorial',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@mumbaieditorial',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 font-sans text-sm leading-relaxed">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-12 px-8 py-16 max-w-screen-2xl mx-auto text-slate-600">
        {/* Column 1: Company */}
        <div className="col-span-2 md:col-span-1">
          <div className="text-xl font-bold text-slate-900 mb-4">GrihaNivas</div>
          <p className="text-slate-500 mb-6 max-w-xs leading-relaxed text-[13px]">
            Mumbai's concierge real estate advisory.
          </p>
          {/* Social Icons */}
          <div className="flex gap-2.5 flex-wrap">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={social.label}
                className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Properties */}
        <div>
          <h3 className="font-bold text-slate-900 mb-6">Properties</h3>
          <ul className="space-y-4">
            <li><Link href="/buy" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Buy</Link></li>
            <li><Link href="/rent" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Rent</Link></li>
            <li><Link href="/builders" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Builders</Link></li>
            <li><Link href="/new-launch" className="hover:translate-x-1 hover:text-primary transition-all inline-block">New Launch</Link></li>
          </ul>
        </div>

        {/* Column 3: Services */}
        <div>
          <h3 className="font-bold text-slate-900 mb-6">Services</h3>
          <ul className="space-y-4">
            <li><Link href="/home-loan" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Home Loan</Link></li>
            <li><Link href="/emi-calculator" className="hover:translate-x-1 hover:text-primary transition-all inline-block">EMI Calculator</Link></li>
            <li><Link href="/stamp-duty" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Stamp Duty</Link></li>
            <li><Link href="/rent-agreement" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Rent Agreement</Link></li>
            <li><Link href="/compare" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Comparison</Link></li>
          </ul>
        </div>

        {/* Column 4: Resources */}
        <div>
          <h3 className="font-bold text-slate-900 mb-6">Resources</h3>
          <ul className="space-y-4">
            <li><Link href="/blogs" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Blogs</Link></li>
            <li><Link href="/faqs" className="hover:translate-x-1 hover:text-primary transition-all inline-block">FAQs</Link></li>
            <li><Link href="/about" className="hover:translate-x-1 hover:text-primary transition-all inline-block">About Us</Link></li>
            <li><Link href="/contact" className="hover:translate-x-1 hover:text-primary transition-all inline-block">Contact</Link></li>
          </ul>
        </div>

        {/* Column 5: Contact Info */}
        <div className="col-span-2 md:col-span-1">
          <h3 className="font-bold text-slate-900 mb-6">Contact</h3>
          <ul className="space-y-4 text-slate-500">
            <li className="flex items-start gap-3">
              <svg className="mt-1 text-primary shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>D-507, 8th Floor, Shree Sawan Knowledge Park,<br />Turbhe, Navi Mumbai – 400703</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="text-primary shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <a href="tel:+919137950050" className="hover:text-primary transition-colors">+91 91379 50050</a>
            </li>
            <li className="flex items-start gap-3">
              <svg className="mt-0.5 text-primary shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="14" x="3" y="5" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
              <span><span className="font-semibold text-slate-600">RERA:</span> A51700000043</span>
            </li>
          </ul>
        </div>
      </div>

      {/* RERA Disclosure */}
      <div className="border-t border-slate-200 px-8 py-4 max-w-screen-2xl mx-auto">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-500">RERA Reg. No.:</span> A51700000043 &nbsp;|&nbsp;
          <span className="font-bold text-slate-500">Head Office:</span> D-507, 8th Floor, Shree Sawan Knowledge Park, Turbhe, Navi Mumbai – 400703
        </p>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 py-6 px-8 max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-slate-600 text-xs">© {currentYear} GrihaNivas. All rights reserved.</div>
        <div className="flex gap-6 text-xs font-bold text-slate-500">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Use</Link>
        </div>
      </div>
    </footer>
  );
}
