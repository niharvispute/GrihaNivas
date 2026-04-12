'use client';

import React from 'react';
import Link from 'next/link';

const BlogSidebar = () => {
  const categories = [
    { label: 'Market Trends', count: 12 },
    { label: 'Legal & Tax', count: 8 },
    { label: 'Lifestyle', count: 15 },
    { label: 'Interior Design', count: 6 },
  ];

  const related = [
    { 
      title: "New RERA Norms for Maharashtra in 2024", 
      tag: "Legal", 
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoHCk3ZAMMi7P7CG9ljigRfCwyC5cgNFudsYFs8PV23DpK_cpFLc6yNSGa-hW2nA7rQC1DXyNuaMfyHllJ4wpWfEcPSnWktZ_25QUpDGYmOlcpheUqmZD0JPMhVF1-E_Yzb3furCIlFBrdnF6BJZF1an3PslI9kNbfkXK5G5dmtKsJpfwa9znT2D-o-DL5wd8D8JMhVIf8-oc8HGcheVVdHsaeeJPSqDp5YCLGgS9wrq7EcxdZ41CIkCrZ2XIJ3xKBilWbjz5dxbE"
    },
    { 
      title: "Why Altamount Road is Still the Billionaire's Choice", 
      tag: "Market Trends", 
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk1R1cDDYdLrpshmnncrgienFgqsSBl5k2Hy-CfmSeODBF6_eRvpauXAKO1h2vcT6CA-IsVOt1fgBpAzLpfL8rxyCAIaqMTRIq5TfZ2WwCi0ac-7kqBwRULiQCIPzrDYEE7rAHePZYkTRuLHAuFoPmsbUYqq2Ar3VX5uTJnKtvX9GG8dCAGwpR3nJB5GWRlpDIbtbtZkYiKGYU5T_SuMI6FOg-5HqeOKNrdVXuOk3qHuLjWoher8gDiXydNg8E2d58V9HoWVJEnTg"
    }
  ];

  return (
    <aside className="lg:col-span-4 space-y-16">
      {/* Search Widget */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 group">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors font-black">search</span>
          <input 
            className="w-full bg-slate-50 border-none rounded-full py-5 pl-14 pr-8 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300" 
            placeholder="Search insights..." 
            type="text"
          />
        </div>
      </div>

      {/* Categories Widget */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-10 flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
          Categories
        </h4>
        <ul className="space-y-6">
          {categories.map((cat, i) => (
            <li key={i}>
              <Link href="#" className="flex justify-between items-center group">
                <span className="font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight">{cat.label}</span>
                <span className="bg-slate-50 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  {cat.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Related Articles Widget */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-10 flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
          Related Insights
        </h4>
        <div className="space-y-10">
          {related.map((post, i) => (
            <Link key={i} href="#" className="group flex gap-6">
              <div className="w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 shadow-lg border-4 border-white group-hover:rotate-3 transition-transform duration-500">
                <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{post.tag}</p>
                <h5 className="text-sm font-black text-slate-900 leading-tight group-hover:text-primary transition-colors tracking-tight line-clamp-2">
                  {post.title}
                </h5>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Card Widget */}
      <div className="bg-primary rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-primary/30 group">
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-10 border-b border-white/10 pb-4">
          Trending Assets
        </h4>
        <div className="space-y-10 relative z-10">
          {[
            { loc: "Worli, South Mumbai", name: "Lodha The Park • 4BHK", price: "18.5 Cr" },
            { loc: "Colaba, Mumbai", name: "Heritage Sky Mansion", price: "24.0 Cr" }
          ].map((item, i) => (
            <div key={i} className="group/item cursor-pointer">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">{item.loc}</p>
              <p className="font-black text-lg leading-tight group-hover/item:translate-x-1 transition-transform">{item.name}</p>
              <p className="text-3xl font-black mt-3 tracking-tighter text-white">₹{item.price}</p>
            </div>
          ))}
          <button className="w-full bg-white text-primary py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl shadow-black/10 hover:scale-[1.03] transition-all active:scale-95 mt-4">
            View All Listings
          </button>
        </div>
      </div>
    </aside>
  );
};

export default BlogSidebar;
