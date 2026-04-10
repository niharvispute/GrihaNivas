const AppError = require('../utils/AppError');

/**
 * 404 — Not Found Handler.
 * Catches any request that didn't match a route.
 * Must be registered AFTER all routes in app.js.
 */
const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

/**
 * Global Error Handler.
 * Single place where ALL errors are processed and sent as JSON.
 * Must be the LAST middleware registered in app.js (4 params = error handler).
 *
 * Handles:
 *  - AppError       — operational errors thrown by controllers/services
 *  - JWT errors     — invalid/expired token
 *  - Multer errors  — file size/type violations
 *  - Zod errors     — schema parse failures (fallback, normally caught in validate middleware)
 *  - Generic errors — unexpected crashes
 */
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
  // Default to 500 if no statusCode set
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let error = null;

  // ── JWT errors ──────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired. Please log in again.';
  }

  // ── Multer errors ───────────────────────────────────────
  if (err.name === 'MulterError') {
    statusCode = 400;
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Maximum allowed size exceeded.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded at once.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = `Unexpected file field: "${err.field}".`;
        break;
      default:
        message = 'File upload error.';
    }
  }

  // ── File type rejection (custom error from upload middleware) ──
  if (err.code === 'INVALID_FILE_TYPE') {
    statusCode = 400;
    message = err.message;
  }

  // ── Non-operational errors (bugs) — hide details in production ──
  if (!err.isOperational && process.env.NODE_ENV === 'production') {
    console.error('UNEXPECTED ERROR:', err);
    statusCode = 500;
    message = 'Something went wrong. Please try again later.';
    error = null;
  }

  // ── Development — expose stack only for non-operational errors (bugs) ──
  // Operational errors (wrong OTP, 404, etc.) only need the message — not the stack
  if (process.env.NODE_ENV === 'development' && !err.isOperational) {
    error = {
      name: err.name,
      stack: err.stack,
    };
  }

  const response = { success: false, message };
  if (error) {
    response.error = error;
  }

  res.status(statusCode).json(response);
};

module.exports = { notFoundHandler, globalErrorHandler };
