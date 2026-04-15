import { authedApiFetch } from '@/lib/api/authedRequest';
import {
  mapAdminUserListToVM,
  mapPropertyListToCardVM,
  mapPropertyListToCompareVM,
  mapUserProfileVM,
} from '@/lib/mappers';

export const getMyProfile = async ({ map = true } = {}) => {
  const res = await authedApiFetch('/api/users/me');
  return map ? mapUserProfileVM(res.data) : res.data;
};

export const updateMyProfile = async (payload, { map = true } = {}) => {
  const res = await authedApiFetch('/api/users/me', {
    method: 'PUT',
    body: payload,
  });
  return map ? mapUserProfileVM(res.data) : res.data;
};

export const getSavedProperties = async ({ map = true } = {}) => {
  const res = await authedApiFetch('/api/users/saved');
  return map ? mapPropertyListToCardVM(res.data || []) : res.data || [];
};

export const saveProperty = async (propertyId) => {
  const res = await authedApiFetch('/api/users/saved', {
    method: 'POST',
    body: { propertyId },
  });
  return res.data;
};

export const unsaveProperty = async (propertyId) => {
  await authedApiFetch(`/api/users/saved/${propertyId}`, {
    method: 'DELETE',
  });
  return true;
};

export const getCompareProperties = async ({ map = true } = {}) => {
  const res = await authedApiFetch('/api/users/compare');
  return map ? mapPropertyListToCompareVM(res.data || []) : res.data || [];
};

export const addCompareProperty = async (propertyId) => {
  const res = await authedApiFetch('/api/users/compare', {
    method: 'POST',
    body: { propertyId },
  });
  return res;
};

export const removeCompareProperty = async (propertyId) => {
  await authedApiFetch(`/api/users/compare/${propertyId}`, {
    method: 'DELETE',
  });
  return true;
};

export const listUsers = async (query = {}, { map = true } = {}) => {
  const res = await authedApiFetch('/api/users', { query });
  return {
    items: map ? mapAdminUserListToVM(res.data || []) : res.data || [],
    meta: res.meta,
    message: res.message,
  };
};

export const getUserById = async (userId, { map = true } = {}) => {
  const res = await authedApiFetch(`/api/users/${userId}`);
  return map ? mapUserProfileVM(res.data) : res.data;
};

export const deactivateUser = async (userId) => {
  const res = await authedApiFetch(`/api/users/${userId}/deactivate`, {
    method: 'PUT',
  });
  return res.data;
};

export const activateUser = async (userId) => {
  const res = await authedApiFetch(`/api/users/${userId}/activate`, {
    method: 'PUT',
  });
  return res.data;
};
