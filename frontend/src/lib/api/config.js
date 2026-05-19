// In production, NEXT_PUBLIC_API_BASE_URL is set to the real backend (e.g. https://api.grihanivas.in).
// Browser requests go directly to the backend — bypassing Vercel's serverless rewrite proxy,
// which caused 429s when multiple API calls fired simultaneously on page load.
// In local dev (no env var set), fall back to relative paths so Next.js rewrites still work.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined' ? '' : 'http://localhost:5000');

export const API_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 20000
);

export const DEFAULT_HEADERS = {
  Accept: 'application/json',
};

export const DEFAULT_FETCH_OPTIONS = {
  credentials: 'include',
};
