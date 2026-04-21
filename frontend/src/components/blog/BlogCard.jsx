import Image from 'next/image';
import Link from 'next/link';

export default function BlogCard({ post, blog }) {
  const item = post || blog;
  if (!item) return null;

  return (
    <article className="group flex flex-col h-full bg-white rounded-moderate overflow-hidden shadow-sm hover:shadow-lg transition-all">
      <div className="aspect-4/3 rounded-t-moderate overflow-hidden mb-0 relative">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm px-2.5 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-primary">
            {item.category}
          </span>
        </div>
      </div>
      
      <div className="p-4 sm:p-5 lg:p-6 flex flex-col grow">
        <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          <span>{item.date}</span>
          <span className="w-1 h-1 bg-primary rounded-full"></span>
          <span>{item.readTime}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold mb-2.5 sm:mb-3 text-slate-900 group-hover:text-primary transition-colors leading-tight">
          {item.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-5 sm:mb-6 line-clamp-2">
          {item.excerpt}
        </p>

        <Link 
          href={`/blogs/${item.slug}`} 
          className="mt-auto text-primary font-bold text-sm flex items-center gap-2 hover:underline"
        >
          Read More 
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </Link>
      </div>
    </article>
  );
}
