import { apiFetch } from '@/lib/api';

/**
 * Fetch all testimonials with management filters.
 */
export const listTestimonials = async () => {
  // In a real app, this would be an API call
  // const res = await apiFetch('/api/admin/testimonials');
  // return res.data;
  
  // Mock data for demo/implementation
  return [
    {
      id: 1,
      name: 'Sarah Jenkins',
      role: 'Verified User',
      image: 'https://i.pravatar.cc/150?u=sarah',
      rating: 5,
      content: "The attention to detail and customer service was absolutely phenomenal. I've never had such a smooth experience with a property management firm before.",
      date: '2 days ago',
      type: 'Retail'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Corporate Plan',
      image: 'https://i.pravatar.cc/150?u=michael',
      rating: 4,
      content: "The dashboard tools are intuitive and powerful. Managing my listings has become a breeze compared to the previous legacy systems we were using.",
      date: '1 week ago',
      type: 'Business'
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      role: 'Verified User',
      image: 'https://i.pravatar.cc/150?u=elena',
      rating: 5,
      content: "I am incredibly impressed with the responsiveness of the support team. Any question I had was answered within minutes. Highly recommended!",
      date: '3 days ago',
      type: 'Retail'
    }
  ];
};

/**
 * Create a new testimonial.
 */
export const createTestimonial = async (payload) => {
  const res = await apiFetch('/api/admin/testimonials', {
    method: 'POST',
    body: payload,
  });
  return res.data;
};

/**
 * Update an existing testimonial.
 */
export const updateTestimonial = async (id, payload) => {
  const res = await apiFetch(`/api/admin/testimonials/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return res.data;
};

/**
 * Delete a testimonial.
 */
export const deleteTestimonial = async (id) => {
  const res = await apiFetch(`/api/admin/testimonials/${id}`, {
    method: 'DELETE',
  });
  return res.data;
};
