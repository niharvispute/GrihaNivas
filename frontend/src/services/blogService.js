import { apiFetch } from '@/lib/api';
import { mapBlogListToCardVM, mapBlogToDetailVM } from '@/lib/mappers/blogMapper';

export const listBlogs = async (query = {}, { map = true } = {}) => {
  const res = await apiFetch('/api/blogs', { query });
  return {
    items: map ? mapBlogListToCardVM(res.data || []) : res.data || [],
    meta: res.meta,
    message: res.message,
  };
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
