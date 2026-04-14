const router = require('express').Router();
const propertySubmissionController = require('../controllers/propertySubmissionController');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { propertySubmissionUploadFields } = require('../middleware/upload');

// User
router.post(
	'/',
	protect,
	uploadLimiter,
	propertySubmissionUploadFields,
	validate(schemas.propertySubmission.create),
	propertySubmissionController.create
);
router.get('/my', protect, validate(schemas.propertySubmission.list, 'query'), propertySubmissionController.mySubmissions);

// Admin
router.get('/', protect, adminOnly, validate(schemas.propertySubmission.list, 'query'), propertySubmissionController.listAdmin);
router.get('/:id', protect, adminOnly, validate(schemas.propertySubmission.idParams, 'params'), propertySubmissionController.getOneAdmin);
router.put('/:id/status', protect, adminOnly, validate(schemas.propertySubmission.idParams, 'params'), validate(schemas.propertySubmission.updateStatus), propertySubmissionController.updateStatus);
router.put('/:id/assign', protect, adminOnly, validate(schemas.propertySubmission.idParams, 'params'), validate(schemas.propertySubmission.assign), propertySubmissionController.assign);
router.post('/:id/notes', protect, adminOnly, validate(schemas.propertySubmission.idParams, 'params'), validate(schemas.propertySubmission.addNote), propertySubmissionController.addNote);
router.delete('/:id', protect, adminOnly, validate(schemas.propertySubmission.idParams, 'params'), propertySubmissionController.remove);

module.exports = router;
