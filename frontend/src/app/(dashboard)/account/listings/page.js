'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ListedPropertyCard from '@/components/dashboard/ListedPropertyCard';
import { listMyPropertySubmissions, deactivateMyPropertySubmission, reactivateMyPropertySubmission } from '@/services/propertySubmissionService';

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyPropertySubmissions()
      .then((res) => {
        setListings(res.items || []);
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDeactivate = async (id) => {
    const updated = await deactivateMyPropertySubmission(id);
    setListings((prev) => prev.map((l) => (l._id === id ? { ...l, ...updated } : l)));
  };

  const handleReactivate = async (id) => {
    const updated = await reactivateMyPropertySubmission(id);
    setListings((prev) => prev.map((l) => (l._id === id ? { ...l, ...updated } : l)));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="h-16 bg-slate-100 rounded-2xl" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-slate-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">
            My <span className="text-primary ">Listings</span>
          </h1>
          <p className="text-slate-400 mt-2 font-black uppercase tracking-[0.25em] text-[10px]">
            {listings.length} {listings.length === 1 ? 'property' : 'properties'} submitted for review
          </p>
        </div>
        <Link 
          href="/list-property" 
          className="bg-primary text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-primary/90 transition-all active:scale-95"
        >
          List New Property
        </Link>
      </div>

      {/* Listings List */}
      <div className="space-y-6 md:space-y-8 pb-16">
        {listings.length > 0 ? (
          listings.map((property) => (
            <ListedPropertyCard
              key={property._id}
              property={property}
              onDeactivate={handleDeactivate}
              onReactivate={handleReactivate}
            />
          ))
        ) : (
          <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-slate-300">home_work</span>
            </div>
            <h3 className="font-black text-slate-900 text-2xl mb-2 tracking-tight">No properties listed yet</h3>
            <p className="text-slate-400 font-bold mb-10 text-sm max-w-sm mx-auto uppercase tracking-wide">Ready to showcase your property to Mumbai's elite?</p>
            <Link href="/list-property" className="bg-primary text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-primary/90 transition-all inline-block">
              Start Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
