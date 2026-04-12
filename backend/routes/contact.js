const router = require('express').Router();
const contactController = require('../controllers/contactController');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.post('/', validate(schemas.contact.submit), contactController.submit);

// Admin
router.get('/',             protect, adminOnly, contactController.list);
router.put('/:id/read',     protect, adminOnly, contactController.markRead);

module.exports = router;
