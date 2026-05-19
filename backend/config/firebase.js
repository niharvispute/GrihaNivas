const admin = require('firebase-admin');

let firebaseApp = null;

/**
 * Initializes Firebase Admin SDK.
 * Called once at app startup — throws if env vars are missing.
 * Returns the initialized app instance.
 */
const initFirebase = () => {
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_PRIVATE_KEY_BASE64,
    FIREBASE_CLIENT_EMAIL,
  } = process.env;

  if (!FIREBASE_PROJECT_ID || (!FIREBASE_PRIVATE_KEY && !FIREBASE_PRIVATE_KEY_BASE64) || !FIREBASE_CLIENT_EMAIL) {
    console.warn('⚠️  Firebase config missing — OTP features disabled.');
    return null;
  }

  // Support both plain (with escaped \n) and base64-encoded private keys.
  // Use FIREBASE_PRIVATE_KEY_BASE64 on hosts that don't support multiline env vars (e.g. Hostinger).
  const privateKey = FIREBASE_PRIVATE_KEY_BASE64
    ? Buffer.from(FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8')
    : FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

  if (admin.apps.length === 0) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          privateKey,
          clientEmail: FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.info('✅ Firebase Admin initialized');
    } catch (err) {
      console.warn('⚠️  Firebase init skipped (invalid credentials).');
      console.warn('    OTP features will not work until real Firebase credentials are set.');
      console.warn('    Error:', err.message);
    }
  } else {
    firebaseApp = admin.apps[0];
  }

  return firebaseApp;
};

/**
 * Returns the Firebase Admin auth instance.
 * Must call initFirebase() before using this.
 */
const getFirebaseAuth = () => admin.auth();

module.exports = { initFirebase, getFirebaseAuth };
