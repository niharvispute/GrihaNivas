const router = require('express').Router();
const builderController = require('../controllers/builderController');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const { builderUploadFields } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.use(protect, adminOnly);

router.get('/', validate(schemas.builder.adminList, 'query'), builderController.listAdmin);
router.get('/:id', validate(schemas.builder.idParams, 'params'), builderController.getAdminOne);
router.post('/', uploadLimiter, builderUploadFields, validate(schemas.builder.create), builderController.create);
router.patch('/:id/feature', validate(schemas.builder.idParams, 'params'), validate(schemas.builder.featureToggle), builderController.toggleFeatured);
router.put('/:id', uploadLimiter, builderUploadFields, validate(schemas.builder.idParams, 'params'), validate(schemas.builder.update), builderController.update);
router.delete('/:id', validate(schemas.builder.idParams, 'params'), builderController.remove);

module.exports = router;
