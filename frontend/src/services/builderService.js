import { apiFetch } from '@/lib/api';
import { authedApiFetch } from '@/lib/api/authedRequest';
import { downloadAuthedFile } from '@/lib/api/downloadFile';
import {
  mapBuilderListToCardVM,
  mapBuilderToDetailVM,
} from '@/lib/mappers/builderMapper';

const BUILDER_CITIES_CACHE_TTL_MS = 5 * 60 * 1000;

let cachedBuilderCities = null;
let cachedBuilderCitiesAt = 0;
let builderCitiesInFlight = null;

const isRateLimitError = (error) => Number(error?.status) === 429;

/**
 * Fetch builders with optional filtering.
 */
export const listBuilders = async (query = {}, { map = true } = {}) => {
  try {
    const res = await apiFetch('/api/builders', { query });
    return {
      items: map ? mapBuilderListToCardVM(res.data || []) : res.data || [],
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

/**
 * Fetch unique cities across builders with active properties.
 */
export const listBuilderCities = async () => {
  const now = Date.now();

  if (Array.isArray(cachedBuilderCities) && now - cachedBuilderCitiesAt < BUILDER_CITIES_CACHE_TTL_MS) {
    return cachedBuilderCities;
  }

  if (builderCitiesInFlight) {
    return builderCitiesInFlight;
  }

  builderCitiesInFlight = apiFetch('/api/builders/cities')
    .then((res) => {
      const cities = Array.isArray(res.data) ? res.data : [];
      cachedBuilderCities = cities;
      cachedBuilderCitiesAt = Date.now();
      return cities;
    })
    .catch((error) => {
      if (isRateLimitError(error)) {
        return Array.isArray(cachedBuilderCities) ? cachedBuilderCities : [];
      }
      throw error;
    })
    .finally(() => {
      builderCitiesInFlight = null;
    });

  return builderCitiesInFlight;
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

export const linkBuilderProperty = async (builderId, propertyId, action) => {
  const res = await authedApiFetch(`/api/admin/builders/${builderId}/link-property`, {
    method: 'PATCH',
    body: { propertyId, action },
  });
  return res.data;
};

export const exportAdminBuilders = async (query = {}) => {
  return downloadAuthedFile('/api/admin/builders/export', {
    query,
    fallbackName: 'bricks_builders.xlsx',
  });
};
