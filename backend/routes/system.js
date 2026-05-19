const router = require('express').Router();
const systemController = require('../controllers/systemController');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.get('/config/admin', protect, adminOnly, systemController.getAdminConfig);
router.get('/config', systemController.getConfig);
router.get('/areas', validate(schemas.system.areasQuery, 'query'), systemController.getAreas);
router.get('/options', systemController.getOptions);
router.put('/config', protect, adminOnly, validate(schemas.system.updateConfig), systemController.upsertConfig);

module.exports = router;