import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogBySlug } from '@/services/blogService';
import { listBlogs } from '@/services/blogService';
import { listProperties } from '@/services/propertyService';
import BlogHero from '@/components/blog/details/BlogHero';
import BlogBody from '@/components/blog/details/BlogBody';
import BlogSidebar from '@/components/blog/details/BlogSidebar';
import BlogComments from '@/components/blog/details/BlogComments';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const post = await getBlogBySlug(slug, { map: true });
    if (!post) return { title: 'Post Not Found' };

    return {
      title: `${post.title} | Mumbai Luxe Editorial`,
      description: post.excerpt,
    };
  } catch (error) {
    return { title: 'Blog Post' };
  }
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  
  let post = null;
  try {
    post = await getBlogBySlug(slug, { map: true });
  } catch (error) {
    console.error('Error fetching blog post:', error);
  }

  // Fallback for demo if API fails or post not found
  // Usually we would notFound() but for this specific implementation task
  // I'll ensure we have a fallback if slug is a specific one or generic
  if (!post && slug === 'luxury-penthouses-south-mumbai-2024') {
    post = {
      id: 'mock-1',
      slug: 'luxury-penthouses-south-mumbai-2024',
      title: 'The Rise of Luxury Penthouses in South Mumbai: 2024 Outlook',
      category: 'Market Trends',
      date: 'Jan 24, 2024',
      readTime: '8 min read',
      excerpt: 'As we move further into 2024, the South Mumbai real estate landscape is witnessing a seismic shift. No longer are "standard" luxury apartments enough for the city\'s elite.',
      content: '', // Let BlogBody handle the demo content if content is empty
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZBx1JA6Y8yMSFNOiyTMLQ35WdthsRgD3jPKwnTp197dCb-09I0uEEVzU0_n74I5rdlT35F31nl6O1kTmRCAw2MlgxKInVDTKoXJLVvBb63rJyRgZR0yMPbFUm8Lzgdo1emEp000tuP8Nr2UL647CiOdn9sJ7CNG3x1WKpOtCjcYPET3l_FVtfMRfSI_6xVyOtADO3q1t1vRzWmJJ8U-7SzJnYu3K2uenVzHGmXEXdnc5T0XtwbU7ehlSWmjxc4oFL1vxD-LnGKC0',
    };
  }

  if (!post) {
     return notFound();
  }

  let relatedPosts = [];
  let trendingAssets = [];

  try {
    const [relatedResponse, featuredPropertiesResponse] = await Promise.all([
      listBlogs(
        {
          category: post?.raw?.category || undefined,
          limit: 6,
          page: 1,
        },
        { map: true }
      ),
      listProperties(
        {
          isFeatured: true,
          sortBy: 'newest',
          limit: 2,
          page: 1,
        },
        { map: true }
      ),
    ]);

    relatedPosts = (relatedResponse?.items || [])
      .filter((item) => item?.slug && item.slug !== post.slug)
      .slice(0, 2);

    trendingAssets = (featuredPropertiesResponse?.items || []).slice(0, 2);
  } catch (error) {
    console.error('Error fetching sidebar data:', error);
    relatedPosts = [];
    trendingAssets = [];
  }

  return (
    <div className="bg-white min-h-screen">
      {/* 🚀 Hero Section */}
      <BlogHero post={post} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        {/* 🥖 Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-8 sm:mb-10 lg:mb-12">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-slate-200">/</span>
          <Link href="/blogs" className="hover:text-primary transition-colors">Insights</Link>
          <span className="text-slate-200">/</span>
          <span className="text-slate-400 line-clamp-1">{post.title}</span>
        </nav>

        {/* 📰 Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20 items-start">
          {/* Content Column */}
          <BlogBody post={post} />

          {/* Sidebar Column */}
          <BlogSidebar relatedPosts={relatedPosts} trendingAssets={trendingAssets} />
        </div>
      </main>

      {/* 💬 Discussions Section */}
      <BlogComments blogId={post.id} comments={post.comments} />

      {/* 📧 Newsletter Footer Integration (Optional - if not in global footer) */}
      <section className="mt-16 sm:mt-20 lg:mt-32 py-14 sm:py-16 lg:py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 sm:gap-10 lg:gap-12">
           <div className="max-w-xl">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">Subscribe to <br/><span className="text-primary italic">Mumbai Insights</span></h3>
              <p className="text-slate-500 font-medium text-sm sm:text-base lg:text-lg leading-relaxed">Get the latest market analysis and exclusive penthouse listings delivered to your inbox weekly.</p>
           </div>
           <form className="flex flex-col sm:flex-row w-full md:w-auto gap-3 sm:gap-4">
              <input 
                className="flex-1 md:w-80 bg-white border-none rounded-full px-6 sm:px-8 py-4 sm:py-5 text-sm font-bold shadow-2xl shadow-slate-200/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                placeholder="Email address" 
                type="email"
              />
              <button className="bg-primary text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all active:scale-95">Subscribe</button>
           </form>
        </div>
      </section>
    </div>
  );
}
