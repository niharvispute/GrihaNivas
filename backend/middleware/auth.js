const jwt = require('jsonwebtoken');
const { sendUnauthorized, sendForbidden } = require('../utils/apiResponse');

/**
 * JWT Authentication Middleware.
 *
 * Verifies the Bearer token from the Authorization header.
 * Attaches the decoded payload to req.user for downstream use.
 *
 * Flow:
 *   1. Extract token from "Authorization: Bearer <token>"
 *   2. Verify signature and expiry
 *   3. Attach decoded payload → req.user
 *   4. Call next() or return 401
 *
 * NOTE: DB user lookup (to check if user still exists / is still active)
 * is marked as TODO — will be added once DB is confirmed.
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendUnauthorized(res, 'Access denied. Token is malformed.');
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // TODO: Once DB is confirmed, add:
    // const user = await UserModel.findById(decoded.id).select('-passwordHash');
    // if (!user) return sendUnauthorized(res, 'User no longer exists.');
    // if (!user.isActive) return sendForbidden(res, 'Account has been deactivated.');

    // 3. Attach decoded payload to request
    req.user = decoded; // { id, role, email, iat, exp }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Session expired. Please log in again.');
    }
    if (err.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Invalid token.');
    }
    // Unexpected error — pass to global error handler
    next(err);
  }
};

/**
 * Optional Auth Middleware.
 *
 * Attaches req.user if a valid token is present, but does NOT block
 * the request if no token is provided.
 *
 * Use for endpoints that behave differently for logged-in users
 * (e.g., property detail page — show "saved" state for logged-in users).
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      }
    }

    next();
  } catch (_err) {
    // If token is invalid, just continue without req.user
    next();
  }
};

module.exports = { protect, optionalAuth };
