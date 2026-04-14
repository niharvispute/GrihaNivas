import { apiFetch } from '@/lib/api';
import { authedApiFetch } from '@/lib/api/authedRequest';
import {
  mapBuilderListToCardVM,
  mapBuilderToDetailVM,
} from '@/lib/mappers/builderMapper';

/**
 * Fetch builders with optional filtering.
 */
export const listBuilders = async (query = {}, { map = true } = {}) => {
  const res = await apiFetch('/api/builders', { query });
  return {
    items: map ? mapBuilderListToCardVM(res.data || []) : res.data || [],
    meta: res.meta,
    message: res.message,
  };
};

/**
 * Get a builder profile by their slug.
 */
export const getBuilderBySlug = async (slug, query = {}, { map = true } = {}) => {
  const res = await apiFetch(`/api/builders/${slug}`, { query });
  const builder = res?.data?.builder || null;
  const properties = res?.data?.properties || [];

  if (!builder) {
    throw new Error('Builder not found');
  }

  return {
    builder: map ? mapBuilderToDetailVM(builder, properties) : builder,
    properties,
    meta: {
      properties: res?.meta?.properties || null,
    },
    message: res.message,
  };
};

export const listAdminBuilders = async (query = {}) => {
  const res = await authedApiFetch('/api/admin/builders', { query });
  return {
    items: Array.isArray(res.data) ? res.data : [],
    meta: res.meta,
    message: res.message,
  };
};

export const getAdminBuilderById = async (builderId) => {
  const res = await authedApiFetch(`/api/admin/builders/${builderId}`);
  return res.data;
};

export const createAdminBuilder = async (formData) => {
  const res = await authedApiFetch('/api/admin/builders', {
    method: 'POST',
    body: formData,
  });
  return res.data;
};

export const updateAdminBuilder = async (builderId, formData) => {
  const res = await authedApiFetch(`/api/admin/builders/${builderId}`, {
    method: 'PUT',
    body: formData,
  });
  return res.data;
};

export const toggleAdminBuilderFeatured = async (builderId, isFeatured) => {
  const res = await authedApiFetch(`/api/admin/builders/${builderId}/feature`, {
    method: 'PATCH',
    body: { isFeatured: Boolean(isFeatured) },
  });
  return res.data;
};

export const deleteAdminBuilder = async (builderId) => {
  const res = await authedApiFetch(`/api/admin/builders/${builderId}`, {
    method: 'DELETE',
  });
  return res.data;
};
