'use strict';

// ── Bricks Real Estate Platform — Test Configuration ──────────────────────
// Auto-detected from codebase discovery. Override via environment variables.

const config = {
  // Server URLs
  BACKEND_URL:  process.env.TEST_BACKEND_URL  || 'http://localhost:5000',
  FRONTEND_URL: process.env.TEST_FRONTEND_URL || 'http://localhost:3000',
  API_BASE:     process.env.TEST_API_BASE     || 'http://localhost:5000/api',

  // Health endpoints (no /api prefix)
  HEALTH_URL:       'http://localhost:5000/health',
  HEALTH_READY_URL: 'http://localhost:5000/health/ready',

  // Auth — read from environment only, never hardcoded
  TEST_ADMIN_EMAIL:    process.env.TEST_ADMIN_EMAIL    || 'admin@mumbaieditorial.com',
  TEST_ADMIN_PASSWORD: process.env.TEST_ADMIN_PASSWORD || '',
  TEST_USER_EMAIL:     process.env.TEST_USER_EMAIL     || '',
  TEST_USER_PASSWORD:  process.env.TEST_USER_PASSWORD  || '',

  // Phone used for admin seed script: +919876543210
  // Auth is phone-OTP or email+password — password tests require a seeded user

  // Timing thresholds (ms)
  RESPONSE_TIME_WARN:     500,
  RESPONSE_TIME_CRITICAL: 2000,

  // Lighthouse thresholds
  LIGHTHOUSE: {
    LCP_WARN_MS: 2500,
    TTFB_WARN_MS: 600,
    CLS_WARN:    0.1,
    TBT_WARN_MS: 300,
  },

  // Discovered API routes (method → path)
  ROUTES: {
    // Health
    GET_HEALTH:       'GET /health',
    GET_HEALTH_READY: 'GET /health/ready',

    // Auth
    POST_AUTH_SIGNUP_REQUEST:     'POST /api/auth/signup/request',
    POST_AUTH_SIGNUP_VERIFY:      'POST /api/auth/signup/verify-email',
    POST_AUTH_SIGNUP_RESEND:      'POST /api/auth/signup/resend-otp',
    POST_AUTH_LOGIN:              'POST /api/auth/login',
    POST_AUTH_GOOGLE:             'POST /api/auth/google',
    POST_AUTH_FORGOT_REQUEST:     'POST /api/auth/forgot-password/request',
    POST_AUTH_FORGOT_VERIFY:      'POST /api/auth/forgot-password/verify',
    POST_AUTH_FORGOT_RESET:       'POST /api/auth/forgot-password/reset',
    POST_AUTH_REFRESH:            'POST /api/auth/refresh',
    POST_AUTH_LOGOUT:             'POST /api/auth/logout',
    GET_AUTH_ME:                  'GET /api/auth/me',           // protected

    // Properties (public)
    GET_PROPERTIES:               'GET /api/properties',
    GET_PROPERTY_SLUG:            'GET /api/properties/slug/:slug',
    GET_PROPERTY_BY_ID:           'GET /api/properties/:id',

    // Properties (admin)
    GET_PROPERTIES_ADMIN:         'GET /api/properties/admin',
    GET_PROPERTIES_EXPORT:        'GET /api/properties/export',
    POST_PROPERTY_SUBMIT:         'POST /api/properties/submit', // user
    POST_PROPERTY_CREATE:         'POST /api/properties',        // admin
    PUT_PROPERTY:                 'PUT /api/properties/:id',
    DELETE_PROPERTY:              'DELETE /api/properties/:id',
    PATCH_PROPERTY_APPROVE:       'PATCH /api/properties/:id/approve',
    PATCH_PROPERTY_REJECT:        'PATCH /api/properties/:id/reject',

    // Leads
    POST_LEAD:                    'POST /api/leads',
    GET_LEAD_MY_ENQUIRIES:        'GET /api/leads/my-enquiries',
    GET_LEADS:                    'GET /api/leads',
    GET_LEADS_EXPORT:             'GET /api/leads/export',
    GET_LEAD_BY_ID:               'GET /api/leads/:id',
    PUT_LEAD_STATUS:              'PUT /api/leads/:id/status',
    PUT_LEAD_ASSIGN:              'PUT /api/leads/:id/assign',
    POST_LEAD_NOTE:               'POST /api/leads/:id/notes',
    DELETE_LEAD:                  'DELETE /api/leads/:id',

    // Blogs (public)
    GET_BLOGS:                    'GET /api/blogs',
    GET_BLOG_SLUG:                'GET /api/blogs/:slug',
    POST_BLOG_COMMENT:            'POST /api/blogs/:id/comments',

    // Blogs (admin)
    GET_BLOGS_ADMIN_COMMENTS:     'GET /api/blogs/admin/comments',
    POST_BLOG_CREATE:             'POST /api/blogs',
    PUT_BLOG:                     'PUT /api/blogs/:id',
    DELETE_BLOG:                  'DELETE /api/blogs/:id',

    // Calculators (public)
    POST_CALC_EMI:                'POST /api/calculators/emi',
    POST_CALC_STAMP_DUTY:         'POST /api/calculators/stamp-duty',

    // Users (all protected)
    GET_USER_ME:                  'GET /api/users/me',
    PUT_USER_ME:                  'PUT /api/users/me',
    GET_USER_PROPERTIES:          'GET /api/users/properties',
    GET_USER_SAVED:               'GET /api/users/saved',
    POST_USER_SAVED:              'POST /api/users/saved',
    DELETE_USER_SAVED:            'DELETE /api/users/saved/:propertyId',
    GET_USER_COMPARE:             'GET /api/users/compare',
    POST_USER_COMPARE:            'POST /api/users/compare',
    DELETE_USER_COMPARE:          'DELETE /api/users/compare/:propertyId',

    // Testimonials
    GET_TESTIMONIALS:             'GET /api/testimonials',
    POST_TESTIMONIAL:             'POST /api/testimonials',

    // Banners
    GET_BANNERS:                  'GET /api/banners',

    // Stamp Duty
    GET_STAMP_DUTY_CONFIG:        'GET /api/stamp-duty',

    // Contact
    POST_CONTACT:                 'POST /api/contact',

    // Dashboard (admin)
    GET_DASHBOARD:                'GET /api/dashboard',

    // System
    GET_SYSTEM_CONFIG:            'GET /api/system/config',

    // Builders
    GET_BUILDERS:                 'GET /api/builders',
  },
};

module.exports = config;
