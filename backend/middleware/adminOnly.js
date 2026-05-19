const { sendForbidden } = require('../utils/apiResponse');

/**
 * Admin Role Guard Middleware.
 *
 * MUST be used AFTER the `protect` middleware — depends on req.user being set.
 *
 * Usage in routes:
 *   router.post('/properties', protect, adminOnly, propertyController.create);
 *
 * Blocks anyone whose role is not 'admin'.
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    // This should never happen if protect runs first — defensive check
    return sendForbidden(res, 'Access denied. Authentication required.');
  }

  if (req.user.role !== 'admin') {
    return sendForbidden(res, 'Access denied. Admin privileges required.');
  }

  next();
};

module.exports = { adminOnly };
