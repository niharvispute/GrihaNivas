import { apiFetch } from '@/lib/api';
import { authedApiFetch } from '@/lib/api/authedRequest';
import { downloadAuthedFile } from '@/lib/api/downloadFile';
import {
  mapPropertyListToCardVM,
  mapPropertyToDetailVM,
} from '@/lib/mappers/propertyMapper';

const isRateLimitError = (error) => Number(error?.status) === 429;

export const listProperties = async (query = {}, { map = true } = {}) => {
  try {
    const res = await apiFetch('/api/properties', { query, includeAuth: true });
    return {
      items: map ? mapPropertyListToCardVM(res.data || []) : res.data || [],
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

export const getPropertyBySlug = async (slug, { map = true } = {}) => {
  const res = await apiFetch(`/api/properties/slug/${slug}`);
  if (!res.data) return null;
  return map ? mapPropertyToDetailVM(res.data) : res.data;
};

export const getPropertyById = async (id, { map = true } = {}) => {
  const res = await apiFetch(`/api/properties/${id}`);
  if (!res.data) return null;
  return map ? mapPropertyToDetailVM(res.data) : res.data;
};

export const createProperty = async (formData) => {
  const res = await authedApiFetch('/api/properties', {
    method: 'POST',
    body: formData,
    });
  return res.data;
};

export const updateProperty = async (id, formData) => {
  const res = await authedApiFetch(`/api/properties/${id}`, {
    method: 'PUT',
    body: formData,
    });
  return res.data;
};

export const deleteProperty = async (id) => {
  await authedApiFetch(`/api/properties/${id}`, { method: 'DELETE' });
  return true;
};

export const setPropertyHeroImage = async (id, { url, publicId }) => {
  const res = await authedApiFetch(`/api/properties/${id}/hero-image`, {
    method: 'PATCH',
    body: { url, publicId },
  });
  return res.data;
};

export const adminListProperties = async (query = {}) => {
  const res = await authedApiFetch('/api/properties/admin', { query });
  return {
    items: Array.isArray(res.data) ? res.data : [],
    meta: res.meta,
  };
};

export const approveProperty = async (id) => {
  const res = await authedApiFetch(`/api/properties/${id}/approve`, { method: 'PATCH' });
  return res.data;
};

export const rejectProperty = async (id) => {
  const res = await authedApiFetch(`/api/properties/${id}/reject`, { method: 'PATCH' });
  return res.data;
};

export const updatePropertyActiveStatus = async (id, isActive) => {
  const res = await authedApiFetch(`/api/properties/${id}/active`, {
    method: 'PATCH',
    body: { isActive },
  });
  return res.data;
};

export const exportProperties = async (query = {}) => {
  return downloadAuthedFile('/api/properties/export', {
    query,
    fallbackName: 'bricks_properties.xlsx',
  });
};
