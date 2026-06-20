const router = require('express').Router();
const projectController = require('../controllers/projectController');
const adminProjectController = require('../controllers/adminProjectController');
const { validate, schemas } = require('../middleware/validate');
const { protect, optionalAuth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const {
  projectUploadFields,
  configUploadFields,
  bulkImportUpload,
} = require('../middleware/upload');
const { uploadLimiter: uploadRateLimit } = require('../middleware/rateLimiter');

// ── Public ────────────────────────────────────────────────────────────────

router.get(
  '/',
  optionalAuth,
  validate(schemas.project.list, 'query'),
  projectController.list
);

router.get(
  '/slug/:slug',
  optionalAuth,
  validate(schemas.project.slugParams, 'params'),
  projectController.getBySlug
);

router.get(
  '/:id/configurations',
  optionalAuth,
  validate(schemas.project.idParams, 'params'),
  projectController.getConfigurations
);

router.get(
  '/:id/units',
  optionalAuth,
  validate(schemas.project.unitsList, 'query'),
  projectController.getUnits
);

router.post(
  '/:id/enquiry',
  protect,
  validate(schemas.project.idParams, 'params'),
  validate(schemas.project.enquiry),
  projectController.submitEnquiry
);

// ── Admin ─────────────────────────────────────────────────────────────────

router.get(
  '/admin',
  protect,
  adminOnly,
  validate(schemas.project.adminList, 'query'),
  adminProjectController.adminList
);

router.get(
  '/:id',
  protect,
  adminOnly,
  validate(schemas.project.idParams, 'params'),
  adminProjectController.getOne
);

router.post(
  '/',
  protect,
  adminOnly,
  uploadRateLimit,
  projectUploadFields,
  validate(schemas.project.create),
  adminProjectController.create
);

router.put(
  '/:id',
  protect,
  adminOnly,
  uploadRateLimit,
  projectUploadFields,
  validate(schemas.project.idParams, 'params'),
  validate(schemas.project.update),
  adminProjectController.update
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  validate(schemas.project.idParams, 'params'),
  adminProjectController.remove
);

router.patch(
  '/:id/status',
  protect,
  adminOnly,
  validate(schemas.project.idParams, 'params'),
  validate(schemas.project.setListingStatus),
  adminProjectController.setListingStatus
);

router.patch(
  '/:id/featured',
  protect,
  adminOnly,
  validate(schemas.project.idParams, 'params'),
  validate(schemas.project.setFeatured),
  adminProjectController.toggleFeatured
);

// ── Configurations ────────────────────────────────────────────────────────

router.post(
  '/:id/configurations',
  protect,
  adminOnly,
  uploadRateLimit,
  configUploadFields,
  validate(schemas.project.idParams, 'params'),
  validate(schemas.project.configuration),
  adminProjectController.createConfiguration
);

router.put(
  '/project-configurations/:configId',
  protect,
  adminOnly,
  uploadRateLimit,
  configUploadFields,
  validate(schemas.project.configIdParams, 'params'),
  validate(schemas.project.configurationUpdate),
  adminProjectController.updateConfiguration
);

router.delete(
  '/project-configurations/:configId',
  protect,
  adminOnly,
  validate(schemas.project.configIdParams, 'params'),
  adminProjectController.deleteConfiguration
);

// ── Units ────────────────────────────────────────────────────────────────

router.post(
  '/:id/units',
  protect,
  adminOnly,
  validate(schemas.project.idParams, 'params'),
  validate(schemas.project.unit),
  adminProjectController.createUnit
);

router.put(
  '/project-units/:unitId',
  protect,
  adminOnly,
  validate(schemas.project.unitIdParams, 'params'),
  validate(schemas.project.unitUpdate),
  adminProjectController.updateUnit
);

router.delete(
  '/project-units/:unitId',
  protect,
  adminOnly,
  validate(schemas.project.unitIdParams, 'params'),
  adminProjectController.deleteUnit
);

router.post(
  '/:id/bulk-import-units',
  protect,
  adminOnly,
  validate(schemas.project.idParams, 'params'),
  validate(schemas.project.bulkImportUnits),
  adminProjectController.bulkImportUnits
);

router.post(
  '/:id/bulk-import-file',
  protect,
  adminOnly,
  bulkImportUpload,
  validate(schemas.project.idParams, 'params'),
  adminProjectController.bulkImportUnitsFromFile
);

router.get(
  '/:id/bulk-import-template',
  protect,
  adminOnly,
  validate(schemas.project.idParams, 'params'),
  adminProjectController.downloadBulkImportTemplate
);

router.get(
  '/:id/units/export',
  protect,
  adminOnly,
  validate(schemas.project.idParams, 'params'),
  adminProjectController.exportUnits
);

module.exports = router;
