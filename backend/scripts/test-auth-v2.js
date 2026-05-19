'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const http = require('http');
const crypto = require('crypto');

const app = require('../app');
const connectDB = require('../config/db');
const { disconnectDB } = require('../config/db');
const AuthOtpFlow = require('../models/mongoose/AuthOtpFlow');

const PORT = 5199;
const BASE = `http://localhost:${PORT}/api`;

let server;
let passed = 0;
let failed = 0;
let preResetRefreshToken = '';

const cookieJar = {};

const assert = (label, condition, actual) => {
  if (condition) {
    console.log(`  PASS ${label}`);
    passed += 1;
    return;
  }

  console.log(`  FAIL ${label} -> ${JSON.stringify(actual)}`);
  failed += 1;
};

const hashValue = (value) =>
  crypto.createHash('sha256').update(String(value)).digest('hex');

const updateCookies = (setCookieHeaders) => {
  if (!Array.isArray(setCookieHeaders)) return;

  for (const header of setCookieHeaders) {
    const pair = String(header || '').split(';')[0] || '';
    const separatorIndex = pair.indexOf('=');
    if (separatorIndex < 0) continue;

    const key = pair.slice(0, separatorIndex).trim();
    const value = pair.slice(separatorIndex + 1).trim();

    if (!key) continue;
    cookieJar[key] = value;
  }
};

const buildCookieHeader = () => {
  const entries = Object.entries(cookieJar)
    .filter(([, value]) => value && value.length > 0)
    .map(([key, value]) => `${key}=${value}`);

  if (entries.length === 0) return null;
  return entries.join('; ');
};

const request = (method, path, body = null, token = null) =>
  new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const cookieHeader = buildCookieHeader();

    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        updateCookies(res.headers['set-cookie']);

        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ status: 0, body: { message: error.message } });
    });

    if (payload) req.write(payload);
    req.end();
  });

const getFlowByCookie = async (cookieName, flowType) => {
  const token = cookieJar[cookieName];
  if (!token) return null;

  return AuthOtpFlow.findOne({
    flowType,
    tokenHash: hashValue(token),
    status: { $in: ['active', 'verified'] },
  });
};

const testSignupAndLogin = async (identity) => {
  console.log('\n[1] Signup and Login');

  const signup = await request('POST', `${BASE}/auth/signup/request`, {
    name: identity.name,
    email: identity.email,
    phone: identity.phone,
    password: identity.password,
  });

  assert('signup/request returns 200', signup.status === 200, signup.body);
  assert('signup flow cookie exists', Boolean(cookieJar.auth_signup_flow), cookieJar);

  const signupFlow = await getFlowByCookie('auth_signup_flow', 'signup_verify');
  assert('signup flow exists in DB', Boolean(signupFlow), signupFlow);

  if (!signupFlow) return;

  const signupOtp = '111111';
  signupFlow.otpHash = hashValue(signupOtp);
  await signupFlow.save();

  const verify = await request('POST', `${BASE}/auth/signup/verify-email`, {
    otp: signupOtp,
  });

  assert('signup/verify-email returns 201', verify.status === 201, verify.body);
  assert('verify response contains accessToken', Boolean(verify.body?.data?.accessToken), verify.body);
  assert('user isEmailVerified true', verify.body?.data?.user?.isEmailVerified === true, verify.body);

  preResetRefreshToken = verify.body?.data?.refreshToken || '';

  const loginEmail = await request('POST', `${BASE}/auth/login`, {
    identifier: identity.email,
    password: identity.password,
  });
  assert('login by email returns 200', loginEmail.status === 200, loginEmail.body);

  const loginPhone = await request('POST', `${BASE}/auth/login`, {
    identifier: identity.phone,
    password: identity.password,
  });
  assert('login by phone returns 200', loginPhone.status === 200, loginPhone.body);
};

const testForgotPassword = async (identity) => {
  console.log('\n[2] Forgot Password');

  const forgotRequest = await request('POST', `${BASE}/auth/forgot-password/request`, {
    identifier: identity.phone,
  });

  assert('forgot/request returns 200', forgotRequest.status === 200, forgotRequest.body);
  assert('forgot flow cookie exists', Boolean(cookieJar.auth_forgot_flow), cookieJar);

  const forgotFlow = await getFlowByCookie('auth_forgot_flow', 'forgot_password');
  assert('forgot flow exists in DB', Boolean(forgotFlow), forgotFlow);

  if (!forgotFlow) return;

  const forgotOtp = '222222';
  forgotFlow.otpHash = hashValue(forgotOtp);
  await forgotFlow.save();

  const forgotVerify = await request('POST', `${BASE}/auth/forgot-password/verify`, {
    otp: forgotOtp,
  });

  assert('forgot/verify returns 200', forgotVerify.status === 200, forgotVerify.body);
  assert('reset token cookie exists', Boolean(cookieJar.auth_reset_token), cookieJar);

  const newPassword = 'ResetPass123';
  const reset = await request('POST', `${BASE}/auth/forgot-password/reset`, {
    newPassword,
  });

  assert('forgot/reset returns 200', reset.status === 200, reset.body);

  const oldLogin = await request('POST', `${BASE}/auth/login`, {
    identifier: identity.email,
    password: identity.password,
  });
  assert('old password is rejected', oldLogin.status === 401, oldLogin.body);

  const newLogin = await request('POST', `${BASE}/auth/login`, {
    identifier: identity.email,
    password: newPassword,
  });
  assert('new password login returns 200', newLogin.status === 200, newLogin.body);

  if (preResetRefreshToken) {
    const refreshOld = await request('POST', `${BASE}/auth/refresh`, {
      refreshToken: preResetRefreshToken,
    });
    assert('pre-reset refresh token invalidated', refreshOld.status === 401, refreshOld.body);
  }
};

const run = async () => {
  const unique = Date.now();
  const identity = {
    name: 'Auth V2 Test User',
    email: `authv2.${unique}@mailinator.com`,
    phone: `+9198${String(unique).slice(-8)}`,
    password: 'TestPass123',
  };

  try {
    console.log('Starting auth v2 integration test...');

    await connectDB();

    await new Promise((resolve) => {
      server = app.listen(PORT, resolve);
    });

    console.log(`API listening on http://localhost:${PORT}`);

    await testSignupAndLogin(identity);
    await testForgotPassword(identity);

    console.log('\nSummary');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Auth v2 test failed to run:', error.message);
    process.exitCode = 1;
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDB();
  }
};

run();
