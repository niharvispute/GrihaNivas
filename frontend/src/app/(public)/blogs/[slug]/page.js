import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogBySlug } from '@/services/blogService';

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;

  let blog = null;
  try {
    blog = await getBlogBySlug(slug);
  } catch {
    blog = null;
  }

  if (!blog) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto px-6 lg:px-8 pt-12 pb-20">
      <nav aria-label="Breadcrumb" className="flex text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">
        <ol className="inline-flex items-center space-x-2">
          <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li className="flex items-center">
            <svg className="w-3 h-3 mx-1 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            <Link href="/blogs" className="hover:text-primary transition-colors">Blogs</Link>
          </li>
          <li className="flex items-center">
            <svg className="w-3 h-3 mx-1 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            <span className="text-primary truncate max-w-60">{blog.title}</span>
          </li>
        </ol>
      </nav>

      <article className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="aspect-16/8 overflow-hidden">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-8 md:p-12">
          <div className="mb-6 flex flex-wrap items-center gap-3 text-slate-400 text-xs font-black uppercase tracking-widest">
            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full">{blog.category}</span>
            <span>{blog.date}</span>
            <span className="w-1 h-1 bg-primary rounded-full"></span>
            <span>{blog.readTime}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-6">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-lg text-slate-500 leading-relaxed font-medium mb-8">
              {blog.excerpt}
            </p>
          )}

          <div className="prose prose-slate max-w-none whitespace-pre-line leading-relaxed">
            {blog.content || 'This article content will be available soon.'}
          </div>
        </div>
      </article>

      <section className="mt-12">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Comments</h2>
        <div className="space-y-4">
          {(blog.comments || []).length === 0 && (
            <p className="text-sm text-slate-500">No comments yet.</p>
          )}

          {(blog.comments || []).map((comment, index) => (
            <div key={comment._id || index} className="bg-white rounded-2xl border border-slate-100 p-6">
              <p className="font-bold text-slate-900 mb-1">{comment.name}</p>
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">
                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-IN') : ''}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {comment.content || comment.comment}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
