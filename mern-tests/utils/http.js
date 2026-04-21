'use strict';

const axios = require('axios');

/**
 * Axios wrapper with automatic timing, structured results, and error normalisation.
 * Every call returns { ok, status, data, durationMs, error }.
 */

function buildClient(baseURL, defaultHeaders = {}) {
  const client = axios.create({
    baseURL,
    timeout: 15000,
    validateStatus: () => true, // never throw on HTTP error codes
    headers: { 'Content-Type': 'application/json', ...defaultHeaders },
  });

  async function request(method, path, { body, headers = {}, params } = {}) {
    const start = Date.now();
    try {
      const resp = await client.request({
        method,
        url: path,
        data: body,
        params,
        headers,
      });
      const durationMs = Date.now() - start;
      return {
        ok: resp.status >= 200 && resp.status < 300,
        status: resp.status,
        data: resp.data,
        headers: resp.headers,
        durationMs,
        error: null,
      };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        data: null,
        headers: {},
        durationMs: Date.now() - start,
        error: err.message,
      };
    }
  }

  return {
    get:    (path, opts)  => request('GET',    path, opts),
    post:   (path, opts)  => request('POST',   path, opts),
    put:    (path, opts)  => request('PUT',    path, opts),
    patch:  (path, opts)  => request('PATCH',  path, opts),
    delete: (path, opts)  => request('DELETE', path, opts),
  };
}

/**
 * Run the same request N times and return { avg, p95, p99, min, max, timings }.
 */
async function timedBatch(fn, count = 10) {
  const timings = [];
  for (let i = 0; i < count; i++) {
    const result = await fn();
    timings.push(result.durationMs);
  }
  timings.sort((a, b) => a - b);
  const avg = Math.round(timings.reduce((s, v) => s + v, 0) / timings.length);
  const p95 = timings[Math.floor(timings.length * 0.95)] ?? timings[timings.length - 1];
  const p99 = timings[Math.floor(timings.length * 0.99)] ?? timings[timings.length - 1];
  return { avg, p95, p99, min: timings[0], max: timings[timings.length - 1], timings };
}

/**
 * Run N concurrent requests and return aggregate stats.
 */
async function concurrentBatch(fn, concurrency = 50) {
  const start = Date.now();
  const promises = Array.from({ length: concurrency }, () => fn());
  const results = await Promise.allSettled(promises);
  const totalMs = Date.now() - start;
  const timings = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value.durationMs);
  timings.sort((a, b) => a - b);
  const avg = timings.length ? Math.round(timings.reduce((s, v) => s + v, 0) / timings.length) : 0;
  const p95 = timings[Math.floor(timings.length * 0.95)] ?? 0;
  const p99 = timings[Math.floor(timings.length * 0.99)] ?? 0;
  return { avg, p95, p99, min: timings[0] ?? 0, max: timings[timings.length - 1] ?? 0, totalMs, count: concurrency };
}

module.exports = { buildClient, timedBatch, concurrentBatch };
