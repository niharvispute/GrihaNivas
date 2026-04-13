import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
      <p className="text-8xl font-black text-primary mb-4 tracking-tighter">404</p>
      <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Page Not Found</h1>
      <p className="text-slate-500 mb-10 max-w-sm font-medium leading-relaxed">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="bg-primary text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-primary/90 transition-all active:scale-95"
        >
          Back to Home
        </Link>
        <Link
          href="/buy"
          className="bg-slate-100 text-slate-700 px-8 py-3 rounded-full font-bold text-sm hover:bg-slate-200 transition-all"
        >
          Browse Properties
        </Link>
      </div>
    </div>
  );
}
