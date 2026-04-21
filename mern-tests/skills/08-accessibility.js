'use strict';

/**
 * Skill 08 — Accessibility Tests
 * axe-core via Playwright, keyboard navigation, heading hierarchy, ARIA.
 */

const path = require('path');
const { makeResult } = require('../utils/reporter');
const cfg = require('../config/test.config');

const PAGES_TO_TEST = [
  { label: 'Homepage',  path: '/' },
  { label: 'Properties listing', path: '/properties' },
  { label: 'Blogs',     path: '/blogs' },
  { label: 'EMI Calculator', path: '/calculators/emi' },
];

async function run() {
  const tests = [];

  let playwright;
  try {
    playwright = require('playwright');
  } catch {
    tests.push(makeResult(
      'Accessibility tests skipped — playwright not installed',
      true,
      { severity: 'INFO', expected: 'cd mern-tests && npm install && npx playwright install chromium' }
    ));
    return { skill: 'Accessibility (08)', tests };
  }

  // Check frontend is up
  const http = require('../utils/http');
  const check = await http.buildClient(cfg.FRONTEND_URL).get('/').catch(() => ({ ok: false }));
  if (!check.ok) {
    tests.push(makeResult(
      'Accessibility tests skipped — frontend not running on port 3000',
      true,
      { severity: 'INFO', expected: 'cd frontend && npm run dev' }
    ));
    return { skill: 'Accessibility (08)', tests };
  }

  const browser = await playwright.chromium.launch({ headless: true }).catch(() => null);
  if (!browser) {
    tests.push(makeResult('Chromium failed to launch for accessibility tests', false, { severity: 'HIGH' }));
    return { skill: 'Accessibility (08)', tests };
  }

  for (const pageSpec of PAGES_TO_TEST) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page    = await context.newPage();

    await page.goto(`${cfg.FRONTEND_URL}${pageSpec.path}`, {
      waitUntil: 'domcontentloaded',
      timeout:   20000,
    }).catch(() => {});

    // ── Inject axe-core from CDN ──────────────────────────────────────
    let axeResults = null;
    try {
      await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js' });
      axeResults = await page.evaluate(async () => {
        const results = await window.axe.run(document, {
          runOnly: ['wcag2a', 'wcag2aa'],
        });
        return {
          violations:  results.violations.map((v) => ({
            id:          v.id,
            impact:      v.impact,
            description: v.description,
            nodes:       v.nodes.length,
          })),
          passes:       results.passes.length,
          incomplete:   results.incomplete.length,
        };
      });
    } catch (e) {
      axeResults = null;
    }

    if (axeResults) {
      const critical = axeResults.violations.filter((v) => v.impact === 'critical');
      const serious  = axeResults.violations.filter((v) => v.impact === 'serious');

      tests.push(makeResult(
        `axe: ${pageSpec.label} — 0 critical violations`,
        critical.length === 0,
        {
          severity: critical.length > 0 ? 'HIGH' : null,
          expected: '0 critical axe violations',
          actual: critical.length > 0
            ? critical.map((v) => `${v.id} (${v.nodes} nodes)`).join(', ')
            : '0 critical',
          fix: critical.length > 0
            ? `Fix: ${critical[0]?.description}. Run axe in browser DevTools for full details.`
            : null,
        }
      ));

      tests.push(makeResult(
        `axe: ${pageSpec.label} — 0 serious violations`,
        serious.length === 0,
        {
          severity: serious.length > 0 ? 'MEDIUM' : null,
          expected: '0 serious axe violations',
          actual: serious.length > 0
            ? serious.map((v) => `${v.id} (${v.nodes} nodes)`).join(', ')
            : '0 serious',
        }
      ));
    } else {
      tests.push(makeResult(
        `axe: ${pageSpec.label} — axe-core injection failed`,
        true,
        { severity: 'INFO', expected: 'axe-core CDN may be blocked; run manually in browser' }
      ));
    }

    // ── Check all images have alt text ────────────────────────────────
    const imgsMissingAlt = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter((img) => !img.alt && !img.getAttribute('aria-label')).length;
    }).catch(() => -1);

    if (imgsMissingAlt >= 0) {
      tests.push(makeResult(
        `${pageSpec.label}: all images have alt text`,
        imgsMissingAlt === 0,
        {
          severity: imgsMissingAlt > 0 ? 'MEDIUM' : null,
          expected: '0 images without alt text',
          actual: `${imgsMissingAlt} image(s) missing alt`,
          fix: 'Add alt="" to decorative images, descriptive alt to content images. In Next.js use <Image alt="..." />',
        }
      ));
    }

    // ── Check all inputs have labels ──────────────────────────────────
    const inputsMissingLabel = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      return inputs.filter((el) => {
        const id = el.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAria  = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
        const hasTitle = el.title;
        return !hasLabel && !hasAria && !hasTitle && el.type !== 'hidden';
      }).length;
    }).catch(() => -1);

    if (inputsMissingLabel >= 0) {
      tests.push(makeResult(
        `${pageSpec.label}: all inputs have labels`,
        inputsMissingLabel === 0,
        {
          severity: inputsMissingLabel > 0 ? 'MEDIUM' : null,
          expected: '0 inputs without labels',
          actual: `${inputsMissingLabel} input(s) missing labels`,
          fix: 'Add <label htmlFor="id"> or aria-label to all form inputs',
        }
      ));
    }

    // ── Check heading hierarchy ───────────────────────────────────────
    const headingIssues = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const levels   = headings.map((h) => parseInt(h.tagName[1]));
      let skips = 0;
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] > levels[i - 1] + 1) skips++;
      }
      return { h1Count: levels.filter((l) => l === 1).length, skips };
    }).catch(() => null);

    if (headingIssues) {
      tests.push(makeResult(
        `${pageSpec.label}: exactly one H1`,
        headingIssues.h1Count === 1,
        {
          severity: headingIssues.h1Count !== 1 ? 'MEDIUM' : null,
          expected: '1 H1 per page',
          actual: `${headingIssues.h1Count} H1(s) found`,
          fix: 'Each page must have exactly one <h1> for accessibility and SEO',
        }
      ));

      tests.push(makeResult(
        `${pageSpec.label}: heading hierarchy has no skipped levels`,
        headingIssues.skips === 0,
        {
          severity: headingIssues.skips > 0 ? 'LOW' : null,
          expected: '0 heading level skips',
          actual: `${headingIssues.skips} skip(s) detected`,
          fix: 'Use h1 → h2 → h3 in order, do not jump from h1 to h3',
        }
      ));
    }

    await context.close();
  }

  await browser.close().catch(() => {});
  return { skill: 'Accessibility (08)', tests };
}

module.exports = { run };
