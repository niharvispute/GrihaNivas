import {
  API_BASE_URL,
  API_TIMEOUT_MS,
  DEFAULT_FETCH_OPTIONS,
  DEFAULT_HEADERS,
} from '@/lib/api/config';
import { ApiError, parseErrorPayload } from '@/lib/api/errors';

const joinUrl = (path) => {
  if (!path) return API_BASE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const target = path.startsWith('/') ? path : `/${path}`;
  return `${base}${target}`;
};

const withQuery = (url, query) => {
  if (!query || typeof query !== 'object') return url;

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)));
      return;
    }
    params.append(key, String(value));
  });

  const queryString = params.toString();
  if (!queryString) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
};

const shouldSendJson = (body) => {
  if (body === undefined || body === null) return false;
  if (body instanceof FormData) return false;
  if (typeof body === 'string') return false;
  return true;
};

export const apiFetch = async (
  path,
  {
    method = 'GET',
    query,
    body,
    headers,
    timeoutMs = API_TIMEOUT_MS,
    token,
    signal,
    credentials,
    cache,
  } = {}
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const mergedHeaders = {
    ...DEFAULT_HEADERS,
    ...(headers || {}),
  };

  if (token) {
    mergedHeaders.Authorization = `Bearer ${token}`;
  }

  const requestInit = {
    ...DEFAULT_FETCH_OPTIONS,
    method,
    headers: mergedHeaders,
    signal: signal || controller.signal,
    credentials: credentials || DEFAULT_FETCH_OPTIONS.credentials,
  };

  if (cache) {
    requestInit.cache = cache;
  }

  if (shouldSendJson(body)) {
    requestInit.headers['Content-Type'] = 'application/json';
    requestInit.body = JSON.stringify(body);
  } else if (body !== undefined && body !== null) {
    requestInit.body = body;
  }

  const finalUrl = withQuery(joinUrl(path), query);

  try {
    const res = await fetch(finalUrl, requestInit);

    if (res.status === 304) {
      return {
        success: true,
        message: 'Not modified',
        data: null,
        meta: null,
        status: 304,
      };
    }

    const contentType = res.headers.get('content-type') || '';
    const hasJson = contentType.includes('application/json');
    const payload = hasJson ? await res.json() : null;

    if (!res.ok) {
      throw parseErrorPayload(payload, res.status);
    }

    if (res.status === 204) {
      return {
        success: true,
        message: 'No content',
        data: null,
        meta: null,
        status: 204,
      };
    }

    if (!payload || typeof payload !== 'object') {
      throw new ApiError('Invalid server response', {
        status: 500,
        code: 'INVALID_RESPONSE',
      });
    }

    return {
      success: payload.success,
      message: payload.message,
      data: payload.data,
      meta: payload.meta || null,
      status: res.status,
    };
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ApiError('Request timed out', {
        status: 408,
        code: 'REQUEST_TIMEOUT',
      });
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error?.message || 'Network error', {
      status: 0,
      code: 'NETWORK_ERROR',
    });
  } finally {
    clearTimeout(timeoutId);
  }
};
