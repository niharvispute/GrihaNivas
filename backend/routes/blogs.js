const router = require('express').Router();
const blogController = require('../controllers/blogController');
const { validate, schemas } = require('../middleware/validate');
const { protect, optionalAuth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const { uploadImage } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Public (with optional auth for admin view)
router.get('/', optionalAuth, validate(schemas.blog.list, 'query'), blogController.list);

// Admin only
router.get('/admin/:id', protect, adminOnly, validate(schemas.blog.commentParams.pick({ id: true }), 'params'), blogController.adminGet);
router.get('/admin/comments', protect, adminOnly, validate(schemas.blog.adminCommentsList, 'query'), blogController.adminListComments);
router.patch('/:id/comments/:commentId/approve', protect, adminOnly, validate(schemas.blog.commentParams, 'params'), blogController.approveComment);
router.delete('/:id/comments/:commentId', protect, adminOnly, validate(schemas.blog.commentParams, 'params'), blogController.deleteComment);
router.post('/',      protect, adminOnly, uploadLimiter, uploadImage.single('featuredImage'), validate(schemas.blog.create), blogController.create);
router.put('/:id',    protect, adminOnly, uploadLimiter, uploadImage.single('featuredImage'), blogController.update);
router.delete('/:id', protect, adminOnly, blogController.remove);

router.get('/:slug',    blogController.getBySlug);
router.post('/:id/comments', validate(schemas.blog.addComment), blogController.addComment);

module.exports = router;
