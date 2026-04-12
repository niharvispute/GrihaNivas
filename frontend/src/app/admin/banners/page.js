'use client';

import React, { useState, useEffect } from 'react';
import { listBanners } from '@/services/bannerService';
import BannerSlotCard from '@/components/admin/banners/BannerSlotCard';

export default function BannerManagementPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await listBanners();
      setBanners(data);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplace = (id) => {
    // In a real app, this would trigger a file upload modal
    alert(`Asset update requested for slot ID: ${id}. Initializing secure upload tunnel...`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-16">
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 lg:text-7xl">
          Visual <span className="text-primary italic">Identity</span>
        </h1>
        <p className="text-slate-500 font-medium text-xl mt-6 max-w-2xl leading-relaxed">
          Manage and optimize the high-impact visual banners on your platform's main entrance. Every pixel defines the "Bricks" experience.
        </p>
      </div>

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center text-slate-300">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Rendering Assets...</span>
        </div>
      ) : (
        <div className="space-y-12">
          {banners.map((banner) => (
            <BannerSlotCard 
              key={banner.id} 
              banner={banner} 
              onReplace={handleReplace} 
            />
          ))}
        </div>
      )}

      {/* Strategic Optimization Widgets (Bento Grid Style) */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary opacity-10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:opacity-20 transition-all duration-700"></div>
          <div className="flex items-start gap-8 relative z-10">
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md text-primary">
              <span className="material-symbols-outlined text-3xl font-black">auto_awesome</span>
            </div>
            <div>
              <h4 className="text-2xl font-black tracking-tight mb-4">Responsive Orchestration</h4>
              <p className="text-slate-400 font-medium leading-[1.8] text-lg">
                Our platform automatically generates optimized responsive variants of your banners for mobile, tablet, and retina-desktop viewports.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex items-start gap-8 group">
          <div className="bg-primary/10 p-4 rounded-3xl text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl font-black">analytics</span>
          </div>
          <div>
            <h4 className="text-2xl font-black tracking-tight mb-4 text-slate-900">Engagement Intelligence</h4>
            <p className="text-slate-500 font-medium leading-[1.8] text-lg">
              Click-through rates (CTR) and interaction heatmaps are tracked for every banner slot to help you optimize visual performance.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="mt-32 py-12 text-center border-t border-slate-50">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
           © 2026 BRICKS ADMINISTRATIVE CONSOLE • Visual Engine v4.0
        </p>
      </footer>
    </div>
  );
}
