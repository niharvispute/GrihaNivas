const router = require('express').Router();
const propertyController = require('../controllers/propertyController');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const { propertyUploadFields } = require('../middleware/upload');
const { uploadLimiter: uploadRateLimit } = require('../middleware/rateLimiter');

// Public
router.get('/',          validate(schemas.property.list, 'query'), propertyController.list);
router.get('/slug/:slug', propertyController.getBySlug);
router.get('/:id',       propertyController.getOne);

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
