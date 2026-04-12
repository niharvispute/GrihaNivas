'use client';

import React from 'react';

const BlogHero = ({ post }) => {
  if (!post) return null;

  return (
    <header className="relative pt-24 min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image & Gradient */}
      <div className="absolute inset-0 z-0">
        <img 
          alt={post.title} 
          className="w-full h-full object-cover" 
          src={post.image || 'https://images.unsplash.com/photo-1600607687940-47a04f92bb1f?auto=format&fit=crop&q=80&w=1200'} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 w-full pt-20">
        <div className="max-w-3xl">
          <span className="inline-block px-5 py-2 rounded-full bg-primary/20 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-[0.2em] mb-8 border border-white/10">
            {post.category}
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter mb-10 drop-shadow-2xl">
            {post.title}
          </h1>
          <div className="flex items-center gap-5 text-white/80 font-medium">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
              <img 
                alt="Author" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDw5aYWyBGdKKh4dyvOnrSUdWaL9ebJJ-Vfgw6hOXR9PAb6R640fkbOC5au0X3APBGreRjsJbz_WVd_3nTAz8x__iL_rBIGGAf7mmtt7urYKkcPUJTmqnq44F_5Eo3EtaQkPQvgMVyS8pfoX2oOk44TxFqmGIDlGbw_VA_N3UNop3N7TEtpBO2hKMK8GVrK5Tiawe9zIzKAoFmGVLxP1AV0s1s93xHZbMa2z3AGH2IorWr3WIx-I-YaFVcPOTQIbemKjmNCy0_j3CA" 
              />
            </div>
            <div className="space-y-1">
              <p className="text-white font-black tracking-tight text-lg">Vikram Oberoi</p>
              <p className="text-xs font-black uppercase tracking-widest opacity-60">
                {post.date} • {post.readTime}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default BlogHero;
