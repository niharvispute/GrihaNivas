const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.get('/', protect, adminOnly, dashboardController.getStats);

module.exports = router;
