# Bricks - Unified Project Status

Last updated: 2026-04-12
Source inputs: backend/CURRENT_STATUS.md + current frontend and backend codebase scan

## Execution Update (2026-04-12)

Phase 0 started and baseline is frozen:
- Added frontend contract freeze doc with response envelope, canonical route strategy, DTO shape decisions, and auth lifecycle: frontend/docs/PHASE0_CONTRACT_FREEZE.md

Phase 1 started and foundation scaffold is now in code:
- API client base + error handling + safe request wrappers
- Token store + refresh-on-401 authed request wrapper
- Domain service modules for auth, properties, blogs, leads, contact, calculators, users, dashboard, system health
- DTO mappers for property/blog/lead/user view models
- Frontend env template for API base URL

Phase 2 kickoff executed on public flows:
- Buy and Rent pages now fetch live property data from backend services
- Buy and Rent pagination is now server-side via URL page params and backend meta
- Buy and Rent filters now submit as URL query params and are executed server-side by backend listing APIs
- Buy and Rent sorting is now URL-driven and executed server-side by backend sortBy query
- Buy listing now supports server-side category switching for commercial and new-launch inventory
- Property and blog cards now use slug-first detail links (with fallback compatibility)
- Property detail page now resolves live data via slug/id lookup + similar listings from API
- Blogs listing page now fetches live posts and a new dynamic blog detail route is added
- Blogs pagination and search are now server-side via URL query params (page/category/search) and backend meta
- Home page now hydrates featured properties and latest blogs from backend (mock fallback retained)
- Public forms now submit to backend: general lead, property lead, home loan, list property, contact
- EMI calculator now calls backend /api/calculators/emi with live server-side computation
- Stamp duty calculator now calls backend /api/calculators/stamp-duty with live server-side computation
- Added agreement page and wired rent-agreement assistance form to backend leads API (leadType=agreement)
- Migrated backend auth to credential login/signup with email OTP verification and forgot-password OTP reset
- Migrated frontend auth page to credential login + signup email OTP verify + forgot-password OTP reset flow
- Added missing public route aliases to remove nav/footer 404s: /commercial, /new-launch, /launches, /loan, /faq
- Backend dependency blocker resolved locally: removed unused multer-storage-cloudinary conflict so backend npm install now succeeds

Status of execution phases:
- Phase 0: Completed (contract freeze documented)
- Phase 1: Completed (foundation scaffold implemented)
- Phase 2: Completed (public listing/detail/blog/forms/calculators wired to backend)

## 1) Executive Snapshot

Overall state: Backend is largely production-ready. Frontend is visually advanced but mostly not integrated with live APIs.

Current readiness split:
- Backend: ~85-90% complete (core API, auth, validation, DB, deployment hardening, test coverage are strong)
- Frontend: ~45-55% complete (UI routes/components are present, but data/auth/integration workflows are mostly pending)
- End-to-end product readiness: ~55-60% (integration layer is the main remaining work)

## 2) What Is Completed

### Backend completed (confirmed)
- Core API domain coverage is implemented and live against MongoDB:
  - Auth (credential signup/login + OTP email verify/reset + JWT refresh/logout/me)
  - Properties
  - Leads
  - Users (profile + saved + compare + admin user management)
  - Blogs
  - Testimonials
  - Banners
  - Stamp duty config
  - Calculators
  - Contact
  - Admin dashboard stats
  - Health + readiness
- Security and runtime hardening done:
  - Helmet, CORS policy, sanitization, HPP, rate limiting, compression, logging
  - Optional HTTPS forcing and proxy trust flags
- Production readiness support done:
  - PM2 profile hardening
  - Deployment runbook
  - Preflight checks
  - Graceful shutdown
  - Redis-backed JWT blacklist with fallback
- Quality signal is strong:
  - API integration suite reported as 97/97 passing in CURRENT_STATUS.md
  - ESLint migration and lint pass completed
- Recent backend bug-fix patch set already merged:
  - Property savedCount support fixed
  - Blog image publicId cleanup fixed
  - Blog unapproved comment exposure fixed
  - Lead monthlyIncome persistence fixed

### Frontend completed (confirmed)
- Next.js app structure is in place with route groups:
  - public pages
  - admin shell
  - user dashboard shell
- UI foundation is strong:
  - Tailwind v4 setup
  - design tokens and global theme in globals.css
  - reusable component library for listing, property details, forms, calculators, layout
- Major page surfaces already designed and implemented as static/dumb UI:
  - Home, buy, rent, property detail
  - Blogs listing
  - Contact
  - Home loan
  - EMI and stamp-duty calculators
  - List-property page
  - About page
  - Admin dashboard placeholder
  - User dashboard placeholder

## 3) What Is Not Completed

### Backend pending items
- Infrastructure rollout still pending (as per CURRENT_STATUS.md):
  - SSL cert issuance
  - production PM2 rollout
  - production Redis env rollout
- Optional feature gaps (as documented):
  - blog comment moderation endpoint for admin
  - lead monthlyIncome filter support in lead list query
  - contact list pagination
  - frontend display usage for property savedCount
- Additional code-level gap found during scan:
  - calculatorController stamp-duty endpoint still uses fallback constants (TODO notes indicate DB-config fetch is planned but not wired there yet)

### Frontend pending integration items
- No route guards for admin/user protected areas
- No app-level session bootstrap yet to auto-hydrate current user state on refresh
- Several non-critical pages still consume static/mock data
- Admin and user dashboard data are hardcoded placeholders
- Property save/compare actions are API-wired; compare UI was hardened with a dedicated compare mapper and defensive rendering
- Blog search and listing controls are wired server-side; remaining integration work is now mainly Phase 3/4 (user/admin/protected flows)

