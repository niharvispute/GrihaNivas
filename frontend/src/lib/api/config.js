// In the browser, use relative paths so Next.js rewrites proxy the request
// through the dev server — this fixes cross-device access where localhost:5000
// would otherwise resolve to the visiting device, not the backend machine.
// On the server (SSR), prefer BACKEND_URL (same var used by the rewrite proxy)
// then fall back to NEXT_PUBLIC_API_BASE_URL, then localhost for local dev.
export const API_BASE_URL =
  typeof window !== 'undefined'
    ? ''
    : (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000');

export const API_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 20000
);

export const DEFAULT_HEADERS = {
  Accept: 'application/json',
};

export const DEFAULT_FETCH_OPTIONS = {
  credentials: 'include',
};
