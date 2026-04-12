'use client';

import React from 'react';

const BlogBody = ({ post }) => {
  if (!post) return null;

  return (
    <article className="lg:col-span-8">
      {/* Article Body */}
      <div className="max-w-none text-slate-600 leading-[1.8] font-medium text-lg font-sans">
        <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tighter leading-tight" id="overview">
          Navigating the New Standard of Mumbai Opulence
        </h2>
        
        <p className="text-2xl mb-12 leading-[1.6] font-light text-slate-500 italic border-l-4 border-primary/20 pl-8">
          {post.excerpt || "As we move further into 2024, the South Mumbai real estate landscape is witnessing a seismic shift. No longer are \"standard\" luxury apartments enough for the city's elite."}
        </p>

        {/* Dynamic Content (Rendered as HTML for demo, but typically from CMS) */}
        <div 
          className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-slate-900 prose-p:mb-8 prose-strong:text-slate-900"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Specialized Blocks (Manual Layout for Demo) */}
        {!post.content && (
          <>
            <p className="mb-10">
              We are seeing a surge in demand for sky-villas and penthouses that offer more than just a pin code—they offer an ecosystem. 
              The prioritization of spatial luxury combined with concierge-level service is creating a new hierarchy in residential real estate.
            </p>

            {/* Key Takeaways Box */}
            <div className="bg-slate-50 rounded-[2.5rem] p-10 mb-16 border border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="text-primary font-black text-xl mb-8 flex items-center gap-3 uppercase tracking-widest text-xs">
                <span className="material-symbols-outlined scale-125">stars</span>
                Market Intelligence
              </h3>
              <ul className="space-y-6">
                {[
                  "A 22% increase in ultra-high-net-worth individual (UHNWI) inquiries for penthouses.",
                  "Privatization of amenities: In-home spas and infinity pools are becoming standard.",
                  "The 'Worli-Prabhadevi Corridor' remains the most coveted luxury stretch."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-5">
                    <div className="bg-primary/10 p-1.5 rounded-full mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="font-bold text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tighter" id="sobo">The Strategic Appeal of SoBo</h3>
            <p className="mb-10">
              South Mumbai, or 'SoBo', has always been the gold standard. However, the 2024 outlook suggests that the traditional heritage charm is now being married with cutting-edge architectural marvels. Developers are increasingly focusing on 'Air Rights', maximizing the height and panoramic views of the Arabian Sea.
            </p>

            {/* Figure with Caption */}
            <figure className="my-16 group">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 group-hover:shadow-3xl transition-shadow duration-700">
                <img 
                  alt="Mumbai Skyline" 
                  className="w-full h-[500px] object-cover transition-transform duration-1000 group-hover:scale-105" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKI5Aq7rPKSbLbJIiw1u5KvR9LCEn33XFlBYJt6HwAIU0PEgYO6U3XWqsjwqZ2URYOkqLPPRqgWTaGoul9hG94t96abix9glz9g3S2-1aiqX7BP5LWF7vaCpFUMnYOBaN4IM6rWw5kZb5_WAOu3ht0nv_wTfkSZDfHxtmshDN2fTRu3ft_lFRLPcI_cg8mNcYhr9NAyLcISj3E-ySVVKmK5YGdKPx5oD2hVSKam85NSiQw42pzoYUA5Ap144rVdvBjU0NvOn3L0P4" 
                />
              </div>
              <figcaption className="text-center text-xs font-black uppercase tracking-[0.3em] text-slate-400 mt-8">
                The panoramic perspective from a Typical Floor 50+ Penthouse in Worli.
              </figcaption>
            </figure>

            {/* Pro Tip Callout */}
            <div className="bg-primary/5 rounded-3xl p-8 mb-12 border border-primary/10 flex items-start gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined drop-shadow-md">lightbulb</span>
              </div>
              <div>
                <p className="font-black text-primary text-xs uppercase tracking-widest mb-2">Editorial Advice</p>
                <p className="text-slate-900 font-black text-lg">Properties in Worli are seeing a 15% YoY appreciation, outperforming the general Mumbai average.</p>
              </div>
            </div>

            <p className="mb-16">
              Investor confidence is fueled by the completion of several major infrastructure projects, including the Coastal Road, which has significantly reduced commute times between the northern suburbs and the luxury hubs of the south.
            </p>
          </>
        )}

        {/* In-Article CTA */}
        <div className="my-20 p-12 bg-slate-900 text-white rounded-[3rem] relative overflow-hidden flex flex-col md:flex-row items-center gap-10 group shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary opacity-20 -mr-16 -mt-16 rounded-full blur-[60px] group-hover:opacity-30 transition-opacity"></div>
          <div className="relative z-10 flex-1">
            <h4 className="text-3xl font-black tracking-tighter mb-4 leading-tight">Ready to find your <br/>piece of the sky?</h4>
            <p className="text-slate-400 font-medium leading-relaxed">Access our exclusive, off-market listings of luxury penthouses across South Mumbai.</p>
          </div>
          <button className="relative z-10 bg-primary text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-110 transition-transform active:scale-95 whitespace-nowrap">
            Browse Penthouses
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-3 mt-16 border-t border-slate-100 pt-10">
          {['South Mumbai', 'Luxury Real Estate', 'Investment', 'Penthouse Market'].map(tag => (
            <span key={tag} className="px-5 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary/20 transition-all cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default BlogBody;
