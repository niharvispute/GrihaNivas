require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { disconnectDB } = require('./config/db');
const { initCloudinary } = require('./config/cloudinary');
const { initFirebase } = require('./config/firebase');
const { initRedis, closeRedis } = require('./config/redis');
const { startRejectedPropertyCleanupJob } = require('./services/propertyLifecycleService');

const PORT = process.env.PORT || 5000;

/**
 * Bootstrap function — initializes all services before starting the HTTP server.
 * If any critical service fails to initialize, the process exits.
 * A failed DB connection should never silently serve traffic.
 */
const bootstrap = async () => {
  try {
    // 1. Database
    await connectDB();

    // 2. Cloudinary
    initCloudinary();

    // 3. Firebase Admin
    initFirebase();

    // 4. Redis (JWT blacklist store)
    await initRedis();

    // 5. Scheduled cleanup for rejected property submissions
    startRejectedPropertyCleanupJob();

    // 6. Start HTTP server — only after all services are ready
    const server = app.listen(PORT, () => {
      console.info(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.info(`📡 Health: http://localhost:${PORT}/health`);
      console.info(`🔗 API:    http://localhost:${PORT}/api\n`);
    });

    // ── Graceful Shutdown ────────────────────────────────────────────────
    // Allows in-flight requests to complete before the process exits.
    // Critical for PM2 cluster restarts and container deployments.

    let isShuttingDown = false;

    const shutdown = (signal) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      console.info(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        console.info('✅ HTTP server closed.');

        await closeRedis();
        await disconnectDB();

        process.exit(0);
      });

      // Force exit after 10s if connections won't close
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout.');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM')); // PM2 / Docker stop
    process.on('SIGINT',  () => shutdown('SIGINT'));  // Ctrl+C in terminal

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

// ── Unhandled Rejection / Exception Guards ──────────────────────────────────
// Last-resort safety net — these should ideally never trigger.
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});

bootstrap();
