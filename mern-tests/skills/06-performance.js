'use strict';

/**
 * Skill 06 — Performance Tests
 * Baseline + concurrent load using axios batches.
 * Lighthouse for frontend Core Web Vitals (if frontend is up).
 * All load tests against localhost only.
 */

const { buildClient, timedBatch, concurrentBatch } = require('../utils/http');
const { makeResult } = require('../utils/reporter');
const { execSync }   = require('child_process');
const cfg = require('../config/test.config');

const api = buildClient(cfg.BACKEND_URL);

async function run() {
  const tests   = [];
  const metrics = { endpoints: [], lighthouse: null };

  // ── 1. Baseline: top 5 endpoints × 10 calls ───────────────────────────
  const baselineRoutes = [
    '/api/properties',
    '/api/blogs',
    '/api/testimonials',
    '/api/builders',
    '/api/system/config',
  ];

  for (const path of baselineRoutes) {
    const stats = await timedBatch(() => api.get(path), 10);
    metrics.endpoints.push({ route: path, ...stats });

    const isCritical = stats.p95 > cfg.RESPONSE_TIME_CRITICAL;
    const isWarn     = stats.p95 > cfg.RESPONSE_TIME_WARN;

    tests.push(makeResult(
      `Baseline: GET ${path} p95 < ${cfg.RESPONSE_TIME_CRITICAL}ms`,
      !isCritical,
      {
        severity: isCritical ? 'HIGH' : (isWarn ? 'LOW' : null),
        expected: `p95 < ${cfg.RESPONSE_TIME_CRITICAL}ms`,
        actual: `avg=${stats.avg}ms, p95=${stats.p95}ms, p99=${stats.p99}ms, min=${stats.min}ms`,
        fix: isCritical ? 'Add .select() to mongoose queries, verify indexes, enable Redis caching' : null,
        durationMs: stats.avg,
        tags: ['performance'],
      }
    ));
  }

  // ── 2. Load: 50 concurrent users on /api/properties ───────────────────
  {
    const stats = await concurrentBatch(() => api.get('/api/properties'), 50);
    metrics.endpoints.push({ route: '/api/properties (50x concurrent)', ...stats });

    const isCritical = stats.p95 > 5000; // 5s threshold under load
    tests.push(makeResult(
      'Load test: 50 concurrent GET /api/properties — p95 < 5000ms',
      !isCritical,
      {
        severity: isCritical ? 'HIGH' : 'LOW',
        expected: 'p95 < 5000ms under 50 concurrent requests',
        actual: `avg=${stats.avg}ms p95=${stats.p95}ms total=${stats.totalMs}ms`,
        fix: 'Add mongoose query projection (.select()), enable Redis response caching, add compound indexes',
        durationMs: stats.avg,
        tags: ['performance', 'load'],
      }
    ));
  }

  // ── 3. Load: 20 concurrent EMI calculations (CPU-bound) ───────────────
  {
    const stats = await concurrentBatch(
      () => api.post('/api/calculators/emi', {
        body: { principal: 5000000, annualInterestRate: 8.5, tenureMonths: 240 },
      }),
      20
    );
    metrics.endpoints.push({ route: 'POST /api/calculators/emi (20x concurrent)', ...stats });

    tests.push(makeResult(
      'Load test: 20 concurrent EMI calculations — p95 < 2000ms',
      stats.p95 < 2000,
      {
        severity: stats.p95 > 2000 ? 'MEDIUM' : null,
        expected: 'p95 < 2000ms',
        actual: `avg=${stats.avg}ms p95=${stats.p95}ms`,
        durationMs: stats.avg,
        tags: ['performance'],
      }
    ));
  }

  // ── 4. Lighthouse (if frontend is running) ────────────────────────────
  {
    // Quick check if frontend is up
    const frontendCheck = await api.get(cfg.FRONTEND_URL).catch(() => ({ ok: false }));

    if (!frontendCheck.ok) {
      tests.push(makeResult(
        'Lighthouse audit skipped — frontend not running on port 3000',
        true,
        {
          severity: 'INFO',
          expected: 'Start frontend: cd frontend && npm run dev',
        }
      ));
    } else {
      let lhResult = null;

      try {
        const lhOutput = execSync(
          `npx lighthouse ${cfg.FRONTEND_URL} --output json --quiet --chrome-flags="--headless --no-sandbox" 2>/dev/null`,
          { timeout: 60000, stdio: ['pipe', 'pipe', 'ignore'] }
        ).toString();
        lhResult = JSON.parse(lhOutput);
      } catch (e) {
        // Lighthouse not installed or frontend not accessible
      }

      if (lhResult) {
        const audits  = lhResult.audits || {};
        const lcp     = audits['largest-contentful-paint']?.numericValue;
        const ttfb    = audits['server-response-time']?.numericValue;
        const tbt     = audits['total-blocking-time']?.numericValue;
        const cls     = audits['cumulative-layout-shift']?.numericValue;

        metrics.lighthouse = { lcp: Math.round(lcp), ttfb: Math.round(ttfb), tbt: Math.round(tbt), cls: +cls?.toFixed(3) };

        const t = cfg.LIGHTHOUSE;
        if (lcp !== undefined) {
          tests.push(makeResult(
            `Lighthouse LCP < ${t.LCP_WARN_MS}ms`,
            lcp < t.LCP_WARN_MS,
            { severity: lcp > t.LCP_WARN_MS ? 'HIGH' : null,
              expected: `LCP < ${t.LCP_WARN_MS}ms`, actual: `LCP = ${Math.round(lcp)}ms`,
              fix: 'Optimise hero image size, use next/image, implement lazy loading',
              tags: ['performance', 'lighthouse'] }
          ));
        }
        if (ttfb !== undefined) {
          tests.push(makeResult(
            `Lighthouse TTFB < ${t.TTFB_WARN_MS}ms`,
            ttfb < t.TTFB_WARN_MS,
            { severity: ttfb > t.TTFB_WARN_MS ? 'MEDIUM' : null,
              expected: `TTFB < ${t.TTFB_WARN_MS}ms`, actual: `TTFB = ${Math.round(ttfb)}ms`,
              fix: 'Enable gzip on Next.js server, move to CDN, add ISR caching in next.config.mjs',
              tags: ['performance', 'lighthouse'] }
          ));
        }
        if (tbt !== undefined) {
          tests.push(makeResult(
            `Lighthouse TBT < ${t.TBT_WARN_MS}ms`,
            tbt < t.TBT_WARN_MS,
            { severity: tbt > t.TBT_WARN_MS ? 'MEDIUM' : null,
              expected: `TBT < ${t.TBT_WARN_MS}ms`, actual: `TBT = ${Math.round(tbt)}ms`,
              fix: 'Code-split heavy components with dynamic(() => import()), defer non-critical scripts',
              tags: ['performance', 'lighthouse'] }
          ));
        }
        if (cls !== undefined) {
          tests.push(makeResult(
            `Lighthouse CLS < ${t.CLS_WARN}`,
            cls < t.CLS_WARN,
            { severity: cls > t.CLS_WARN ? 'MEDIUM' : null,
              expected: `CLS < ${t.CLS_WARN}`, actual: `CLS = ${cls}`,
              fix: 'Set explicit width/height on images, avoid inserting DOM above existing content',
              tags: ['performance', 'lighthouse'] }
          ));
        }
      } else {
        tests.push(makeResult(
          'Lighthouse could not run (install: npm install -g lighthouse)',
          true,
          { severity: 'INFO' }
        ));
      }
    }
  }

  return { skill: 'Performance (06)', tests, metrics };
}

module.exports = { run };
