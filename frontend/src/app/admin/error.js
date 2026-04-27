'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({ error, unstable_retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Admin Panel Error</h2>
      <p className="text-slate-500 mb-8 max-w-sm font-bold">
        An error occurred while loading this admin page. Check the console for details.
      </p>
      <div className="flex gap-3">
        <button
          onClick={unstable_retry}
          className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-primary/90 transition-all active:scale-95"
        >
          Try Again
        </button>
        <Link
          href="/admin"
          className="bg-slate-100 text-slate-700 px-6 py-3 rounded-full font-bold text-sm hover:bg-slate-200 transition-all"
        >
          Admin Home
        </Link>
      </div>
    </div>
  );
}
