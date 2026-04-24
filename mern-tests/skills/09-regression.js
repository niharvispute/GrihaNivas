'use strict';

/**
 * Skill 09 — Regression Suite
 * Re-runs the 10 most critical checks from skills 01–05.
 * Target: < 2 minutes. Run after every deploy.
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

  // ── R1. Backend health check ──────────────────────────────────────────
  {
    const r = await api.get('/health');
    tests.push(makeResult(
      'R1: Backend /health responds 200',
      r.ok && r.status === 200,
      {
        severity: 'CRITICAL',
        expected: 'HTTP 200',
        actual: `HTTP ${r.status}`,
        fix: 'Backend must be running: cd backend && npm run dev',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── R2. MongoDB connected ─────────────────────────────────────────────
  {
    const r = await api.get('/health/ready');
    tests.push(makeResult(
      'R2: MongoDB connected (/health/ready)',
      r.ok && r.data?.checks?.mongo?.connected === true,
      {
        severity: 'CRITICAL',
        expected: 'mongo.connected = true',
        actual: `HTTP ${r.status} — ${JSON.stringify(r.data?.checks?.mongo)}`,
        fix: 'Check MONGODB_URI in backend/.env',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── R3. Main CRUD — properties list ──────────────────────────────────
  {
    const r = await api.get('/api/properties');
    tests.push(makeResult(
      'R3: GET /api/properties returns data array',
      r.ok && Array.isArray(r.data?.data),
      {
        severity: 'CRITICAL',
        expected: '{ success: true, data: [] }',
        actual: `HTTP ${r.status}, success=${r.data?.success}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── R4. EMI calculator functional ────────────────────────────────────
  {
    const r = await api.post('/api/calculators/emi', {
      body: { principal: 5000000, annualInterestRate: 8.5, tenureMonths: 240 },
    });
    tests.push(makeResult(
      'R4: EMI calculator returns valid EMI',
      r.ok && r.data?.data?.emi > 0,
      {
        severity: 'HIGH',
        expected: 'HTTP 200 with emi > 0',
        actual: `HTTP ${r.status}, emi=${r.data?.data?.emi}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── R5. Auth — protected route without token → 401 ────────────────────
  {
    const r = await api.get('/api/auth/me');
    tests.push(makeResult(
      'R5: GET /api/auth/me without token returns 401',
      r.status === 401,
      {
        severity: 'CRITICAL',
        expected: 'HTTP 401',
        actual: `HTTP ${r.status}`,
        fix: 'protect middleware must reject missing Authorization header',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── R6. Admin-only route without token → 401 ─────────────────────────
  {
    const r = await api.get('/api/leads');
    tests.push(makeResult(
      'R6: GET /api/leads (admin) without token returns 401',
      r.status === 401,
      {
        severity: 'CRITICAL',
        expected: 'HTTP 401',
        actual: `HTTP ${r.status}`,
        fix: 'adminOnly middleware — verify it is applied to leads routes',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── R7. Admin login works ─────────────────────────────────────────────
  {
    if (!cfg.TEST_ADMIN_PASSWORD) {
      tests.push(makeResult('R7: Admin login skipped — no password set', true, { severity: 'INFO' }));
    } else {
      const r = await api.post('/api/auth/login', {
        body: { identifier: cfg.TEST_ADMIN_EMAIL, password: cfg.TEST_ADMIN_PASSWORD },
      });
      const token = r.data?.data?.accessToken || r.data?.token;
      tests.push(makeResult(
        'R7: Admin login returns access token',
        r.ok && !!token,
        {
          severity: 'CRITICAL',
          expected: 'HTTP 200 with accessToken',
          actual: `HTTP ${r.status}, token=${!!token}`,
          fix: 'Seed admin: cd backend && node scripts/seedAdmin.js',
          durationMs: r.durationMs,
        }
      ));
    }
  }

  // ── R8. XSS not reflected ─────────────────────────────────────────────
  {
    const r = await api.post('/api/calculators/emi', {
      body: { principal: '<script>alert(1)</script>', annualInterestRate: 8.5, tenureMonths: 240 },
    });
    const reflected = JSON.stringify(r.data || '').includes('<script>');
    tests.push(makeResult(
      'R8: XSS payload not reflected in response',
      !reflected,
      {
        severity: 'CRITICAL',
        expected: 'No <script> in response',
        actual: reflected ? '⚠️ script tag reflected' : 'Clean',
        fix: 'Verify app.use(xss()) middleware is applied in app.js',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── R9. NoSQL injection blocked ───────────────────────────────────────
  {
    const r = await api.post('/api/auth/login', {
      body: { email: { '$gt': '' }, password: { '$gt': '' } },
    });
    tests.push(makeResult(
      'R9: NoSQL injection on login returns non-200',
      r.status !== 200,
      {
        severity: 'CRITICAL',
        expected: 'HTTP 400/401 (not 200)',
        actual: `HTTP ${r.status}`,
        fix: 'Verify app.use(mongoSanitize()) is applied in app.js',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── R10. Admin dashboard accessible with valid token ──────────────────
  {
    const adminToken = await adminLogin();
    if (!adminToken) {
      tests.push(makeResult(
        'R10: Dashboard access skipped — no admin token',
        true,
        { severity: 'INFO' }
      ));
    } else {
      const r = await api.get('/api/dashboard', { headers: authHeader(adminToken) });
      tests.push(makeResult(
        'R10: Admin dashboard accessible with valid token',
        r.ok,
        {
          severity: 'HIGH',
          expected: 'HTTP 200',
          actual: `HTTP ${r.status}`,
          durationMs: r.durationMs,
        }
      ));
    }
  }

  return { skill: 'Regression (09)', tests };
}

module.exports = { run };
