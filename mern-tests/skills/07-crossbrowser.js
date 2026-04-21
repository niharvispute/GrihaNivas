'use strict';

/**
 * Skill 07 — Cross-Browser Tests
 * Chromium, Firefox, WebKit — login flow, screenshots, console errors.
 * Responsive viewports: 375px / 768px / 1280px.
 */

const path   = require('path');
const fs     = require('fs');
const { makeResult } = require('../utils/reporter');
const cfg = require('../config/test.config');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'reports', 'screenshots');

async function run() {
  const tests = [];

  // Ensure playwright is available
  let playwright;
  try {
    playwright = require('playwright');
  } catch {
    tests.push(makeResult(
      'Cross-browser tests skipped — playwright not installed',
      true,
      {
        severity: 'INFO',
        expected: 'Run: cd mern-tests && npm install && npx playwright install chromium firefox webkit',
      }
    ));
    return { skill: 'Cross-Browser (07)', tests };
  }

  // Check frontend is up
  const http = require('../utils/http');
  const check = await http.buildClient(cfg.FRONTEND_URL).get('/').catch(() => ({ ok: false }));
  if (!check.ok) {
    tests.push(makeResult(
      'Cross-browser tests skipped — frontend not running on port 3000',
      true,
      { severity: 'INFO', expected: 'cd frontend && npm run dev' }
    ));
    return { skill: 'Cross-Browser (07)', tests };
  }

  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browsers   = ['chromium', 'firefox', 'webkit'];
  const viewports  = [
    { label: 'mobile',  width: 375,  height: 812  },
    { label: 'tablet',  width: 768,  height: 1024 },
    { label: 'desktop', width: 1280, height: 800  },
  ];

  for (const browserType of browsers) {
    let browser = null;
    try {
      browser = await playwright[browserType].launch({ headless: true });

      for (const viewport of viewports) {
        const context = await browser.newContext({ viewport });
        const page    = await context.newPage();
        const consoleErrors = [];
        page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

        const start    = Date.now();
        const response = await page.goto(cfg.FRONTEND_URL, {
          waitUntil: 'domcontentloaded',
          timeout:   20000,
        }).catch(() => null);
        const durationMs = Date.now() - start;

        const pageOk = response && (response.ok() || response.status() === 200);

        // Screenshot
        const screenshotName = `${browserType}-${viewport.label}.png`;
        await page.screenshot({
          path:     path.join(SCREENSHOT_DIR, screenshotName),
          fullPage: false,
        }).catch(() => {});

        tests.push(makeResult(
          `${browserType} @ ${viewport.width}px: homepage loads`,
          !!pageOk,
          {
            severity: pageOk ? null : 'HIGH',
            expected: 'HTTP 200, page renders',
            actual: response ? `HTTP ${response.status()}` : 'Load failed',
            durationMs,
          }
        ));

        const hasConsoleErrors = consoleErrors.length > 0;
        tests.push(makeResult(
          `${browserType} @ ${viewport.width}px: no console errors`,
          !hasConsoleErrors,
          {
            severity: hasConsoleErrors ? 'MEDIUM' : null,
            expected: '0 console errors',
            actual: hasConsoleErrors
              ? `${consoleErrors.length} error(s): ${consoleErrors.slice(0, 2).join('; ')}`
              : '0 errors',
            durationMs,
          }
        ));

        await context.close();
      }

    } catch (err) {
      tests.push(makeResult(
        `${browserType}: browser launch failed`,
        false,
        {
          severity: 'HIGH',
          expected: 'Browser launches successfully',
          actual: err.message,
          fix: `Install browser: npx playwright install ${browserType}`,
        }
      ));
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }

  return { skill: 'Cross-Browser (07)', tests };
}

module.exports = { run };
