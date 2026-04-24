const router = require('express').Router();
const propertyController = require('../controllers/propertyController');
const { validate, schemas } = require('../middleware/validate');
const { protect, optionalAuth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const { propertyUploadFields } = require('../middleware/upload');
const { uploadLimiter: uploadRateLimit } = require('../middleware/rateLimiter');

// Public
router.get('/', optionalAuth, validate(schemas.property.list, 'query'), propertyController.list);
router.get('/slug/:slug', optionalAuth, propertyController.getBySlug);

// User submission
router.post(
  '/submit',
  protect,
  uploadRateLimit,
  propertyUploadFields,
  validate(schemas.property.submit),
  propertyController.submit
);

// Admin moderation routes
router.get('/admin', protect, adminOnly, validate(schemas.property.adminList, 'query'), propertyController.adminList);
router.get('/export', protect, adminOnly, propertyController.exportProperties);
router.patch('/:id/approve', protect, adminOnly, validate(schemas.property.moderationParams, 'params'), propertyController.approve);
router.patch('/:id/reject', protect, adminOnly, validate(schemas.property.moderationParams, 'params'), propertyController.reject);
router.patch('/:id/active', protect, adminOnly, validate(schemas.property.moderationParams, 'params'), propertyController.toggleActive);

// Public detail routes
router.get('/:id', optionalAuth, validate(schemas.property.moderationParams, 'params'), propertyController.getOne);

// Admin only
router.post(
  '/',
  protect,
  adminOnly,
  uploadRateLimit,
  propertyUploadFields,
  validate(schemas.property.create),
  propertyController.create
);
router.put('/:id',    protect, adminOnly, uploadRateLimit, propertyUploadFields, propertyController.update);
router.delete('/:id', protect, adminOnly, propertyController.remove);

module.exports = router;
