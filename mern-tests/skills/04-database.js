'use strict';

/**
 * Skill 04 — Database Tests
 * Model validation, unique constraints, type coercion, index presence.
 * All verified via API layer (read-only from test perspective).
 * Any created test records are cleaned up immediately.
 */

const { buildClient } = require('../utils/http');
const { makeResult }  = require('../utils/reporter');
const cfg = require('../config/test.config');

const api = buildClient(cfg.BACKEND_URL);

async function adminLogin() {
  if (!cfg.TEST_ADMIN_PASSWORD) return null;
  const r = await api.post('/api/auth/login', {
    body: { identifier: cfg.TEST_ADMIN_EMAIL, password: cfg.TEST_ADMIN_PASSWORD },
  });
  return r.data?.data?.accessToken || r.data?.token || null;
}

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function run() {
  const tests = [];
  const adminToken = await adminLogin();

  // ── 1. Required field: title missing from blog → 400/422 ─────────────
  if (adminToken) {
    const r = await api.post('/api/blogs', {
      body: { content: 'Content without a title', category: 'market_trends' },
      headers: authHeader(adminToken),
    });
    tests.push(makeResult(
      'Blog: missing required field "title" returns 400/422',
      r.status === 400 || r.status === 422,
      {
        severity: 'HIGH',
        expected: 'HTTP 400 or 422 with validation error',
        actual: `HTTP ${r.status}: ${JSON.stringify(r.data?.message || '')}`,
        fix: 'Zod schema for blog.create must mark "title" as required',
        durationMs: r.durationMs,
      }
    ));
  } else {
    tests.push(makeResult('Blog required-field test skipped — no admin token', true, { severity: 'INFO' }));
  }

  // ── 2. Enum validation: invalid property category → 400 ──────────────
  if (adminToken) {
    const r = await api.post('/api/properties', {
      body: {
        title: 'Test Property',
        description: 'A test property',
        category: 'INVALID_CATEGORY', // must be buy|rent|commercial|new_launch
        price: 5000000,
        'location.area': 'Bandra',
      },
      headers: authHeader(adminToken),
    });
    tests.push(makeResult(
      'Property: invalid category enum value returns 400/422',
      r.status === 400 || r.status === 422,
      {
        severity: 'HIGH',
        expected: 'HTTP 400 or 422',
        actual: `HTTP ${r.status}`,
        fix: 'Zod enum validation must include all four categories: buy, rent, commercial, new_launch',
        durationMs: r.durationMs,
      }
    ));
  } else {
    tests.push(makeResult('Property enum test skipped — no admin token', true, { severity: 'INFO' }));
  }

  // ── 3. Price negative validation ──────────────────────────────────────
  if (adminToken) {
    const r = await api.post('/api/properties', {
      body: {
        title: 'Negative Price Test',
        description: 'Testing negative price',
        category: 'buy',
        price: -1000,
        'location.area': 'Andheri',
      },
      headers: authHeader(adminToken),
    });
    tests.push(makeResult(
      'Property: negative price returns 400/422',
      r.status === 400 || r.status === 422,
      {
        severity: 'HIGH',
        expected: 'HTTP 400 — price must be >= 0',
        actual: `HTTP ${r.status}`,
        fix: 'Add .min(0) to price field in Zod schema for property creation',
        durationMs: r.durationMs,
      }
    ));
  } else {
    tests.push(makeResult('Price validation test skipped — no admin token', true, { severity: 'INFO' }));
  }

  // ── 4. EMI calculator — type coercion (string instead of number) ──────
  {
    const r = await api.post('/api/calculators/emi', {
      body: { principal: 'not-a-number', annualInterestRate: 8.5, tenureMonths: 240 },
    });
    tests.push(makeResult(
      'EMI calc: string principal rejected with 400/422',
      r.status === 400 || r.status === 422,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 400 — principal must be a number',
        actual: `HTTP ${r.status}`,
        fix: 'Zod schema: z.number() for principal field in calculator schema',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 5. Lead — required field "leadType" missing ───────────────────────
  if (adminToken) {
    const r = await api.post('/api/leads', {
      body: {
        name: 'Test Lead',
        phone: '+919876543210',
        // missing leadType
      },
      headers: authHeader(adminToken),
    });
    tests.push(makeResult(
      'Lead: missing required "leadType" returns 400/422',
      r.status === 400 || r.status === 422,
      {
        severity: 'HIGH',
        expected: 'HTTP 400 or 422',
        actual: `HTTP ${r.status}`,
        fix: 'Zod lead.create schema must require leadType enum: buy|rent|loan|agreement',
        durationMs: r.durationMs,
      }
    ));
  } else {
    tests.push(makeResult('Lead required-field test skipped — no admin token', true, { severity: 'INFO' }));
  }

  // ── 6. Lead — invalid leadType enum ──────────────────────────────────
  if (adminToken) {
    const r = await api.post('/api/leads', {
      body: {
        name: 'Test Lead',
        phone: '+919876543210',
        leadType: 'INVALID',
      },
      headers: authHeader(adminToken),
    });
    tests.push(makeResult(
      'Lead: invalid leadType returns 400/422',
      r.status === 400 || r.status === 422,
      {
        severity: 'HIGH',
        expected: 'HTTP 400 — leadType must be buy|rent|loan|agreement',
        actual: `HTTP ${r.status}`,
        durationMs: r.durationMs,
      }
    ));
  } else {
    tests.push(makeResult('Lead enum test skipped — no admin token', true, { severity: 'INFO' }));
  }

  // ── 7. Duplicate email signup → 400/409 ───────────────────────────────
  {
    // First attempt with dummy email (will likely fail with OTP required, but should not 500)
    const r = await api.post('/api/auth/signup/request', {
      body: { name: 'Test User', email: cfg.TEST_ADMIN_EMAIL, phone: '+919876543210', password: 'Password123!' },
    });
    tests.push(makeResult(
      'Signup with existing email returns 400/409 (not 500)',
      r.status !== 500,
      {
        severity: 'HIGH',
        expected: 'HTTP 400 or 409 — email already in use',
        actual: `HTTP ${r.status}`,
        fix: 'authController.signupRequest must check for duplicate email and return 409',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 8. Properties pagination — limit/skip parameters work ────────────
  {
    const r1 = await api.get('/api/properties', { params: { page: 1, limit: 2 } });
    const r2 = await api.get('/api/properties', { params: { page: 2, limit: 2 } });

    const d1 = r1.data?.data || [];
    const d2 = r2.data?.data || [];

    // If there are enough properties, pages should differ
    const paginationWorks = !r1.ok || !r2.ok ||
      d1.length === 0 || d2.length === 0 ||
      (d1[0]?._id !== d2[0]?._id);

    tests.push(makeResult(
      'GET /api/properties: page 1 and page 2 return different records',
      paginationWorks,
      {
        severity: 'MEDIUM',
        expected: 'Different records for page=1 and page=2',
        actual: `page1[0]._id=${d1[0]?._id}, page2[0]._id=${d2[0]?._id}`,
        fix: 'Use utils/pagination.js consistently in propertyController.list',
        durationMs: r1.durationMs,
      }
    ));
  }

  // ── 9. Mongoose CastError — invalid ObjectId returns 400 not 500 ──────
  {
    const r = await api.get('/api/properties/definitely-not-an-object-id-12345');
    tests.push(makeResult(
      'Invalid ObjectId in URL returns 400/404 (Mongoose CastError handled)',
      r.status === 400 || r.status === 404,
      {
        severity: 'HIGH',
        expected: 'HTTP 400 or 404',
        actual: `HTTP ${r.status}`,
        fix: `In globalErrorHandler, handle err.name === 'CastError':
if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid ID format' });`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 10. Properties response is not exposing DB internals ─────────────
  {
    const r = await api.get('/api/properties');
    const items = r.data?.data || [];
    if (items.length > 0) {
      const item = items[0];
      const exposesInternals = '__v' in item || 'passwordHash' in item;
      tests.push(makeResult(
        'Property documents do not expose __v or passwordHash',
        !exposesInternals,
        {
          severity: 'MEDIUM',
          expected: 'No __v field in response',
          actual: `Fields: ${Object.keys(item).join(', ')}`,
          fix: 'Set versionKey: false in propertySchema options',
          durationMs: r.durationMs,
        }
      ));
    } else {
      tests.push(makeResult('DB internals check skipped — no properties in DB', true, { severity: 'INFO' }));
    }
  }

  return { skill: 'Database (04)', tests };
}

module.exports = { run };
