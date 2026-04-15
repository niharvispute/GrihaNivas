import { apiFetch } from '@/lib/api';
import { authedApiFetch } from '@/lib/api/authedRequest';
import {
  mapPropertyListToCardVM,
  mapPropertyToDetailVM,
} from '@/lib/mappers/propertyMapper';

export const listProperties = async (query = {}, { map = true } = {}) => {
  const res = await apiFetch('/api/properties', { query, includeAuth: true });
  return {
    items: map ? mapPropertyListToCardVM(res.data || []) : res.data || [],
    meta: res.meta,
    message: res.message,
  };
};

export const getPropertyBySlug = async (slug, { map = true } = {}) => {
  const res = await apiFetch(`/api/properties/slug/${slug}`);
  return map ? mapPropertyToDetailVM(res.data) : res.data;
};

export const getPropertyById = async (id, { map = true } = {}) => {
  const res = await apiFetch(`/api/properties/${id}`);
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
