import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-gray-100/50 shadow-sm">
      <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
        {/* Brand Logo */}
        <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900">
          Mumbai Editorial
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-semibold tracking-tight text-sm text-slate-600">
          <div className="group relative py-2">
            <Link href="/buy" className="hover:text-primary transition-colors">Buy</Link>
          </div>
          <div className="group relative py-2">
            <Link href="/rent" className="hover:text-primary transition-colors">Rent</Link>
          </div>
          <div className="group relative py-2">
            <Link href="/commercial" className="hover:text-primary transition-colors">Commercial</Link>
          </div>
          <div className="group relative py-2">
            <Link href="/new-launch" className="hover:text-primary transition-colors">New Launch</Link>
          </div>
          <Link href="/blogs" className="hover:text-primary transition-colors">Blogs</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button className="text-slate-600 hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Login/Register</Link>
            <button className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold tracking-tight hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              List Your Property
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
