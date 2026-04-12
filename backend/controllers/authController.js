const { generateOtp, verifyOtp, verifyFirebaseToken } = require('../services/otpService');
const { sendOtpEmail, sendWelcome } = require('../services/emailService');
const { sendOtp: sendSmsotp } = require('../services/smsService');
const { generateTokenPair, verifyRefreshToken, blacklistToken, isBlacklisted } = require('../utils/jwt');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const User = require('../models/mongoose/User');

/**
 * Auth Controller
 *
 * Routes:
 *  POST /api/auth/send-otp    → generate OTP and deliver it
 *  POST /api/auth/verify-otp  → verify OTP or Firebase token → issue JWT pair
 *  POST /api/auth/refresh     → rotate refresh token → new access token
 *  POST /api/auth/logout      → blacklist refresh token
 *  GET  /api/auth/me          → return current user (requires protect middleware)
 */

// ── POST /api/auth/send-otp ──────────────────────────────────────────────────

const sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const otp = generateOtp(phone);

    // Fire-and-forget SMS — a transient failure shouldn't block the response
    sendSmsotp(phone, otp).catch((err) =>
      console.error('[Auth/sendOtp] SMS delivery failed (non-fatal):', err.message)
    );

    // Email fallback if user has email on file
    const user = await User.findOne({ phone }).select('email name');
    if (user?.email) {
      sendOtpEmail(user.email, otp).catch((err) =>
        console.error('[Auth/sendOtp] Email OTP delivery failed (non-fatal):', err.message)
      );
    }

    return sendSuccess(res, 200, 'OTP sent successfully. Valid for 10 minutes.', { phone });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/verify-otp ────────────────────────────────────────────────

const verifyOtpHandler = async (req, res, next) => {
  try {
    const { phone, otp, idToken, name, email } = req.body;

    let verifiedPhone = phone;
    let verifiedEmail = email || null;

    // ── Path A: Custom OTP ───────────────────────────────────────────────
    if (otp) {
      verifyOtp(phone, otp);
      verifiedPhone = phone;
    }

    // ── Path B: Firebase ID Token ────────────────────────────────────────
    if (idToken) {
      const decoded = await verifyFirebaseToken(idToken);
      verifiedPhone = decoded.phone || phone;
      verifiedEmail = decoded.email || email || null;
    }

    // ── Find or create user ──────────────────────────────────────────────
    let user = await User.findOne({ phone: verifiedPhone });
    const isNewUser = !user;

    if (!user) {
      user = await User.create({
        phone: verifiedPhone,
        email: verifiedEmail,
        name: name || null,
        isVerified: true,
      });
    } else {
      user.lastLogin = new Date();
      if (verifiedEmail && !user.email) user.email = verifiedEmail;
      if (name && !user.name) user.name = name;
      await user.save();
    }

    // ── Generate JWT pair ────────────────────────────────────────────────
    const { accessToken, refreshToken } = generateTokenPair({
      id: user._id.toString(),
      role: user.role,
      phone: user.phone,
      email: user.email,
    });

    // Welcome email for new users — fire-and-forget
    if (isNewUser && user.email) {
      sendWelcome({ name: user.name, email: user.email }).catch((err) =>
        console.error('Welcome email failed (non-fatal):', err.message)
      );
    }

    return sendCreated(res, isNewUser ? 'Account created successfully.' : 'Login successful.', {
      accessToken,
      refreshToken,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/refresh ───────────────────────────────────────────────────

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (await isBlacklisted(refreshToken)) {
      throw new AppError('Refresh token has been revoked. Please log in again.', 401);
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.id).select('role phone email isActive');
    if (!user || !user.isActive) {
      throw new AppError('Account not found or deactivated.', 401);
    }

    // Invalidate used token — prevents replay attacks
    await blacklistToken(refreshToken);

    const tokens = generateTokenPair({
      id: user._id.toString(),
      role: user.role,
      phone: user.phone,
      email: user.email,
    });

    return sendSuccess(res, 200, 'Token refreshed.', tokens);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/logout ────────────────────────────────────────────────────

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await blacklistToken(refreshToken);
    return sendSuccess(res, 200, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────────────────────

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    if (!user) throw new AppError('User not found.', 404);
    return sendSuccess(res, 200, 'Current user fetched.', user.toSafeObject());
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendOtp,
  verifyOtp: verifyOtpHandler,
  refresh,
  logout,
  getMe,
};
