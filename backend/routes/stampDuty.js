const router = require('express').Router();
const stampDutyController = require('../controllers/stampDutyController');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.get('/', stampDutyController.getConfig);
router.put('/', protect, adminOnly, validate(schemas.stampDuty.update), stampDutyController.updateConfig);

module.exports = router;
