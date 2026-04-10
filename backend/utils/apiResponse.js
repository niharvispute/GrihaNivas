/**
 * Standardized API response helpers.
 *
 * Every controller uses these — never call res.json() directly.
 * This ensures a consistent response envelope across all endpoints.
 *
 * Success envelope:  { success: true,  data, message, meta }
 * Error envelope:    { success: false, error, message, stack? }
 */

/**
 * Send a success response.
 *
 * @param {Response} res        - Express response object
 * @param {number}   statusCode - HTTP status code (default 200)
 * @param {string}   message    - Human-readable message
 * @param {*}        data       - Payload (object, array, null)
 * @param {object}   meta       - Optional metadata (pagination, totals, etc.)
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = { success: true, message, data };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
};

/**
 * Send an error response.
 *
 * @param {Response} res        - Express response object
 * @param {number}   statusCode - HTTP status code (default 500)
 * @param {string}   message    - Human-readable error message
 * @param {*}        error      - Error detail (validation errors, field errors, etc.)
 */
const sendError = (res, statusCode = 500, message = 'Something went wrong', error = null) => {
  const response = { success: false, message };
  if (error) {
    response.error = error;
  }
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    response.stack = error.stack;
  }
  return res.status(statusCode).json(response);
};

/**
 * Shorthand helpers for common status codes.
 */
const sendCreated = (res, message, data, meta) => sendSuccess(res, 201, message, data, meta);
const sendNoContent = (res) => res.status(204).send();
const sendBadRequest = (res, message, error) => sendError(res, 400, message, error);
const sendUnauthorized = (res, message = 'Unauthorized') => sendError(res, 401, message);
const sendForbidden = (res, message = 'Forbidden') => sendError(res, 403, message);
const sendNotFound = (res, message = 'Resource not found') => sendError(res, 404, message);
const sendConflict = (res, message, error) => sendError(res, 409, message, error);
const sendTooMany = (res, message = 'Too many requests') => sendError(res, 429, message);
const sendServerError = (res, message = 'Internal server error', error) =>
  sendError(res, 500, message, error);

module.exports = {
  sendSuccess,
  sendError,
  sendCreated,
  sendNoContent,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendTooMany,
  sendServerError,
};
