import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogBySlug } from '@/services/blogService';
import { listBlogs } from '@/services/blogService';
import { listProperties } from '@/services/propertyService';
import BlogHero from '@/components/blog/details/BlogHero';
import BlogBody from '@/components/blog/details/BlogBody';
import BlogSidebar from '@/components/blog/details/BlogSidebar';
import BlogBottomSubscription from '@/components/blog/BlogBottomSubscription';
import BlogComments from '@/components/blog/details/BlogComments';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const post = await getBlogBySlug(slug, { map: true });
    if (!post) return { title: 'Post Not Found' };

    const image = post.coverImage?.url || post.coverImage || null;
    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: `${post.title} | GrihaNivas`,
        description: post.excerpt,
        type: 'article',
        publishedTime: post.createdAt,
        ...(image && { images: [{ url: image, width: 1200, height: 630, alt: post.title }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
        ...(image && { images: [image] }),
      },
    };
  } catch {
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

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bricksmumbai.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    url: `${SITE_URL}/blogs/${post.slug}`,
    image: post.coverImage?.url || post.coverImage || undefined,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: { '@type': 'Organization', name: 'Ghar Mumbai' },
    publisher: {
      '@type': 'Organization',
      name: 'Ghar Mumbai',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  };

  return (
    <div className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
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

      {/* 📧 Newsletter Footer Integration */}
      <section className="mt-16 sm:mt-20 lg:mt-32 py-14 sm:py-16 lg:py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlogBottomSubscription />
        </div>
      </section>
    </div>
  );
}
