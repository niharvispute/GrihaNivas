const router = require('express').Router();
const leadController = require('../controllers/leadController');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

// Public — any user can submit a lead
router.post('/', validate(schemas.lead.create), leadController.create);

// Admin only
router.get('/',       protect, adminOnly, validate(schemas.lead.list, 'query'), leadController.list);
router.get('/:id',    protect, adminOnly, leadController.getOne);
router.put('/:id/status', protect, adminOnly, validate(schemas.lead.updateStatus), leadController.updateStatus);
router.post('/:id/notes', protect, adminOnly, validate(schemas.lead.addNote), leadController.addNote);

module.exports = router;
