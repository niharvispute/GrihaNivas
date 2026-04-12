import { apiFetch } from '@/lib/api/client';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/lib/auth/tokenStore';
import { refreshTokenPair } from '@/services/authService';

export const authedApiFetch = async (path, options = {}) => {
  const { retryOnAuthError = true, ...requestOptions } = options;

  const initialToken = requestOptions.token || getAccessToken();

  try {
    return await apiFetch(path, {
      ...requestOptions,
      token: initialToken,
    });
  } catch (error) {
    if (!retryOnAuthError || error?.status !== 401) {
      throw error;
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      throw error;
    }

    try {
      const tokens = await refreshTokenPair(refreshToken);
      if (!tokens?.accessToken || !tokens?.refreshToken) {
        clearTokens();
        throw error;
      }

      setTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      return await apiFetch(path, {
        ...requestOptions,
        token: tokens.accessToken,
      });
    } catch {
      clearTokens();
      throw error;
    }
  }
};
