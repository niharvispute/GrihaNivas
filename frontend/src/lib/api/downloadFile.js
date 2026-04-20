import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from '@/lib/api/config';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/lib/auth/tokenStore';
import { refreshTokenPair } from '@/services/authService';

/**
 * Fetch a binary file (e.g. .xlsx export) with authentication and trigger browser download.
 * Automatically retries once after refreshing the access token on 401.
 *
 * @param {string} path              - API path (e.g. '/api/users/export')
 * @param {object} opts
 * @param {object} opts.query        - Query params to append
 * @param {string} opts.fallbackName - Filename fallback if server omits Content-Disposition
 */
export const downloadAuthedFile = async (
  path,
  { query, fallbackName = 'export.xlsx' } = {}
) => {
  const buildUrl = () => {
    const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const target = path.startsWith('/') ? path : `/${path}`;
    let url = `${base}${target}`;

    if (query && typeof query === 'object') {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        params.append(key, String(value));
      });
      const qs = params.toString();
      if (qs) url += `${url.includes('?') ? '&' : '?'}${qs}`;
    }
    return url;
  };

  const doFetch = async (token) => {
    return fetch(buildUrl(), {
      ...DEFAULT_FETCH_OPTIONS,
      method: 'GET',
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  let accessToken = getAccessToken();
  let res = await doFetch(accessToken);

  if (res.status === 401) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      throw new Error('Session expired. Please sign in again.');
    }
    try {
      const tokens = await refreshTokenPair(refreshToken);
      if (!tokens?.accessToken || !tokens?.refreshToken) {
        clearTokens();
        throw new Error('Session expired. Please sign in again.');
      }
      setTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      accessToken = tokens.accessToken;
      res = await doFetch(accessToken);
    } catch (err) {
      clearTokens();
      throw err;
    }
  }

  if (!res.ok) {
    let message = `Download failed (${res.status})`;
    try {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const payload = await res.json();
        message = payload?.message || message;
      }
    } catch { /* ignore parse errors */ }
    throw new Error(message);
  }

  // Extract filename from Content-Disposition if present
  let filename = fallbackName;
  const disposition = res.headers.get('content-disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/i);
  if (match && match[1]) filename = match[1];

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Revoke after a short delay so the download has time to start
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

  return { filename };
};
