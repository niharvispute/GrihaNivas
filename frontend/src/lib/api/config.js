export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const API_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 20000
);

export const DEFAULT_HEADERS = {
  Accept: 'application/json',
};

export const DEFAULT_FETCH_OPTIONS = {
  credentials: 'include',
};
