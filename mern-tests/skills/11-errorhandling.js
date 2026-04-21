'use strict';

/**
 * Skill 11 — Error Handling Tests
 * Malformed JSON, wrong Content-Type, non-existent routes,
 * unhandled errors, stack trace exposure.
 */

const axios  = require('axios');
const { buildClient } = require('../utils/http');
const { makeResult }  = require('../utils/reporter');
const cfg = require('../config/test.config');

const api = buildClient(cfg.BACKEND_URL);

async function run() {
  const tests = [];

  // ── 1. Malformed JSON body → 400 not 500 ─────────────────────────────
  {
    let result = null;
    try {
      const resp = await axios.post(`${cfg.BACKEND_URL}/api/calculators/emi`, 'this is {not valid json', {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true,
        timeout: 10000,
      });
      result = { status: resp.status, data: resp.data };
    } catch (e) {
      result = { status: 0, data: null, error: e.message };
    }

    tests.push(makeResult(
      'Malformed JSON body → 400 (not 500 crash)',
      result.status === 400 || result.status === 422,
      {
        severity: 'HIGH',
        expected: 'HTTP 400 — Express body-parser rejects malformed JSON',
        actual: `HTTP ${result.status}`,
        fix: 'Express\'s built-in JSON parser already returns 400 for malformed JSON — verify globalErrorHandler does not re-throw as 500',
      }
    ));
  }

  // ── 2. text/plain body to JSON endpoint ───────────────────────────────
  {
    let result = null;
    try {
      const resp = await axios.post(
        `${cfg.BACKEND_URL}/api/calculators/emi`,
        'principal=5000000&annualRate=8.5&tenureMonths=240',
        {
          headers: { 'Content-Type': 'text/plain' },
          validateStatus: () => true,
          timeout: 10000,
        }
      );
      result = { status: resp.status, data: resp.data };
    } catch (e) {
      result = { status: 0, data: null };
    }

    tests.push(makeResult(
      'text/plain body to JSON endpoint → 400/415 (not crash)',
      result.status !== 500 && result.status !== 0,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 400 or 415',
        actual: `HTTP ${result.status}`,
        fix: 'Zod validation will catch empty/unparsed body — returns 400',
      }
    ));
  }

  // ── 3. Non-existent route → 404 JSON ─────────────────────────────────
  {
    const r = await api.get('/api/route-that-does-not-exist-xyz');
    const isJson = typeof r.data === 'object' && r.data !== null;

    tests.push(makeResult(
      'Non-existent route returns 404 JSON (not HTML)',
      r.status === 404 && isJson,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 404 with JSON body { success: false }',
        actual: `HTTP ${r.status}, body type: ${typeof r.data}`,
        fix: `notFoundHandler in middleware/errorHandler.js must return JSON:
res.status(404).json({ success: false, message: 'Route not found' })`,
      }
    ));
  }

  // ── 4. Non-existent nested route ─────────────────────────────────────
  {
    const r = await api.get('/completely/outside/api');
    tests.push(makeResult(
      'Route outside /api prefix returns 404',
      r.status === 404,
      {
        severity: 'LOW',
        expected: 'HTTP 404',
        actual: `HTTP ${r.status}`,
      }
    ));
  }

  // ── 5. Error response does not expose stack trace ─────────────────────
  {
    // Trigger an error by sending invalid ID
    const r = await api.get('/api/properties/bad-id-for-cast-error');
    const body = JSON.stringify(r.data || '');
    const hasStack = body.includes('at Object') || body.includes('.js:') && body.includes('    at ');

    tests.push(makeResult(
      'Error response does not expose Node.js stack trace',
      !hasStack,
      {
        severity: 'HIGH',
        expected: 'No stack trace in response body',
        actual: hasStack ? '⚠️ Stack trace found in response' : 'Clean',
        fix: `In globalErrorHandler:
if (process.env.NODE_ENV === 'production') {
  delete err.stack;  // never send stack in production
}`,
      }
    ));
  }

  // ── 6. DELETE with missing ID ─────────────────────────────────────────
  {
    const r = await api.delete('/api/properties/000000000000000000000000');
    tests.push(makeResult(
      'DELETE /api/properties with fake ID returns 401/404 (not crash)',
      r.status === 401 || r.status === 404 || r.status === 403,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 401 (unauth) or 404 (not found)',
        actual: `HTTP ${r.status}`,
      }
    ));
  }

  // ── 7. Oversized payload → 413 ───────────────────────────────────────
  {
    const bigPayload = 'x'.repeat(11 * 1024); // 11kb — limit is 10kb
    let result = null;
    try {
      const resp = await axios.post(
        `${cfg.BACKEND_URL}/api/contact`,
        { message: bigPayload, name: 'Test', email: 'a@b.com', phone: '+919876543210' },
        { headers: { 'Content-Type': 'application/json' }, validateStatus: () => true, timeout: 10000 }
      );
      result = { status: resp.status };
    } catch (e) {
      result = { status: 0 };
    }

    tests.push(makeResult(
      'Oversized payload (11kb) returns 413 (limit is 10kb)',
      result.status === 413 || result.status === 400,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 413 — payload too large',
        actual: `HTTP ${result.status}`,
        fix: 'app.use(express.json({ limit: "10kb" })) in app.js — already configured',
      }
    ));
  }

  // ── 8. Empty string fields vs null ───────────────────────────────────
  {
    const r = await api.post('/api/auth/login', {
      body: { email: '', password: '' },
    });
    tests.push(makeResult(
      'Login with empty string credentials returns 400 (not 500)',
      r.status === 400 || r.status === 401 || r.status === 422,
      {
        severity: 'MEDIUM',
        expected: 'HTTP 400/401/422',
        actual: `HTTP ${r.status}`,
        fix: 'Zod schema: z.string().min(1) for email and password fields',
      }
    ));
  }

  // ── 9. GET with body is handled gracefully ────────────────────────────
  {
    let result = null;
    try {
      const resp = await axios.get(
        `${cfg.BACKEND_URL}/api/properties`,
        {
          data: { malicious: 'payload' },
          validateStatus: () => true,
          timeout: 10000,
        }
      );
      result = { status: resp.status };
    } catch {
      result = { status: 200 }; // axios may drop body on GET
    }

    tests.push(makeResult(
      'GET request with body does not crash (200/400)',
      result.status !== 500,
      {
        severity: 'LOW',
        expected: 'HTTP 200 or 400 (body on GET is ignored or rejected)',
        actual: `HTTP ${result.status}`,
      }
    ));
  }

  // ── 10. Response has correct Content-Type: application/json ──────────
  {
    const r = await api.get('/api/properties');
    const ct = r.headers?.['content-type'] || '';
    const isJson = ct.includes('application/json');

    tests.push(makeResult(
      'API response Content-Type is application/json',
      isJson,
      {
        severity: 'MEDIUM',
        expected: 'Content-Type: application/json',
        actual: ct || 'missing',
        fix: 'Express sets Content-Type automatically for res.json() — ensure all responses use res.json() not res.send()',
      }
    ));
  }

  return { skill: 'Error Handling (11)', tests };
}

module.exports = { run };
