import { apiFetch } from '@/lib/api';

export const submitContactForm = async (payload) => {
  const res = await apiFetch('/api/contact', {
    method: 'POST',
    body: payload,
  });
  return res.data;
};
