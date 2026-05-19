const admin = require('firebase-admin');

let firebaseApp = null;

/**
 * Initializes Firebase Admin SDK.
 * Called once at app startup — throws if env vars are missing.
 * Returns the initialized app instance.
 */
const initFirebase = () => {
  const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
    throw new Error(
      'Firebase config missing. Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL in .env'
    );
  }

  if (admin.apps.length === 0) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          // Replace escaped newlines from .env string format
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.info('✅ Firebase Admin initialized');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Firebase init skipped in development (invalid placeholder credentials).');
        console.warn('    OTP features will not work until real Firebase credentials are set.');
      } else {
        // In production a bad Firebase config is fatal
        throw err;
      }
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
