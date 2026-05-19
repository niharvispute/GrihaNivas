const router = require('express').Router();
const leadController = require('../controllers/leadController');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

// Authenticated user — submit a lead
router.post('/', protect, validate(schemas.lead.create), leadController.create);

// User — fetch their own enquiries by phone
router.get('/my-enquiries', protect, validate(schemas.lead.list, 'query'), leadController.myEnquiries);

// Admin only
router.get('/',       protect, adminOnly, validate(schemas.lead.list, 'query'), leadController.list);
router.get('/export', protect, adminOnly, leadController.exportLeads);
router.get('/:id',    protect, adminOnly, validate(schemas.lead.idParams, 'params'), leadController.getOne);
router.put('/:id/status', protect, adminOnly, validate(schemas.lead.idParams, 'params'), validate(schemas.lead.updateStatus), leadController.updateStatus);
router.put('/:id/assign', protect, adminOnly, validate(schemas.lead.idParams, 'params'), leadController.assign);
router.post('/:id/notes', protect, adminOnly, validate(schemas.lead.idParams, 'params'), validate(schemas.lead.addNote), leadController.addNote);
router.delete('/:id', protect, adminOnly, validate(schemas.lead.idParams, 'params'), leadController.remove);

module.exports = router;
