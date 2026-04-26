import { authedApiFetch } from '@/lib/api/authedRequest';

export const createPropertySubmission = async (payload) => {
  const res = await authedApiFetch('/api/property-submissions', {
    method: 'POST',
    body: payload,
  });
  return res.data;
};

export const listMyPropertySubmissions = async (query = {}) => {
  const res = await authedApiFetch('/api/property-submissions/my', { query });
  return {
    items: res.data || [],
    meta: res.meta,
    message: res.message,
  };
};

export const listPropertySubmissions = async (query = {}) => {
  const res = await authedApiFetch('/api/property-submissions', { query });
  return {
    items: res.data || [],
    meta: res.meta,
    message: res.message,
  };
};

export const getPropertySubmissionById = async (id) => {
  const res = await authedApiFetch(`/api/property-submissions/${id}`);
  return res.data;
};

export const updatePropertySubmissionStatus = async (id, status) => {
  const res = await authedApiFetch(`/api/property-submissions/${id}/status`, {
    method: 'PUT',
    body: { status },
  });
  return res.data;
};

export const assignPropertySubmission = async (id, adminId) => {
  const res = await authedApiFetch(`/api/property-submissions/${id}/assign`, {
    method: 'PUT',
    body: { adminId },
  });
  return res.data;
};

export const addPropertySubmissionNote = async (id, text) => {
  const res = await authedApiFetch(`/api/property-submissions/${id}/notes`, {
    method: 'POST',
    body: { text },
  });
  return res.data;
};

export const deactivateMyPropertySubmission = async (id) => {
  const res = await authedApiFetch(`/api/property-submissions/${id}/deactivate`, {
    method: 'PUT',
  });
  return res.data;
};

export const reactivateMyPropertySubmission = async (id) => {
  const res = await authedApiFetch(`/api/property-submissions/${id}/reactivate`, {
    method: 'PUT',
  });
  return res.data;
};

export const deletePropertySubmission = async (id) => {
  const res = await authedApiFetch(`/api/property-submissions/${id}`, {
    method: 'DELETE',
  });
  return res.data;
};
