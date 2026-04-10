const { generateOtp, verifyOtp, verifyFirebaseToken } = require('../services/otpService');
const { sendOtpEmail, sendWelcome } = require('../services/emailService');
const { sendOtp: sendSmsotp } = require('../services/smsService');
const { generateTokenPair, verifyRefreshToken, blacklistToken, isBlacklisted } = require('../utils/jwt');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

/**
 * Auth Controller
 *
 * All DB interactions are clearly marked TODO — JWT and OTP logic
 * is fully implemented and functional without a database.
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

    // ── SMS Delivery ─────────────────────────────────────────────────────
    // Dev: logs to console. Prod: MSG91 or Twilio (see services/smsService.js)
    // Fire-and-forget — a transient SMS failure shouldn't block the response.
    sendSmsotp(phone, otp).catch((err) =>
      console.error('[Auth/sendOtp] SMS delivery failed (non-fatal):', err.message)
    );

    // ── Email fallback if user has email on file ──────────────────────────
    // TODO: Once DB is ready:
    //   const user = await UserModel.findOne({ phone });
    //   if (user?.email) await sendOtpEmail(user.email, otp);

    // NEVER return the OTP in the response — visible only in server logs during dev.
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
      // Throws AppError on wrong OTP, expired, or too many attempts
      verifyOtp(phone, otp);
      verifiedPhone = phone;
    }

    // ── Path B: Firebase ID Token ────────────────────────────────────────
    if (idToken) {
      const decoded = await verifyFirebaseToken(idToken);
      verifiedPhone = decoded.phone || phone;
      verifiedEmail = decoded.email || email || null;
    }

    // ── DB: Find or create user ──────────────────────────────────────────
    // TODO: Replace stub with real DB upsert once DB is confirmed.
    //
    // MongoDB (Mongoose):
    //   let user = await User.findOne({ phone: verifiedPhone });
    //   const isNewUser = !user;
    //   if (!user) {
    //     user = await User.create({
    //       phone: verifiedPhone,
    //       email: verifiedEmail,
    //       name: name || null,
    //       isVerified: true,
    //     });
    //   } else {
    //     user.lastLogin = new Date();
    //     await user.save();
    //   }
    //
    // PostgreSQL (Prisma):
    //   const { user, created: isNewUser } = await prisma.user.upsert({
    //     where: { phone: verifiedPhone },
    //     update: { lastLogin: new Date() },
    //     create: { phone: verifiedPhone, email: verifiedEmail, name, isVerified: true },
    //   });

    // Stub until DB available
    const isNewUser = true; // TODO: derive from DB upsert result
    const user = {
      id: 'stub-user-id', // TODO: real DB id (_id for Mongo, id for Postgres)
      role: 'user',
      phone: verifiedPhone,
      email: verifiedEmail,
      name: name || null,
      isVerified: true,
    };

    // ── Generate JWT pair ────────────────────────────────────────────────
    const { accessToken, refreshToken } = generateTokenPair({
      id: user.id,
      role: user.role,
      phone: user.phone,
      email: user.email,
    });

    // ── Welcome email for new users ──────────────────────────────────────
    // Fire-and-forget — don't await, don't block the login response
    if (isNewUser && user.email) {
      sendWelcome({ name: user.name, email: user.email }).catch((err) =>
        console.error('Welcome email failed (non-fatal):', err.message)
      );
    }

    return sendCreated(res, isNewUser ? 'Account created successfully.' : 'Login successful.', {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isNewUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/refresh ───────────────────────────────────────────────────

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Reject blacklisted tokens (logged-out sessions)
    if (isBlacklisted(refreshToken)) {
      throw new AppError('Refresh token has been revoked. Please log in again.', 401);
    }

    // Verify signature and expiry
    const decoded = verifyRefreshToken(refreshToken);

    // ── DB: Fetch latest user state ───────────────────────────────────────
    // TODO: Ensure user still exists and is active before issuing new tokens.
    //
    //   const user = await User.findById(decoded.id).select('role phone email isActive');
    //   if (!user || !user.isActive) {
    //     throw new AppError('Account not found or deactivated.', 401);
    //   }

    // Stub until DB available
    const user = {
      id: decoded.id,
      role: 'user',  // TODO: from DB
      phone: null,   // TODO: from DB
      email: null,   // TODO: from DB
    };

    // ── Refresh Token Rotation ────────────────────────────────────────────
    // Invalidate the used token — prevents replay attacks
    blacklistToken(refreshToken);

    // Issue a fresh pair
    const tokens = generateTokenPair({
      id: user.id,
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

    // Blacklist so it cannot be reused
    blacklistToken(refreshToken);

    // TODO: If storing refresh tokens in DB, delete here.
    //   await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });

    return sendSuccess(res, 200, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────────────────────

const getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware (decoded JWT payload)
    // TODO: Fetch full user profile from DB for fresh data.
    //   const user = await User.findById(req.user.id).select('-passwordHash');
    //   if (!user) throw new AppError('User not found.', 404);

    return sendSuccess(res, 200, 'Current user fetched.', req.user);
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
