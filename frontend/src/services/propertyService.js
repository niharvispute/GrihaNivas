import { apiFetch } from '@/lib/api';
import {
  mapPropertyListToCardVM,
  mapPropertyToDetailVM,
} from '@/lib/mappers/propertyMapper';

export const listProperties = async (query = {}, { map = true } = {}) => {
  const res = await apiFetch('/api/properties', { query });
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
