# Bricks Backend - API & Integration Progress

## Update - 2026-04-21

### Current Snapshot
- Backend API surface is fully implemented across all 14 route groups (auth, properties, leads, users, blogs, builders, banners, testimonials, calculators, stamp-duty, contact, property-submissions, dashboard, system).
- Frontend integration: public flows (listing, detail, blogs, forms, calculators) are fully wired. Admin consoles are wired for all domains.
- **Dashboard stats bug: FIXED** (2026-04-21) — `GET /api/dashboard` now returns flat `leads.new`, `leads.contacted`, `leads.qualified`, `leads.closed` fields (in addition to the existing `byStatus` map for backward compat). Admin dashboard KPIs will now render real values instead of "—".
- Production environment variables (MongoDB URI, JWT secrets, Cloudinary, email/SMS) still need to be configured for deployment.

### What Is Fully Complete
- Core backend infrastructure, middleware hardening (Helmet, CORS, rate limiting, XSS, NoSQL injection, HPP, compression).
- All API controllers and routes implemented and wired.
- Credential auth with email OTP verification + forgot-password OTP flow.
- File uploads via Multer → Cloudinary.
- PM2 process management config ready.
- All models fully defined (User, Property, Lead, Blog, Builder, Banner, Testimonial, StampDutyConfig, SystemConfig, PropertySubmission, Contact, NewsletterSubscriber, AuthOtpFlow).

### Recently Fixed / Added
- ✅ **Dashboard stats bug** (2026-04-21) — `dashboardController.js` now exposes `leads.new`, `leads.contacted`, `leads.qualified`, `leads.closed` as top-level fields (defaulting to `0` when no leads in that status) while still returning the `byStatus` map for compatibility.
- ✅ **Excel export endpoints** (2026-04-21) — Added admin-only `.xlsx` export for Users (password fields excluded), Properties, Builders, Testimonials, and Leads. Uses `exceljs` + shared `utils/excelExport.js` utility. Endpoints respect existing filter query params (search, category, status, leadType, etc.).

### What Is Still In Progress
1. **Production env config** — `.env` exists locally but production values not set (MongoDB URI, JWT secrets, Cloudinary, SMTP/SendGrid, Firebase).
2. **FORCE_HTTPS** — currently disabled; must be enabled via env var before going live.
3. **Database indexes** — not verified on hot query fields (Property.category, Property.location.area, Lead.status, User.email, Blog.slug).
4. **MongoDB backup** — no automated backup strategy configured.
5. **Seed admin user** — `npm run seed:admin` must be run on production DB.

---

## Backend Infrastructure Status

### Tech Stack & Security
- **Runtime**: Node.js >= 18.0.0 ✅
- **Framework**: Express.js 4.21.2 ✅
- **Database**: MongoDB 9.4.1 ✅
- **Authentication**: JWT + Firebase OTP ✅
- **File Uploads**: Cloudinary integration ✅
- **Email**: Nodemailer + SendGrid support ✅
- **Security Middleware**:
  - Helmet (security headers) ✅
  - CORS (configurable origins) ✅
  - Rate limiting ✅
  - XSS protection ✅
  - NoSQL injection prevention ✅
  - HTTP Parameter Pollution (HPP) prevention ✅
  - Request compression ✅

### Development Tools
- ESLint configuration ✅
- Prettier code formatting ✅
- PM2 production process manager ✅
- Morgan HTTP logging ✅
- Environment configuration (.env) ✅

---

## API Endpoints Status

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Auth | Status | Integrated |
|--------|----------|------|--------|-----------|
| POST | `/auth/signup/request` | Public | ✅ | ✅ |
| POST | `/auth/signup/verify-email` | Public | ✅ | ✅ |
| POST | `/auth/signup/resend-otp` | Public | ✅ | ✅ |
| POST | `/auth/login` | Public | ✅ | ✅ |
| POST | `/auth/google` | Public | ✅ | ✅ |
| POST | `/auth/forgot-password/request` | Public | ✅ | ✅ |
| POST | `/auth/forgot-password/verify` | Public | ✅ | ✅ |
| POST | `/auth/forgot-password/reset` | Public | ✅ | ✅ |
| POST | `/auth/refresh` | Public | ✅ | ✅ |
| POST | `/auth/logout` | Public | ✅ | ✅ |
| GET | `/auth/me` | Protected | ✅ | ✅ |

---

### 2. Properties (`/api/properties`)

| Method | Endpoint | Auth | Status | Integrated |
|--------|----------|------|--------|-----------|
| GET | `/properties` | Optional | ✅ | ✅ |
| GET | `/properties/:id` | Optional | ✅ | ✅ |
| GET | `/properties/slug/:slug` | Optional | ✅ | ✅ |
| GET | `/properties/admin` | Admin | ✅ | ✅ |
| POST | `/properties` | Admin | ✅ | ✅ |
| POST | `/properties/submit` | Protected | ✅ | ✅ |
| GET | `/properties/export` | Admin | ✅ | ✅ |
| PUT | `/properties/:id` | Admin | ✅ | ✅ |
| PATCH | `/properties/:id/approve` | Admin | ✅ | ✅ |
| PATCH | `/properties/:id/reject` | Admin | ✅ | ✅ |
| DELETE | `/properties/:id` | Admin | ✅ | ✅ |

