import { apiFetch } from '@/lib/api';
import { authedApiFetch } from '@/lib/api/authedRequest';
import { downloadAuthedFile } from '@/lib/api/downloadFile';

const toDateText = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const mapTestimonialToAdminVM = (item) => ({
  id: item?._id,
  name: item?.name || 'Anonymous',
  role: item?.designation || item?.company || 'Customer',
  image: item?.photo?.url || null,
  rating: Number(item?.rating || 5),
  content: item?.testimonial || '',
  date: toDateText(item?.updatedAt),
  type: item?.company ? 'Business' : 'Retail',
  designation: item?.designation || '',
  company: item?.company || '',
  isActive: item?.isActive !== false,
  order: Number(item?.order || 0),
  raw: item,
});

/**
 * Fetch all testimonials with management filters.
 */
export const listTestimonials = async () => {
  try {
    const res = await apiFetch('/api/testimonials');
    return Array.isArray(res.data) ? res.data.map(mapTestimonialToAdminVM) : [];
  } catch {
    return [];
  }
};

/**
 * Fetch all testimonials (for admin).
 */
export const listTestimonialsAdmin = async () => {
  const res = await authedApiFetch('/api/testimonials');
  return Array.isArray(res.data) ? res.data.map(mapTestimonialToAdminVM) : [];
};

/**
 * Create a new testimonial.
 */
export const createTestimonial = async (payload) => {
  const res = await authedApiFetch('/api/testimonials', {
    method: 'POST',
    body: payload,
  });
  return res.data;
};

/**
 * Update an existing testimonial.
 */
export const updateTestimonial = async (id, payload) => {
  const res = await authedApiFetch(`/api/testimonials/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return res.data;
};

/**
 * Delete a testimonial.
 */
export const deleteTestimonial = async (id) => {
  const res = await authedApiFetch(`/api/testimonials/${id}`, {
    method: 'DELETE',
  });
  return res.data;
};

/**
 * Download all testimonials as an .xlsx file.
 */
export const exportTestimonials = async (query = {}) => {
  return downloadAuthedFile('/api/testimonials/export', {
    query,
    fallbackName: 'bricks_testimonials.xlsx',
  });
};
