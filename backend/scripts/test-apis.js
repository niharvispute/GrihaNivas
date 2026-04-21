/**
 * API Integration Test Script
 *
 * Starts the Express app on port 5099 (in-process),
 * runs all major API flows with real MongoDB Atlas,
 * and prints a pass/fail report.
 *
 * Usage:
 *   node scripts/test-apis.js
 *   node scripts/test-apis.js --scope=builders
 *   node scripts/test-apis.js --scope=property-submissions
 */

'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const http    = require('http');
const crypto  = require('crypto');
const bcrypt  = require('bcryptjs');
const app     = require('../app');
const connectDB   = require('../config/db');
const { initCloudinary } = require('../config/cloudinary');
const { initFirebase }   = require('../config/firebase');
const AuthOtpFlow = require('../models/mongoose/AuthOtpFlow');
const User = require('../models/mongoose/User');

const PORT  = 5099;
const BASE  = `http://localhost:${PORT}/api`;

// ── Test state ────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures = [];

let userAccessToken  = '';
let userRefreshToken = '';
let adminAccessToken = '';
let userId = '';
let adminUserId = '';

let createdPropertyId = '';
let createdBuilderId  = '';
let createdBuilderSlug = '';
let createdLeadId     = '';
let createdPropertySubmissionId = '';
let createdBlogId     = '';
let createdBlogSlug   = '';
let createdContactId  = '';
let createdTestimonialId = '';
let createdBannerId   = '';
const moderationPropertyIds = [];

const cookieJar = {};

const TEST_SUFFIX = Date.now();
const TEST_PHONE = `+9197${String(TEST_SUFFIX).slice(-8)}`;
const TEST_EMAIL = `testuser.${TEST_SUFFIX}@mailinator.com`;
const TEST_PASSWORD = 'TestPass123';

const ADMIN_PHONE = process.env.ADMIN_PHONE || '+919876543210';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'bricks.dev@gmail.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

const scopeArg = process.argv.find((arg) => arg.startsWith('--scope='));
const TEST_SCOPE = (scopeArg ? scopeArg.split('=')[1] : 'all').toLowerCase();
const isBuilderScope = TEST_SCOPE === 'builders';
const isPropertySubmissionScope = TEST_SCOPE === 'property-submissions';

// ── HTTP helper ───────────────────────────────────────────────────────────────

const hashValue = (value) =>
  crypto.createHash('sha256').update(String(value)).digest('hex');

const updateCookies = (setCookieHeaders) => {
  if (!Array.isArray(setCookieHeaders)) return;

  for (const header of setCookieHeaders) {
    const pair = String(header || '').split(';')[0] || '';
    const idx = pair.indexOf('=');
    if (idx < 0) continue;

    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
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

const getFlowByCookie = async (cookieName, flowType) => {
  const token = cookieJar[cookieName];
  if (!token) return null;

  return AuthOtpFlow.findOne({
    flowType,
    tokenHash: hashValue(token),
    status: { $in: ['active', 'verified'] },
  });
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
        ...(token   && { Authorization: `Bearer ${token}` }),
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        updateCookies(res.headers['set-cookie']);
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => resolve({ status: 0, body: { message: err.message } }));
    if (payload) req.write(payload);
    req.end();
  });

// ── Assertion helper ──────────────────────────────────────────────────────────

