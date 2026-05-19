// const rateLimit = require('express-rate-limit');

/**
 * Rate limiter configurations — temporarily disabled.
 * To re-enable, uncomment the rateLimit import and all the limiter definitions below,
 * and remove the no-op middleware exports.
 *
 * Different limits for different route sensitivity:
 *   - globalLimiter    : All /api routes — general protection
 *   - authLimiter      : /api/auth — stricter, prevents brute force
 *   - otpLimiter       : OTP issue/resend routes — very strict, prevents OTP spam
 *   - uploadLimiter    : Upload endpoints — prevents abuse
 */

// const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
// const defaultMaxRequests = process.env.NODE_ENV === 'production' ? 500 : 5000;
// const maxRequests = parseInt(process.env.RATE_LIMIT_MAX, 10) || defaultMaxRequests;

// const rateLimitHandler = (req, res) => {
//   res.status(429).json({
//     success: false,
//     message: 'Too many requests. Please try again later.',
//     retryAfter: Math.ceil(windowMs / 1000 / 60) + ' minutes',
//   });
// };

// const globalLimiter = rateLimit({
//   windowMs,
//   max: maxRequests,
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: rateLimitHandler,
//   skipSuccessfulRequests: false,
// });

// const authLimiter = rateLimit({
//   windowMs,
//   max: 20,
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: rateLimitHandler,
//   message: 'Too many authentication attempts. Please try again later.',
// });

// const otpLimiter = rateLimit({
//   windowMs,
//   max: 5,
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res) => {
//     res.status(429).json({
//       success: false,
//       message: 'Too many OTP requests. Please wait 15 minutes before trying again.',
//     });
//   },
// });

// const uploadLimiter = rateLimit({
//   windowMs,
//   max: 30,
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: rateLimitHandler,
// });

const noOp = (req, res, next) => next();
const globalLimiter = noOp;
const authLimiter = noOp;
const otpLimiter = noOp;
const uploadLimiter = noOp;

module.exports = { globalLimiter, authLimiter, otpLimiter, uploadLimiter };
