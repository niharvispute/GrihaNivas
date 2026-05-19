/* global fetch */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendOtpEmail, sendWelcome } = require('../services/emailService');
const { generateTokenPair, verifyRefreshToken, blacklistToken, isBlacklisted } = require('../utils/jwt');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const User = require('../models/mongoose/User');
const AuthOtpFlow = require('../models/mongoose/AuthOtpFlow');

const FLOW_TYPE = {
  SIGNUP: 'signup_verify',
  FORGOT_PASSWORD: 'forgot_password',
};

const COOKIE_NAME = {
  SIGNUP: 'auth_signup_flow',
  FORGOT: 'auth_forgot_flow',
  RESET: 'auth_reset_token',
};

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/api/auth',
  maxAge,
});

const parseCookie = (req, key) => {
  const raw = req.headers.cookie || '';
  if (!raw) return null;

  const parts = raw.split(';').map((v) => v.trim());
  for (const part of parts) {
    if (part.startsWith(`${key}=`)) {
      return decodeURIComponent(part.slice(key.length + 1));
    }
  }
  return null;
};

const hashValue = (value) =>
  crypto.createHash('sha256').update(String(value)).digest('hex');

const randomToken = () => crypto.randomBytes(32).toString('hex');

const generateOtpCode = () => String(crypto.randomInt(100000, 1000000));

const compareOtp = (otp, otpHash) => {
  const incoming = Buffer.from(hashValue(otp), 'utf8');
  const stored = Buffer.from(otpHash, 'utf8');
  if (incoming.length !== stored.length) return false;
  return crypto.timingSafeEqual(incoming, stored);
};

const resolveIdentifierQuery = (identifier) => {
  const value = String(identifier || '').trim();
  if (EMAIL_REGEX.test(value)) {
    return { email: value.toLowerCase() };
  }
  return { phone: value };
};

const setFlowCookie = (res, name, token, ttlMs) => {
  res.cookie(name, token, cookieOptions(ttlMs));
};

const clearFlowCookie = (res, name) => {
  res.clearCookie(name, cookieOptions(0));
};

const getTokenPayload = (user) => ({
  id: user._id.toString(),
  role: user.role,
  phone: user.phone,
  email: user.email,
  tokenVersion: Number(user.tokenVersion || 0),
});

const createOtpFlow = async ({ user, flowType }) => {
  const now = Date.now();
  const flowToken = randomToken();
  const otp = generateOtpCode();

  await AuthOtpFlow.updateMany(
    {
      userId: user._id,
      flowType,
      status: { $in: ['active', 'verified'] },
    },
    {
      $set: {
        status: 'expired',
        consumedAt: new Date(),
      },
    }
  );

  const flow = await AuthOtpFlow.create({
    flowType,
    userId: user._id,
    email: user.email,
    phone: user.phone,
    tokenHash: hashValue(flowToken),
    otpHash: hashValue(otp),
    expiresAt: new Date(now + OTP_TTL_MS),
    attemptsUsed: 0,
    maxAttempts: OTP_MAX_ATTEMPTS,
    resendAfter: new Date(now + OTP_RESEND_COOLDOWN_MS),
    status: 'active',
  });

  return { flow, flowToken, otp };
};

const getFlowFromCookie = async ({ req, flowType, cookieName, statuses }) => {
  const token = parseCookie(req, cookieName);
  if (!token) {
    throw new AppError('Verification session expired. Please request OTP again.', 401);
  }

  const flow = await AuthOtpFlow.findOne({
    tokenHash: hashValue(token),
    flowType,
    status: { $in: statuses },
  });

  if (!flow) {
    throw new AppError('Verification session expired. Please request OTP again.', 401);
  }

  return { flow, token };
};

const assertFlowNotExpired = async (flow) => {
  if (flow.expiresAt && flow.expiresAt.getTime() < Date.now()) {
    flow.status = 'expired';
    flow.consumedAt = new Date();
    await flow.save();
    throw new AppError('OTP expired. Please request a new OTP.', 400);
  }
};