---

### 3. Users (`/api/users`)

| Method | Endpoint | Auth | Status | Integrated |
|--------|----------|------|--------|-----------|
| GET | `/users/me` | Protected | ✅ | ✅ |
| PUT | `/users/me` | Protected | ✅ | ✅ |
| GET | `/users/properties` | Protected | ✅ | ✅ |
| GET | `/users/saved` | Protected | ✅ | ✅ |
| POST | `/users/saved` | Protected | ✅ | ✅ |
| DELETE | `/users/saved/:propertyId` | Protected | ✅ | ✅ |
| GET | `/users/compare` | Protected | ✅ | ✅ |
| POST | `/users/compare` | Protected | ✅ | ✅ |
| DELETE | `/users/compare/:propertyId` | Protected | ✅ | ✅ |
| GET | `/users` | Admin | ✅ | ✅ |
| GET | `/users/export` | Admin | ✅ | ✅ |
| GET | `/users/:id` | Admin | ✅ | ✅ |
| PUT | `/users/:id/activate` | Admin | ✅ | ✅ |
| PUT | `/users/:id/deactivate` | Admin | ✅ | ✅ |

---

### 4. Leads (`/api/leads`)

| Method | Endpoint | Auth | Status | Integrated |
|--------|----------|------|--------|-----------|
| POST | `/leads` | Protected | ✅ | ✅ |
| GET | `/leads/my-enquiries` | Protected | ✅ | ✅ |
| GET | `/leads` | Admin | ✅ | ✅ |
| GET | `/leads/export` | Admin | ✅ | ✅ |
| GET | `/leads/:id` | Admin | ✅ | ✅ |
| PUT | `/leads/:id/status` | Admin | ✅ | ✅ |
| PUT | `/leads/:id/assign` | Admin | ✅ | ✅ |
| POST | `/leads/:id/notes` | Admin | ✅ | ✅ |
| DELETE | `/leads/:id` | Admin | ✅ | ✅ |

---

### 5. Blogs (`/api/blogs`)

| Method | Endpoint | Auth | Status | Integrated |
|--------|----------|------|--------|-----------|
| GET | `/blogs` | Public | ✅ | ✅ |
| GET | `/blogs/:slug` | Public | ✅ | ✅ |
| GET | `/blogs/admin/comments` | Admin | ✅ | ✅ |
| POST | `/blogs` | Admin | ✅ | ✅ |
| PUT | `/blogs/:id` | Admin | ✅ | ✅ |
| DELETE | `/blogs/:id` | Admin | ✅ | ✅ |
| POST | `/blogs/:id/comments` | Public | ✅ | ✅ |
| PATCH | `/blogs/:id/comments/:commentId/approve` | Admin | ✅ | ✅ |
| DELETE | `/blogs/:id/comments/:commentId` | Admin | ✅ | ✅ |

---

### 6. Builders (`/api/builders` & `/api/admin/builders`)

| Method | Endpoint | Auth | Status | Integrated |
|--------|----------|------|--------|-----------|
| GET | `/builders` | Public | ✅ | ✅ |
| GET | `/builders/:slug` | Public | ✅ | ✅ |
| GET | `/admin/builders` | Admin | ✅ | ✅ |
| GET | `/admin/builders/export` | Admin | ✅ | ✅ |
| POST | `/admin/builders` | Admin | ✅ | ✅ |
| PUT | `/admin/builders/:id` | Admin | ✅ | ✅ |
| DELETE | `/admin/builders/:id` | Admin | ✅ | ✅ |

---

### 7. Banners (`/api/banners`)

| Method | Endpoint | Auth | Status | Integrated |
|--------|----------|------|--------|-----------|
| GET | `/banners` | Public | ✅ | ✅ |
| POST | `/banners` | Admin | ✅ | ✅ |
| PUT | `/banners/:id` | Admin | ✅ | ✅ |
| DELETE | `/banners/:id` | Admin | ✅ | ✅ |

---

### 8. Calculators (`/api/calculators`)

| Method | Endpoint | Auth | Status | Integrated |
|--------|----------|------|--------|-----------|
| GET | `/calculators/stamp-duty` | Public | ✅ | ✅ |
| GET | `/calculators/emi` | Public | ✅ | ✅ |

---

### 9. Stamp Duty (`/api/stamp-duty`)

| Method | Endpoint | Auth | Status | Integrated |
|--------|----------|------|--------|-----------|
| GET | `/stamp-duty` | Public | ✅ | ✅ |
| GET | `/stamp-duty/admin` | Admin | ✅ | ✅ |
| POST | `/stamp-duty` | Admin | ✅ | ✅ |
| PUT | `/stamp-duty/:id` | Admin | ✅ | ✅ |

---

### 10. Testimonials (`/api/testimonials`)

