import { apiFetch } from '@/lib/api';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/lib/auth/tokenStore';

export const signupRequest = async ({ name, email, phone, password }) => {
  const res = await apiFetch('/api/auth/signup/request', {
    method: 'POST',
    body: { name, email, phone, password },
  });
  return res.data;
};

export const signupVerifyEmail = async ({ otp }) => {
  const res = await apiFetch('/api/auth/signup/verify-email', {
    method: 'POST',
    body: { otp },
  });
  return res.data;
};

export const signupResendOtp = async () => {
  const res = await apiFetch('/api/auth/signup/resend-otp', {
    method: 'POST',
    body: {},
  });
  return res.data;
};

export const loginWithPassword = async ({ identifier, password }) => {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: { identifier, password },
  });
  const data = res.data;

  if (data?.accessToken && data?.refreshToken) {
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }

  return data;
};

export const completeSignupVerification = async ({ otp }) => {
  const data = await signupVerifyEmail({ otp });

  if (data?.accessToken && data?.refreshToken) {
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }

  return data;
};


export const forgotPasswordRequest = async ({ identifier }) => {
  const res = await apiFetch('/api/auth/forgot-password/request', {
    method: 'POST',
    body: { identifier },
  });
  return res.data;
};

export const forgotPasswordVerify = async ({ otp }) => {
  const res = await apiFetch('/api/auth/forgot-password/verify', {
    method: 'POST',
    body: { otp },
  });
  return res.data;
};

export const forgotPasswordReset = async ({ newPassword }) => {
  const res = await apiFetch('/api/auth/forgot-password/reset', {
    method: 'POST',
    body: { newPassword },
  });
  return res.data;
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