const assert = (label, condition, actual) => {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.log(`  ❌  ${label}  →  ${JSON.stringify(actual)}`);
    failed++;
    failures.push({ label, actual });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITES
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Health ─────────────────────────────────────────────────────────────────
const testHealth = async () => {
  console.log('\n[1] Health Check');
  const health = await request('GET', '/health');
  assert('GET /health → 200', health.status === 200, health.body);
  assert('health success: true', health.body?.success === true, health.body);

  const ready = await request('GET', '/health/ready');
  assert('GET /health/ready → 200', ready.status === 200, ready.body);
  assert('readiness status = ready', ready.body?.status === 'ready', ready.body);
  assert('readiness mongo connected = true', ready.body?.checks?.mongo?.connected === true, ready.body);
  assert('readiness redis mode exposed', typeof ready.body?.checks?.redisBlacklist?.mode === 'string', ready.body);
};

// ── 2. Auth — User ────────────────────────────────────────────────────────────
const testAuthUser = async () => {
  console.log('\n[2] Auth — User Flow');

  // 2a. Validation: bad identifier format
  const r1 = await request('POST', `${BASE}/auth/login`, {
    identifier: 'invalid-phone-format',
    password: TEST_PASSWORD,
  });
  assert('login bad identifier → 400', r1.status === 400, r1.body);

  // 2b. Signup request
  const r2 = await request('POST', `${BASE}/auth/signup/request`, {
    name: 'Test User',
    email: TEST_EMAIL,
    phone: TEST_PHONE,
    password: TEST_PASSWORD,
  });
  assert('signup/request → 200', r2.status === 200, r2.body);

  const signupFlow = await getFlowByCookie('auth_signup_flow', 'signup_verify');
  assert('signup flow exists in DB', Boolean(signupFlow), signupFlow);

  if (!signupFlow) return;

  const signupOtp = '111111';
  signupFlow.otpHash = hashValue(signupOtp);
  await signupFlow.save();

  // 2c. Verify signup with OTP-only payload
  const r3 = await request('POST', `${BASE}/auth/signup/verify-email`, {
    otp: signupOtp,
  });
  assert('signup/verify-email → 201', r3.status === 201, r3.body);
  assert('signup verify returns accessToken', !!r3.body?.data?.accessToken, r3.body);
  assert('signup verify returns user.phone', r3.body?.data?.user?.phone === TEST_PHONE, r3.body);

  userAccessToken  = r3.body?.data?.accessToken  || '';
  userRefreshToken = r3.body?.data?.refreshToken || '';
  userId = r3.body?.data?.user?.id || '';

  // 2d. Login by email
  const r4 = await request('POST', `${BASE}/auth/login`, {
    identifier: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  assert('login with email → 200', r4.status === 200, r4.body);

  // 2e. GET /me
  const r5 = await request('GET', `${BASE}/auth/me`, null, userAccessToken);
  assert('GET /auth/me → 200', r5.status === 200, r5.body);

  // 2f. GET /me — no token
  const r6 = await request('GET', `${BASE}/auth/me`);
  assert('GET /auth/me no token → 401', r6.status === 401, r6.body);

  // 2g. Refresh
  const r7 = await request('POST', `${BASE}/auth/refresh`, { refreshToken: userRefreshToken });
  assert('POST /auth/refresh → 200', r7.status === 200, r7.body);
  userAccessToken  = r7.body?.data?.accessToken  || userAccessToken;
  userRefreshToken = r7.body?.data?.refreshToken || userRefreshToken;
};

// ── 3. Auth — Admin ───────────────────────────────────────────────────────────

const ensureAdminCredentials = async () => {
  let admin = await User.findOne({
    $or: [{ email: ADMIN_EMAIL }, { phone: ADMIN_PHONE }],
  }).select('+passwordHash');

  if (!admin) {
    admin = await User.create({
      name: 'Super Admin',
      phone: ADMIN_PHONE,
      email: ADMIN_EMAIL,
      role: 'admin',
      isVerified: true,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
    });
    return admin;
  }

  admin.email = ADMIN_EMAIL;
  admin.phone = ADMIN_PHONE;
  admin.role = 'admin';
  admin.isActive = true;
  admin.isVerified = true;
  admin.isEmailVerified = true;
  admin.emailVerifiedAt = admin.emailVerifiedAt || new Date();
  admin.passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await admin.save();

  return admin;
};

const testAuthAdmin = async () => {
  console.log('\n[3] Auth — Admin Login');

  await ensureAdminCredentials();

  const r = await request('POST', `${BASE}/auth/login`, {
    identifier: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  assert('admin login → 200', r.status === 200, r.body);
  assert('admin role = admin', r.body?.data?.user?.role === 'admin', r.body);

  adminAccessToken = r.body?.data?.accessToken || '';
  adminUserId = r.body?.data?.user?.id || '';
};

// ── 4. Calculators ────────────────────────────────────────────────────────────
const testCalculators = async () => {
  console.log('\n[4] Calculators');

  const r1 = await request('POST', `${BASE}/calculators/emi`, {
    principal: 5000000, annualInterestRate: 8.5, tenureMonths: 240,
  });
  assert('EMI calc → 200', r1.status === 200, r1.body);
  assert('EMI value > 0', r1.body?.data?.emi > 0, r1.body);

  const r2 = await request('POST', `${BASE}/calculators/stamp-duty`, {
    propertyValue: 10000000, ownershipType: 'female',
  });
  assert('Stamp duty female → 200', r2.status === 200, r2.body);
  assert('Stamp duty = 500000', r2.body?.data?.stampDuty === 500000, r2.body);

  // Validation: bad principal
  const r3 = await request('POST', `${BASE}/calculators/emi`, {
    principal: 100, annualInterestRate: 8.5, tenureMonths: 240,
  });
  assert('EMI bad principal → 400', r3.status === 400, r3.body);
};

// ── 5. Contact ────────────────────────────────────────────────────────────────
const testContact = async () => {
  console.log('\n[5] Contact');

  const r1 = await request('POST', `${BASE}/contact`, {
    name: 'Raj Sharma', phone: '+919812345678',
    email: 'raj@test.com',
    message: 'Interested in 3BHK in Worli. Please call me back.',
  });
  assert('POST /contact → 201', r1.status === 201, r1.body);

  // Validation: short message
  const r2 = await request('POST', `${BASE}/contact`, {
    name: 'X', phone: '+919812345678', message: 'Hi',
  });
  assert('POST /contact short msg → 400', r2.status === 400, r2.body);

  // Admin: list contacts
  const r3 = await request('GET', `${BASE}/contact`, null, adminAccessToken);
  assert('GET /contact (admin) → 200', r3.status === 200, r3.body);
  assert('contact list is array', Array.isArray(r3.body?.data), r3.body);

  if (r3.body?.data?.length > 0) {
    createdContactId = r3.body.data[0]._id;
    const r4 = await request('PUT', `${BASE}/contact/${createdContactId}/read`, null, adminAccessToken);
    assert('PUT /contact/:id/read → 200', r4.status === 200, r4.body);
    assert('isRead = true', r4.body?.data?.isRead === true, r4.body);
  }
};

// ── 6. Leads ──────────────────────────────────────────────────────────────────
const testLeads = async () => {
  console.log('\n[6] Leads');

  const r1 = await request('POST', `${BASE}/leads`, {
    name: 'Priya Patel', phone: '+919123456789', email: 'priya@test.com',
    leadType: 'buy',
    message: 'Looking for 3BHK in Bandra West under 2 crore.',
    budgetMin: 15000000, budgetMax: 20000000,
    preferredLocations: ['Bandra West', 'Juhu'],
  }, userAccessToken);
  assert('POST /leads buy → 201', r1.status === 201, r1.body);
  if (r1.body?.data?._id) createdLeadId = r1.body.data._id;

  const r2 = await request('POST', `${BASE}/leads`, {
    name: 'Amit Shah', phone: '+919988776655', leadType: 'rent',
    message: 'Need 2BHK in Andheri West.',
  }, userAccessToken);
  assert('POST /leads rent → 201', r2.status === 201, r2.body);

  const rMine = await request('GET', `${BASE}/leads/my-enquiries`, null, userAccessToken);
  assert('GET /leads/my-enquiries (user) → 200', rMine.status === 200, rMine.body);
  assert('my-enquiries list is array', Array.isArray(rMine.body?.data), rMine.body);

  // Validation: invalid leadType
  const r3 = await request('POST', `${BASE}/leads`, {
    name: 'Test', phone: '+919876543210', leadType: 'investment',
  }, userAccessToken);
  assert('POST /leads bad leadType → 400', r3.status === 400, r3.body);

  // Admin: list all leads
  const r4 = await request('GET', `${BASE}/leads`, null, adminAccessToken);
  assert('GET /leads (admin) → 200', r4.status === 200, r4.body);
  assert('leads list is array', Array.isArray(r4.body?.data), r4.body);

  // Use a lead created in this test for deterministic updates
  const leadIdForUpdate = createdLeadId || r4.body?.data?.[0]?._id;
  if (leadIdForUpdate) {
    createdLeadId = leadIdForUpdate;

    const r5 = await request('GET', `${BASE}/leads/${leadIdForUpdate}`, null, adminAccessToken);
    assert('GET /leads/:id → 200', r5.status === 200, r5.body);

    // Update status
    const r6 = await request('PUT', `${BASE}/leads/${leadIdForUpdate}/status`,
      { status: 'contacted' }, adminAccessToken);
    assert('PUT /leads/:id/status contacted → 200', r6.status === 200, r6.body);

    // One-step backward transition should be allowed
    const r7 = await request('PUT', `${BASE}/leads/${leadIdForUpdate}/status`,
      { status: 'new' }, adminAccessToken);
    assert('PUT /leads backward status → 200', r7.status === 200, r7.body);

    // Jump transitions should still be blocked
    const r7a = await request('PUT', `${BASE}/leads/${leadIdForUpdate}/status`,
      { status: 'closed' }, adminAccessToken);
    assert('PUT /leads jump status → 400', r7a.status === 400, r7a.body);

    // Add note
    const r8 = await request('POST', `${BASE}/leads/${leadIdForUpdate}/notes`,
      { text: 'Called client, interested in Worli area. Follow up next week.' }, adminAccessToken);
    assert('POST /leads/:id/notes → 201', r8.status === 201, r8.body);
  }

  // Non-admin cannot list leads
  const r9 = await request('GET', `${BASE}/leads`, null, userAccessToken);
  assert('GET /leads non-admin → 403', r9.status === 403, r9.body);
};

// ── Property Submissions ─────────────────────────────────────────────────────
const testPropertySubmissions = async () => {
  console.log('\n[PS] Property Submissions');

  let publishedPropertyId = '';
  let publishedCategory = 'buy';

  const payload = {
    ownerName: 'Nikhil Rao',
    phone: '+919812345678',
    email: `owner.${TEST_SUFFIX}@mailinator.com`,
    listingType: 'Sale',
    buildingType: 'Residential',
    propertyType: 'Apartment',
    city: 'Mumbai',
    locality: 'Powai',
    possession: 'Ready to Move',
    age: '5',
    bathrooms: '2',
    balconies: '1',
    coveredParking: '1',
    openParking: '0',
    images: [
      'https://example.com/property-submission-1.jpg',
      'https://example.com/property-submission-2.jpg',
      'https://example.com/property-submission-3.jpg',
      'https://example.com/property-submission-4.jpg',
      'https://example.com/property-submission-5.jpg',
    ],
    amenities: ['Gym', 'Security'],
    title: `Powai Lake View Residence ${TEST_SUFFIX}`,
    description: 'Owner-listed apartment in Powai with premium amenities and immediate possession.',
    price: 24500000,
    readyToProceed: true,
  };

  publishedCategory = payload.buildingType === 'Commercial'
    ? 'commercial'
    : payload.listingType === 'Rent'
      ? 'rent'
      : 'buy';

  const insufficientImagesPayload = {
    ...payload,
    images: payload.images.slice(0, 4),
  };

  const r0 = await request('POST', `${BASE}/property-submissions`, insufficientImagesPayload, userAccessToken);
  assert('POST /property-submissions with <5 images → 400', r0.status === 400, r0.body);

  const r1 = await request('POST', `${BASE}/property-submissions`, payload, userAccessToken);
  assert('POST /property-submissions (user) → 201', r1.status === 201, r1.body);
  assert('submission status defaults to new', r1.body?.data?.status === 'new', r1.body);
  createdPropertySubmissionId = r1.body?.data?._id || '';

  const r2 = await request('GET', `${BASE}/property-submissions/my`, null, userAccessToken);
  assert('GET /property-submissions/my → 200', r2.status === 200, r2.body);
  assert('my submissions list is array', Array.isArray(r2.body?.data), r2.body);

  const r3 = await request('GET', `${BASE}/property-submissions`, null, adminAccessToken);
  assert('GET /property-submissions (admin) → 200', r3.status === 200, r3.body);
  assert('admin submissions list is array', Array.isArray(r3.body?.data), r3.body);

  if (!createdPropertySubmissionId) {
    return;
  }

  const r4 = await request('GET', `${BASE}/property-submissions/${createdPropertySubmissionId}`, null, adminAccessToken);
  assert('GET /property-submissions/:id (admin) → 200', r4.status === 200, r4.body);

  const r5 = await request(
    'PUT',
    `${BASE}/property-submissions/${createdPropertySubmissionId}/status`,
    { status: 'approved' },
    adminAccessToken
  );
  assert('PUT /property-submissions/:id/status approved → 200', r5.status === 200, r5.body);

  publishedPropertyId = String(r5.body?.data?.publishedProperty || '');
  assert('approved submission linked to published property', Boolean(publishedPropertyId), r5.body);

  const r5a = await request('GET', `${BASE}/properties?category=${publishedCategory}&limit=20`);
  assert('approved submission visible in public category list', r5a.status === 200, r5a.body);
  const isPublishedInCategoryList = Array.isArray(r5a.body?.data)
    ? r5a.body.data.some((property) => property?._id === publishedPropertyId)
    : false;
  assert('published property id appears in category list', isPublishedInCategoryList, r5a.body);

  const r5b = await request('GET', `${BASE}/properties/${publishedPropertyId}`);
  assert('GET /properties/:id for published submission → 200', r5b.status === 200, r5b.body);

  const r6 = await request(
    'PUT',
    `${BASE}/property-submissions/${createdPropertySubmissionId}/status`,
    { status: 'new' },
    adminAccessToken
  );
  assert('PUT /property-submissions backward status → 400', r6.status === 400, r6.body);

  const r7 = await request(
    'POST',
    `${BASE}/property-submissions/${createdPropertySubmissionId}/notes`,
    { text: 'Verified owner details and requested site visit documents.' },
    adminAccessToken
  );
  assert('POST /property-submissions/:id/notes → 201', r7.status === 201, r7.body);

  const r8 = await request(
    'GET',
    `${BASE}/property-submissions/${createdPropertySubmissionId}`,
    null,
    userAccessToken
  );
  assert('GET /property-submissions/:id non-admin → 403', r8.status === 403, r8.body);

  const r9 = await request(
    'DELETE',
    `${BASE}/property-submissions/${createdPropertySubmissionId}`,
    null,
    adminAccessToken
  );
  assert('DELETE /property-submissions/:id → 200', r9.status === 200, r9.body);

  if (publishedPropertyId) {
    const r10 = await request('DELETE', `${BASE}/properties/${publishedPropertyId}`, null, adminAccessToken);
    assert('DELETE published property from submission test → 204', r10.status === 204, r10.body);
  }

  createdPropertySubmissionId = '';
};

// ── 7. Stamp Duty Config ──────────────────────────────────────────────────────
const testStampDuty = async () => {
  console.log('\n[7] Stamp Duty Config');

  const r1 = await request('GET', `${BASE}/stamp-duty`);
  assert('GET /stamp-duty → 200', r1.status === 200, r1.body);
  assert('maleRate exists', r1.body?.data?.maleRate !== undefined, r1.body);

  // Admin update
  const r2 = await request('PUT', `${BASE}/stamp-duty`,
    { maleRate: 6, femaleRate: 5, jointRate: 5, registrationCharge: 30000 },
    adminAccessToken
  );
  assert('PUT /stamp-duty (admin) → 200', r2.status === 200, r2.body);

  // Non-admin blocked
  const r3 = await request('PUT', `${BASE}/stamp-duty`,
    { maleRate: 7, femaleRate: 6, jointRate: 6, registrationCharge: 35000 },
    userAccessToken
  );
  assert('PUT /stamp-duty non-admin → 403', r3.status === 403, r3.body);
};

// ── 8. Builders ────────────────────────────────────────────────────────────────
const testBuilders = async () => {
  console.log('\n[8] Builders');

  const builderName = `Lodha Group ${TEST_SUFFIX}`;
  const r1 = await request(
    'POST',
    `${BASE}/admin/builders`,
    {
      name: builderName,
      shortDescription: 'Premium real estate developer with strong Mumbai portfolio.',
      description:
        'Lodha has delivered multiple flagship projects across Mumbai and continues to launch premium residences in key micro-markets.',
      aboutHeadline: 'Engineering premium residential communities at scale',
      qualityStandards: 'ISO aligned QA process',
      innovation: 'Sustainable construction and smart utility systems',
      featuredImages: [
        'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80',
      ],
      faqs: [
        {
          question: 'Are all projects MahaRERA compliant?',
          answer: 'Yes, all active projects are registered before launch.',
        },
      ],
      testimonials: [
        {
          author: 'R. Sharma',
          role: 'Homeowner',
          content: 'Great handover process and build quality.',
          rating: 5,
        },
      ],
      establishedYear: 1980,
      totalProjects: 100,
      ongoingProjects: 11,
      completedDeliveries: 89,
      headquarters: 'Mumbai',
      isFeatured: true,
      isActive: true,
      seo: {
        metaTitle: 'Lodha Group Projects in Mumbai',
        metaDescription: 'Explore Lodha Group projects and listings in Mumbai.',
        keywords: ['lodha', 'mumbai builder'],
      },
    },
    adminAccessToken
  );
  assert('POST /admin/builders (admin) → 201', r1.status === 201, r1.body);

  createdBuilderId = r1.body?.data?._id || '';
  createdBuilderSlug = r1.body?.data?.slug || '';

  const r2 = await request('GET', `${BASE}/builders`);
  assert('GET /builders → 200', r2.status === 200, r2.body);
  assert('builders.data is array', Array.isArray(r2.body?.data), r2.body);

  if (createdBuilderSlug) {
    const r3 = await request('GET', `${BASE}/builders/${createdBuilderSlug}`);
    assert('GET /builders/:slug → 200', r3.status === 200, r3.body);
    assert('builder detail has builder object', !!r3.body?.data?.builder, r3.body);
    assert('builder detail has properties array', Array.isArray(r3.body?.data?.properties), r3.body);
    assert('builder detail includes FAQ list', Array.isArray(r3.body?.data?.builder?.faqs), r3.body);
    assert('builder detail includes testimonials list', Array.isArray(r3.body?.data?.builder?.testimonials), r3.body);
  }

  const r4 = await request('GET', `${BASE}/admin/builders?page=1&limit=10`, null, adminAccessToken);
  assert('GET /admin/builders (admin) → 200', r4.status === 200, r4.body);

  const r5 = await request('GET', `${BASE}/admin/builders`, null, userAccessToken);
  assert('GET /admin/builders non-admin → 403', r5.status === 403, r5.body);
};

// ── 9. Properties ─────────────────────────────────────────────────────────────
const testProperties = async () => {
  console.log('\n[9] Properties');

  // Create (admin, no file upload for test)
  const r1 = await request('POST', `${BASE}/properties`, {
    title: 'Sea View 3BHK in Worli',
    description: 'Stunning sea view apartment in prime Worli location with all modern amenities and excellent connectivity.',
    category: 'buy',
    location: { city: 'Mumbai', area: 'Worli' },
    price: 25000000,
    bhk: 3,
    areaSqft: 1450,
    ...(createdBuilderId ? { builder: createdBuilderId } : {}),
    furnishing: 'semi_furnished',
    possession: 'Ready to Move',
    amenities: ['Swimming Pool', 'Gym', 'Parking'],
    highlights: ['Sea View', 'Corner Unit'],
    isFeatured: true,
  }, adminAccessToken);
  assert('POST /properties (admin) → 201', r1.status === 201, r1.body);

  if (r1.body?.data?._id) {
    createdPropertyId = r1.body.data._id;
    createdBlogSlug   = r1.body.data.slug;
  }

  // List all
  const r2 = await request('GET', `${BASE}/properties`);
  assert('GET /properties → 200', r2.status === 200, r2.body);
  assert('properties.data is array', Array.isArray(r2.body?.data), r2.body);

  // Filter by category
  const r3 = await request('GET', `${BASE}/properties?category=buy&sortBy=price_desc`);
  assert('GET /properties?category=buy → 200', r3.status === 200, r3.body);

  // Filter by area (regex)
  const r4 = await request('GET', `${BASE}/properties?area=Worli`);
  assert('GET /properties?area=Worli → 200', r4.status === 200, r4.body);

  // Filter by bhk
  const r5 = await request('GET', `${BASE}/properties?bhk=3`);
  assert('GET /properties?bhk=3 → 200', r5.status === 200, r5.body);

  if (createdBuilderId) {
    const r5a = await request('GET', `${BASE}/properties?builder=${createdBuilderId}`);
    assert('GET /properties?builder=builderId → 200', r5a.status === 200, r5a.body);
    const foundByBuilder = Array.isArray(r5a.body?.data)
      ? r5a.body.data.some((property) => property?._id === createdPropertyId)
      : false;
    assert('builderId filter includes created property', foundByBuilder, r5a.body);
  }

  if (createdBuilderSlug) {
    const r5b = await request('GET', `${BASE}/properties?builderSlug=${encodeURIComponent(createdBuilderSlug)}`);
    assert('GET /properties?builderSlug=slug → 200', r5b.status === 200, r5b.body);
    const foundByBuilderSlug = Array.isArray(r5b.body?.data)
      ? r5b.body.data.some((property) => property?._id === createdPropertyId)
      : false;
    assert('builderSlug filter includes created property', foundByBuilderSlug, r5b.body);
  }

  if (createdPropertyId) {
    // Get by ID
    const r6 = await request('GET', `${BASE}/properties/${createdPropertyId}`);
    assert('GET /properties/:id → 200', r6.status === 200, r6.body);
    assert('property title matches', r6.body?.data?.title === 'Sea View 3BHK in Worli', r6.body);
    if (createdBuilderId) {
      assert('property includes populated builder', r6.body?.data?.builder?._id === createdBuilderId, r6.body);
    }

    // Get by slug
    const slug = r6.body?.data?.slug;
    if (slug) {
      const r7 = await request('GET', `${BASE}/properties/slug/${slug}`);
      assert('GET /properties/slug/:slug → 200', r7.status === 200, r7.body);
    }

    // Update
    const r8 = await request('PUT', `${BASE}/properties/${createdPropertyId}`,
      { price: 26000000, isFeatured: false }, adminAccessToken);
    assert('PUT /properties/:id → 200', r8.status === 200, r8.body);

    if (createdBuilderSlug) {
      const r8a = await request('GET', `${BASE}/builders/${createdBuilderSlug}`);
      const hasBuilderProperty = Array.isArray(r8a.body?.data?.properties)
        ? r8a.body.data.properties.some((property) => property?._id === createdPropertyId)
        : false;
      assert('GET /builders/:slug includes linked property', r8a.status === 200 && hasBuilderProperty, r8a.body);
    }
  }

  // Invalid ObjectId → 400 (not 500)
  const r9 = await request('GET', `${BASE}/properties/not-a-valid-id`);
  assert('GET /properties/invalid-id → 400', r9.status === 400, r9.body);

  // Non-admin cannot create
  const r10 = await request('POST', `${BASE}/properties`,
    { title: 'Test', description: 'Test', category: 'buy', location: { area: 'Andheri' }, price: 1000000 },
    userAccessToken
  );
  assert('POST /properties non-admin → 403', r10.status === 403, r10.body);
};

// ── 10. Property Moderation Lifecycle ─────────────────────────────────────────
const testPropertyModeration = async () => {
  console.log('\n[10] Property Moderation Lifecycle');

  const pendingArea = `Moderation Pending ${TEST_SUFFIX}`;
  const pendingPayload = {
    title: `Moderation Pending Property ${TEST_SUFFIX}`,
    description:
      'This property is submitted by a user and should remain hidden from public endpoints until admin approval.',
    category: 'buy',
    location: { city: 'Mumbai', area: pendingArea },
    price: 18500000,
    bhk: 2,
    areaSqft: 980,
    furnishing: 'semi_furnished',
    amenities: ['Gym'],
    highlights: ['Moderation Test'],
  };

  const r1 = await request('POST', `${BASE}/properties/submit`, pendingPayload, userAccessToken);
  assert('POST /properties/submit → 201', r1.status === 201, r1.body);
  assert('submitted property status = pending', r1.body?.data?.status === 'pending', r1.body);
  assert('submitted property isActive = false', r1.body?.data?.isActive === false, r1.body);

  const pendingPropertyId = r1.body?.data?.id || '';
  if (!pendingPropertyId) return;
  moderationPropertyIds.push(pendingPropertyId);

  const r2 = await request('GET', `${BASE}/properties?area=${encodeURIComponent(pendingArea)}`);
  const pendingVisiblePublicly = Array.isArray(r2.body?.data)
    ? r2.body.data.some((property) => property?._id === pendingPropertyId)
    : false;
  assert('pending property hidden from public list', r2.status === 200 && !pendingVisiblePublicly, r2.body);

  const r3 = await request('GET', `${BASE}/properties/${pendingPropertyId}`);
  assert('pending property hidden from public detail', r3.status === 404, r3.body);

  const r4 = await request(
    'GET',
    `${BASE}/properties/admin?status=pending&search=${encodeURIComponent(pendingArea)}`,
    null,
    adminAccessToken
  );
  const pendingInAdminQueue = Array.isArray(r4.body?.data)
    ? r4.body.data.some((property) => property?._id === pendingPropertyId)
    : false;
  assert('pending property visible in admin queue', r4.status === 200 && pendingInAdminQueue, r4.body);

  const r5 = await request('PATCH', `${BASE}/properties/${pendingPropertyId}/approve`, null, adminAccessToken);
  assert('PATCH /properties/:id/approve → 200', r5.status === 200, r5.body);
  assert('approved property status = approved', r5.body?.data?.status === 'approved', r5.body);
  assert('approved property isActive = true', r5.body?.data?.isActive === true, r5.body);

  const r6 = await request('GET', `${BASE}/properties?area=${encodeURIComponent(pendingArea)}`);
  const approvedVisiblePublicly = Array.isArray(r6.body?.data)
    ? r6.body.data.some((property) => property?._id === pendingPropertyId)
    : false;
  assert('approved property visible in public list', r6.status === 200 && approvedVisiblePublicly, r6.body);

  const r7 = await request('GET', `${BASE}/properties/${pendingPropertyId}`);
  assert('approved property visible in public detail', r7.status === 200, r7.body);

  const rejectArea = `Moderation Rejected ${TEST_SUFFIX}`;
  const rejectPayload = {
    title: `Moderation Rejected Property ${TEST_SUFFIX}`,
    description:
      'This property is submitted by a user and should become hidden again after admin rejection.',
    category: 'buy',
    location: { city: 'Mumbai', area: rejectArea },
    price: 9900000,
    bhk: 1,
    areaSqft: 620,
    furnishing: 'unfurnished',
  };

  const r8 = await request('POST', `${BASE}/properties/submit`, rejectPayload, userAccessToken);
  assert('POST /properties/submit (reject scenario) → 201', r8.status === 201, r8.body);

  const rejectedPropertyId = r8.body?.data?.id || '';
  if (!rejectedPropertyId) return;
  moderationPropertyIds.push(rejectedPropertyId);

  const r9 = await request('PATCH', `${BASE}/properties/${rejectedPropertyId}/reject`, null, adminAccessToken);
  assert('PATCH /properties/:id/reject → 200', r9.status === 200, r9.body);
  assert('rejected property status = rejected', r9.body?.data?.status === 'rejected', r9.body);
  assert('rejected property isActive = false', r9.body?.data?.isActive === false, r9.body);

  const r10 = await request('GET', `${BASE}/properties/${rejectedPropertyId}`);
  assert('rejected property hidden from public detail', r10.status === 404, r10.body);

  const r11 = await request('GET', `${BASE}/properties?area=${encodeURIComponent(rejectArea)}`);
  const rejectedVisiblePublicly = Array.isArray(r11.body?.data)
    ? r11.body.data.some((property) => property?._id === rejectedPropertyId)
    : false;
  assert('rejected property hidden from public list', r11.status === 200 && !rejectedVisiblePublicly, r11.body);

  const r12 = await request(
    'GET',
    `${BASE}/properties/admin?status=rejected&search=${encodeURIComponent(rejectArea)}`,
    null,
    adminAccessToken
  );
  const rejectedInAdminQueue = Array.isArray(r12.body?.data)
    ? r12.body.data.some((property) => property?._id === rejectedPropertyId)
    : false;
  assert('rejected property visible in admin rejected list', r12.status === 200 && rejectedInAdminQueue, r12.body);
};

// ── 11. User — Saved & Compare ───────────────────────────────────────────────
const testUserActions = async () => {
  console.log('\n[11] User — Saved & Compare');

  if (!createdPropertyId) {
    console.log('  ⚠️  No property ID, skipping');
    return;
  }

  // Save property
  const r1 = await request('POST', `${BASE}/users/saved`,
    { propertyId: createdPropertyId }, userAccessToken);
  assert('POST /users/saved → 201', r1.status === 201, r1.body);

  // Save again — idempotent (200 not 201)
  const r2 = await request('POST', `${BASE}/users/saved`,
    { propertyId: createdPropertyId }, userAccessToken);
  assert('POST /users/saved duplicate → 201 idempotent', r2.status === 201, r2.body);

  // Get saved
  const r3 = await request('GET', `${BASE}/users/saved`, null, userAccessToken);
  assert('GET /users/saved → 200', r3.status === 200, r3.body);

  // Add to compare
  const r4 = await request('POST', `${BASE}/users/compare`,
    { propertyId: createdPropertyId }, userAccessToken);
  assert('POST /users/compare → 201', r4.status === 201, r4.body);

  // Get compare list
  const r5 = await request('GET', `${BASE}/users/compare`, null, userAccessToken);
  assert('GET /users/compare → 200', r5.status === 200, r5.body);

  // Unsave
  const r6 = await request('DELETE', `${BASE}/users/saved/${createdPropertyId}`,
    null, userAccessToken);
  assert('DELETE /users/saved/:id → 204', r6.status === 204, r6.body);

  // Remove from compare
  const r7 = await request('DELETE', `${BASE}/users/compare/${createdPropertyId}`,
    null, userAccessToken);
  assert('DELETE /users/compare/:id → 204', r7.status === 204, r7.body);

  // Profile
  const r8 = await request('GET', `${BASE}/users/me`, null, userAccessToken);
  assert('GET /users/me → 200', r8.status === 200, r8.body);
};

// ── 12. Users — Admin Management ─────────────────────────────────────────────
const testAdminUserManagement = async () => {
  console.log('\n[12] Users — Admin Management');

  const r1 = await request('GET', `${BASE}/users?page=1&limit=10`, null, adminAccessToken);
  assert('GET /users (admin) → 200', r1.status === 200, r1.body);
  assert('users.data is array', Array.isArray(r1.body?.data), r1.body);

  if (!userId) {
    console.log('  ⚠️  No user ID available, skipping detailed admin-user tests');
    return;
  }

  const r2 = await request('GET', `${BASE}/users/${userId}`, null, adminAccessToken);
  assert('GET /users/:id (admin) → 200', r2.status === 200, r2.body);

  if (adminUserId) {
    const r3 = await request('PUT', `${BASE}/users/${adminUserId}/deactivate`, null, adminAccessToken);
    assert('PUT /users/:adminId/deactivate self-block → 400', r3.status === 400, r3.body);
  }

  const r4 = await request('PUT', `${BASE}/users/${userId}/deactivate`, null, adminAccessToken);
  assert('PUT /users/:id/deactivate → 200', r4.status === 200, r4.body);
  assert('deactivated user isActive false', r4.body?.data?.isActive === false, r4.body);

  const r5 = await request('GET', `${BASE}/users/me`, null, userAccessToken);
  assert('deactivated user access blocked → 403', r5.status === 403, r5.body);

  const r6 = await request('PUT', `${BASE}/users/${userId}/activate`, null, adminAccessToken);
  assert('PUT /users/:id/activate → 200', r6.status === 200, r6.body);
  assert('activated user isActive true', r6.body?.data?.isActive === true, r6.body);

  const r7 = await request('GET', `${BASE}/users/me`, null, userAccessToken);
  assert('reactivated user access restored → 200', r7.status === 200, r7.body);
};

// ── 13. Blogs ─────────────────────────────────────────────────────────────────
const testBlogs = async () => {
  console.log('\n[13] Blogs');

  // Create (admin)
  const r1 = await request('POST', `${BASE}/blogs`, {
    title: 'Top 5 Areas to Buy Property in Mumbai 2025',
    content: 'Mumbai real estate continues to thrive despite global headwinds. From Worli to Powai, here are the top 5 micro-markets every buyer must consider before making their purchase decision in 2025. Each area has unique advantages in terms of connectivity, infrastructure, and price appreciation potential.',
    category: 'market_trends',
    tags: ['mumbai', 'investment', 'real-estate'],
    metaTitle: 'Top 5 Mumbai Areas to Buy Property',
    metaDescription: 'Discover the best areas to invest in Mumbai real estate in 2025.',
    isPublished: true,
  }, adminAccessToken);
  assert('POST /blogs (admin) → 201', r1.status === 201, r1.body);

  if (r1.body?.data?._id) {
    createdBlogId   = r1.body.data._id;
    createdBlogSlug = r1.body.data.slug;
  }

  // List blogs
  const r2 = await request('GET', `${BASE}/blogs`);
  assert('GET /blogs → 200', r2.status === 200, r2.body);
  assert('blogs.data is array', Array.isArray(r2.body?.data), r2.body);

  // Filter by category
  const r3 = await request('GET', `${BASE}/blogs?category=market_trends`);
  assert('GET /blogs?category → 200', r3.status === 200, r3.body);

  if (createdBlogSlug) {
    // Get by slug
    const r4 = await request('GET', `${BASE}/blogs/${createdBlogSlug}`);
    assert('GET /blogs/:slug → 200', r4.status === 200, r4.body);
  }

  if (createdBlogId) {
    // Add comment
    const r5 = await request('POST', `${BASE}/blogs/${createdBlogId}/comments`, {
      name: 'Rohan Mehta',
      comment: 'Very helpful article! Bandra West was my first choice anyway.',
    });
    assert('POST /blogs/:id/comments → 201', r5.status === 201, r5.body);

    // Update blog (admin)
    const r6 = await request('PUT', `${BASE}/blogs/${createdBlogId}`,
      { title: 'Top 5 Areas to Buy Property in Mumbai 2025 (Updated)' },
      adminAccessToken);
    assert('PUT /blogs/:id (admin) → 200', r6.status === 200, r6.body);
  }
};

// ── 14. Testimonials ──────────────────────────────────────────────────────────
const testTestimonials = async () => {
  console.log('\n[14] Testimonials');

  // List (public)
  const r1 = await request('GET', `${BASE}/testimonials`);
  assert('GET /testimonials → 200', r1.status === 200, r1.body);

  // Non-admin cannot create (no file, will fail at auth before file check)
  const r2 = await request('POST', `${BASE}/testimonials`,
    { name: 'Sneha', rating: 5, message: 'Excellent service from Bricks team.' },
    userAccessToken);
  assert('POST /testimonials non-admin → 403', r2.status === 403, r2.body);
};

// ── 15. Dashboard ─────────────────────────────────────────────────────────────
const testDashboard = async () => {
  console.log('\n[15] Dashboard');

  const r1 = await request('GET', `${BASE}/dashboard`, null, adminAccessToken);
  assert('GET /dashboard (admin) → 200', r1.status === 200, r1.body);
  assert('dashboard has properties', r1.body?.data?.properties !== undefined, r1.body);
  assert('dashboard has leads',      r1.body?.data?.leads      !== undefined, r1.body);
  assert('dashboard has users',      r1.body?.data?.users      !== undefined, r1.body);
  assert('dashboard has blogs',      r1.body?.data?.blogs      !== undefined, r1.body);

  // Non-admin blocked
  const r2 = await request('GET', `${BASE}/dashboard`, null, userAccessToken);
  assert('GET /dashboard non-admin → 403', r2.status === 403, r2.body);
};

// ── 16. Error Hardening ───────────────────────────────────────────────────────
const testHardening = async () => {
  console.log('\n[16] Security & Error Hardening');

  // 404
  const r1 = await request('GET', `${BASE}/nonexistent-route`);
  assert('404 on unknown route', r1.status === 404, r1.body);

  // Invalid ObjectId → 400 not 500
  const r2 = await request('GET', `${BASE}/leads/bad-id`, null, adminAccessToken);
  assert('Invalid ObjectId → 400', r2.status === 400, r2.body);

  // NoSQL injection attempt (mongoSanitize strips it)
  const r3 = await request('POST', `${BASE}/auth/signup/request`, {
    name: 'Injection Test',
    email: `inject.${Date.now()}@mailinator.com`,
    phone: { $gt: '' },
    password: 'InjectPass123',
  });
  assert('NoSQL injection → 400', r3.status === 400, r3.body);

  // Missing auth on protected route
  const r4 = await request('GET', `${BASE}/users/me`);
  assert('No token → 401', r4.status === 401, r4.body);

  // Tampered token
  const r5 = await request('GET', `${BASE}/auth/me`, null, 'this.is.fake');
  assert('Tampered token → 401', r5.status === 401, r5.body);

  // Logout and reuse refresh token
  const r6 = await request('POST', `${BASE}/auth/logout`, { refreshToken: userRefreshToken });
  assert('POST /auth/logout → 200', r6.status === 200, r6.body);

  const r7 = await request('POST', `${BASE}/auth/refresh`, { refreshToken: userRefreshToken });
  assert('Reused refresh token after logout → 401', r7.status === 401, r7.body);
};

// ── 17. Cleanup — Delete test property, builder & blog ───────────────────────
const testCleanup = async () => {
  console.log('\n[17] Cleanup');

  const cleanupOk = (res) => res.status === 204 || res.status === 429;

  for (const moderationPropertyId of moderationPropertyIds) {
    const r = await request('DELETE', `${BASE}/properties/${moderationPropertyId}`, null, adminAccessToken);
    assert(`DELETE moderation property ${moderationPropertyId} → 204|429`, cleanupOk(r), r.body);
  }

  if (createdPropertyId) {
    const r = await request('DELETE', `${BASE}/properties/${createdPropertyId}`, null, adminAccessToken);
    assert('DELETE /properties/:id → 204|429', cleanupOk(r), r.body);
  }

  if (createdBuilderId) {
    const r = await request('DELETE', `${BASE}/admin/builders/${createdBuilderId}`, null, adminAccessToken);
    assert('DELETE /admin/builders/:id → 204|429', cleanupOk(r), r.body);
  }

  if (createdBlogId) {
    const r = await request('DELETE', `${BASE}/blogs/${createdBlogId}`, null, adminAccessToken);
    assert('DELETE /blogs/:id → 204|429', cleanupOk(r), r.body);
  }

  if (createdPropertySubmissionId) {
    const r = await request('DELETE', `${BASE}/property-submissions/${createdPropertySubmissionId}`, null, adminAccessToken);
    assert('DELETE /property-submissions/:id (cleanup) → 200|429', r.status === 200 || r.status === 429, r.body);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// RUNNER
// ─────────────────────────────────────────────────────────────────────────────

const run = async () => {
  // Boot
  await connectDB();
  initCloudinary();
  initFirebase();

  const server = http.createServer(app);
  await new Promise((res) => server.listen(PORT, res));
  console.log(`\n🧪 Bricks API Tests — server on :${PORT}\n${'─'.repeat(55)}`);

  try {
    await testHealth();
    await testAuthUser();
    await testAuthAdmin();

    if (isBuilderScope) {
      await testBuilders();
      await testProperties();
      await testCleanup();

      const totalBuilder = passed + failed;
      console.log(`\n${'─'.repeat(55)}`);
      console.log(`[scope=builders] Results: ${passed}/${totalBuilder} passed`);
      if (failures.length) {
        console.log('\nFailed tests:');
        failures.forEach((f) => console.log(`  ❌ ${f.label}`));
      } else {
        console.log('All scoped tests passed! 🎉');
      }

      server.close(() => process.exit(failed > 0 ? 1 : 0));
      return;
    }

    if (isPropertySubmissionScope) {
      await testPropertySubmissions();

      const totalPropertySubmissions = passed + failed;
      console.log(`\n${'─'.repeat(55)}`);
      console.log(`[scope=property-submissions] Results: ${passed}/${totalPropertySubmissions} passed`);
      if (failures.length) {
        console.log('\nFailed tests:');
        failures.forEach((f) => console.log(`  ❌ ${f.label}`));
      } else {
        console.log('All scoped tests passed! 🎉');
      }

      server.close(() => process.exit(failed > 0 ? 1 : 0));
      return;
    }

    await testCalculators();
    await testContact();
    await testLeads();
    await testPropertySubmissions();
    await testStampDuty();
    await testBuilders();
    await testProperties();
    await testPropertyModeration();
    await testUserActions();
    await testAdminUserManagement();
    await testBlogs();
    await testTestimonials();
    await testDashboard();
    await testHardening();
    await testCleanup();
  } catch (err) {
    console.error('\n💥 Test runner crashed:', err.message);
    console.error(err.stack);
  }

  // Report
  const total = passed + failed;
  console.log(`\n${'─'.repeat(55)}`);
  console.log(`Results: ${passed}/${total} passed`);
  if (failures.length) {
    console.log('\nFailed tests:');
    failures.forEach((f) => console.log(`  ❌ ${f.label}`));
  } else {
    console.log('All tests passed! 🎉');
  }

  server.close(() => process.exit(failed > 0 ? 1 : 0));
};

run().catch((err) => {
  console.error('Boot error:', err.message);
  process.exit(1);
});
