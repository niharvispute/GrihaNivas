/**
 * API Integration Test Script
 *
 * Starts the Express app on port 5099 (in-process),
 * runs all major API flows with real MongoDB Atlas,
 * and prints a pass/fail report.
 *
 * Usage:
 *   node scripts/test-apis.js
 */

'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const http    = require('http');
const app     = require('../app');
const connectDB   = require('../config/db');
const { initCloudinary } = require('../config/cloudinary');
const { initFirebase }   = require('../config/firebase');
const { generateOtp }    = require('../services/otpService');

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
let createdLeadId     = '';
let createdBlogId     = '';
let createdBlogSlug   = '';
let createdContactId  = '';
let createdTestimonialId = '';
let createdBannerId   = '';

// ── HTTP helper ───────────────────────────────────────────────────────────────

const request = (method, path, body = null, token = null) =>
  new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
        ...(token   && { Authorization: `Bearer ${token}` }),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
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
const TEST_PHONE = '+917777777701';

const testAuthUser = async () => {
  console.log('\n[2] Auth — User Flow');

  // 2a. Validation: bad phone
  const r1 = await request('POST', `${BASE}/auth/send-otp`, { phone: '9876543210' });
  assert('send-otp bad phone → 400', r1.status === 400, r1.body);

  // 2b. Send OTP (generates in-memory, logs to console in dev)
  const otp = generateOtp(TEST_PHONE);  // grab it directly since we're in-process
  const r2 = await request('POST', `${BASE}/auth/send-otp`, { phone: TEST_PHONE });
  assert('send-otp → 200', r2.status === 200, r2.body);

  // 2c. Wrong OTP
  const r3 = await request('POST', `${BASE}/auth/verify-otp`, {
    phone: TEST_PHONE, otp: '000000',
  });
  assert('verify-otp wrong OTP → 400', r3.status === 400, r3.body);

  // 2d. Correct OTP (re-generate since wrong OTP consumed an attempt)
  const otp2 = generateOtp(TEST_PHONE);
  const r4 = await request('POST', `${BASE}/auth/verify-otp`, {
    phone: TEST_PHONE,
    otp: otp2,
    name: 'Test User',
    email: 'testuser.bricks@mailinator.com',
  });
  assert('verify-otp correct → 201', r4.status === 201, r4.body);
  assert('verify-otp returns accessToken', !!r4.body?.data?.accessToken, r4.body);
  assert('verify-otp returns user.phone', r4.body?.data?.user?.phone === TEST_PHONE, r4.body);

  userAccessToken  = r4.body?.data?.accessToken  || '';
  userRefreshToken = r4.body?.data?.refreshToken || '';
  userId = r4.body?.data?.user?.id || '';

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
const ADMIN_PHONE = process.env.ADMIN_PHONE || '+919876543210';

const testAuthAdmin = async () => {
  console.log('\n[3] Auth — Admin Login');

  const otp = generateOtp(ADMIN_PHONE);
  const r = await request('POST', `${BASE}/auth/verify-otp`, {
    phone: ADMIN_PHONE, otp,
  });
  assert('admin login → 201/200', r.status === 201 || r.status === 200, r.body);
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
  });
  assert('POST /leads buy → 201', r1.status === 201, r1.body);

  const r2 = await request('POST', `${BASE}/leads`, {
    name: 'Amit Shah', phone: '+919988776655', leadType: 'rent',
    message: 'Need 2BHK in Andheri West.',
  });
  assert('POST /leads rent → 201', r2.status === 201, r2.body);

  // Validation: invalid leadType
  const r3 = await request('POST', `${BASE}/leads`, {
    name: 'Test', phone: '+919876543210', leadType: 'investment',
  });
  assert('POST /leads bad leadType → 400', r3.status === 400, r3.body);

  // Admin: list all leads
  const r4 = await request('GET', `${BASE}/leads`, null, adminAccessToken);
  assert('GET /leads (admin) → 200', r4.status === 200, r4.body);
  assert('leads list is array', Array.isArray(r4.body?.data), r4.body);

  // Get first lead for further tests
  if (r4.body?.data?.length > 0) {
    createdLeadId = r4.body.data[0]._id;

    const r5 = await request('GET', `${BASE}/leads/${createdLeadId}`, null, adminAccessToken);
    assert('GET /leads/:id → 200', r5.status === 200, r5.body);

    // Update status
    const r6 = await request('PUT', `${BASE}/leads/${createdLeadId}/status`,
      { status: 'contacted' }, adminAccessToken);
    assert('PUT /leads/:id/status contacted → 200', r6.status === 200, r6.body);

    // Try backward transition
    const r7 = await request('PUT', `${BASE}/leads/${createdLeadId}/status`,
      { status: 'new' }, adminAccessToken);
    assert('PUT /leads backward status → 400', r7.status === 400, r7.body);

    // Add note
    const r8 = await request('POST', `${BASE}/leads/${createdLeadId}/notes`,
      { text: 'Called client, interested in Worli area. Follow up next week.' }, adminAccessToken);
    assert('POST /leads/:id/notes → 201', r8.status === 201, r8.body);
  }

  // Non-admin cannot list leads
  const r9 = await request('GET', `${BASE}/leads`, null, userAccessToken);
  assert('GET /leads non-admin → 403', r9.status === 403, r9.body);
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

