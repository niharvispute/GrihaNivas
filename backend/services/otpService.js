const crypto = require('crypto');
const { getFirebaseAuth } = require('../config/firebase');
const AppError = require('../utils/AppError');

/**
 * OTP Service
 *
 * Two auth paths are supported:
 *
 * Path A — Custom OTP (backend-generated):
 *   1. generateOtp(identifier)  → creates 6-digit OTP, stores with TTL
 *   2. verifyOtp(identifier, otp) → checks OTP, marks as used
 *   Storage: In-memory Map with expiry (swap for Redis in production)
 *
 * Path B — Firebase ID Token (frontend-handled OTP):
 *   1. Frontend uses Firebase Client SDK to send + verify phone OTP
 *   2. Frontend sends the Firebase ID token to the backend
 *   3. verifyFirebaseToken(idToken) → validates token, returns phone number
 *
 * The controller decides which path to use based on what the frontend sends.
 * If `otp` is present in req.body → Path A
 * If `idToken` is present in req.body → Path B
 */

// ── OTP Store (In-Memory) ────────────────────────────────────────────────────
// Key   : phone number or email
// Value : { hash, expiresAt, attempts }
//
// TODO: Replace this Map with a Redis client when Redis is available.
//       Interface stays identical — only the storage backend changes.
//       Redis command equivalent: SET key value EX 600 (10 min TTL)

const otpStore = new Map();

const OTP_TTL_MS      = 10 * 60 * 1000; // 10 minutes
const OTP_LENGTH      = 6;
const MAX_ATTEMPTS    = 5;              // lock after 5 wrong attempts

// Cleanup expired entries every 15 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (value.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}, 15 * 60 * 1000);

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a cryptographically secure 6-digit OTP.
 * Uses crypto.randomInt for true randomness (not Math.random).
 */
const generateSecureOtp = () => {
  const min = Math.pow(10, OTP_LENGTH - 1); // 100000
  const max = Math.pow(10, OTP_LENGTH);     // 1000000
  return String(crypto.randomInt(min, max));
};

/**
 * Hash the OTP before storing — never store plain OTPs.
 * Using SHA-256: fast, collision-resistant, no need for bcrypt here
 * because OTPs are short-lived and single-use.
 */
const hashOtp = (otp) =>
  crypto.createHash('sha256').update(otp).digest('hex');

// ── Path A: Custom OTP ───────────────────────────────────────────────────────

/**
 * Generate and store an OTP for the given identifier (phone or email).
 * Returns the plain OTP — caller is responsible for sending it to the user.
 *
 * Replaces any existing OTP for the same identifier (re-send scenario).
 *
 * @param {string} identifier - Phone (+91XXXXXXXXXX) or email
 * @returns {string} otp - Plain 6-digit OTP to be sent to user
 */
const generateOtp = (identifier) => {
  if (!identifier) {
    throw new AppError('Identifier (phone or email) is required to generate OTP', 400);
  }

  const otp = generateSecureOtp();

  otpStore.set(identifier, {
    hash: hashOtp(otp),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });

  return otp;
};

/**
 * Verify a plain OTP against the stored hash for the given identifier.
 *
 * @param {string} identifier - Must match the identifier used in generateOtp()
 * @param {string} otp        - Plain OTP entered by the user
 * @returns {true}            - Throws AppError on any failure
 */
const verifyOtp = (identifier, otp) => {
  const record = otpStore.get(identifier);

  // Not found or expired
  if (!record) {
    throw new AppError('OTP not found or has expired. Please request a new one.', 400);
  }

  // Expired (belt-and-suspenders check)
  if (Date.now() > record.expiresAt) {
    otpStore.delete(identifier);
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  // Too many failed attempts — prevent brute force
  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(identifier);
    throw new AppError(
      'Too many incorrect attempts. Please request a new OTP.',
      429
    );
  }

  // Constant-time comparison to prevent timing attacks
  const inputHash = hashOtp(otp);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(inputHash),
    Buffer.from(record.hash)
  );

  if (!isValid) {
    // Increment attempt counter — do NOT delete yet
    record.attempts += 1;
    otpStore.set(identifier, record);

    const remaining = MAX_ATTEMPTS - record.attempts;
    throw new AppError(
      `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      400
    );
  }

  // ✅ Valid — delete immediately (single-use)
  otpStore.delete(identifier);
  return true;
};

// ── Path B: Firebase ID Token ────────────────────────────────────────────────

/**
 * Verify a Firebase ID token issued by the frontend after phone OTP verification.
 * Returns the decoded token payload including the verified phone number.
 *
 * @param {string} idToken - Firebase ID token from the frontend
 * @returns {{ uid, phone_number, email? }} decoded token
 */
const verifyFirebaseToken = async (idToken) => {
  if (!idToken) {
    throw new AppError('Firebase ID token is required', 400);
  }

  try {
    const auth = getFirebaseAuth();
    const decoded = await auth.verifyIdToken(idToken);

    if (!decoded.phone_number && !decoded.email) {
      throw new AppError('Token does not contain a verified phone number or email', 400);
    }

    return {
      uid: decoded.uid,
      phone: decoded.phone_number || null,
      email: decoded.email || null,
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    // Firebase-specific errors
    if (err.code === 'auth/id-token-expired') {
      throw new AppError('Firebase token has expired. Please sign in again.', 401);
    }
    if (err.code === 'auth/argument-error' || err.code === 'auth/id-token-revoked') {
      throw new AppError('Invalid Firebase token.', 401);
    }
    if (err.message?.includes('Firebase init skipped')) {
      throw new AppError('Firebase is not configured. Use OTP path instead.', 503);
    }
    throw new AppError('Token verification failed. Please try again.', 401);
  }
};

// ── Dev Utilities ─────────────────────────────────────────────────────────────

/**
 * Get OTP store size — for testing/monitoring only.
 * Never expose this via an API endpoint.
 */
const getStoreSize = () => otpStore.size;

module.exports = {
  generateOtp,
  verifyOtp,
  verifyFirebaseToken,
  getStoreSize,
};
