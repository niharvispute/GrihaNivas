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
router.put('/:id/assign', protect, adminOnly, leadController.assign);
router.post('/:id/notes', protect, adminOnly, validate(schemas.lead.addNote), leadController.addNote);
router.delete('/:id', protect, adminOnly, validate(schemas.lead.idParams, 'params'), leadController.remove);

module.exports = router;
