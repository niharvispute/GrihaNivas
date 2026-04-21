#!/usr/bin/env node
'use strict';

/**
 * Bricks Real Estate Platform — Test Orchestrator
 *
 * Usage:
 *   node run-all.js                  → full suite
 *   node run-all.js --phase smoke    → 5 smoke checks only
 *   node run-all.js --phase all      → full suite (same as default)
 *   node run-all.js --phase security → security skill only
 *   node run-all.js --phase perf     → performance skill only
 *   node run-all.js --phase regression → regression suite only
 */

const chalk = require('chalk');
const dayjs = require('dayjs');
const { buildClient } = require('./utils/http');
const { generateReport } = require('./utils/reporter');
const { scan: scanOptimizations } = require('./utils/optimizationScanner');
const cfg = require('./config/test.config');

const args  = process.argv.slice(2);
const phase = (() => {
  const idx = args.indexOf('--phase');
  return idx >= 0 ? args[idx + 1] : 'all';
})();

// ── Phase → skill mapping ────────────────────────────────────────────────
const PHASES = {
  smoke:      ['10-smoke'],
  regression: ['09-regression'],
  security:   ['05-security'],
  perf:       ['06-performance'],
  all: [
    '01-functional',
    '02-integration',
    '03-api',
    '04-database',
    '05-security',
    '06-performance',
    '07-crossbrowser',
    '08-accessibility',
    '09-regression',
    '10-smoke',
    '11-errorhandling',
  ],
};

const skillsToRun = PHASES[phase] || PHASES.all;

// ── Helpers ──────────────────────────────────────────────────────────────
function divider(char = '─', n = 60) { return char.repeat(n); }

function statusIcon(passed) { return passed ? chalk.green('✅') : chalk.red('❌'); }

async function checkServerAlive() {
  const api = buildClient(cfg.BACKEND_URL);
  const r = await api.get('/health');
  return r.ok;
}

async function runSkill(name) {
  const start = Date.now();
  process.stdout.write(`  ${chalk.cyan('›')} ${name} ... `);
  try {
    const mod = require(`./skills/${name}`);
    const result = await mod.run();
    const pass  = result.tests.filter((t) => t.passed).length;
    const fail  = result.tests.filter((t) => !t.passed).length;
    const elapsed = Date.now() - start;
    const icon  = fail === 0 ? chalk.green('✅') : chalk.red(`❌ (${fail} failed)`);
    console.log(`${icon}  ${chalk.gray(pass + ' passed')}  ${chalk.gray(elapsed + 'ms')}`);
    return result;
  } catch (err) {
    const elapsed = Date.now() - start;
    console.log(chalk.red(`💥 ERROR: ${err.message}`) + chalk.gray(`  ${elapsed}ms`));
    return {
      skill: name,
      tests: [{
        name: `${name} crashed: ${err.message}`,
        passed: false,
        severity: 'CRITICAL',
        expected: 'Skill runs without error',
        actual: err.stack,
        fix: 'Check skill file for syntax errors or missing dependencies',
      }],
    };
  }
}

