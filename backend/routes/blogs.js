const router = require('express').Router();
const blogController = require('../controllers/blogController');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const { uploadImage } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Public
router.get('/',         validate(schemas.blog.list, 'query'), blogController.list);
router.get('/:slug',    blogController.getBySlug);
router.post('/:id/comments', validate(schemas.blog.addComment), blogController.addComment);

// Admin only
router.post('/',      protect, adminOnly, uploadLimiter, uploadImage.single('featuredImage'), validate(schemas.blog.create), blogController.create);
router.put('/:id',    protect, adminOnly, uploadLimiter, uploadImage.single('featuredImage'), blogController.update);
router.delete('/:id', protect, adminOnly, blogController.remove);

module.exports = router;
