const router = require('express').Router();
const authController = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

// Public
router.post('/send-otp',   otpLimiter,  validate(schemas.auth.sendOtp),   authController.sendOtp);
router.post('/verify-otp', authLimiter, validate(schemas.auth.verifyOtp), authController.verifyOtp);
router.post('/refresh',    authLimiter, validate(schemas.auth.refresh),   authController.refresh);
router.post('/logout',                  validate(schemas.auth.logout),    authController.logout);

// Protected
router.get('/me', protect, authController.getMe);

module.exports = router;
