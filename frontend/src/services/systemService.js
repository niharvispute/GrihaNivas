import { apiFetch } from '@/lib/api';
import { authedApiFetch } from '@/lib/api/authedRequest';

const BOOTSTRAP_CACHE_TTL_MS = 10 * 60 * 1000;

const DEFAULT_SYSTEM_CONFIG = {
  city: 'Mumbai',
  locale: 'en-IN',
  currency: 'INR',
  defaultCountryCode: '+91',
};

const DEFAULT_SYSTEM_AREAS = [
  'South Mumbai',
  'Bandra West',
  'Juhu',
  'Worli',
  'Andheri West',
  'Powai',
];

const DEFAULT_SYSTEM_OPTIONS = {
  bhkValues: ['1', '2', '3', '4', '5'],
  amenityList: [],
  propertyTypes: ['buy', 'rent', 'commercial', 'new_launch'],
  statusOptions: ['pending', 'approved', 'rejected'],
  furnishingOptions: ['unfurnished', 'semi_furnished', 'furnished'],
};

let bootstrapCache = {
  data: null,
  expiresAt: 0,
  inFlight: null,
};

const clearBootstrapCache = () => {
  bootstrapCache = {
    data: null,
    expiresAt: 0,
    inFlight: null,
  };
};

const normalizeStringList = (list) => {
  if (!Array.isArray(list)) return [];
  const set = new Set(
    list
      .map((item) => String(item || '').trim())
      .filter(Boolean)
  );
  return Array.from(set).sort((a, b) => a.localeCompare(b));
};

const withConfigFallback = (raw) => ({
  ...DEFAULT_SYSTEM_CONFIG,
  ...(raw && typeof raw === 'object' ? raw : {}),
});

const withOptionsFallback = (raw) => ({
  ...DEFAULT_SYSTEM_OPTIONS,
  ...(raw && typeof raw === 'object' ? raw : {}),
  bhkValues: normalizeStringList(raw?.bhkValues).length > 0
    ? normalizeStringList(raw?.bhkValues)
    : DEFAULT_SYSTEM_OPTIONS.bhkValues,
  amenityList: normalizeStringList(raw?.amenityList),
  propertyTypes: normalizeStringList(raw?.propertyTypes).length > 0
    ? normalizeStringList(raw?.propertyTypes)
    : DEFAULT_SYSTEM_OPTIONS.propertyTypes,
  statusOptions: normalizeStringList(raw?.statusOptions).length > 0
    ? normalizeStringList(raw?.statusOptions)
    : DEFAULT_SYSTEM_OPTIONS.statusOptions,
  furnishingOptions: normalizeStringList(raw?.furnishingOptions).length > 0
    ? normalizeStringList(raw?.furnishingOptions)
    : DEFAULT_SYSTEM_OPTIONS.furnishingOptions,
});

const withAreasFallback = (raw) => {
  const normalized = normalizeStringList(raw);
  return normalized.length > 0 ? normalized : DEFAULT_SYSTEM_AREAS;
};

export const getHealth = async () => {
  const res = await apiFetch('/health');
  return res;
};

export const getReadiness = async () => {
  const res = await apiFetch('/health/ready');
  return res;
};

export const getSystemConfig = async () => {
  const res = await apiFetch('/api/system/config');
  return withConfigFallback(res.data);
};

export const getSystemAreas = async (query = {}) => {
  const res = await apiFetch('/api/system/areas', { query });
  return withAreasFallback(res.data);
};

export const getSystemOptions = async () => {
  const res = await apiFetch('/api/system/options');
  return withOptionsFallback(res.data);
};

export const getSystemBootstrap = async ({ forceRefresh = false } = {}) => {
  const now = Date.now();

  if (!forceRefresh && bootstrapCache.data && bootstrapCache.expiresAt > now) {
    return bootstrapCache.data;
  }

  if (!forceRefresh && bootstrapCache.inFlight) {
    return bootstrapCache.inFlight;
  }

  bootstrapCache.inFlight = Promise.allSettled([
    getSystemConfig(),
    getSystemAreas(),
    getSystemOptions(),
  ])
    .then((results) => {
      const config = results[0].status === 'fulfilled' ? results[0].value : DEFAULT_SYSTEM_CONFIG;
      const areas = results[1].status === 'fulfilled' ? results[1].value : DEFAULT_SYSTEM_AREAS;
      const options = results[2].status === 'fulfilled' ? results[2].value : DEFAULT_SYSTEM_OPTIONS;

      const payload = {
        config: withConfigFallback(config),
        areas: withAreasFallback(areas),
        options: withOptionsFallback(options),
      };

      bootstrapCache = {
        data: payload,
        expiresAt: now + BOOTSTRAP_CACHE_TTL_MS,
        inFlight: null,
      };

      return payload;
    })
    .catch(() => {
      const payload = {
        config: DEFAULT_SYSTEM_CONFIG,
        areas: DEFAULT_SYSTEM_AREAS,
        options: DEFAULT_SYSTEM_OPTIONS,
      };

      bootstrapCache = {
        data: payload,
        expiresAt: now + BOOTSTRAP_CACHE_TTL_MS,
        inFlight: null,
      };

      return payload;
    });

  return bootstrapCache.inFlight;
};

export const getAdminSystemConfig = async () => {
  const res = await authedApiFetch('/api/system/config/admin');
  return {
    ...DEFAULT_SYSTEM_CONFIG,
    ...DEFAULT_SYSTEM_OPTIONS,
    areas: DEFAULT_SYSTEM_AREAS,
    allowDynamicAreas: true,
    allowDynamicAmenities: true,
    ...(res.data || {}),
    areas: withAreasFallback(res?.data?.areas),
    ...withOptionsFallback(res.data),
  };
};

export const updateAdminSystemConfig = async (payload = {}) => {
  const res = await authedApiFetch('/api/system/config', {
    method: 'PUT',
    body: payload,
  });

  clearBootstrapCache();

  return {
    ...DEFAULT_SYSTEM_CONFIG,
    ...DEFAULT_SYSTEM_OPTIONS,
    areas: DEFAULT_SYSTEM_AREAS,
    allowDynamicAreas: true,
    allowDynamicAmenities: true,
    ...(res.data || {}),
    areas: withAreasFallback(res?.data?.areas),
    ...withOptionsFallback(res.data),
  };
};
