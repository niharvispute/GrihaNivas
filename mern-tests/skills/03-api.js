'use strict';

/**
 * Skill 03 — API Contract Tests
 * Status codes, response structure, field presence, response timing.
 * Tests every discovered route for correct HTTP semantics.
 */

const { buildClient, timedBatch } = require('../utils/http');
const { makeResult }              = require('../utils/reporter');
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

  // ── Helper: assert status code ────────────────────────────────────────
  function assertStatus(label, actual, expected, opts = {}) {
    const ok = Array.isArray(expected)
      ? expected.includes(actual)
      : actual === expected;
    return makeResult(label, ok, {
      severity: opts.severity || 'MEDIUM',
      expected: `HTTP ${Array.isArray(expected) ? expected.join(' or ') : expected}`,
      actual:   `HTTP ${actual}`,
      fix:      opts.fix,
      durationMs: opts.durationMs,
    });
  }

  // ── 1. Public endpoints return 200 ───────────────────────────────────
  const publicRoutes = [
    ['/health',              200],
    ['/health/ready',        [200, 503]],
    ['/api/properties',      200],
    ['/api/blogs',           200],
    ['/api/testimonials',    200],
    ['/api/builders',        200],
    ['/api/system/config',   [200, 404]],
    ['/api/banners',         [200, 404]],
  ];

  for (const [path, code] of publicRoutes) {
    const r = await api.get(path);
    tests.push(assertStatus(
      `GET ${path} returns ${Array.isArray(code) ? code.join('/') : code}`,
      r.status, code,
      { severity: 'HIGH', durationMs: r.durationMs }
    ));
  }

  // ── 2. Protected endpoints return 401 without token ───────────────────
  const protectedRoutes = [
    '/api/auth/me',
    '/api/leads',
    '/api/users/me',
    '/api/dashboard',
    '/api/properties/admin',
    '/api/leads/export',
    '/api/users/export',
    '/api/testimonials/export',
  ];

  for (const path of protectedRoutes) {
    const r = await api.get(path);
    tests.push(assertStatus(
      `GET ${path} returns 401 without token`,
      r.status, 401,
      { severity: 'CRITICAL', durationMs: r.durationMs,
        fix: 'protect middleware must reject requests missing Authorization header' }
    ));
  }

  // ── 3. 404 for unknown routes ─────────────────────────────────────────
  {
    const r = await api.get('/api/this-route-does-not-exist');
    tests.push(assertStatus(
      'GET /api/nonexistent returns 404 (not 500)',
      r.status, [404, 400],
      { severity: 'MEDIUM', durationMs: r.durationMs }
    ));

    // Must return JSON, not HTML
    const isJson = typeof r.data === 'object' && r.data !== null;
    tests.push(makeResult(
      'Unknown route returns JSON body (not HTML error page)',
      isJson,
      {
        severity: 'MEDIUM',
        expected: 'JSON { success: false, message: "Not found" }',
        actual:   typeof r.data === 'string' ? 'HTML string' : `type: ${typeof r.data}`,
        fix:      'notFoundHandler in errorHandler.js must send JSON',
      }
    ));
  }

  // ── 4. Missing required fields → 400, not 500 ─────────────────────────
  const postRoutes = [
    ['/api/calculators/emi',        {},                    'EMI calculator with empty body'],
    ['/api/calculators/stamp-duty', {},                    'Stamp duty calculator with empty body'],
    ['/api/contact',                {},                    'Contact form with empty body'],
    ['/api/auth/login',             {},                    'Login with empty body'],
    ['/api/auth/signup/request',    {},                    'Signup request with empty body'],
  ];

  for (const [path, body, label] of postRoutes) {
    const r = await api.post(path, { body });
    tests.push(assertStatus(
      `POST ${path} with empty body → 400/422 (${label})`,
      r.status, [400, 422],
      { severity: 'HIGH', durationMs: r.durationMs,
        fix: `Add Zod/express-validator schema to ${path} POST handler` }
    ));
  }

  // ── 5. Error responses never expose stack traces ───────────────────────
  {
    const r = await api.post('/api/calculators/emi', { body: {} });
    const body = JSON.stringify(r.data || '');
    const exposesStack = body.includes('at ') && body.includes('.js:');
    tests.push(makeResult(
      'Error response does not expose stack traces',
      !exposesStack,
      {
        severity: 'HIGH',
        expected: 'No stack trace in response body',
        actual: exposesStack ? 'Stack trace found in response' : 'Clean error',
        fix: 'In globalErrorHandler, check process.env.NODE_ENV and omit err.stack in production',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 6. Response times — all public routes under 2s ───────────────────
  {
    const slowRoutes = [];
    const routesToTime = [
      '/api/properties',
      '/api/blogs',
      '/api/testimonials',
    ];

    for (const path of routesToTime) {
      const stats = await timedBatch(() => api.get(path), 5);
      const isSlowP95 = stats.p95 > cfg.RESPONSE_TIME_CRITICAL;
      const isWarnP95 = stats.p95 > cfg.RESPONSE_TIME_WARN;

      if (isSlowP95) slowRoutes.push(path);

      tests.push(makeResult(
        `GET ${path} p95 response time < ${cfg.RESPONSE_TIME_CRITICAL}ms`,
        !isSlowP95,
        {
          severity: isSlowP95 ? 'HIGH' : (isWarnP95 ? 'LOW' : null),
          expected: `p95 < ${cfg.RESPONSE_TIME_CRITICAL}ms`,
          actual:   `avg=${stats.avg}ms p95=${stats.p95}ms p99=${stats.p99}ms`,
          fix:      isSlowP95 ? 'Add .select() to mongoose query, ensure indexes exist, add response caching' : null,
          durationMs: stats.avg,
          tags: ['performance'],
        }
      ));
    }
  }

  // ── 7. Extra fields in body are ignored ──────────────────────────────
  {
    const r = await api.post('/api/calculators/emi', {
      body: {
        principal:          5000000,
        annualInterestRate: 8.5,
        tenureMonths:       240,
        hackField:          'injected',
        __proto__:          { polluted: true },
      },
    });
    tests.push(makeResult(
      'POST with extra unknown fields does not crash (returns 200)',
      r.ok,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 200 — unknown fields silently stripped',
        actual:   `HTTP ${r.status}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 8. Success response always has { success: true } wrapper ─────────
  {
    const r = await api.get('/api/properties');
    tests.push(makeResult(
      'Successful response always includes { success: true }',
      r.ok && r.data?.success === true,
      {
        severity: 'MEDIUM',
        expected: '{ success: true, data: ... }',
        actual:   `success = ${r.data?.success}`,
        fix:      'Ensure all controllers use apiResponse.success() — see utils/apiResponse.js',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 9. Admin routes with admin token return 200 ──────────────────────
  if (adminToken) {
    const adminRoutes = [
      '/api/leads',
      '/api/dashboard',
      '/api/properties/admin',
    ];
    for (const path of adminRoutes) {
      const r = await api.get(path, { headers: authHeader(adminToken) });
      tests.push(assertStatus(
        `GET ${path} returns 200 with admin token`,
        r.status, 200,
        { severity: 'HIGH', durationMs: r.durationMs }
      ));
    }
  }

  return { skill: 'API Contract (03)', tests };
}

module.exports = { run };
