/**
 * Custom operational error class.
 *
 * Distinguishes between operational errors (expected — wrong input, not found, etc.)
 * and programmer errors (bugs — unexpected crashes).
 *
 * The global error handler sends clean JSON for operational errors
 * and a generic 500 for anything else.
 *
 * Usage:
 *   throw new AppError('Property not found', 404);
 *   throw new AppError('Duplicate phone number', 409);
 */
class AppError extends Error {
  /**
   * @param {string} message   - Human-readable error message sent to client
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true; // flag — safe to expose to client

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
