const router = require('express').Router();
const userController = require('../controllers/userController');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');

// All user routes require authentication
router.use(protect);

router.get('/me',     userController.getProfile);
router.put('/me',     validate(schemas.user.updateProfile), userController.updateProfile);

router.get('/saved',  userController.getSaved);
router.post('/saved', validate(schemas.user.saveProperty), userController.saveProperty);
router.delete('/saved/:propertyId', userController.unsaveProperty);

router.get('/compare',    userController.getCompare);
router.post('/compare',   validate(schemas.user.compareProperty), userController.addToCompare);
router.delete('/compare/:propertyId', userController.removeFromCompare);

module.exports = router;
