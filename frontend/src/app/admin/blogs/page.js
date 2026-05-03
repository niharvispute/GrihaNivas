'use client';

import React, { useState, useEffect } from 'react';
import {
  listBlogsAdmin,
  getBlogByIdAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
  listBlogCommentsAdmin,
  approveBlogComment,
  deleteBlogComment,
} from '@/services/blogService';
import { getErrorMessage } from '@/lib/api/errors';
import BlogManagementTable from '@/components/admin/blog/BlogManagementTable';
import BlogEditorForm from '@/components/admin/blog/BlogEditorForm';
import BlogCommentsModerationPanel from '@/components/admin/blog/BlogCommentsModerationPanel';

export default function AdminBlogCMS() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingComments, setPendingComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    fetchBlogs();
    fetchPendingComments();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await listBlogsAdmin({ limit: 50 }, { map: true });
      setBlogs(response.items || []);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingComments = async () => {
    setLoadingComments(true);
    try {
      const response = await listBlogCommentsAdmin({ status: 'pending', limit: 50, page: 1 });
      setPendingComments(response.items || []);
    } catch (error) {
      console.error('Failed to fetch blog comments:', error);
      setPendingComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this post? This action is irreversible.')) {
      try {
        await deleteBlog(id);
        setBlogs(prev => prev.filter(b => b.id !== id));
      } catch (error) {
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const handleApproveComment = async (blogId, commentId) => {
    try {
      await approveBlogComment(blogId, commentId);
      setPendingComments((prev) => prev.filter((item) => item.commentId !== commentId));
    } catch (error) {
      alert(getErrorMessage(error, 'Failed to approve comment.'));
    }
  };

  const handleDeleteComment = async (blogId, commentId) => {
    if (!confirm('Delete this comment permanently?')) return;

    try {
      await deleteBlogComment(blogId, commentId);
      setPendingComments((prev) => prev.filter((item) => item.commentId !== commentId));
    } catch (error) {
      alert(getErrorMessage(error, 'Failed to delete comment.'));
    }
  };

  const handleEdit = async (post) => {
    setLoading(true);
    try {
      // Fetch full post details including content/body
      const fullPost = await getBlogByIdAdmin(post.id, { map: true });
      setEditingPost(fullPost);
      setIsAddingNew(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert('Failed to load post details for editing.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingPost(null);
    setIsAddingNew(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (data) => {
    setIsSaving(true);
    try {
      if (editingPost?.id) {
        await updateBlog(editingPost.id, data);
      } else {
        await createBlog(data);
      }
      setEditingPost(null);
      setIsAddingNew(false);
      fetchBlogs();
    } catch (error) {
      const detailMessage = Array.isArray(error?.details) && error.details.length
        ? error.details.map((item) => `${item.field || 'field'}: ${item.message}`).join('\n')
        : null;
      alert(detailMessage || getErrorMessage(error, 'Failed to save post. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Dynamic View Toggling */}
      {(editingPost || isAddingNew) ? (
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-10">
            <button 
              onClick={() => { setEditingPost(null); setIsAddingNew(false); }}
              className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
              {editingPost ? 'Refining Post' : 'Crafting New Insight'}
            </h2>
          </div>
          
          <BlogEditorForm
            initialData={editingPost || {}}
            onSave={handleSave}
            onCancel={() => { setEditingPost(null); setIsAddingNew(false); }}
            isSaving={isSaving}
          />
        </section>
      ) : (
        <section className="animate-in fade-in duration-700">
           <div className="flex justify-between items-end mb-12">
              <div>
                <h1 className="text-5xl font-black tracking-tighter text-slate-900 lg:text-6xl">
                  Content <span className="text-primary ">Engine</span>
                </h1>
                <p className="text-slate-500 font-bold text-lg mt-4 max-w-xl">
                  Curate the digital face of Mumbai Luxe. Manage your editorial pipeline with precision and scale.
                </p>
              </div>
           </div>

           {loading ? (
             <div className="py-32 flex flex-col items-center justify-center text-slate-300">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                <span className="text-xs font-black uppercase tracking-widest">Accessing Archive...</span>
             </div>
           ) : (
             <>
               <BlogManagementTable 
                  blogs={blogs} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  onAddNew={handleAddNew}
               />
               <BlogCommentsModerationPanel
                 comments={pendingComments}
                 loading={loadingComments}
                 onApprove={handleApproveComment}
                 onDelete={handleDeleteComment}
               />
             </>
           )}

        </section>
      )}
    </div>
  );
}
