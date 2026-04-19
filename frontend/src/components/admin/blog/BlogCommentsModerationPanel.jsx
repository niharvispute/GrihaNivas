'use client';

import React from 'react';
import Link from 'next/link';

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function BlogCommentsModerationPanel({
  comments = [],
  loading = false,
  onApprove,
  onDelete,
}) {
  return (
    <section className="bg-white rounded-4xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="p-8 sm:p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-2xl text-slate-900 tracking-tighter">Comments Moderation</h3>
          <p className="text-slate-500 text-sm font-medium mt-1">Review and approve pending blog discussions.</p>
        </div>
        <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
          Pending: {comments.length}
        </span>
      </div>

      <div className="p-6 sm:p-8">
        {loading ? (
          <div className="py-14 flex items-center justify-center text-slate-400 text-sm font-semibold">
            Loading pending comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="py-14 text-center text-slate-400 text-sm font-semibold">
            No pending comments. Everything is up to date.
          </div>
        ) : (
          <div className="space-y-5">
            {comments.map((comment) => (
              <div key={`${comment.blogId}-${comment.commentId}`} className="border border-slate-100 rounded-2xl p-5 sm:p-6 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-black text-slate-900 tracking-tight">{comment.name || 'Guest'}</p>
                    <p className="text-[11px] uppercase tracking-widest font-black text-slate-400 mt-1">{formatDate(comment.createdAt)}</p>
                    {comment.email ? (
                      <p className="text-xs text-slate-500 mt-1 font-semibold">{comment.email}</p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onApprove?.(comment.blogId, comment.commentId)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(comment.blogId, comment.commentId)}
                      className="px-4 py-2 rounded-xl bg-white border border-red-200 text-red-600 text-[11px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-4">{comment.content}</p>

                <Link
                  href={`/blogs/${comment.blogSlug}`}
                  className="text-xs font-black uppercase tracking-widest text-primary hover:underline"
                >
                  Open: {comment.blogTitle}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
