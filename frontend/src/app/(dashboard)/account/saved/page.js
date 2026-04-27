'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SavedPropertyCard from '@/components/dashboard/SavedPropertyCard';
import { getSavedProperties, unsaveProperty } from '@/services/userService';

export default function SavedPropertiesPage() {
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedProperties()
      .then(setSavedProperties)
      .catch(() => setSavedProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (propertyId) => {
    try {
      await unsaveProperty(propertyId);
      setSavedProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch {
      alert('Failed to remove property. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="h-16 bg-slate-100 rounded-2xl" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-52 bg-slate-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-100 pb-6 sm:pb-8 md:pb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-slate-900 tracking-tight">
            Saved <span className="text-primary ">Collection</span>
          </h1>
          <p className="text-slate-400 mt-2 font-bold uppercase tracking-[0.2em] text-[8px] sm:text-[10px]">
            {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'} curated for your consideration
          </p>
        </div>
      </div>

      {/* Properties List */}
      <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-8 sm:pb-12 md:pb-16">
        {savedProperties.length > 0 ? (
          savedProperties.map((property) => (
            <SavedPropertyCard
              key={property.id}
              property={property}
              onUnsave={() => handleUnsave(property.id)}
            />
          ))
        ) : (
          <div className="py-12 sm:py-16 md:py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="material-symbols-outlined text-3xl sm:text-4xl text-slate-300">favorite</span>
            </div>
            <h3 className="font-heading font-black text-slate-900 text-lg sm:text-xl md:text-2xl mb-2">No saved properties yet</h3>
            <p className="text-slate-400 font-bold mb-6 sm:mb-8 text-sm sm:text-base">Start exploring and save the ones you love.</p>
            <Link href="/buy" className="bg-primary text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-heading font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all inline-block">
              Browse Listings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
