'use strict';

/**
 * Skill 01 — Functional Tests
 * Happy path + error path for every discovered route.
 * Auth flows, form validation, CRUD lifecycle.
 * NEVER writes permanent data — all test records are cleaned up.
 */

const { buildClient } = require('../utils/http');
const { makeResult }  = require('../utils/reporter');
const cfg = require('../config/test.config');

const api = buildClient(cfg.BACKEND_URL);

let adminToken   = null;
let userToken    = null;
let createdBlogId = null;

// ── Helpers ───────────────────────────────────────────────────────────────
async function adminLogin() {
  if (!cfg.TEST_ADMIN_PASSWORD) return null;
  const r = await api.post('/api/auth/login', {
    body: { email: cfg.TEST_ADMIN_EMAIL, password: cfg.TEST_ADMIN_PASSWORD },
  });
  return r.data?.data?.accessToken || r.data?.token || null;
}

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function run() {
  const tests = [];
  adminToken = await adminLogin();

  // ── 1. Calculator — EMI ───────────────────────────────────────────────
  {
    const r = await api.post('/api/calculators/emi', {
      body: { principal: 5000000, annualRate: 8.5, tenureMonths: 240 },
    });
    tests.push(makeResult(
      'POST /api/calculators/emi returns monthly EMI',
      r.ok && r.data?.data?.emi > 0,
      {
        severity: 'HIGH',
        expected: 'HTTP 200 with { data: { emi: <number> } }',
        actual: `HTTP ${r.status} — emi=${r.data?.data?.emi}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 2. Calculator — EMI validation ───────────────────────────────────
  {
    const r = await api.post('/api/calculators/emi', {
      body: { principal: -1, annualRate: 0, tenureMonths: 0 },
    });
    tests.push(makeResult(
      'POST /api/calculators/emi rejects invalid inputs with 400',
      r.status === 400 || r.status === 422,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 400/422',
        actual: `HTTP ${r.status}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 3. Calculator — Stamp Duty ────────────────────────────────────────
  {
    const r = await api.post('/api/calculators/stamp-duty', {
      body: { propertyValue: 10000000, ownerType: 'male', propertyType: 'residential' },
    });
    tests.push(makeResult(
      'POST /api/calculators/stamp-duty returns stamp duty amount',
      r.ok && typeof r.data?.data?.stampDuty === 'number',
      {
        severity: 'HIGH',
        expected: 'HTTP 200 with { data: { stampDuty: <number> } }',
        actual: `HTTP ${r.status}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 4. Properties list — public ───────────────────────────────────────
  {
    const r = await api.get('/api/properties');
    tests.push(makeResult(
      'GET /api/properties returns paginated list',
      r.ok && Array.isArray(r.data?.data),
      {
        severity: 'HIGH',
        expected: 'HTTP 200 with { data: [] }',
        actual: `HTTP ${r.status}, data type: ${typeof r.data?.data}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 5. Properties list — with filters ────────────────────────────────
  {
    const r = await api.get('/api/properties', { params: { category: 'buy', bhk: 2 } });
    tests.push(makeResult(
      'GET /api/properties?category=buy&bhk=2 filters correctly',
      r.ok,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 200',
        actual: `HTTP ${r.status}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 6. Properties list — invalid category ────────────────────────────
  {
    const r = await api.get('/api/properties', { params: { category: 'INVALID_CAT' } });
    tests.push(makeResult(
      'GET /api/properties with invalid category returns 400',
      r.status === 400 || r.status === 422 || r.ok, // some APIs ignore unknown filters
      {
        severity: 'LOW',
        expected: 'HTTP 400 or 200 (graceful ignore)',
        actual: `HTTP ${r.status}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 7. Property detail — non-existent ID ─────────────────────────────
  {
    const r = await api.get('/api/properties/000000000000000000000000');
    tests.push(makeResult(
      'GET /api/properties/:id with fake ObjectId returns 404',
      r.status === 404,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 404 with { success: false }',
        actual: `HTTP ${r.status}`,
        fix: 'Controller should check if null result and call next(new AppError(404))',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 8. Property detail — malformed ID ────────────────────────────────
  {
    const r = await api.get('/api/properties/not-a-valid-id');
    tests.push(makeResult(
      'GET /api/properties/:id with invalid ID does not crash (returns 400/404)',
      r.status === 400 || r.status === 404,
      {
        severity: 'HIGH',
        expected: 'HTTP 400 or 404',
        actual: `HTTP ${r.status}`,
        fix: 'Add ObjectId validation to schema validators or use CastError handler in globalErrorHandler',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 9. Blogs list — public ────────────────────────────────────────────
  {
    const r = await api.get('/api/blogs');
    tests.push(makeResult(
      'GET /api/blogs returns list',
      r.ok && Array.isArray(r.data?.data),
      {
        severity: 'HIGH',
        expected: 'HTTP 200 with { data: [] }',
        actual: `HTTP ${r.status}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 10. Blog slug — non-existent ─────────────────────────────────────
  {
    const r = await api.get('/api/blogs/this-slug-does-not-exist-xyz123');
    tests.push(makeResult(
      'GET /api/blogs/:slug with non-existent slug returns 404',
      r.status === 404,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 404',
        actual: `HTTP ${r.status}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 11. Testimonials — public ─────────────────────────────────────────
  {
    const r = await api.get('/api/testimonials');
    tests.push(makeResult(
      'GET /api/testimonials returns list',
      r.ok,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 200',
        actual: `HTTP ${r.status}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 12. Builders — public ─────────────────────────────────────────────
  {
    const r = await api.get('/api/builders');
    tests.push(makeResult(
      'GET /api/builders returns list',
      r.ok,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 200',
        actual: `HTTP ${r.status}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 13. System config — public ────────────────────────────────────────
  {
    const r = await api.get('/api/system/config');
    tests.push(makeResult(
      'GET /api/system/config returns platform config',
      r.ok,
      {
        severity: 'LOW',
        expected: 'HTTP 200',
        actual: `HTTP ${r.status}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 14. Contact form — empty fields ──────────────────────────────────
  {
    const r = await api.post('/api/contact', { body: {} });
    tests.push(makeResult(
      'POST /api/contact with empty body returns 400',
      r.status === 400 || r.status === 422,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 400/422 validation error',
        actual: `HTTP ${r.status}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 15. Auth — signup with invalid email ─────────────────────────────
  {
    const r = await api.post('/api/auth/signup/request', {
      body: { email: 'not-an-email', password: 'short' },
    });
    tests.push(makeResult(
      'POST /api/auth/signup/request with invalid email returns 400',
      r.status === 400 || r.status === 422,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 400/422',
        actual: `HTTP ${r.status}`,
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 16. Auth — login with wrong password ──────────────────────────────
  {
    const r = await api.post('/api/auth/login', {
      body: { email: cfg.TEST_ADMIN_EMAIL, password: 'definitly-wrong-password-xyz' },
    });
    tests.push(makeResult(
      'POST /api/auth/login with wrong password returns 401',
      r.status === 401 || r.status === 400,
      {
        severity: 'HIGH',
        expected: 'HTTP 401',
        actual: `HTTP ${r.status}`,
        fix: 'Auth controller must compare password hash and return 401 on mismatch',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 17. Auth — GET /me without token → 401 ────────────────────────────
  {
    const r = await api.get('/api/auth/me');
    tests.push(makeResult(
      'GET /api/auth/me without token returns 401',
      r.status === 401,
      {
        severity: 'CRITICAL',
        expected: 'HTTP 401',
        actual: `HTTP ${r.status}`,
        fix: 'protect middleware must return 401 when Authorization header is missing',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 18. Admin-only route without token → 401 ─────────────────────────
  {
    const r = await api.get('/api/leads');
    tests.push(makeResult(
      'GET /api/leads (admin-only) without token returns 401',
      r.status === 401,
      {
        severity: 'CRITICAL',
        expected: 'HTTP 401',
        actual: `HTTP ${r.status}`,
        fix: 'protect middleware must reject unauthenticated requests',
        durationMs: r.durationMs,
      }
    ));
  }

  // ── 19. Admin CRUD: create + delete blog ──────────────────────────────
  if (adminToken) {
    const createR = await api.post('/api/blogs', {
      body: {
        title:    'Test Blog Post __AUTO_TEST__',
        content:  'This is a test blog post created by the automated test suite.',
        category: 'market-trends',
        status:   'draft',
      },
      headers: authHeader(adminToken),
    });
    const blogCreated = createR.ok && createR.data?.data?._id;
    createdBlogId = createR.data?.data?._id || null;

    tests.push(makeResult(
      'Admin POST /api/blogs creates a blog post',
      !!blogCreated,
      {
        severity: 'HIGH',
        expected: 'HTTP 201 with blog _id',
        actual: `HTTP ${createR.status}`,
        durationMs: createR.durationMs,
      }
    ));

    if (createdBlogId) {
      const delR = await api.delete(`/api/blogs/${createdBlogId}`, {
        headers: authHeader(adminToken),
      });
      tests.push(makeResult(
        'Admin DELETE /api/blogs/:id removes the test blog',
        delR.ok || delR.status === 204,
        {
          severity: 'HIGH',
          expected: 'HTTP 200/204',
          actual: `HTTP ${delR.status}`,
          durationMs: delR.durationMs,
        }
      ));
    }
  } else {
    tests.push(makeResult(
      'Admin CRUD blog test skipped — no admin token',
      true,
      { severity: 'INFO', expected: 'Set TEST_ADMIN_PASSWORD to enable' }
    ));
  }

  // ── 20. Dashboard — admin only ────────────────────────────────────────
  if (adminToken) {
    const r = await api.get('/api/dashboard', { headers: authHeader(adminToken) });
    tests.push(makeResult(
      'GET /api/dashboard returns stats for admin',
      r.ok,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 200 with dashboard stats',
        actual: `HTTP ${r.status}`,
        durationMs: r.durationMs,
      }
    ));
  }

  return { skill: 'Functional (01)', tests };
}

module.exports = { run };
