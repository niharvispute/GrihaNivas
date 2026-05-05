'use client';

import React from 'react';
import { useMemo, useState } from 'react';
import { getErrorMessage } from '@/lib/api';
import { addBlogComment } from '@/services/blogService';

const formatCommentDate = (value) => {
  if (!value) return 'Just now';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Just now';
  return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const BlogComments = ({ blogId, comments = [] }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const normalizedComments = useMemo(
    () =>
      (Array.isArray(comments) ? comments : []).map((comment, index) => ({
        id: comment?._id || comment?.id || `${index}`,
        name: comment?.name || 'Guest',
        body: comment?.content || comment?.comment || '',
        date: formatCommentDate(comment?.createdAt || comment?.date),
      })),
    [comments]
  );

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!blogId) {
      setFeedback({ type: 'error', message: 'Unable to submit comment for this blog right now.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      await addBlogComment(blogId, {
        name: form.name.trim(),
        comment: form.comment.trim(),
      });

      setFeedback({
        type: 'success',
        message: 'Comment submitted. It will appear after moderation approval.',
      });
      setForm({ name: '', email: '', comment: '' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to submit your comment right now.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-16 sm:mt-20 lg:mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        <div className="lg:w-2/3">
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mb-8 sm:mb-10 lg:mb-12 tracking-tighter">
            Discussions <span className="text-primary ">({normalizedComments.length})</span>
          </h3>
          
          <div className="space-y-8 sm:space-y-10 lg:space-y-16 mb-12 sm:mb-16 lg:mb-20">
            {normalizedComments.length > 0 ? normalizedComments.map((comment) => (
              <div key={comment.id} className="flex gap-4 sm:gap-6 lg:gap-8 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-slate-100 shrink-0 flex items-center justify-center text-slate-300 font-black text-base sm:text-lg lg:text-xl border-2 border-white shadow-lg group-hover:scale-110 transition-transform">
                  {comment.name.charAt(0)}
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="font-black text-slate-900 tracking-tight text-base sm:text-lg">{comment.name}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{comment.date}</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed font-bold text-sm sm:text-base lg:text-lg max-w-3xl">
                    {comment.body}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-base font-bold text-slate-400">
                No approved discussions yet. Be the first to share your perspective.
              </p>
            )}
          </div>

          <div className="bg-slate-50 p-6 sm:p-8 lg:p-12 rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/50">
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 sm:mb-8 lg:mb-10 tracking-tighter flex items-center gap-3">
              <span className="material-symbols-outlined text-primary font-black">add_comment</span>
              Join the Dialogue
            </h4>
            <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Share your perspective</label>
                <textarea
                  className="w-full bg-white border-none rounded-2xl p-5 sm:p-6 lg:p-8 focus:ring-2 focus:ring-primary/20 text-sm sm:text-base lg:text-lg font-medium shadow-sm min-h-32 sm:min-h-40 placeholder:text-slate-200"
                  placeholder="What are your thoughts on this market outlook?" 
                  rows="4"
                  value={form.comment}
                  onChange={handleChange('comment')}
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Your Identity</label>
                  <input
                    className="w-full bg-white border-none rounded-full px-6 sm:px-8 py-4 sm:py-5 focus:ring-2 focus:ring-primary/20 text-sm font-bold shadow-sm"
                    placeholder="Full Name"
                    type="text"
                    value={form.name}
                    onChange={handleChange('name')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Credential Email</label>
                  <input
                    className="w-full bg-white border-none rounded-full px-6 sm:px-8 py-4 sm:py-5 focus:ring-2 focus:ring-primary/20 text-sm font-bold shadow-sm"
                    placeholder="Email Address"
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                  />
                </div>
              </div>
              {feedback.message && (
                <p className={`text-sm font-bold ${feedback.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                  {feedback.message}
                </p>
              )}
              <button
                className="w-full sm:w-auto bg-primary text-white px-10 sm:px-12 py-4 sm:py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Comment'}
              </button>
            </form>
          </div>
        </div>
        <div className="hidden lg:block lg:w-1/3">
          {/* Side spacing for alignment with Sidebar widgets */}
        </div>
      </div>
    </section>
  );
};

export default BlogComments;
