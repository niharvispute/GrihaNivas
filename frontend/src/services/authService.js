import { apiFetch } from '@/lib/api';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/lib/auth/tokenStore';

export const sendOtp = async (phone) => {
  const res = await apiFetch('/api/auth/send-otp', {
    method: 'POST',
    body: { phone },
  });
  return res.data;
};

export const verifyOtp = async ({ phone, otp, idToken, name, email }) => {
  const res = await apiFetch('/api/auth/verify-otp', {
    method: 'POST',
    body: { phone, otp, idToken, name, email },
  });
  return res.data;
};

export const loginWithOtp = async (payload) => {
  const data = await verifyOtp(payload);

  if (data?.accessToken && data?.refreshToken) {
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }

  return data;
};

export const refreshTokenPair = async (refreshToken) => {
  const res = await apiFetch('/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
  return res.data;
};

export const refreshSession = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const data = await refreshTokenPair(refreshToken);
  if (data?.accessToken && data?.refreshToken) {
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }

  return data;
};

export const getCurrentUser = async () => {
  const token = getAccessToken();
  if (!token) return null;

  const res = await apiFetch('/api/auth/me', {
    method: 'GET',
    token,
  });
  return res.data;
};

export const logout = async () => {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
        body: { refreshToken },
      });
    }
  } finally {
    clearTokens();
  }
};
