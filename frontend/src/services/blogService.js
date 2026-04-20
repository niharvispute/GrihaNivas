import { apiFetch } from '@/lib/api';
import { authedApiFetch } from '@/lib/api/authedRequest';
import { mapBlogListToCardVM, mapBlogToDetailVM } from '@/lib/mappers/blogMapper';

const isRateLimitError = (error) => Number(error?.status) === 429;

export const listBlogs = async (query = {}, { map = true } = {}) => {
  try {
    const res = await apiFetch('/api/blogs', { query });
    return {
      items: map ? mapBlogListToCardVM(res.data || []) : res.data || [],
      meta: res.meta,
      message: res.message,
      rateLimited: false,
    };
  } catch (error) {
    if (isRateLimitError(error)) {
      return {
        items: [],
        meta: null,
        message: error?.message || 'Too many requests. Please try again later.',
        rateLimited: true,
      };
    }
    throw error;
  }
};

export const getBlogBySlug = async (slug, { map = true } = {}) => {
  const res = await apiFetch(`/api/blogs/${slug}`);
  return map ? mapBlogToDetailVM(res.data) : res.data;
};

export const addBlogComment = async (blogId, payload) => {
  const res = await apiFetch(`/api/blogs/${blogId}/comments`, {
    method: 'POST',
    body: payload,
  });
  return res.data;
};

export const createBlog = async (payload) => {
  const res = await authedApiFetch('/api/blogs', {
    method: 'POST',
    body: payload,
  });
  return res.data;
};

export const updateBlog = async (id, payload) => {
  const res = await authedApiFetch(`/api/blogs/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return res.data;
};

export const deleteBlog = async (id) => {
  const res = await authedApiFetch(`/api/blogs/${id}`, {
    method: 'DELETE',
  });
  return res.data;
};

export const listBlogCommentsAdmin = async (query = {}) => {
  const res = await authedApiFetch('/api/blogs/admin/comments', { query });
  return {
    items: res.data || [],
    meta: res.meta,
    message: res.message,
  };
};

export const approveBlogComment = async (blogId, commentId) => {
  const res = await authedApiFetch(`/api/blogs/${blogId}/comments/${commentId}/approve`, {
    method: 'PATCH',
  });
  return res.data;
};

export const deleteBlogComment = async (blogId, commentId) => {
  const res = await authedApiFetch(`/api/blogs/${blogId}/comments/${commentId}`, {
    method: 'DELETE',
  });
  return res.data;
};
