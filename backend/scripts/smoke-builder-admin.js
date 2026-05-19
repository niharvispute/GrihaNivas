'use strict';

/**
 * Quick smoke test for admin builder APIs.
 *
 * Validates:
 * 1) Admin login
 * 2) Create builder
 * 3) Toggle featured flag
 * 4) Delete builder
 *
 * Usage:
 *   npm run smoke:builders-admin
 *
 * Env vars:
 *   API_BASE_URL      default: http://localhost:5000/api
 *   ADMIN_IDENTIFIER  default: admin@bricks.com
 *   ADMIN_PASSWORD    default: Admin@123
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_IDENTIFIER = process.env.ADMIN_IDENTIFIER || 'admin@bricks.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

const buildUrl = (path) => {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const target = path.startsWith('/') ? path : `/${path}`;
  return `${base}${target}`;
};

const request = async (method, path, body, token) => {
  const headers = {};
  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return {
    status: response.status,
    payload,
  };
};

const assert = (condition, message, detail = null) => {
  if (condition) return;

  const suffix = detail
    ? `\nDetail: ${typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2)}`
    : '';

  throw new Error(`${message}${suffix}`);
};

const getAccessToken = (payload) => {
  return payload?.data?.accessToken || payload?.accessToken || null;
};

const run = async () => {
  const suffix = `${Date.now()}`.slice(-8);
  const builderName = `Smoke Builder ${suffix}`;
  const builderDescription = `Smoke test builder profile ${suffix} for admin endpoint checks.`;

  console.log(`[smoke] Base URL: ${API_BASE_URL}`);
  console.log('[smoke] Step 1/4: admin login');

  const loginRes = await request('POST', '/auth/login', {
    identifier: ADMIN_IDENTIFIER,
    password: ADMIN_PASSWORD,
  });

  assert(loginRes.status === 200, 'Admin login failed', loginRes.payload);
  const accessToken = getAccessToken(loginRes.payload);
  assert(Boolean(accessToken), 'Access token missing in login response', loginRes.payload);

  console.log('[smoke] Step 2/4: create builder');

  const createRes = await request(
    'POST',
    '/admin/builders',
    {
      name: builderName,
      shortDescription: 'Smoke test builder',
      description: builderDescription,
      headquarters: 'Mumbai',
      isActive: true,
      isFeatured: false,
    },
    accessToken
  );

  assert(createRes.status === 201, 'Builder create failed', createRes.payload);
  const builderId = createRes.payload?.data?._id;
  assert(Boolean(builderId), 'Builder ID missing in create response', createRes.payload);

  console.log('[smoke] Step 3/4: toggle featured');

  const featureRes = await request(
    'PATCH',
    `/admin/builders/${builderId}/feature`,
    { isFeatured: true },
    accessToken
  );

  assert(featureRes.status === 200, 'Builder feature toggle failed', featureRes.payload);
  assert(featureRes.payload?.data?.isFeatured === true, 'Builder isFeatured did not update', featureRes.payload);

  console.log('[smoke] Step 4/4: delete builder');

  const deleteRes = await request('DELETE', `/admin/builders/${builderId}`, null, accessToken);
  assert(deleteRes.status === 200, 'Builder delete failed', deleteRes.payload);
  assert(deleteRes.payload?.data?.builderId === builderId, 'Delete response has unexpected builder ID', deleteRes.payload);

  const verifyRes = await request('GET', `/admin/builders/${builderId}`, null, accessToken);
  assert(verifyRes.status === 404, 'Deleted builder should return 404 on fetch', verifyRes.payload);

  console.log('[smoke] PASS: create/feature/delete flow is healthy.');
};

run().catch((error) => {
  console.error('[smoke] FAIL:', error.message);
  process.exit(1);
});