// ── Main ─────────────────────────────────────────────────────────────────
(async () => {
  const startTime = Date.now();

  console.log('\n' + chalk.bold('🧱 Bricks Real Estate Platform — Test Suite'));
  console.log(chalk.gray(`Phase: ${phase}  |  ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`));
  console.log(divider());

  // ── Pre-flight: check if server is alive ─────────────────────────────
  if (phase !== 'all' || skillsToRun.includes('10-smoke')) {
    process.stdout.write(chalk.yellow('  Checking backend availability ... '));
    const alive = await checkServerAlive();
    if (!alive) {
      console.log(chalk.red('OFFLINE'));
      console.log('\n' + chalk.red.bold('⛔ Backend is not running!'));
      console.log(chalk.yellow('\nTo start the backend:'));
      console.log(chalk.white('  cd backend && npm run dev'));
      console.log(chalk.yellow('\nTo start the frontend (optional, for browser tests):'));
      console.log(chalk.white('  cd frontend && npm run dev\n'));

      if (phase === 'smoke') {
        // Still run smoke — it will report the failure gracefully
      } else {
        console.log(chalk.gray('Running smoke tests to capture failures ...\n'));
      }
    } else {
      console.log(chalk.green('ONLINE'));
    }
  }

  // ── Run skills ────────────────────────────────────────────────────────
  console.log(`\n${chalk.bold('Running skills:')}`);

  const allResults = [];
  let perfMetrics  = { endpoints: [], lighthouse: null };

  // Skills 01-04: run in parallel
  const parallelGroup1 = skillsToRun.filter((s) => ['01-functional', '02-integration', '03-api', '04-database'].includes(s));
  // Skills 05-06: sequential (security needs isolation; perf does load tests)
  const sequentialGroup = skillsToRun.filter((s) => ['05-security', '06-performance'].includes(s));
  // Skills 07-08: parallel (browser tests)
  const parallelGroup2 = skillsToRun.filter((s) => ['07-crossbrowser', '08-accessibility'].includes(s));
  // Skills 09, 10, 11: parallel
  const parallelGroup3 = skillsToRun.filter((s) => ['09-regression', '10-smoke', '11-errorhandling'].includes(s));

  // Parallel group 1
  if (parallelGroup1.length > 0) {
    const results = await Promise.all(parallelGroup1.map(runSkill));
    allResults.push(...results);
  }

  // Sequential group (security + perf)
  for (const skill of sequentialGroup) {
    const result = await runSkill(skill);
    allResults.push(result);
    // Collect perf metrics
    if (result.metrics) {
      if (result.metrics.endpoints) perfMetrics.endpoints.push(...result.metrics.endpoints);
      if (result.metrics.lighthouse) perfMetrics.lighthouse = result.metrics.lighthouse;
    }
  }

  // Parallel group 2
  if (parallelGroup2.length > 0) {
    const results = await Promise.all(parallelGroup2.map(runSkill));
    allResults.push(...results);
  }

  // Parallel group 3
  if (parallelGroup3.length > 0) {
    const results = await Promise.all(parallelGroup3.map(runSkill));
    allResults.push(...results);
  }

  // ── Scan optimizations ────────────────────────────────────────────────
  process.stdout.write(`\n  ${chalk.cyan('›')} Scanning codebase for optimizations ... `);
  const optimizations = scanOptimizations();
  console.log(chalk.green(`found ${optimizations.length} findings`));

  // ── Generate report ───────────────────────────────────────────────────
  const { reportFile, totalPass, totalFail, totalWarn, criticalCount } =
    generateReport(allResults, perfMetrics, optimizations);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // ── Console summary ───────────────────────────────────────────────────
  console.log('\n' + divider('═'));
  console.log(chalk.bold('📊 RESULTS'));
  console.log(divider('═'));

  console.log(
    chalk.green(`✅ PASSED: ${totalPass}`) + '  ' +
    chalk.red(`❌ FAILED: ${totalFail}`) + '  ' +
    chalk.yellow(`⚠️  WARNINGS: ${totalWarn}`)
  );

  if (criticalCount > 0) {
    console.log(chalk.red.bold(`\n🚨 CRITICAL failures: ${criticalCount} (see report for fixes)`));
  } else {
    console.log(chalk.green('\n✅ No critical failures!'));
  }

  console.log(`\n📄 Full report: ${chalk.cyan(reportFile)}`);

  // Top optimization
  const highImpact = optimizations.filter((o) => o.impact === 'High' && !o.title.startsWith('✅'));
  if (highImpact.length > 0) {
    console.log(`⚡ Top optimization: ${chalk.yellow(highImpact[0].title)}`);
  }

  console.log(chalk.gray(`\nTotal time: ${elapsed}s\n`));

  process.exit(totalFail > 0 || criticalCount > 0 ? 1 : 0);
})();
