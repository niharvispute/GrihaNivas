const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

/**
 * JWT Utility
 *
 * Two token types:
 *  - Access Token  : short-lived (default 7d), used for API auth
 *  - Refresh Token : long-lived (default 30d), used to rotate access tokens
 *
 * They use DIFFERENT secrets so a compromised access token cannot be used
 * to generate refresh tokens and vice versa.
 *
 * Payload shape: { id, role, phone, email? }
 */

// ── Token Generation ─────────────────────────────────────────────────────────

/**
 * Generate a JWT access token.
 *
 * @param {{ id: string, role: string, phone: string, email?: string }} payload
 * @returns {string} signed JWT
 */
const generateAccessToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET is not configured', 500);
  }

  return jwt.sign(
    {
      id: payload.id,
      role: payload.role,
      phone: payload.phone,
      ...(payload.email && { email: payload.email }),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'mumbai-editorial',
      audience: 'mumbai-editorial-client',
    }
  );
};

/**
 * Generate a JWT refresh token.
 * Carries only the user id — minimal payload for security.
 *
 * @param {{ id: string }} payload
 * @returns {string} signed JWT
 */
const generateRefreshToken = (payload) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new AppError('JWT_REFRESH_SECRET is not configured', 500);
  }

  return jwt.sign(
    { id: payload.id },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: 'mumbai-editorial',
      audience: 'mumbai-editorial-client',
    }
  );
};

/**
 * Generate both tokens at once.
 * Used after successful OTP verification / login.
 *
 * @param {{ id, role, phone, email? }} payload
 * @returns {{ accessToken, refreshToken }}
 */
const generateTokenPair = (payload) => ({
  accessToken: generateAccessToken(payload),
  refreshToken: generateRefreshToken({ id: payload.id }),
});

// ── Token Verification ───────────────────────────────────────────────────────

/**
 * Verify a JWT access token.
 * Throws AppError (401) on invalid or expired tokens.
 *
 * @param {string} token
 * @returns {object} decoded payload
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'mumbai-editorial',
      audience: 'mumbai-editorial-client',
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Access token expired. Please refresh.', 401);
    }
    throw new AppError('Invalid access token.', 401);
  }
};

/**
 * Verify a JWT refresh token.
 * Throws AppError (401) on invalid or expired tokens.
 *
 * @param {string} token
 * @returns {object} decoded payload
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'mumbai-editorial',
      audience: 'mumbai-editorial-client',
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Refresh token expired. Please log in again.', 401);
    }
    throw new AppError('Invalid refresh token.', 401);
  }
};

// ── Refresh Token Blacklist (Redis-ready stub) ────────────────────────────────
//
// In production, use Redis with TTL matching the token's expiry.
// SET blacklist:<token_hash> 1 EX <remaining_ttl_seconds>
// CHECK: EXISTS blacklist:<token_hash>
//
// Current implementation: in-memory Set (resets on server restart).
// Acceptable for dev — not for production clusters (tokens survive restart).

const blacklist = new Set();

/**
 * Hash a token before storing in blacklist (don't store raw tokens).
 */
const { createHash } = require('crypto');
const hashToken = (token) => createHash('sha256').update(token).digest('hex');

/**
 * Invalidate a refresh token (logout).
 * @param {string} refreshToken
 */
const blacklistToken = (refreshToken) => {
  blacklist.add(hashToken(refreshToken));
};

/**
 * Check if a refresh token has been blacklisted.
 * @param {string} refreshToken
 * @returns {boolean}
 */
const isBlacklisted = (refreshToken) => blacklist.has(hashToken(refreshToken));

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  blacklistToken,
  isBlacklisted,
};