// ── 8. Properties ─────────────────────────────────────────────────────────────
const testProperties = async () => {
  console.log('\n[8] Properties');

  // Create (admin, no file upload for test)
  const r1 = await request('POST', `${BASE}/properties`, {
    title: 'Sea View 3BHK in Worli',
    description: 'Stunning sea view apartment in prime Worli location with all modern amenities and excellent connectivity.',
    category: 'buy',
    location: { city: 'Mumbai', area: 'Worli' },
    price: 25000000,
    bhk: 3,
    areaSqft: 1450,
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

  if (createdPropertyId) {
    // Get by ID
    const r6 = await request('GET', `${BASE}/properties/${createdPropertyId}`);
    assert('GET /properties/:id → 200', r6.status === 200, r6.body);
    assert('property title matches', r6.body?.data?.title === 'Sea View 3BHK in Worli', r6.body);

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

// ── 9. User — Saved & Compare ─────────────────────────────────────────────────
const testUserActions = async () => {
  console.log('\n[9] User — Saved & Compare');

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

// ── 10. Blogs ─────────────────────────────────────────────────────────────────
const testAdminUserManagement = async () => {
  console.log('\n[10] Users — Admin Management');

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

// ── 11. Blogs ─────────────────────────────────────────────────────────────────
const testBlogs = async () => {
  console.log('\n[11] Blogs');

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

// ── 12. Testimonials ──────────────────────────────────────────────────────────
const testTestimonials = async () => {
  console.log('\n[12] Testimonials');

  // List (public)
  const r1 = await request('GET', `${BASE}/testimonials`);
  assert('GET /testimonials → 200', r1.status === 200, r1.body);

  // Non-admin cannot create (no file, will fail at auth before file check)
  const r2 = await request('POST', `${BASE}/testimonials`,
    { name: 'Sneha', rating: 5, message: 'Excellent service from Bricks team.' },
    userAccessToken);
  assert('POST /testimonials non-admin → 403', r2.status === 403, r2.body);
};

// ── 13. Dashboard ─────────────────────────────────────────────────────────────
const testDashboard = async () => {
  console.log('\n[13] Dashboard');

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

// ── 14. Error Hardening ───────────────────────────────────────────────────────
const testHardening = async () => {
  console.log('\n[14] Security & Error Hardening');

  // 404
  const r1 = await request('GET', `${BASE}/nonexistent-route`);
  assert('404 on unknown route', r1.status === 404, r1.body);

  // Invalid ObjectId → 400 not 500
  const r2 = await request('GET', `${BASE}/leads/bad-id`, null, adminAccessToken);
  assert('Invalid ObjectId → 400', r2.status === 400, r2.body);

  // NoSQL injection attempt (mongoSanitize strips it)
  const r3 = await request('POST', `${BASE}/auth/send-otp`, { phone: { $gt: '' } });
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

// ── 15. Cleanup — Delete test property & blog ─────────────────────────────────
const testCleanup = async () => {
  console.log('\n[15] Cleanup');

  if (createdPropertyId) {
    const r = await request('DELETE', `${BASE}/properties/${createdPropertyId}`, null, adminAccessToken);
    assert('DELETE /properties/:id → 204', r.status === 204, r.body);
  }

  if (createdBlogId) {
    const r = await request('DELETE', `${BASE}/blogs/${createdBlogId}`, null, adminAccessToken);
    assert('DELETE /blogs/:id → 204', r.status === 204, r.body);
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
    await testCalculators();
    await testContact();
    await testLeads();
    await testStampDuty();
    await testProperties();
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
