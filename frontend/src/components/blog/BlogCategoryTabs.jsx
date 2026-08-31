'use client';

import Link from 'next/link';
import { useLinkStatus } from 'next/link';

/**
 * Category tabs for the blog listing.
 *
 * The listing is server-rendered per category, so a click costs a round-trip
 * (~1-2s on production). Previously nothing on screen acknowledged the click,
 * which read as an unresponsive button. Each tab now shows a spinner the moment
 * it is pressed, and prefetches so the navigation itself is quicker.
 */

function TabSpinner() {
  const { pending } = useLinkStatus();

  if (!pending) return null;

  return (
    <span
      role="status"
      aria-label="Loading"
      className="inline-block w-3 h-3 shrink-0 rounded-full border-2 border-current border-r-transparent animate-spin"
    />
  );
}

export default function BlogCategoryTabs({ items = [], currentCategory = '' }) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {items.map((item) => {
        const isActive = currentCategory === item.value;

        return (
          <Link
            key={item.label}
            href={item.href}
            prefetch
            aria-current={isActive ? 'page' : undefined}
            className={`px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-black tracking-tight transition-all inline-flex items-center gap-2 ${
              isActive
                ? 'bg-primary text-white shadow-xl'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 active:scale-95'
            }`}
          >
            {item.label}
            <TabSpinner />
          </Link>
        );
      })}
    </div>
  );
}
