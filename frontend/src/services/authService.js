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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Transient = not the user's fault and worth retrying (rate limit, server, network, timeout).
// A 429 must never be treated as an auth failure.
const isTransientStatus = (status) =>
  status === 429 || status === 408 || status === 0 || (status >= 500 && status <= 599);

export const getCurrentUser = async () => {
  const token = getAccessToken();
  if (!token) return null;

  const maxAttempts = 3;
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const res = await apiFetch('/api/auth/me', {
        method: 'GET',
        token: getAccessToken(),
      });
      return res.data;
    } catch (error) {
      lastError = error;
      const status = error?.status;

      // Genuine auth failure: try a single refresh, then surface the 401.
      if (status === 401) {
        try {
          const refreshed = await refreshSession();
          if (refreshed?.accessToken) continue; // retry /me with the new token
        } catch (_) {
          // fall through and rethrow the 401
        }
        throw error;
      }

      // Transient failure (e.g. 429): back off and retry. Do NOT treat as logout.
      if (isTransientStatus(status) && attempt < maxAttempts - 1) {
        await sleep(400 * 2 ** attempt); // 400ms, 800ms
        continue;
      }

      throw error;
    }
  }

  throw lastError;
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
