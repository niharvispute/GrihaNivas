'use strict';

const fs   = require('fs');
const path = require('path');
const dayjs = require('dayjs');

const REPORTS_DIR = path.join(__dirname, '..', 'reports');

function severityOrder(s) {
  return { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 }[s] ?? 5;
}

function statusIcon(passed) { return passed ? '✅' : '❌'; }

/**
 * Aggregate all skill results and write a markdown report.
 *
 * @param {Array<{skill, tests: Array<{name, passed, severity?, expected?, actual?, fix?, durationMs?, tags?}>}>} skillResults
 * @param {Object} perfMetrics  — { endpoints: [], lighthouse: {} }
 * @param {Array}  optimizations — perf/code findings
 */
function generateReport(skillResults, perfMetrics = {}, optimizations = []) {
  const timestamp = dayjs().format('YYYY-MM-DD-HH-mm');
  const reportFile = path.join(REPORTS_DIR, `report-${timestamp}.md`);

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  // ── Tally ────────────────────────────────────────────────────────────────
  let totalPass = 0, totalFail = 0, totalWarn = 0;
  const allFailures = [];

  for (const sr of skillResults) {
    for (const t of sr.tests) {
      if (t.passed) {
        totalPass++;
      } else if (t.severity === 'LOW' || t.severity === 'INFO') {
        totalWarn++;
        allFailures.push({ ...t, skill: sr.skill });
      } else {
        totalFail++;
        allFailures.push({ ...t, skill: sr.skill });
      }
    }
  }

  allFailures.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
  const criticalCount = allFailures.filter((f) => f.severity === 'CRITICAL').length;

  // ── Build Markdown ────────────────────────────────────────────────────────
  const lines = [];

  lines.push(`# Bricks API — Post-Deployment Test Report`);
  lines.push(`\n> Generated: **${dayjs().format('YYYY-MM-DD HH:mm:ss')}**`);
  lines.push(`> App: \`http://localhost:5000\` (backend) · \`http://localhost:3000\` (frontend)`);
  lines.push(`\n---\n`);

  // Summary
  lines.push(`## Summary\n`);
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| ✅ Passed | **${totalPass}** |`);
  lines.push(`| ❌ Failed | **${totalFail}** |`);
  lines.push(`| ⚠️ Warnings | **${totalWarn}** |`);
  lines.push(`| 🚨 Critical Failures | **${criticalCount}** |`);
  lines.push('');

  // Per-skill table
  lines.push(`## Results by Skill\n`);
  lines.push(`| Skill | Pass | Fail | Status |`);
  lines.push(`|-------|------|------|--------|`);
  for (const sr of skillResults) {
    const p = sr.tests.filter((t) => t.passed).length;
    const f = sr.tests.filter((t) => !t.passed).length;
    const icon = f === 0 ? '✅' : (sr.tests.filter((t) => !t.passed && (t.severity === 'CRITICAL' || t.severity === 'HIGH')).length > 0 ? '🚨' : '⚠️');
    lines.push(`| ${sr.skill} | ${p} | ${f} | ${icon} |`);
  }
  lines.push('');

  // Failures
  if (allFailures.length > 0) {
    lines.push(`## Failures (sorted by severity)\n`);
    for (const f of allFailures) {
      const sev = f.severity || 'MEDIUM';
      lines.push(`### ${statusIcon(false)} [${sev}] ${f.name}`);
      lines.push(`**Skill:** ${f.skill}`);
      if (f.expected) lines.push(`\n**Expected:** ${f.expected}`);
      if (f.actual)   lines.push(`**Actual:** ${f.actual}`);
      if (f.fix) {
        lines.push(`\n**Fix:**`);
        lines.push('```');
        lines.push(f.fix);
        lines.push('```');
      }
      lines.push('');
    }
  }

  // Performance table
  if (perfMetrics.endpoints && perfMetrics.endpoints.length > 0) {
    lines.push(`## Performance Metrics\n`);
    lines.push(`### API Response Times\n`);
    lines.push(`| Endpoint | Avg (ms) | P95 (ms) | P99 (ms) | Flag |`);
    lines.push(`|----------|----------|----------|----------|------|`);
    for (const ep of perfMetrics.endpoints) {
      const flag = ep.avg > 2000 ? '🚨 CRITICAL' : (ep.avg > 500 ? '⚠️ SLOW' : '✅');
      lines.push(`| \`${ep.route}\` | ${ep.avg} | ${ep.p95} | ${ep.p99} | ${flag} |`);
    }
    lines.push('');
  }

  if (perfMetrics.lighthouse) {
    const lh = perfMetrics.lighthouse;
    lines.push(`### Lighthouse Scores\n`);
    lines.push(`| Metric | Value | Threshold | Status |`);
    lines.push(`|--------|-------|-----------|--------|`);
    if (lh.lcp  !== undefined) lines.push(`| LCP (ms)  | ${lh.lcp}  | 2500 | ${lh.lcp  > 2500 ? '❌' : '✅'} |`);
    if (lh.ttfb !== undefined) lines.push(`| TTFB (ms) | ${lh.ttfb} | 600  | ${lh.ttfb > 600  ? '❌' : '✅'} |`);
    if (lh.tbt  !== undefined) lines.push(`| TBT (ms)  | ${lh.tbt}  | 300  | ${lh.tbt  > 300  ? '❌' : '✅'} |`);
    if (lh.cls  !== undefined) lines.push(`| CLS       | ${lh.cls}  | 0.1  | ${lh.cls  > 0.1  ? '❌' : '✅'} |`);
    lines.push('');
  }

  // Optimizations
  if (optimizations.length > 0) {
    lines.push(`## Optimization Recommendations\n`);
    const byImpact = { High: [], Medium: [], Low: [] };
    for (const o of optimizations) {
      (byImpact[o.impact] || byImpact.Low).push(o);
    }
    for (const impact of ['High', 'Medium', 'Low']) {
      if (byImpact[impact].length === 0) continue;
      lines.push(`### ${impact} Impact\n`);
      for (const o of byImpact[impact]) {
        lines.push(`#### ${o.title}`);
        if (o.file)  lines.push(`**File:** \`${o.file}\``);
        if (o.issue) lines.push(`\n**Issue:** ${o.issue}`);
        if (o.before) {
          lines.push(`\n**Current:**`);
          lines.push('```js');
          lines.push(o.before);
          lines.push('```');
        }
        if (o.after) {
          lines.push(`**Optimized:**`);
          lines.push('```js');
          lines.push(o.after);
          lines.push('```');
        }
        lines.push('');
      }
    }
  }

  // Quick-win checklist
  lines.push(`## Quick-Win Checklist\n`);
  lines.push(`- [ ] Fix all CRITICAL failures first`);
  lines.push(`- [ ] Fix all HIGH severity failures`);
  lines.push(`- [ ] Review MEDIUM severity warnings`);
  lines.push(`- [ ] Apply High-impact optimizations`);
  lines.push(`- [ ] Re-run \`node run-all.js --phase smoke\` after each fix`);
  lines.push(`- [ ] Re-run \`node run-all.js --phase all\` before next release`);
  lines.push('');

  const content = lines.join('\n');
  fs.writeFileSync(reportFile, content, 'utf8');
  return { reportFile, totalPass, totalFail, totalWarn, criticalCount };
}

/**
 * Build a TestResult helper to standardise test entries.
 */
function makeResult(name, passed, opts = {}) {
  return {
    name,
    passed,
    severity:  opts.severity  || (passed ? null : 'MEDIUM'),
    expected:  opts.expected  || null,
    actual:    opts.actual    || null,
    fix:       opts.fix       || null,
    durationMs: opts.durationMs || null,
    tags:      opts.tags      || [],
  };
}

module.exports = { generateReport, makeResult };