### Routing and UI consistency gaps
- Footer legal/company links still point to missing routes: /privacy, /terms, /careers, /sitemap
- User sidebar links to /dashboard/saved and /dashboard/enquiries, but those pages are missing
- Admin sidebar links to /admin/properties, /admin/leads, /admin/users, but those pages are missing

### Data-contract mismatches likely to break integration if not addressed
- Residual mismatch risk remains on pages that still use static models directly instead of shared mappers
- Admin/user dashboard surfaces still need strict DTO usage audit before full API wiring

## 4) Changes Required (Priority)

### P0 (must do first)
- Build frontend API foundation:
  - lib/api/client.js (base URL + error handling)
  - auth token store + refresh flow
  - consistent response parser for backend envelope { success, message, data, meta }
- Environment wiring:
  - frontend .env.local: NEXT_PUBLIC_API_BASE_URL
  - backend ALLOWED_ORIGINS must include frontend URL (for browser CORS)
- Fix route integrity and immediate runtime errors:
  - implement/redirect missing linked routes
  - add blogs/[slug] page
  - fix BlogCard prop contract
- Create frontend DTO mappers from backend models for:
  - Property
  - Blog
  - Lead
  - User profile

### P1 (public user journeys)
- Wire public pages to live backend:
  - Home: featured properties + latest blogs + optional banners/testimonials
  - Buy/Rent listing: GET /api/properties with query params
  - Property detail: use slug-first strategy via GET /api/properties/slug/:slug
  - Blogs list and blog detail: GET /api/blogs, GET /api/blogs/:slug
- Wire all public forms:
  - Contact page -> POST /api/contact
  - Property lead form(s) -> POST /api/leads
  - Home loan and list-property forms -> POST /api/leads with leadType=loan/list_property

### P2 (auth and user area)
- Implement credential auth flow:
  - signup request + email verify (OTP-only verify payload)
  - login via email or phone + password
  - forgot-password request/verify/reset (OTP-only verify payload)
  - secure token persistence strategy
  - silent refresh and logout
- Integrate user features:
  - GET/PUT /api/users/me
  - saved and compare endpoints
  - build missing dashboard subpages (saved, enquiries)

### P3 (admin console)
- Add admin route protection and role-based navigation
- Wire admin pages:
  - dashboard stats -> GET /api/dashboard
  - users management -> /api/users + activate/deactivate
  - properties/leads/blogs CRUD management pages

### P4 (hardening + polish)
- Implement loading, empty, error, and retry states across pages
- Add input validation aligned with backend Zod constraints
- Add E2E smoke tests for critical paths
- Add SSR/ISR strategy for SEO pages (blogs/property listings)

## 5) Recommended Frontend-Backend Integration Approach

Approach: vertical-slice integration, not big-bang.

Why this approach:
- It gives user-visible progress early
- It reduces contract mismatch risk
- It keeps rollback surface small per release

### Phase-by-phase execution plan

Phase 0 - Contract freeze (1 day)
- Finalize payload/response contracts per endpoint
- Decide canonical frontend route strategy:
  - preferred: property and blog by slug
- Define frontend view-model mappers

Phase 1 - Integration foundation (1-2 days)
- API client, env setup, auth helpers, global error handling
- CORS/proxy checks
- Shared hooks or service modules per domain

Phase 2 - Public flows (3-5 days)
- Listing/detail/blog/contact/leads wired end-to-end
- Replace mock datasets with API data
- Keep UI unchanged while swapping data source

Phase 3 - Auth + user dashboard (3-4 days)
- Credential login/signup, token lifecycle, profile, saved, compare
- Build missing dashboard screens

Phase 4 - Admin MVP (4-6 days)
- Dashboard stats, users, leads, properties basic management
- Guard all admin routes via role

Phase 5 - Stabilization and launch readiness (2-4 days)
- E2E regression pass
- Performance and SEO pass
- Production env checks and deployment rehearsal

## 6) Integration Mapping (Quick)

Primary page-to-endpoint mapping:
- Home
  - GET /api/properties?isFeatured=true
  - GET /api/blogs?page=1&limit=3
  - optional: GET /api/banners?position=home_hero, GET /api/testimonials
- Buy/Rent listings
  - GET /api/properties?category=buy|rent&bhk=&minPrice=&maxPrice=&area=&sortBy=
- Property detail
  - GET /api/properties/slug/:slug
  - lead submission: POST /api/leads
- Blogs
  - list: GET /api/blogs
  - detail: GET /api/blogs/:slug
  - comments: POST /api/blogs/:id/comments
- Contact
  - POST /api/contact
- Calculators
  - POST /api/calculators/emi
  - POST /api/calculators/stamp-duty
- User area
  - auth: /api/auth/*
  - profile: /api/users/me
  - saved: /api/users/saved
  - compare: /api/users/compare
- Admin
  - stats: /api/dashboard
  - users: /api/users
  - leads: /api/leads
  - property/blog/banner/testimonial endpoints as needed

## 7) Definition of Done for Full Integration

- No mock data imports remain in production routes
- All primary forms submit successfully with validation and error handling
- Auth/login/refresh/logout works reliably
- Saved and compare are fully functional
- Admin dashboard and core admin lists are connected to live API
- Broken links and missing routes are eliminated
- CORS and environment configs work in dev and production
- Critical E2E journeys pass:
  - browse -> detail -> lead submit
  - login -> save/compare
  - admin login -> lead/user management

## 8) Final Recommendation

Do not redesign UI first. Keep current frontend UI, lock backend contracts, then integrate in vertical slices.

The fastest high-value sequence is:
1. Foundation + auth plumbing
2. Public property/blog/contact flows
3. User saved/compare flows
4. Admin data screens

This gives a usable, testable product quickly while minimizing integration risk.
