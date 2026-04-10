const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');

const { globalLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
const routes = require('./routes/index');

const app = express();

// ── 1. Security Headers ────────────────────────────────────────────────────
app.use(helmet());

// ── 2. CORS ────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [];

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
      callback(new Error(`CORS: Origin "${origin}" not allowed`));
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

// ── 9. API Routes ─────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 10. 404 Handler ───────────────────────────────────────────────────────
app.use(notFoundHandler);

// ── 11. Global Error Handler (must be last) ───────────────────────────────
app.use(globalErrorHandler);

module.exports = app;
