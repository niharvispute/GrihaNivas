import {
  estimateReadTime,
  formatDateLabel,
  titleCase,
} from '@/lib/mappers/formatters';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80';

export const mapBlogToCardVM = (blog) => ({
  id: blog?._id,
  slug: blog?.slug,
  title: blog?.title || '',
  category: titleCase(blog?.category),
  date: formatDateLabel(blog?.publishedAt || blog?.createdAt),
  readTime: estimateReadTime(blog?.content || blog?.excerpt),
  excerpt: blog?.excerpt || '',
  image: blog?.featuredImage?.url || FALLBACK_IMAGE,
  raw: blog,
});

export const mapBlogToDetailVM = (blog) => ({
  id: blog?._id,
  slug: blog?.slug,
  title: blog?.title || '',
  category: titleCase(blog?.category),
  date: formatDateLabel(blog?.publishedAt || blog?.createdAt),
  readTime: estimateReadTime(blog?.content),
  excerpt: blog?.excerpt || '',
  content: blog?.content || '',
  image: blog?.featuredImage?.url || FALLBACK_IMAGE,
  comments: Array.isArray(blog?.comments) ? blog.comments : [],
  raw: blog,
});

export const mapBlogListToCardVM = (blogs = []) => blogs.map(mapBlogToCardVM);
