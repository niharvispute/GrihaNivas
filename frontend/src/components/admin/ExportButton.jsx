'use client';

import { useState } from 'react';

/**
 * Reusable Export button for admin list pages.
 *
 * @param {object}   props
 * @param {Function} props.onExport - async function triggered on click
 * @param {string}   props.label    - Button label (default: 'Export Excel')
 */
export default function ExportButton({ onExport, label = 'Export Excel' }) {
  const [exporting, setExporting] = useState(false);

  const handleClick = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await onExport();
    } catch (error) {
      alert(error?.message || 'Failed to export. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={exporting}
      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.18em] hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
      title="Download all records as Excel (.xlsx)"
    >
      <span className="material-symbols-outlined text-lg">
        {exporting ? 'hourglass_top' : 'download'}
      </span>
      <span>{exporting ? 'Exporting…' : label}</span>
    </button>
  );
}
