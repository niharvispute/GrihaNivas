'use strict';

const { chromium, firefox, webkit } = require('playwright');

/**
 * Launch a browser and return { browser, page, close }.
 * Defaults to headless chromium.
 */
async function launchBrowser(type = 'chromium', options = {}) {
  const engines = { chromium, firefox, webkit };
  const engine  = engines[type] || chromium;
  const browser = await engine.launch({ headless: true, ...options });
  const context = await browser.newContext({
    viewport: options.viewport || { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  return {
    browser,
    context,
    page,
    close: async () => { try { await browser.close(); } catch {} },
  };
}

/**
 * Navigate to URL and return { ok, title, consoleErrors, durationMs }.
 */
async function visitPage(page, url) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  const start = Date.now();
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null);
  const durationMs = Date.now() - start;
  const title = await page.title().catch(() => '');
  return {
    ok: response ? response.ok() : false,
    status: response ? response.status() : 0,
    title,
    consoleErrors: errors,
    durationMs,
  };
}

module.exports = { launchBrowser, visitPage };
