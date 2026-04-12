const router = require('express').Router();
const authController = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

// Public
router.post('/signup/request',        otpLimiter,  validate(schemas.auth.signupRequest),        authController.signupRequest);
router.post('/signup/verify-email',   authLimiter, validate(schemas.auth.signupVerifyEmail),    authController.signupVerifyEmail);
router.post('/signup/resend-otp',     otpLimiter,  validate(schemas.auth.signupResendOtp),      authController.signupResendOtp);

router.post('/login',                 authLimiter, validate(schemas.auth.login),                authController.login);
router.post('/google',                authLimiter, validate(schemas.auth.googleAuth),            authController.googleAuth);

router.post('/forgot-password/request', otpLimiter,  validate(schemas.auth.forgotPasswordRequest), authController.forgotPasswordRequest);
router.post('/forgot-password/verify',  authLimiter, validate(schemas.auth.forgotPasswordVerify),  authController.forgotPasswordVerify);
router.post('/forgot-password/reset',   authLimiter, validate(schemas.auth.forgotPasswordReset),   authController.forgotPasswordReset);

router.post('/refresh',    authLimiter, validate(schemas.auth.refresh),   authController.refresh);
router.post('/logout',                  validate(schemas.auth.logout),    authController.logout);

// Protected
router.get('/me', protect, authController.getMe);

module.exports = router;
