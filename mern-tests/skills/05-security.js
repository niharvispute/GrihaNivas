'use strict';

/**
 * Skill 05 — Security Tests
 * XSS, NoSQL injection, auth bypass, privilege escalation,
 * sensitive data exposure, header audit, CORS.
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

  // ── 1. XSS — sanitisation of text inputs ─────────────────────────────
  // xss-clean middleware should strip <script> tags before they persist
  {
    const xssPayload = '<script>alert("xss")</script>';

    const r = await api.post('/api/calculators/emi', {
      body: { principal: xssPayload, annualInterestRate: 8.5, tenureMonths: 240 },
    });

    // Either: 400 (rejected as non-number) or 200 but script tag is NOT in response
    const bodyStr = JSON.stringify(r.data || '');
    const scriptReflected = bodyStr.includes('<script>');

    tests.push(makeResult(
      'XSS payload in input is not reflected in response',
      !scriptReflected,
      {
        severity: 'CRITICAL',
        expected: 'No <script> tag reflected in response',
        actual: scriptReflected ? '⚠️ <script> tag found in response' : 'Clean',
        fix: 'Verify xss-clean middleware is applied: app.use(xss()) in app.js',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 2. XSS in contact form message field ─────────────────────────────
  {
    const xssPayload = '<img src=x onerror=alert(1)>';
    const r = await api.post('/api/contact', {
      body: {
        name:    'Test',
        email:   'test@example.com',
        phone:   '+919876543210',
        message: xssPayload,
        subject: 'Test',
      },
    });
    const bodyStr = JSON.stringify(r.data || '');
    const reflected = bodyStr.includes('<img') && bodyStr.includes('onerror');

    tests.push(makeResult(
      'XSS payload in contact message not reflected',
      !reflected,
      {
        severity: 'CRITICAL',
        expected: 'XSS stripped by xss-clean middleware',
        actual: reflected ? '⚠️ img/onerror found in response' : 'Clean',
        fix: 'Confirm app.use(xss()) runs before route handlers',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 3. NoSQL Injection — login endpoint ──────────────────────────────
  // express-mongo-sanitize strips $ and . from keys
  {
    const r = await api.post('/api/auth/login', {
      body: { identifier: { '$gt': '' }, password: { '$gt': '' } },
    });
    // Should get 400 (validation error) not 200 (logged in!)
    tests.push(makeResult(
      'NoSQL injection on login is rejected (not 200)',
      r.status !== 200,
      {
        severity: 'CRITICAL',
        expected: 'HTTP 400 or 401 — operator injection rejected',
        actual: `HTTP ${r.status}`,
        fix: 'Verify app.use(mongoSanitize()) is applied in app.js before routes',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 4. Auth bypass — every protected route without token → 401 ────────
  const protectedRoutes = [
    ['GET',  '/api/auth/me'],
    ['GET',  '/api/leads'],
    ['GET',  '/api/users/me'],
    ['GET',  '/api/dashboard'],
    ['GET',  '/api/properties/admin'],
    ['POST', '/api/leads'],
    ['GET',  '/api/leads/export'],
  ];

  for (const [method, path] of protectedRoutes) {
    const r = await api[method.toLowerCase()](path);
    tests.push(makeResult(
      `Auth bypass: ${method} ${path} without token → 401`,
      r.status === 401,
      {
        severity: 'CRITICAL',
        expected: 'HTTP 401',
        actual: `HTTP ${r.status}`,
        fix: `protect middleware must be applied to ${path}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 5. Privilege escalation — user token on admin routes ─────────────
  // We can't create a real user token without OTP flow, so we test with a crafted
  // but structurally valid JWT for a user role (will fail JWT verify → 401)
  {
    // Use an obviously fake token — verifyJWT must reject it
    const fakeUserJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.fake_signature';
    const r = await api.get('/api/dashboard', {
      headers: { Authorization: `Bearer ${fakeUserJwt}` },
    });
    tests.push(makeResult(
      'Fake JWT on admin route is rejected (401/403)',
      r.status === 401 || r.status === 403,
      {
        severity: 'CRITICAL',
        expected: 'HTTP 401 or 403',
        actual: `HTTP ${r.status}`,
        fix: 'JWT verification must check signature — ensure JWT_SECRET is set and not empty',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 6. Sensitive data — password hash not in API responses ────────────
  {
    const r = await api.get('/api/properties');
    const bodyStr = JSON.stringify(r.data || '');
    const exposesHash = bodyStr.includes('passwordHash') || bodyStr.includes('password');

    tests.push(makeResult(
      'API responses do not expose passwordHash field',
      !exposesHash,
      {
        severity: 'CRITICAL',
        expected: 'No passwordHash in any response',
        actual: exposesHash ? '⚠️ password field found in response' : 'Clean',
        fix: 'Mongoose User schema: passwordHash field has select: false — verify controllers do not override select()',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 7. Security headers audit ─────────────────────────────────────────
  {
    const r = await api.get('/health');
    const h = r.headers || {};

    const securityHeaders = [
      ['x-frame-options',          'X-Frame-Options'],
      ['x-content-type-options',   'X-Content-Type-Options'],
      ['x-xss-protection',         'X-XSS-Protection'],
    ];

    for (const [hKey, hName] of securityHeaders) {
      const present = !!h[hKey];
      tests.push(makeResult(
        `Security header present: ${hName}`,
        present,
        {
          severity: 'MEDIUM',
          expected: `${hName} header in response`,
          actual: present ? h[hKey] : 'MISSING',
          fix: 'Helmet middleware provides these — verify app.use(helmet()) is before routes in app.js',
          durationMs: r.durationMs,
        }
      ));
    }

    // CSP header (helmet adds this)
    const hasCSP = !!h['content-security-policy'];
    tests.push(makeResult(
      'Content-Security-Policy header present',
      hasCSP,
      {
        severity: 'MEDIUM',
        expected: 'Content-Security-Policy header',
        actual: hasCSP ? 'present' : 'MISSING',
        fix: 'app.use(helmet()) in app.js — helmet sets CSP by default',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 8. CORS — reject arbitrary evil origin ───────────────────────────
  {
    // Build a fresh axios instance that sends Origin header
    const corsCheckClient = buildClient(cfg.BACKEND_URL, {
      Origin: 'https://evil-hacker-site.com',
    });
    const r = await corsCheckClient.get('/api/properties');

    // CORS with credentials: if the response contains ACAO header set to the evil origin, that's a finding
    const acao = (r.headers || {})['access-control-allow-origin'];
    const corsVulnerable = acao === 'https://evil-hacker-site.com' || acao === '*';

    tests.push(makeResult(
      'CORS: evil origin is not reflected in Access-Control-Allow-Origin',
      !corsVulnerable,
      {
        severity: 'HIGH',
        expected: 'ACAO header absent or restricted to allowedOrigins',
        actual: acao ? `ACAO: ${acao}` : 'ACAO not set (correct)',
        fix: 'In app.js CORS config: ensure allowedOrigins does not include \'*\' and isLocalDevOrigin check is guarded by !isProduction',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 9. JWT in URL — should never appear ───────────────────────────────
  // Scan a few known endpoints that return redirects/links
  {
    const r = await api.get('/api/properties');
    const bodyStr = JSON.stringify(r.data || '');
    const jwtInUrl = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(bodyStr);

    tests.push(makeResult(
      'No JWT tokens embedded in API response body',
      !jwtInUrl,
      {
        severity: 'HIGH',
        expected: 'No JWT in response body',
        actual: jwtInUrl ? '⚠️ JWT pattern found in response body' : 'Clean',
        fix: 'Never embed JWT tokens in property/blog responses',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 10. Rate limiter — too many rapid requests return 429 ─────────────
  // Note: global limiter is 300 req per 15 min — we test the auth limiter
  {
    let hit429 = false;
    for (let i = 0; i < 20; i++) {
      const r = await api.post('/api/auth/login', {
        body: { identifier: 'ratelimit-test@test.com', password: 'wrongpassword' },
      });
      if (r.status === 429) { hit429 = true; break; }
    }

    tests.push(makeResult(
      'Rate limiter returns 429 after repeated failed auth attempts',
      hit429,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 429 after excessive requests',
        actual: hit429 ? 'Got 429' : 'Rate limiter not triggered in 20 requests',
        fix: 'authLimiter in middleware/rateLimiter.js — verify max is low (e.g., 10 per 15 min)',
        durationMs: null,
      }
    ));
  }

  // ── 11. Content-Type enforcement ─────────────────────────────────────
  {
    // Send plain text body to a JSON endpoint
    const r = await buildClient(cfg.BACKEND_URL, { 'Content-Type': 'text/plain' })
      .post('/api/calculators/emi', {
        body: 'principal=5000000&annualRate=8.5&tenureMonths=240',
      });

    tests.push(makeResult(
      'JSON endpoint rejects text/plain body gracefully (400/415, not crash)',
      r.status !== 500,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 400 or 415',
        actual: `HTTP ${r.status}`,
        fix: 'Express will not parse text/plain as JSON — ensure validation catches empty body',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 12. Admin token cannot read other user's private data ─────────────
  // (structural check — verifies admin can list users and it's gated)
  if (!adminToken) {
    const r = await api.get('/api/users');
    tests.push(makeResult(
      'GET /api/users (admin list) returns 401 without token',
      r.status === 401,
      {
        severity: 'CRITICAL',
        expected: 'HTTP 401',
        actual: `HTTP ${r.status}`,
        fix: 'Users list route must be admin-only',
        durationMs: r.durationMs,
      }
    ));
  }

  return { skill: 'Security (05)', tests };
}

module.exports = { run };
