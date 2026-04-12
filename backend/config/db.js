const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas via Mongoose.
 * Called once at server startup — exits process on failure.
 *
 * Connection events are logged so you can see the DB status
 * at a glance in any environment without digging through logs.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment variables.');
  }

  // Mongoose 7+ doesn't need these options but they're safe to set for clarity
  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);

  console.info('✅ MongoDB connected:', mongoose.connection.host);

  // ── Connection lifecycle events ──────────────────────────────────────────
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.info('✅ MongoDB reconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.connection.close();
  console.info('MongoDB connection closed.');
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
