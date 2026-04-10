const router = require('express').Router();
const bannerController = require('../controllers/bannerController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const { uploadImage } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.get('/', bannerController.list);
router.post('/',      protect, adminOnly, uploadLimiter, uploadImage.single('image'), bannerController.create);
router.put('/:id',    protect, adminOnly, bannerController.update);
router.delete('/:id', protect, adminOnly, bannerController.remove);

module.exports = router;
