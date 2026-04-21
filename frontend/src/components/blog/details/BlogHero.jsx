'use client';

import React from 'react';
import Image from 'next/image';

const BlogHero = ({ post }) => {
  if (!post) return null;

  return (
    <header className="relative pt-16 sm:pt-20 lg:pt-24 min-h-130 sm:min-h-140 lg:min-h-150 flex items-center overflow-hidden">
      {/* Background Image & Gradient */}
      <div className="absolute inset-0 z-0">
        <Image
          alt={post.title}
          fill
          sizes="100vw"
          className="object-cover"
          src={post.image || 'https://images.unsplash.com/photo-1600607687940-47a04f92bb1f?auto=format&fit=crop&q=80&w=1200'}
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-12 sm:pt-16 lg:pt-20">
        <div className="max-w-3xl">
          <span className="inline-block px-4 sm:px-5 py-2 rounded-full bg-primary/20 backdrop-blur-md text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mb-5 sm:mb-6 lg:mb-8 border border-white/10">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tighter mb-6 sm:mb-8 lg:mb-10 drop-shadow-2xl">
            {post.title}
          </h1>
          <div className="text-white/80 font-medium">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-60">
              {post.date} • {post.readTime}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default BlogHero;
