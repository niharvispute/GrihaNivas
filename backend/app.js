const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

const { globalLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
const { getRedisRuntimeStatus } = require('./config/redis');
const routes = require('./routes/index');

const app = express();

const isProduction = process.env.NODE_ENV === 'production';
const trustProxyEnabled = process.env.TRUST_PROXY === 'true' || isProduction;
const forceHttps = process.env.FORCE_HTTPS === 'true';

if (trustProxyEnabled) {
  // Required when running behind Nginx/ALB so req.secure uses x-forwarded-proto
  app.set('trust proxy', 1);
}

// ── 1. Security Headers ────────────────────────────────────────────────────
app.use(helmet());

// ── 2. CORS ────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [];

const isLocalDevOrigin = (origin) => {
  if (!origin) return false;

  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol !== 'http:' && protocol !== 'https:') return false;

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '192.168.1.5') {
      return true;
    }

    // Allow LAN/private IPv4 hosts during local development.
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
    if (/^192\.168\.\d{1,3}\.\d{1,5}$/.test(hostname)) return true;
    return false;
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, curl)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (!isProduction && isLocalDevOrigin(origin)) {
        return callback(null, true);
      }

      // Do not throw 500 for CORS mismatch; just omit CORS headers.
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── 3. Request Parsing ─────────────────────────────────────────────────────
// 10kb limit prevents large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── 4. Data Sanitization ───────────────────────────────────────────────────
// Strips $ and . from keys — prevents NoSQL injection
app.use(mongoSanitize());
// Strips HTML tags from user input — prevents XSS
app.use(xss());
// Prevents HTTP Parameter Pollution (e.g. ?status=new&status=closed)
// Whitelist allows multiple values for these specific params
app.use(hpp({ whitelist: ['category', 'bhk', 'amenities', 'highlights', 'builder', 'builderSlug'] }));

// ── 5. Compression ─────────────────────────────────────────────────────────
app.use(compression());

// ── 6. HTTP Logging ────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── 7. Global Rate Limiter ────────────────────────────────────────────────
app.use('/api', globalLimiter);

// ── 8. Health Check ───────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/ready', (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;
  const redisStatus = getRedisRuntimeStatus();

  let redisReady = true;
  if (redisStatus.mode === 'redis') {
    redisReady = redisStatus.connected;
  } else if (redisStatus.mode === 'auto') {
    redisReady = redisStatus.hasUrl ? redisStatus.connected : true;
  }

  const ready = mongoConnected && redisReady;

  return res.status(ready ? 200 : 503).json({
    success: ready,
    status: ready ? 'ready' : 'not_ready',
    environment: process.env.NODE_ENV,
    checks: {
      mongo: {
        connected: mongoConnected,
      },
      redisBlacklist: {
        mode: redisStatus.mode,
        hasUrl: redisStatus.hasUrl,
        connected: redisStatus.connected,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// ── 9. HTTPS Enforcement (optional) ───────────────────────────────────────
if (forceHttps) {
  app.use((req, res, next) => {
    const forwardedProto = req.headers['x-forwarded-proto'];
    const isSecure = req.secure || forwardedProto === 'https';

    if (isSecure) {
      return next();
    }

    const host = req.headers.host;
    if (!host) {
      return next();
    }

    return res.redirect(301, `https://${host}${req.originalUrl}`);
  });
}

// ── 10. API Routes ────────────────────────────────────────────────────────
// Disable ETags on API to prevent 304 responses (which have no body)
app.disable('etag');
app.use('/api', routes);

// ── 11. 404 Handler ───────────────────────────────────────────────────────
app.use(notFoundHandler);

// ── 12. Global Error Handler (must be last) ──────────────────────────────
app.use(globalErrorHandler);

module.exports = app;
