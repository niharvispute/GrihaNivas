'use client';

import { useState } from 'react';

export default function PropertyManagementPage() {
  const [selectedBHK, setSelectedBHK] = useState('3 BHK');

  const properties = [
    { id: 'PROP-4921', name: 'Skyline Tower A', type: 'New Launch', location: 'Worli', bhk: '3 BHK', price: '4.50 CR', status: 'Approved', statusColor: 'bg-emerald-100 text-emerald-700', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWTGafz7X6PPAlK_5rNLfnvxuoei2g6qjSQuBojxFVzudVknSIx8xdSawNI6Xtek_P61OIS3DfohCAdxhACwhqzXIvtgojfKmxCuFBq5Crt2YKJhcj93RtTOhR3KdUe4xeImUbbs9jTnaWgyPs02zDE6DCqSZHnoNRMo32FyZ23v3bwN0lQn_2F9WK3nH3vJhA4dyzh7NziwJr-3AnWhuobxdoEQVBOdrYrC-xG50_jelEw4XKehsVmX52hrgZ-s77_stfVIJ-NBc' },
    { id: 'PROP-8812', name: 'Ocean View Estates', type: 'Buy', location: 'Bandra West', bhk: '4 BHK', price: '12.20 CR', status: 'Pending', statusColor: 'bg-amber-100 text-amber-700', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmtMkb_V6GSvuurf78Y-0urg-BfUVaXY_4z0ycgHVMbezZPViPzpyRKZTEcHhk2m5DgZLQJYYFuDTr2_5Vrn-aJzStJIISAsiB7bW51mvue02ww6D5j8Rw3_NVp-BJuBxTfg2IMaX9hUN6KRqSWtSUKZ_aScivERMKWqBwbCGNsY9_mebLVNTB45j8rGVW03C09B0iRI9uAhbe7gRnpQT9bPf_TsODFzhPondWQlfUuV2fU9oJm-oB5iOf0CQSnDy2_KapS_sZwrY' },
    { id: 'PROP-2105', name: 'Corporate Plaza X', type: 'Commercial', location: 'BKC', bhk: 'N/A', price: '25.00 CR', status: 'Approved', statusColor: 'bg-emerald-100 text-emerald-700', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5Di86U0I58pWRhEXFLdgJQOwGGHA3m2REVNLWIzpoNHwoCOQkBR1YJAfmMsoIP9TuBzHZ3SBIFpWdqXv-C_s_cSmDjgUjDSQD0xm4sct7wzqlt83Wpj2RqLHh-_TpC7gTsMZU6SmP_ZZ8TJ5vLsIBOSaadY6hemCLHLIyRVM9Np6TRrMKU7HJ39d360KTCeLbl2pANP-8QDdjPspfJUenqtF6NWmHMmDWYZYKyWZa6RstCimokD0f98QoTgIzhjRrxUAQ2lzEFAE' }
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* 🏙️ Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Properties</h1>
          <p className="text-slate-500 font-bold mt-2">Manage your active real estate listings and portfolio.</p>
        </div>
        <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-primary/90 transition-all active:scale-95 shadow-2xl shadow-primary/20">
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Add Property
        </button>
      </div>

      {/* 🔍 Advanced Filters */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-wrap gap-8 items-end">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Asset Type</label>
          <div className="relative group">
            <select className="w-full appearance-none bg-slate-50 border border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer">
              <option>All Types</option>
              <option>Buy</option>
              <option>Rent</option>
              <option>Commercial</option>
              <option>New Launch</option>
            </select>
            <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-lg group-hover:text-primary transition-colors">keyboard_arrow_down</span>
          </div>
        </div>
        <div className="flex-1 min-w-[240px]">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">MMR Region</label>
          <div className="relative group">
            <select className="w-full appearance-none bg-slate-50 border border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer">
              <option>All Locations</option>
              <option>South Mumbai</option>
              <option>Bandra West</option>
              <option>Worli</option>
              <option>Andheri East</option>
            </select>
            <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-lg group-hover:text-primary transition-colors">location_on</span>
          </div>
        </div>
        <div className="flex-1 min-w-[240px]">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Price Tier</label>
          <div className="relative group">
            <select className="w-full appearance-none bg-slate-50 border border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer">
              <option>Any Price</option>
              <option>Under 2 CR</option>
              <option>2 - 5 CR</option>
              <option>5 - 10 CR</option>
              <option>10+ CR</option>
            </select>
            <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-lg group-hover:text-primary transition-colors">payments</span>
          </div>
        </div>
        <button className="bg-slate-50 text-slate-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 shadow-sm">
          Reset Console
        </button>
      </div>

      {/* 📁 Properties Table */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-50 overflow-hidden hover:shadow-2xl transition-all">
        <div className="overflow-x-auto px-6 pb-6 mt-6">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-6 py-4">Asset Portfolio</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Geography</th>
                <th className="px-6 py-4">Specs</th>
                <th className="px-6 py-4 text-right">Valuation</th>
                <th className="px-6 py-4 text-center">RERA Status</th>
                <th className="px-6 py-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="space-y-4">
              {properties.map((prop, i) => (
                <tr key={i} className="bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group rounded-3xl">
                  <td className="px-6 py-6 rounded-l-3xl">
                    <div className="flex items-center gap-5">
                      <img src={prop.img} alt={prop.name} className="w-16 h-16 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform" />
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{prop.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {prop.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm font-bold text-slate-500">{prop.type}</td>
                  <td className="px-6 py-6 text-sm font-black text-slate-900 tracking-tight italic">{prop.location}</td>
                  <td className="px-6 py-6 text-sm font-bold text-slate-500">{prop.bhk}</td>
                  <td className="px-6 py-6 text-right text-sm font-black text-slate-900 tracking-tighter italic text-lg">{prop.price}</td>
                  <td className="px-6 py-6 text-center">
                    <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${prop.statusColor}`}>
                      {prop.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right rounded-r-3xl">
                    <div className="flex items-center justify-end gap-3">
                      <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-10 py-8 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing 1-10 of 154 properties</span>
          <div className="flex gap-3">
            <button className="w-10 h-10 flex items-center justify-center border border-slate-100 rounded-xl bg-white hover:border-primary transition-all shadow-sm disabled:opacity-30" disabled>
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-primary bg-primary text-white rounded-xl font-black text-xs shadow-lg shadow-primary/20">1</button>
            <button className="w-10 h-10 flex items-center justify-center border border-slate-100 rounded-xl bg-white hover:border-primary transition-all shadow-sm">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🚀 Property Form Section (Integrated Editor) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Form Column */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-50 group hover:shadow-2xl transition-all">
            <div className="flex items-center gap-5 mb-12">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">add_business</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Property Specifications</h3>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Property Title</label>
                  <input className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 placeholder:text-slate-300 transition-all font-body" placeholder="e.g. Skyline Residency" type="text"/>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Price (in CR)</label>
                  <input className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 placeholder:text-slate-300 transition-all font-body" placeholder="e.g. 5.25" step="0.01" type="number"/>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Location Details</label>
                  <input className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 placeholder:text-slate-300 transition-all font-body" placeholder="e.g. Bandra West, Mumbai" type="text"/>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">BHK Configuration</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 text-slate-900 transition-all font-body appearance-none cursor-pointer"
                    onChange={(e) => setSelectedBHK(e.target.value)}
                    value={selectedBHK}
                  >
                    <option>Select BHK</option>
                    <option>1 BHK</option>
                    <option>2 BHK</option>
                    <option>3 BHK</option>
                    <option>4 BHK+</option>
                    <option>Penthouse</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Narrative Description</label>
                <textarea className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 placeholder:text-slate-300 transition-all font-body resize-none" placeholder="Detailed property features, amenities, and connectivity info..." rows="5"></textarea>
              </div>
            </div>
          </div>

          {/* Media Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-50 flex flex-col h-full hover:shadow-2xl transition-all group">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Asset Visualization</h3>
              <div className="flex-1 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-12 bg-slate-50/50 hover:bg-white hover:border-primary transition-all cursor-pointer group/upload">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover/upload:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                </div>
                <p className="text-base font-black text-slate-900 tracking-tight">Upload Portfolio Images</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3 text-center leading-relaxed">PNG, JPG up to 10MB.<br/>Max 12 files.</p>
              </div>
            </div>
            <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-50 flex flex-col h-full hover:shadow-2xl transition-all group">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Legal Documentation</h3>
              <div className="flex-1 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-12 bg-slate-50/50 hover:bg-white hover:border-primary transition-all cursor-pointer group/upload">
                <div className="w-20 h-20 rounded-3xl bg-slate-200 flex items-center justify-center text-slate-500 mb-6 group-hover/upload:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">picture_as_pdf</span>
                </div>
                <p className="text-base font-black text-slate-900 tracking-tight">Upload E-Brochure</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3 text-center leading-relaxed">PDF format only.<br/>Max 25MB.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Side Action Column */}
        <div className="space-y-10">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-50 hover:shadow-2xl transition-all">
            <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tighter">Inventory Console</h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-50 group hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">visibility</span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Visibility</span>
                </div>
                <span className="text-xs font-black text-primary uppercase tracking-widest">Public</span>
              </div>
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-50 group hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">verified_user</span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">RERA Verified</span>
                </div>
                <input className="w-6 h-6 rounded-lg text-primary focus:ring-primary/20 border-slate-200 cursor-pointer" type="checkbox" defaultChecked />
              </div>
              <button className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-6">
                Commit Changes
              </button>
              <button className="w-full py-5 border-2 border-slate-100 text-slate-400 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-slate-900 transition-all">
                Discard Prototype
              </button>
            </div>
          </div>

          {/* Premium Promotion */}
          <div className="bg-slate-950 p-10 rounded-[3.5rem] shadow-2xl shadow-slate-900/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4 tracking-tighter">Premium Listing</h3>
              <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">Boost your asset to the top of editorial search results and capture 5x more verified leads.</p>
              <button className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20">
                Go Premium
              </button>
            </div>
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/20 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
          </div>

          {/* Location Preview */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all group">
            <div className="flex items-center gap-4 mb-8">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">map</span>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Localization Preview</h4>
            </div>
            <div className="h-64 rounded-[2.5rem] bg-slate-50 relative overflow-hidden border border-slate-200 shadow-inner group-hover:border-primary/20 transition-all">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdaTEsAv8R-9Q8nyj8n0oHuJaycd1B_Kq5Fxm4ISV3cBWwZ8doD7jH7GoLSPCwNQgvPSHH6CEbWYzzcJ7t3_qG-YHLVWzXYSAYE9S-6N4v-dbl9CU8FlDgyIJy_qZZFgliXQujL-kgtTw03oCqmqUIH91c4CLwEMSa-Beb3aL63_PPYxcgyGkmnmxvjHoYQMZ0TaF3bZj14rzG0c5vEBRdxrKwLsuI6L5c4onz1aMk48qTCiIl6xbwjStqEGkBag6k1c-nihHK9NE" 
                alt="Map Preview" 
                className="w-full h-full object-cover grayscale opacity-40 group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-primary rounded-full border-4 border-white shadow-2xl animate-pulse flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-6 text-center leading-relaxed">
              Satellite view and heatmapping available in premium mode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
