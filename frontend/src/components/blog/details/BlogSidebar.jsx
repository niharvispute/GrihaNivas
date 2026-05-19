import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const FALLBACK_RELATED_IMAGE =
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80';

const BlogSidebar = ({ relatedPosts = [], trendingAssets = [] }) => {

  return (
    <aside className="lg:col-span-4 space-y-8 sm:space-y-10 lg:space-y-16">
      {/* Related Articles Widget */}
      <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-50">
        <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 sm:mb-8 lg:mb-10 flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
          Related Insights
        </h4>
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          {relatedPosts.length > 0 ? relatedPosts.map((post) => (
            <Link key={post.slug || post.id} href={`/blogs/${post.slug}`} className="group flex gap-4 sm:gap-5 lg:gap-6">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg border-4 border-white group-hover:rotate-3 transition-transform duration-500">
                <Image src={post.image || FALLBACK_RELATED_IMAGE} alt={post.title} fill sizes="96px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{post.category || 'Insight'}</p>
                <h5 className="text-sm sm:text-[15px] font-black text-slate-900 leading-tight group-hover:text-primary transition-colors tracking-tight line-clamp-2">
                  {post.title}
                </h5>
              </div>
            </Link>
          )) : (
            <p className="text-sm font-bold text-slate-400">Related insights will appear here shortly.</p>
          )}
        </div>
      </div>

      {/* Trending Card Widget */}
      <div className="bg-primary rounded-2xl p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl group">
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
        <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-6 sm:mb-8 lg:mb-10 border-b border-white/10 pb-4">
          Trending Assets
        </h4>
        <div className="space-y-6 sm:space-y-8 lg:space-y-10 relative z-10">
          {trendingAssets.length > 0 ? trendingAssets.map((item) => {
            const location = item?.location || 'Mumbai';
            const name = `${item?.title || 'Featured Property'}${item?.bhk && item.bhk !== '-' ? ` • ${item.bhk}BHK` : ''}`;
            const priceText = item?.price ? `₹${item.price}${item.priceSuffix || ''}` : 'Price on request';

            return (
              <Link key={item.id || item.slug} href={`/property/${item.slug || item.id}`} className="block group/item cursor-pointer">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">{location}</p>
                <p className="font-black text-base sm:text-lg leading-tight group-hover/item:translate-x-1 transition-transform">{name}</p>
                <p className="text-2xl sm:text-3xl font-black mt-2 sm:mt-3 tracking-tighter text-white">{priceText}</p>
              </Link>
            );
          }) : (
            <p className="text-sm font-bold text-white/70">Featured assets will appear here shortly.</p>
          )}
          <Link href="/buy" className="block w-full bg-white text-primary py-4 rounded-full text-center font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-black/10 hover:scale-[1.03] transition-all active:scale-95 mt-2 sm:mt-4">
            View All Listings
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default BlogSidebar;
