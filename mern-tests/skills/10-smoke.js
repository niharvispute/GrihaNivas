'use strict';

/**
 * Skill 10 — Smoke Tests
 * 5 essential checks. Run these first — they confirm the app is alive.
 * If any fail, do not bother running the full suite.
 */

const { buildClient } = require('../utils/http');
const { makeResult }  = require('../utils/reporter');
const cfg = require('../config/test.config');

const api = buildClient(cfg.BACKEND_URL);

async function run() {
  const tests = [];
  let accessToken = null;

  // ── 1. Backend health responds ───────────────────────────────────────────
  {
    const r = await api.get('/health');
    tests.push(makeResult(
      'Backend health endpoint responds HTTP 200',
      r.ok && r.status === 200,
      {
        severity: 'CRITICAL',
        expected: 'HTTP 200 with { success: true }',
        actual: r.error ? `Network error: ${r.error}` : `HTTP ${r.status}`,
        fix: 'Start the backend: cd backend && npm run dev\nThen verify PORT=5000 in backend/.env',
        durationMs: r.durationMs,
      }
    ));

    if (!r.ok) {
      tests.push(makeResult(
        'Remaining smoke tests skipped — backend is not reachable',
        false,
        {
          severity: 'CRITICAL',
          expected: 'Backend running on port 5000',
          actual: 'Connection refused',
          fix: 'cd backend && npm run dev',
        }
      ));
      return { skill: 'Smoke (10)', tests };
    }
  }

  // ── 2. API health/ready endpoint ─────────────────────────────────────────
  {
    const r = await api.get('/health/ready');
    const mongoOk = r.data?.checks?.mongo?.connected === true;
    tests.push(makeResult(
      'Health/ready: MongoDB connected',
      r.ok && mongoOk,
      {
        severity: 'CRITICAL',
        expected: 'HTTP 200, checks.mongo.connected = true',
        actual: r.ok
          ? `HTTP ${r.status}, mongo.connected = ${mongoOk}`
          : `HTTP ${r.status}`,
        fix: 'Ensure MONGODB_URI is set in backend/.env and MongoDB is running.\nStart: mongod --dbpath /data/db',
      }
    ));
  }

  // ── 3. Login with test credentials ───────────────────────────────────────
  {
    if (!cfg.TEST_ADMIN_PASSWORD) {
      tests.push(makeResult(
        'Admin login skipped — TEST_ADMIN_PASSWORD not set',
        true,
        { severity: 'INFO', expected: 'Set TEST_ADMIN_PASSWORD env var to enable' }
      ));
    } else {
      const r = await api.post('/api/auth/login', {
        body: { identifier: cfg.TEST_ADMIN_EMAIL, password: cfg.TEST_ADMIN_PASSWORD },
      });
      accessToken = r.data?.data?.accessToken || r.data?.token || null;
      tests.push(makeResult(
        `Login as admin (${cfg.TEST_ADMIN_EMAIL})`,
        r.ok && !!accessToken,
        {
          severity: 'CRITICAL',
          expected: 'HTTP 200 with { data: { accessToken: "..." } }',
          actual: r.error ? `Network error: ${r.error}` : `HTTP ${r.status}, token=${!!accessToken}`,
          fix: 'Run: cd backend && node scripts/seedAdmin.js\nSet TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD env vars',
          durationMs: r.durationMs,
        }
      ));
    }
  }

  // ── 4. Protected route accessible with token ──────────────────────────────
  {
    if (!accessToken) {
      tests.push(makeResult(
        'Protected route check skipped — no access token',
        true,
        { severity: 'INFO' }
      ));
    } else {
      const r = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      tests.push(makeResult(
        'GET /api/auth/me returns user profile with valid token',
        r.ok && r.data?.data?.id,
        {
          severity: 'CRITICAL',
          expected: 'HTTP 200 with { data: { id, email, role } }',
          actual: `HTTP ${r.status}`,
          fix: 'Check JWT_SECRET in backend/.env matches what was used to sign the token',
          durationMs: r.durationMs,
        }
      ));
    }
  }

  // ── 5. Logout invalidates token ───────────────────────────────────────────
  {
    if (!accessToken) {
      tests.push(makeResult(
        'Logout test skipped — no access token',
        true,
        { severity: 'INFO' }
      ));
    } else {
      // Logout
      await api.post('/api/auth/logout', {
        body: { refreshToken: 'dummy' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Try using the (now-blacklisted) token
      const r = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Accept either 401 (token blacklisted) or the token still works
      // because in-memory blacklist resets on restart; mark as warning not critical
      const blacklisted = r.status === 401;
      tests.push(makeResult(
        'Logout: subsequent request with old token returns 401',
        blacklisted,
        {
          severity: 'HIGH',
          expected: 'HTTP 401 after logout',
          actual: `HTTP ${r.status}`,
          fix: 'Ensure JWT blacklist is working. If JWT_BLACKLIST_STORE=memory, tokens survive server restart.\nFor production, set REDIS_URL and JWT_BLACKLIST_STORE=redis',
          durationMs: r.durationMs,
        }
      ));
    }
  }

  return { skill: 'Smoke (10)', tests };
}

module.exports = { run };
