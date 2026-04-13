const router = require('express').Router();
const userController = require('../controllers/userController');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const { uploadImage } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

// All user routes require authentication
router.use(protect);

router.get('/me',     userController.getProfile);
router.put('/me',     uploadLimiter, uploadImage.single('profilePicture'), validate(schemas.user.updateProfile), userController.updateProfile);
router.get('/properties', validate(schemas.user.myPropertiesList, 'query'), userController.getMyProperties);

router.get('/saved',  userController.getSaved);
router.post('/saved', validate(schemas.user.saveProperty), userController.saveProperty);
router.delete('/saved/:propertyId', userController.unsaveProperty);

router.get('/compare',    userController.getCompare);
router.post('/compare',   validate(schemas.user.compareProperty), userController.addToCompare);
router.delete('/compare/:propertyId', userController.removeFromCompare);

// Admin user management
router.get('/',                 adminOnly, validate(schemas.user.adminList, 'query'), userController.listUsers);
router.get('/:id',              adminOnly, validate(schemas.user.userIdParam, 'params'), userController.getUserById);
router.put('/:id/deactivate',   adminOnly, validate(schemas.user.userIdParam, 'params'), userController.deactivateUser);
router.put('/:id/activate',     adminOnly, validate(schemas.user.userIdParam, 'params'), userController.activateUser);

module.exports = router;
