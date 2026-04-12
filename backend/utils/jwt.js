const jwt = require('jsonwebtoken');
const AppError = require('./AppError');
const { createHash } = require('crypto');
const { getRedisClient } = require('../config/redis');

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

// ── Refresh Token Blacklist ──────────────────────────────────────────────────
//
// Storage strategy:
//  - Redis (if initialized) for production-safe persistence across restarts
//  - In-memory map fallback for local/dev usage

const inMemoryBlacklist = new Map(); // tokenHash -> expiresAtEpochSec
const REDIS_KEY_PREFIX = 'jwt:blacklist:refresh:';
const FALLBACK_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

/**
 * Hash a token before storing in blacklist (don't store raw tokens).
 */
const hashToken = (token) => createHash('sha256').update(token).digest('hex');

const buildRedisKey = (tokenHash) => `${REDIS_KEY_PREFIX}${tokenHash}`;

const getBlacklistTtlSeconds = (refreshToken) => {
  const decoded = jwt.decode(refreshToken);

  if (decoded && typeof decoded.exp === 'number') {
    const remaining = decoded.exp - Math.floor(Date.now() / 1000);
    return Math.max(1, remaining);
  }

  return FALLBACK_TTL_SECONDS;
};

const cleanupExpiredInMemoryBlacklist = () => {
  const now = Math.floor(Date.now() / 1000);

  for (const [tokenHash, expiresAt] of inMemoryBlacklist.entries()) {
    if (expiresAt <= now) {
      inMemoryBlacklist.delete(tokenHash);
    }
  }
};

/**
 * Invalidate a refresh token (logout).
 * @param {string} refreshToken
 */
const blacklistToken = async (refreshToken) => {
  if (!refreshToken) return;

  const tokenHash = hashToken(refreshToken);
  const ttlSeconds = getBlacklistTtlSeconds(refreshToken);
  const redis = getRedisClient();

  if (redis) {
    await redis.set(buildRedisKey(tokenHash), '1', { EX: ttlSeconds });
    return;
  }

  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  inMemoryBlacklist.set(tokenHash, expiresAt);
};

/**
 * Check if a refresh token has been blacklisted.
 * @param {string} refreshToken
 * @returns {boolean}
 */
const isBlacklisted = async (refreshToken) => {
  if (!refreshToken) return false;

  const tokenHash = hashToken(refreshToken);
  const redis = getRedisClient();

  if (redis) {
    const exists = await redis.exists(buildRedisKey(tokenHash));
    return exists === 1;
  }

  cleanupExpiredInMemoryBlacklist();
  return inMemoryBlacklist.has(tokenHash);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  blacklistToken,
  isBlacklisted,
};