const verifyFlowOtp = async (flow, otp) => {
  await assertFlowNotExpired(flow);

  if (flow.attemptsUsed >= flow.maxAttempts) {
    flow.status = 'expired';
    flow.consumedAt = new Date();
    await flow.save();
    throw new AppError('Too many incorrect OTP attempts. Request a new OTP.', 429);
  }

  if (!compareOtp(otp, flow.otpHash)) {
    flow.attemptsUsed += 1;
    if (flow.attemptsUsed >= flow.maxAttempts) {
      flow.status = 'expired';
      flow.consumedAt = new Date();
    }
    await flow.save();

    const remaining = Math.max(0, flow.maxAttempts - flow.attemptsUsed);
    throw new AppError(
      `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      400
    );
  }
};

// ── New Credential Auth Flows ────────────────────────────────────────────────

const signupRequest = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    const [userByEmail, userByPhone] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ phone }),
    ]);

    let user = null;

    if (userByEmail && userByPhone && userByEmail._id.toString() !== userByPhone._id.toString()) {
      throw new AppError('Email or phone is already associated with another account.', 409);
    }

    if (userByEmail || userByPhone) {
      user = userByEmail || userByPhone;

      if (user.isEmailVerified || user.isVerified) {
        throw new AppError('Account already exists. Please log in.', 409);
      }

      user.name = name;
      user.email = email;
      user.phone = phone;
      user.passwordHash = await bcrypt.hash(password, 12);
      user.isActive = true;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        phone,
        passwordHash: await bcrypt.hash(password, 12),
        isEmailVerified: false,
        isVerified: false,
      });
    }

    const { flowToken, otp } = await createOtpFlow({
      user,
      flowType: FLOW_TYPE.SIGNUP,
    });

    await sendOtpEmail(user.email, otp);

    setFlowCookie(res, COOKIE_NAME.SIGNUP, flowToken, OTP_TTL_MS);

    return sendSuccess(res, 200, 'Signup initiated. OTP sent to your email address.');
  } catch (err) {
    next(err);
  }
};

const signupVerifyEmail = async (req, res, next) => {
  try {
    const { otp } = req.body;

    const { flow } = await getFlowFromCookie({
      req,
      flowType: FLOW_TYPE.SIGNUP,
      cookieName: COOKIE_NAME.SIGNUP,
      statuses: ['active'],
    });

    await verifyFlowOtp(flow, otp);

    const user = await User.findById(flow.userId);
    if (!user) throw new AppError('User not found.', 404);

    const isFirstVerification = !user.isEmailVerified;

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.isVerified = true;
    user.lastLogin = new Date();
    await user.save();

    flow.status = 'consumed';
    flow.verifiedAt = new Date();
    flow.consumedAt = new Date();
    await flow.save();

    clearFlowCookie(res, COOKIE_NAME.SIGNUP);

    if (isFirstVerification && user.email) {
      sendWelcome({ name: user.name, email: user.email }).catch((error) =>
        console.error('Welcome email failed (non-fatal):', error.message)
      );
    }

    const { accessToken, refreshToken } = generateTokenPair(getTokenPayload(user));

    return sendCreated(res, 'Signup completed successfully.', {
      accessToken,
      refreshToken,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

const signupResendOtp = async (req, res, next) => {
  try {
    const { flow, token } = await getFlowFromCookie({
      req,
      flowType: FLOW_TYPE.SIGNUP,
      cookieName: COOKIE_NAME.SIGNUP,
      statuses: ['active'],
    });

    await assertFlowNotExpired(flow);

    if (flow.resendAfter && flow.resendAfter.getTime() > Date.now()) {
      const seconds = Math.ceil((flow.resendAfter.getTime() - Date.now()) / 1000);
      throw new AppError(`Please wait ${seconds}s before requesting another OTP.`, 429);
    }

    const otp = generateOtpCode();
    flow.otpHash = hashValue(otp);
    flow.expiresAt = new Date(Date.now() + OTP_TTL_MS);
    flow.resendAfter = new Date(Date.now() + OTP_RESEND_COOLDOWN_MS);
    flow.attemptsUsed = 0;
    await flow.save();

    await sendOtpEmail(flow.email, otp);

    // Keep cookie fresh in browser while preserving same flow token.
    setFlowCookie(res, COOKIE_NAME.SIGNUP, token, OTP_TTL_MS);

    return sendSuccess(res, 200, 'A new OTP has been sent to your email address.');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const query = resolveIdentifierQuery(identifier);

    const user = await User.findOne(query).select('+passwordHash');

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid credentials.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated.', 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials.', 401);
    }

    if (!user.isEmailVerified && !user.isVerified) {
      throw new AppError('Please verify your email before logging in.', 403);
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokenPair(getTokenPayload(user));

    return sendSuccess(res, 200, 'Login successful.', {
      accessToken,
      refreshToken,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

const forgotPasswordRequest = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    const query = resolveIdentifierQuery(identifier);

    const user = await User.findOne(query);

    // Always return generic success to avoid account enumeration.
    if (!user || !user.isActive || !user.email) {
      return sendSuccess(
        res,
        200,
        'If the account exists, an OTP has been sent to the registered email.'
      );
    }

    const { flowToken, otp } = await createOtpFlow({
      user,
      flowType: FLOW_TYPE.FORGOT_PASSWORD,
    });

    await sendOtpEmail(user.email, otp);

    setFlowCookie(res, COOKIE_NAME.FORGOT, flowToken, OTP_TTL_MS);
    clearFlowCookie(res, COOKIE_NAME.RESET);

    return sendSuccess(
      res,
      200,
      'If the account exists, an OTP has been sent to the registered email.'
    );
  } catch (err) {
    next(err);
  }
};

const forgotPasswordVerify = async (req, res, next) => {
  try {
    const { otp } = req.body;

    const { flow } = await getFlowFromCookie({
      req,
      flowType: FLOW_TYPE.FORGOT_PASSWORD,
      cookieName: COOKIE_NAME.FORGOT,
      statuses: ['active'],
    });

    await verifyFlowOtp(flow, otp);

    const resetToken = randomToken();
    const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    flow.status = 'verified';
    flow.verifiedAt = new Date();
    flow.resetTokenHash = hashValue(resetToken);
    flow.resetTokenExpiresAt = resetTokenExpiresAt;
    // Reuse expiresAt so TTL cleanup removes verified flow after reset window.
    flow.expiresAt = resetTokenExpiresAt;
    flow.attemptsUsed = 0;
    await flow.save();

    setFlowCookie(res, COOKIE_NAME.RESET, resetToken, RESET_TOKEN_TTL_MS);

    return sendSuccess(res, 200, 'OTP verified. You can now reset your password.');
  } catch (err) {
    next(err);
  }
};

const forgotPasswordReset = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const resetToken = parseCookie(req, COOKIE_NAME.RESET);

    if (!resetToken) {
      throw new AppError('Reset session expired. Please verify OTP again.', 401);
    }

    const flow = await AuthOtpFlow.findOne({
      flowType: FLOW_TYPE.FORGOT_PASSWORD,
      status: 'verified',
      resetTokenHash: hashValue(resetToken),
    });

    if (!flow) {
      throw new AppError('Reset session expired. Please verify OTP again.', 401);
    }

    if (!flow.resetTokenExpiresAt || flow.resetTokenExpiresAt.getTime() < Date.now()) {
      flow.status = 'expired';
      flow.consumedAt = new Date();
      await flow.save();

      clearFlowCookie(res, COOKIE_NAME.RESET);
      clearFlowCookie(res, COOKIE_NAME.FORGOT);
      throw new AppError('Reset session expired. Please verify OTP again.', 401);
    }

    const user = await User.findById(flow.userId).select('+passwordHash');
    if (!user) throw new AppError('Account not found.', 404);

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordChangedAt = new Date();
    user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    await user.save();

    flow.status = 'consumed';
    flow.consumedAt = new Date();
    flow.resetTokenHash = null;
    flow.resetTokenExpiresAt = null;
    await flow.save();

    clearFlowCookie(res, COOKIE_NAME.RESET);
    clearFlowCookie(res, COOKIE_NAME.FORGOT);

    return sendSuccess(res, 200, 'Password updated successfully. Please log in again.');
  } catch (err) {
    next(err);
  }
};

// ── Session Endpoints ────────────────────────────────────────────────────────

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (await isBlacklisted(refreshToken)) {
      throw new AppError('Refresh token has been revoked. Please log in again.', 401);
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.id).select('role phone email isActive tokenVersion');
    if (!user || !user.isActive) {
      throw new AppError('Account not found or deactivated.', 401);
    }

    const decodedVersion = Number(decoded.tokenVersion || 0);
    const currentVersion = Number(user.tokenVersion || 0);
    if (decodedVersion !== currentVersion) {
      throw new AppError('Session has expired. Please log in again.', 401);
    }

    await blacklistToken(refreshToken);

    const tokens = generateTokenPair(getTokenPayload(user));

    return sendSuccess(res, 200, 'Token refreshed.', tokens);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await blacklistToken(refreshToken);
    return sendSuccess(res, 200, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

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
  signupRequest,
  signupVerifyEmail,
  signupResendOtp,
  login,
  forgotPasswordRequest,
  forgotPasswordVerify,
  forgotPasswordReset,

  refresh,
  logout,
  getMe,
};
