const rateLimit = require('express-rate-limit');

/**
 * Rate limiter configurations.
 *
 * Different limits for different route sensitivity:
 *   - globalLimiter    : All /api routes — general protection
 *   - authLimiter      : /api/auth — stricter, prevents brute force
 *   - otpLimiter       : OTP issue/resend routes — very strict, prevents OTP spam
 *   - uploadLimiter    : Upload endpoints — prevents abuse
 */

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000; // 15 min
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;

/**
 * Shared rate limit response handler.
 */
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.',
    retryAfter: Math.ceil(windowMs / 1000 / 60) + ' minutes',
  });
};

/**
 * Global limiter — applied to all /api routes.
 * 100 requests per 15 minutes per IP.
 */
const globalLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
});

/**
 * Auth limiter — applied to all /api/auth routes.
 * 20 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many authentication attempts. Please try again later.',
});

/**
 * OTP limiter — applied to OTP issue/resend endpoints.
 * 5 requests per 15 minutes per IP — prevents OTP spam.
 */
const otpLimiter = rateLimit({
  windowMs,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many OTP requests. Please wait 15 minutes before trying again.',
    });
  },
});

/**
 * Upload limiter — applied to file upload endpoints.
 * 30 requests per 15 minutes per IP.
 */
const uploadLimiter = rateLimit({
  windowMs,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

module.exports = { globalLimiter, authLimiter, otpLimiter, uploadLimiter };
