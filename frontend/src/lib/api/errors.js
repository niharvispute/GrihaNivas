export class ApiError extends Error {
  constructor(message, { status = 500, code = 'API_ERROR', details = null, payload = null } = {}) {
    super(message || 'Request failed');
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.payload = payload;
  }
}

export const parseErrorPayload = (payload, status) => {
  if (!payload || typeof payload !== 'object') {
    return new ApiError('Request failed', { status });
  }

  const message = payload.message || 'Request failed';
  const details = payload.error || null;

  return new ApiError(message, {
    status,
    details,
    payload,
    code: payload.code || 'API_ERROR',
  });
};

export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
};
