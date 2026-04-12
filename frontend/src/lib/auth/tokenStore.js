const ACCESS_TOKEN_KEY = 'bricks_access_token';
const REFRESH_TOKEN_KEY = 'bricks_refresh_token';

let memoryAccessToken = null;
let memoryRefreshToken = null;

const isBrowser = () => typeof window !== 'undefined';

export const getAccessToken = () => {
  if (isBrowser()) {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return memoryAccessToken;
};

export const getRefreshToken = () => {
  if (isBrowser()) {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return memoryRefreshToken;
};

export const setTokens = ({ accessToken, refreshToken }) => {
  memoryAccessToken = accessToken || null;
  memoryRefreshToken = refreshToken || null;

  if (!isBrowser()) return;

  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const clearTokens = () => {
  memoryAccessToken = null;
  memoryRefreshToken = null;

  if (!isBrowser()) return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const hasSession = () => Boolean(getAccessToken() && getRefreshToken());