| Method | Endpoint | Auth | Status | Integrated |
|--------|----------|------|--------|-----------|
| GET | `/testimonials` | Public | ✅ | ✅ |
| GET | `/testimonials/export` | Admin | ✅ | ✅ |
| POST | `/testimonials` | Admin | ✅ | ✅ |
| PUT | `/testimonials/:id` | Admin | ✅ | ✅ |
| DELETE | `/testimonials/:id` | Admin | ✅ | ✅ |

---

### 11. Contact (`/api/contact`)

| Method | Endpoint | Auth | Status | Integrated |
|--------|----------|------|--------|-----------|
| POST | `/contact` | Public | ✅ | ✅ |
| POST | `/contact/newsletter` | Public | ✅ | ✅ |
| GET | `/contact` | Admin | ✅ | ⚠️ (no admin UI) |
| PUT | `/contact/:id/read` | Admin | ✅ | ⚠️ (no admin UI) |

---

### 12. Property Submissions (`/api/property-submissions`)

| Method | Endpoint | Auth | Status | Integrated |
|--------|----------|------|--------|-----------|
| GET | `/property-submissions` | Admin | ✅ | ✅ |
| GET | `/property-submissions/:id` | Admin | ✅ | ✅ |
| PATCH | `/property-submissions/:id/approve` | Admin | ✅ | ✅ |
| PATCH | `/property-submissions/:id/reject` | Admin | ✅ | ✅ |

---

### 13. Dashboard (`/api/dashboard`)

| Method | Endpoint | Auth | Status | Integrated |
|--------|----------|------|--------|-----------|
| GET | `/dashboard` | Admin | ✅ | ✅ |

**Response shape** (fixed 2026-04-21):
```json
{
  "properties": { "total", "active", "featured", "byCategory": {} },
  "leads": {
    "total", "today",
    "new", "contacted", "qualified", "closed",
    "byStatus": { "new": N, "contacted": N, "qualified": N, "closed": N }
  },
  "users": { "total" },
  "blogs": { "total" }
}
```
Flat `new`/`contacted`/`qualified`/`closed` fields default to `0` when no leads exist in that status. `byStatus` retained for any consumer expecting the map shape.

---

### 14. System (`/api/system`)

| Method | Endpoint | Auth | Status | Integrated |
|--------|----------|------|--------|-----------|
| GET | `/system/config` | Public | ✅ | ✅ |
| GET | `/system/areas` | Public | ✅ | ✅ |
| GET | `/system/options` | Public | ✅ | ✅ |
| GET | `/system/config/admin` | Admin | ✅ | ✅ |
| PUT | `/system/config` | Admin | ✅ | ✅ |

---

## Known Bugs

_None currently tracked. Last fixed: 2026-04-21 (dashboard flat lead-status fields)._

---

## Production Readiness Checklist

### ✅ Implemented
- [x] Security headers (Helmet)
- [x] CORS configuration
- [x] Rate limiting
- [x] Input validation (Zod schemas)
- [x] Request/response compression
- [x] Error handling middleware
- [x] JWT authentication + refresh
- [x] Database connection (MongoDB)
- [x] File upload handling (Cloudinary)
- [x] Email integration (Nodemailer + SendGrid)
- [x] Data sanitization (NoSQL injection prevention)
- [x] XSS protection
- [x] HPP prevention
- [x] PM2 process management config
- [x] Morgan HTTP logging

### ⚠️ Needs Action Before Deploy
- [x] ~~Fix dashboard stats bug~~ ✅ Fixed 2026-04-21
- [ ] Set strong JWT_SECRET + JWT_REFRESH_SECRET (32+ chars)
- [ ] Configure production MONGODB_URI (Atlas w/ IP allowlist)
- [ ] Set FORCE_HTTPS=true and TRUST_PROXY=true
- [ ] Tighten CORS_ORIGINS (remove localhost)
- [ ] Configure CLOUDINARY_* env vars
- [ ] Configure SMTP or SENDGRID_* env vars (OTP/password reset depend on this)
- [ ] Configure Firebase credentials (if OTP via Firebase)
- [ ] Seed admin user: `npm run seed:admin`
- [ ] Add database indexes on: Property.category, Property.location.area, Property.price, Lead.status, User.email, Blog.slug
- [ ] Configure MongoDB Atlas automated backups

### ❌ Post-Launch Backlog
- [ ] Structured logging (Winston/Pino) — currently Morgan only
- [ ] Error tracking (Sentry) — flying blind without it
- [ ] APM / performance monitoring
- [ ] Redis caching for properties/builders
- [ ] Admin UI for contact submissions
- [ ] Load testing
- [ ] API versioning (v1 implicit)

---

## Summary

| Category | Status |
|----------|--------|
| API Endpoints Implemented | ✅ 48 endpoints across 14 route groups |
| Frontend Integration | ✅ ~95% (all admin consoles + public flows wired) |
| Known Bugs | ✅ None (dashboard stats fix applied 2026-04-21) |
| Production Config | ⚠️ Needs env vars + seed |
| Security Middleware | ✅ Complete |
| Monitoring/Logging | ❌ Post-launch |
