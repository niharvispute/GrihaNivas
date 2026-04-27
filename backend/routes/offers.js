const router = require('express').Router();
const offerController = require('../controllers/offerController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.get('/', offerController.getOffer);
router.put('/', protect, adminOnly, offerController.upsertOffer);
router.delete('/', protect, adminOnly, offerController.deleteOffer);

module.exports = router;
