#!/usr/bin/env node

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const { createClient } = require('redis');

const results = {
  pass: [],
  warn: [],
  fail: [],
};

const addPass = (msg) => results.pass.push(msg);
const addWarn = (msg) => results.warn.push(msg);
const addFail = (msg) => results.fail.push(msg);

const isTruthy = (value) => value === 'true' || value === true;

const checkRequiredEnv = () => {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  required.forEach((key) => {
    if (!process.env[key]) {
      addFail(`${key} is missing.`);
    } else {
      addPass(`${key} is set.`);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    addWarn(`NODE_ENV is "${process.env.NODE_ENV || 'undefined'}" (expected "production" for deployment).`);
  } else {
    addPass('NODE_ENV is production.');
  }

  const trustProxy = isTruthy(process.env.TRUST_PROXY);
  const forceHttps = isTruthy(process.env.FORCE_HTTPS);

  if (forceHttps && !trustProxy) {
    addWarn('FORCE_HTTPS=true while TRUST_PROXY=false may cause redirect loops behind reverse proxy.');
  }

  if (!process.env.ALLOWED_ORIGINS) {
    addWarn('ALLOWED_ORIGINS is empty. CORS fallback will use default localhost values.');
  } else {
    addPass('ALLOWED_ORIGINS is configured.');
  }
};

const checkMongo = async () => {
  if (!process.env.MONGODB_URI) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    addPass('MongoDB connection successful.');
  } catch (err) {
    addFail(`MongoDB connection failed: ${err.message}`);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};

const checkRedis = async () => {
  const mode = (process.env.JWT_BLACKLIST_STORE || 'auto').toLowerCase();
  const redisUrl = process.env.REDIS_URL;

  if (!['auto', 'memory', 'redis'].includes(mode)) {
    addFail('JWT_BLACKLIST_STORE must be one of: auto, memory, redis.');
    return;
  }

  if (mode === 'memory') {
    addWarn('JWT_BLACKLIST_STORE=memory is not recommended for production.');
    return;
  }

  if (!redisUrl) {
    if (mode === 'redis') {
      addFail('JWT_BLACKLIST_STORE=redis requires REDIS_URL.');
      return;
    }

    addWarn('REDIS_URL not set. auto mode will fallback to in-memory blacklist store.');
    return;
  }

  let client;
  try {
    client = createClient({ url: redisUrl });
    await client.connect();
    await client.ping();
    addPass(`Redis connection successful (${mode} mode).`);
  } catch (err) {
    if (mode === 'redis') {
      addFail(`Redis connection failed in redis mode: ${err.message}`);
    } else {
      addWarn(`Redis unavailable in auto mode (${err.message}). App will fallback to memory.`);
    }
  } finally {
    if (client && client.isOpen) {
      await client.quit();
    }
  }
};

const printSummary = () => {
  console.log('\nProduction Preflight Summary');
  console.log('--------------------------------');

  if (results.pass.length) {
    console.log(`PASS (${results.pass.length})`);
    results.pass.forEach((msg) => console.log(`  - ${msg}`));
  }

  if (results.warn.length) {
    console.log(`WARN (${results.warn.length})`);
    results.warn.forEach((msg) => console.log(`  - ${msg}`));
  }

  if (results.fail.length) {
    console.log(`FAIL (${results.fail.length})`);
    results.fail.forEach((msg) => console.log(`  - ${msg}`));
  }

  console.log('--------------------------------');

  if (results.fail.length > 0) {
    console.log('Preflight failed. Fix FAIL items before production deploy.');
    process.exitCode = 1;
  } else {
    console.log('Preflight passed. No blocking issues found.');
    process.exitCode = 0;
  }
};

const run = async () => {
  checkRequiredEnv();
  await checkMongo();
  await checkRedis();
  printSummary();
};

run().catch((err) => {
  console.error('Preflight crashed:', err.message);
  process.exit(1);
});
