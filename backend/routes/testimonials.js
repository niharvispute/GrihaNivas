const router = require('express').Router();
const testimonialController = require('../controllers/testimonialController');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const { uploadImage } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.get('/', testimonialController.list);
router.post('/', protect, adminOnly, uploadLimiter, uploadImage.single('image'), validate(schemas.testimonial.create), testimonialController.create);
router.delete('/:id', protect, adminOnly, testimonialController.remove);

module.exports = router;
