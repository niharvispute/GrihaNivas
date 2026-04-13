# Backend — Current Status

> Last updated: 2026-04-12
> Stack: Node.js + Express.js | Auth: credential + email OTP verify/reset + JWT | Validation: Zod | DB: MongoDB Atlas (Mongoose) | Token Blacklist: Redis-ready
> Phases Complete: 1 · 2 · 3 · 4 · 5 · 6 (MongoDB Integration) · 7 (Audit & Bug Fixes)

---

## ✅ Completed

### Patch Update — 2026-04-11 (Post Audit)

| Item | Status | Notes |
|---|---|---|
| `savedCount` added to Property model | ✅ | Save/unsave now correctly increments/decrements |
| Blog `extractPublicId` fix | ✅ | Was passing object instead of URL string — old images now cleaned from Cloudinary |
| Unapproved comments filtered in `getBySlug` | ✅ | Public blog response no longer returns `isApproved: false` comments |
| `monthlyIncome` added to Lead model | ✅ | Was in Zod schema but missing from Mongoose — silently stripped before fix |
| All 97/97 API tests passing post-fix | ✅ | `node scripts/test-apis.js` |

### Patch Update — 2026-04-11 (Post Phase 6)

| Item | Status | Notes |
|---|---|---|
| Admin user management routes | ✅ | Added list users, get user, deactivate, reactivate |
| User profile upload route wiring | ✅ | `PUT /api/users/me` now mounts upload middleware |
| Property update upload route wiring | ✅ | `PUT /api/properties/:id` now mounts multipart upload middleware |
| Banner update upload route wiring | ✅ | `PUT /api/banners/:id` now mounts image upload middleware |
| Auth middleware active-user enforcement | ✅ | `protect` now verifies user exists + `isActive` in DB |
| Blog controller/schema alignment | ✅ | Fixed author mapping, featuredImage shape, category normalization, comments mapping |
| Integration API suite | ✅ | `scripts/test-apis.js` covers auth, admin flows, and health readiness checks; latest run: **97/97 passed** |
| HTTPS/proxy runtime hardening | ✅ | Added `TRUST_PROXY` + optional `FORCE_HTTPS` redirect middleware |
| PM2 production profile hardening | ✅ | Added `env_production`, restart controls, and Redis/HTTPS runtime flags |
| Deployment runbook | ✅ | Added `DEPLOYMENT.md` with PM2 + Nginx + SSL + Redis steps |
| Production preflight checks | ✅ | Added `scripts/preflight-prod.js` + `npm run preflight:prod` for env/connectivity checks |
| Readiness endpoint | ✅ | Added `GET /health/ready` with Mongo + Redis blacklist dependency checks |
| Mongoose v9 update-option cleanup | ✅ | Replaced deprecated `new: true` with `returnDocument: 'after'` in update paths |
| Redis-ready JWT blacklist store | ✅ | Redis-backed blacklist with in-memory fallback (`JWT_BLACKLIST_STORE`) |
| Graceful shutdown connection cleanup | ✅ | Server now closes HTTP, Redis, and MongoDB connections |
| ESLint v9 migration | ✅ | Added `eslint.config.js`; `npm run lint` now executes successfully |

### Validation Snapshot — 2026-04-11

| Check | Status | Notes |
|---|---|---|
| `GET /health/ready` | ✅ Pass | Returns `200 ready` with Mongo connected and Redis mode details |
| `npm run preflight:prod` | ✅ Pass | Production env + Mongo/Redis readiness checks added |
| `npm run lint` | ✅ Pass | ESLint v9 flat config active |
| `node scripts/test-apis.js` | ✅ Pass | End-to-end API suite: **97/97 passed** |

### Production Runtime Flags

| Variable | Purpose | Typical Production Value |
|---|---|---|
| `TRUST_PROXY` | Trust reverse proxy headers (`x-forwarded-*`) | `true` |
| `FORCE_HTTPS` | Redirect plain HTTP requests to HTTPS | `true` |
| `JWT_BLACKLIST_STORE` | Refresh token blacklist backend | `redis` |
| `REDIS_URL` | Redis connection URL | `redis://<host>:6379` |

---

## 🧪 How to Test APIs with Postman

### Step 1 — Start the Server

```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

### Step 2 — Set Up a Postman Environment

Create a new environment in Postman with these variables:

| Variable | Initial Value |
|---|---|
| `BASE_URL` | `http://localhost:5000` |
| `accessToken` | *(leave blank — filled by login script)* |
| `refreshToken` | *(leave blank — filled by login script)* |

### Step 3 — Login as Admin (get tokens)

#### 3a. Login with credentials
```
POST {{BASE_URL}}/api/auth/login
Body (JSON):
{
  "identifier": "bricks.dev@gmail.com",
  "password": "Admin@123"
}
```

#### 3b. If password is unknown, reset via email OTP
```
POST {{BASE_URL}}/api/auth/forgot-password/request
Body (JSON):
{
  "identifier": "bricks.dev@gmail.com"
}
```
Then verify OTP and reset:
```
POST {{BASE_URL}}/api/auth/forgot-password/verify
Body: { "otp": "<OTP from email>" }

POST {{BASE_URL}}/api/auth/forgot-password/reset
Body: { "newPassword": "Admin@123" }
```

In the **Tests** tab of this request, paste this to auto-save tokens:
```js
const data = pm.response.json().data;
pm.environment.set("accessToken", data.accessToken);
pm.environment.set("refreshToken", data.refreshToken);
```

### Step 4 — Add Auth Header to Protected Requests

For all protected routes, set:
```
Authorization: Bearer {{accessToken}}
```

### Step 5 — Test Key Flows

#### Health Checks (no auth needed)
```
GET {{BASE_URL}}/health
GET {{BASE_URL}}/health/ready
```

#### Properties (public read, admin write)
```
# List properties
GET {{BASE_URL}}/api/properties
GET {{BASE_URL}}/api/properties?category=buy&bhk=2&minPrice=5000000
GET {{BASE_URL}}/api/properties?sortBy=price_asc

# Create property (admin + multipart/form-data)
POST {{BASE_URL}}/api/properties
  + Auth header
  + Body: form-data with fields:
    title, description, category (buy/rent/commercial/new_launch),
    price (number), location[area], bhk (number), areaSqft (number),
    furnishing (unfurnished/semi_furnished/furnished)
  + Files: heroImage, images[] (gallery), floorPlans[], brochure
```

#### Leads (auth create, admin manage)
```
# Submit a lead (requires login)
POST {{BASE_URL}}/api/leads
  + Auth header
Body (JSON):
{
  "name": "Rahul Sharma",
  "phone": "+919876543210",
  "leadType": "buy",
  "message": "Looking for 2BHK in Andheri"
}

# Fetch my enquiries
GET {{BASE_URL}}/api/leads/my-enquiries
  + Auth header

# List leads (admin)
GET {{BASE_URL}}/api/leads
  + Auth header

# Update lead status (admin) — only forward: new → contacted → qualified → closed
PUT {{BASE_URL}}/api/leads/:id/status
  + Auth header
Body: { "status": "contacted" }

# Assign lead to admin
PUT {{BASE_URL}}/api/leads/:id/assign
  + Auth header
Body: { "adminId": "<admin user _id>" }

# Add CRM note
POST {{BASE_URL}}/api/leads/:id/notes
  + Auth header
Body: { "text": "Called client, follow up Thursday." }
```

#### Blogs (public read, admin write)
```
# List blogs
GET {{BASE_URL}}/api/blogs
GET {{BASE_URL}}/api/blogs?category=market_trends

# Get blog by slug
GET {{BASE_URL}}/api/blogs/:slug

# Create blog (admin)
POST {{BASE_URL}}/api/blogs
  + Auth header
  + Body: multipart/form-data
    title, content (min 100 chars), category (market_trends/buying_guide/legal/investment/lifestyle)
  + File: featuredImage (optional)

# Add comment (public)
POST {{BASE_URL}}/api/blogs/:id/comments
Body: { "name": "Jane Doe", "comment": "Great article!" }
```

#### Users — My Profile
```
# Get my profile
GET {{BASE_URL}}/api/users/me
  + Auth header

# Update my profile
PUT {{BASE_URL}}/api/users/me
  + Auth header
Body (JSON or multipart if uploading avatar):
{
  "name": "Vishal Jangid",
  "email": "v@example.com"
}

# Save a property
POST {{BASE_URL}}/api/users/saved
  + Auth header
Body: { "propertyId": "<24-char ObjectId>" }

# Compare properties (max 3)
POST {{BASE_URL}}/api/users/compare
  + Auth header
Body: { "propertyId": "<24-char ObjectId>" }
```

#### Admin — User Management
```
GET {{BASE_URL}}/api/users             (+ Auth) — list all users
GET {{BASE_URL}}/api/users/:id         (+ Auth) — get user detail
PUT {{BASE_URL}}/api/users/:id/deactivate  (+ Auth) — deactivate user
PUT {{BASE_URL}}/api/users/:id/activate    (+ Auth) — reactivate user
```

#### Calculators (no auth)
```
POST {{BASE_URL}}/api/calculators/emi
Body: { "principal": 5000000, "annualInterestRate": 8.5, "tenureMonths": 240 }

POST {{BASE_URL}}/api/calculators/stamp-duty
Body: { "propertyValue": 10000000, "ownershipType": "male" }
```

#### Stamp Duty Config
```
GET {{BASE_URL}}/api/stamp-duty        — get current rates
PUT {{BASE_URL}}/api/stamp-duty        (+ Auth, admin) — update rates
Body: { "maleRate": 6, "femaleRate": 5, "jointRate": 5, "registrationCharge": 30000 }
```

#### Banners & Testimonials
```
GET {{BASE_URL}}/api/banners
GET {{BASE_URL}}/api/banners?position=home_hero

POST {{BASE_URL}}/api/banners          (+ Auth, multipart)
  Fields: title, link (url), position, order (number), isActive (boolean)
  File: image (required)

GET {{BASE_URL}}/api/testimonials

POST {{BASE_URL}}/api/testimonials     (+ Auth, multipart)
  Fields: name, rating (1-5), message
  File: image (optional)
```

#### Dashboard (admin)
```
GET {{BASE_URL}}/api/dashboard
  + Auth header
```

#### Contact
```
POST {{BASE_URL}}/api/contact
Body: { "name": "Test User", "phone": "+919876543210", "message": "I want to inquire about a property." }

GET {{BASE_URL}}/api/contact           (+ Auth, admin)
PUT {{BASE_URL}}/api/contact/:id/read  (+ Auth, admin)
```

#### Token Refresh & Logout
```
# Refresh access token
POST {{BASE_URL}}/api/auth/refresh
Body: { "refreshToken": "{{refreshToken}}" }

# Logout (blacklists refresh token)
POST {{BASE_URL}}/api/auth/logout
Body: { "refreshToken": "{{refreshToken}}" }
```

### Common Validation Rules

| Rule | Detail |
|---|---|
| Phone format | Must be `+91XXXXXXXXXX` (Indian mobile, 10 digits after +91) |
| ObjectId | Must be a 24-character hex string |
| Property `bhk` | Number 1–10 (not a string like "2BHK") |
| Property `price` | Number (not a string) |
| Property `furnishing` | `unfurnished` / `semi_furnished` / `furnished` (exact) |
| Property `category` | `buy` / `rent` / `commercial` / `new_launch` (exact) |
| Blog `category` | `market_trends` / `buying_guide` / `legal` / `investment` / `lifestyle` |
| Blog `content` | Minimum 100 characters |
| Compare list | Max 3 properties — adding a 4th returns 400 |

---

## 🟢 All Endpoints — Live with Real Database

### Auth
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/auth/signup/request` | Public | Creates/updates pending account and emails OTP |
| `POST` | `/api/auth/signup/verify-email` | Public | OTP-only payload, flow context via secure cookie |
| `POST` | `/api/auth/signup/resend-otp` | Public | Resend OTP with cooldown |
| `POST` | `/api/auth/login` | Public | Email or phone + password |
| `POST` | `/api/auth/forgot-password/request` | Public | Accepts email/phone, sends OTP to registered email |
| `POST` | `/api/auth/forgot-password/verify` | Public | OTP-only payload, issues reset cookie |
| `POST` | `/api/auth/forgot-password/reset` | Public | Resets password and bumps token version |
| `POST` | `/api/auth/refresh` | Public | Validates user still active in DB |
| `POST` | `/api/auth/logout` | Public | Blacklists token |
| `GET` | `/api/auth/me` | JWT | Returns full user from DB |

### Properties
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/properties` | Public | Filter: category, bhk, area, minPrice, maxPrice, furnishing, isFeatured |
| `GET` | `/api/properties/slug/:slug` | Public | SEO-friendly lookup |
| `GET` | `/api/properties/:id` | Public | Increments views count |
| `POST` | `/api/properties` | Admin | Cloudinary upload + slug generation |
| `PUT` | `/api/properties/:id` | Admin | |
| `DELETE` | `/api/properties/:id` | Admin | Cloudinary cleanup |

### Leads (CRM)
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/leads` | JWT | Creates lead for authenticated user, stores `userId`, fires emails |
| `GET` | `/api/leads/my-enquiries` | JWT | Returns current user's enquiries |
| `GET` | `/api/leads` | Admin | Filter: status, leadType, search |
| `GET` | `/api/leads/:id` | Admin | Populates assignedTo + propertyId |
| `PUT` | `/api/leads/:id/status` | Admin | No backward transitions |
| `PUT` | `/api/leads/:id/assign` | Admin | Assign to admin user |
| `POST` | `/api/leads/:id/notes` | Admin | Push note to embedded array |

### Users
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/users/me` | JWT | Full profile with populated properties |
| `PUT` | `/api/users/me` | JWT | Profile update + avatar upload |
| `GET` | `/api/users/saved` | JWT | |
| `POST` | `/api/users/saved` | JWT | $addToSet idempotent |
| `DELETE` | `/api/users/saved/:id` | JWT | |
| `GET` | `/api/users/compare` | JWT | |
| `POST` | `/api/users/compare` | JWT | Max 3 enforced |
| `DELETE` | `/api/users/compare/:id` | JWT | |
| `GET` | `/api/users` | Admin | User list with pagination + search + filters |
| `GET` | `/api/users/:id` | Admin | User detail with saved/compare population |
| `PUT` | `/api/users/:id/deactivate` | Admin | Deactivate user (self-deactivate blocked) |
| `PUT` | `/api/users/:id/activate` | Admin | Reactivate user |

### Blogs
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/blogs` | Public | Excludes content field |
| `GET` | `/api/blogs/:slug` | Public | Full content; unapproved comments filtered out |
| `POST` | `/api/blogs` | Admin | Featured image upload |
| `PUT` | `/api/blogs/:id` | Admin | Old image deleted from Cloudinary |
| `DELETE` | `/api/blogs/:id` | Admin | Cloudinary cleanup |
| `POST` | `/api/blogs/:id/comments` | Public | Embedded comment push (requires approval to show) |

### Other
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/testimonials` | Public | Active only, sorted by order |
| `POST` | `/api/testimonials` | Admin | |
| `PUT` | `/api/testimonials/:id` | Admin | |
| `DELETE` | `/api/testimonials/:id` | Admin | Cloudinary cleanup |
| `GET` | `/api/banners` | Public | Filter by `?position=home_hero` |
| `POST` | `/api/banners` | Admin | |
| `PUT` | `/api/banners/:id` | Admin | |
| `DELETE` | `/api/banners/:id` | Admin | |
| `GET` | `/api/stamp-duty` | Public | |
| `PUT` | `/api/stamp-duty` | Admin | Upsert singleton |
| `POST` | `/api/calculators/emi` | Public | |
| `POST` | `/api/calculators/stamp-duty` | Public | |
| `POST` | `/api/contact` | Public | |
| `GET` | `/api/contact` | Admin | |
| `PUT` | `/api/contact/:id/read` | Admin | |
| `GET` | `/api/dashboard` | Admin | 9 parallel stat queries |
| `GET` | `/health` | Public | Liveness check |
| `GET` | `/health/ready` | Public | Returns 200 only when Mongo + Redis are ready |

---

## 🧑‍💼 Admin Account

| Field | Value |
|---|---|
| Phone | `+919876543210` (from `ADMIN_PHONE` in .env) |
| Email | `bricks.dev@gmail.com` (from `ADMIN_EMAIL` in .env) |
| Role | `admin` |
| MongoDB ID | `69d9cd0fcef209e1a584ceba` |

> Login: `POST /api/auth/login` using admin email or phone and password.
> If needed, run `npm run seed:admin` to provision password hash and verified state.

---

## 🚀 How to Start

```bash
cd backend
npm run dev        # Development (nodemon auto-restart)
npm run test:auth:v2 # Credential auth + OTP flow smoke test
npm run start      # Production (plain node)
npm run pm2:start  # Production (PM2 cluster mode)
```

---

## ⏳ Remaining

### Infrastructure (not code work)

| Item | Priority | Notes |
|---|---|---|
| SSL cert issuance | Medium | `certbot --nginx -d yourdomain.com` or managed cert via cloud provider |
| PM2 production rollout | Low | `pm2 start ecosystem.config.js --env production` |
| Redis env rollout | Low | Set `JWT_BLACKLIST_STORE=redis` and `REDIS_URL` in production `.env` |

### Optional Feature Gaps (post-launch)

| Item | Priority | Notes |
|---|---|---|
| Blog comment moderation endpoint | Low | Admin `PUT /api/blogs/:blogId/comments/:commentId/approve` — currently no way to approve comments via API |
| Lead `monthlyIncome` in search filter | Low | Field exists in model + Zod but `list` filter doesn't expose it as a query param |
| Property `savedCount` display | Low | Field now exists and increments — frontend can display it on listings |
| Pagination on `GET /api/contact` | Low | Currently returns all contact submissions without pagination |

---

## 📁 Folder Structure

```
backend/
├── eslint.config.js          ← ESLint v9 flat config
├── DEPLOYMENT.md             ← Production deployment guide (Nginx, SSL, PM2, Redis)
├── CURRENT_STATUS.md         ← This file
├── app.js
├── server.js
├── .env                      ← Live credentials (never commit)
├── config/
│   ├── db.js                 ← Mongoose connection
│   ├── redis.js              ← JWT blacklist store (Redis + fallback)
│   ├── cloudinary.js
│   └── firebase.js
├── controllers/              ← All wired to MongoDB (10 controllers)
├── routes/                   ← 11 route files
├── middleware/
│   ├── auth.js               ← protect + optionalAuth (DB lookup on every request)
│   ├── adminOnly.js          ← role guard
│   ├── validate.js           ← Zod factory + all schemas
│   ├── rateLimiter.js        ← global / auth / OTP / upload limiters
│   ├── upload.js             ← Multer memory storage
│   └── errorHandler.js       ← Mongoose error handling (CastError, ValidationError, E11000)
├── models/
│   └── mongoose/             ← 8 models
│       ├── User.js
│       ├── Property.js       ← includes savedCount field
│       ├── Lead.js           ← includes monthlyIncome field
│       ├── Blog.js
│       ├── Testimonial.js
│       ├── Banner.js
│       ├── StampDutyConfig.js
│       └── Contact.js
├── scripts/
│   ├── seedAdmin.js          ← Admin seeded
│   ├── test-apis.js          ← 97/97 end-to-end tests
│   └── preflight-prod.js     ← Production readiness checker
├── services/
│   ├── cloudinaryService.js  ← upload/delete, 7 presets, extractPublicId
│   ├── emailService.js       ← Gmail SMTP
│   ├── otpService.js         ← Custom OTP engine
│   ├── smsService.js         ← MSG91
│   └── calculatorService.js  ← EMI + stamp duty
└── utils/
    ├── jwt.js                ← generateTokenPair, blacklistToken, isBlacklisted
    ├── apiResponse.js        ← sendSuccess, sendCreated, sendNoContent, etc.
    ├── AppError.js
    ├── pagination.js
    └── slugify.js
```

---

## 🔑 Credentials Status (Live Verified)

| Service | Status | Notes |
|---|---|---|
| **MongoDB Atlas** | ✅ Live | Cluster: `ac-py8hgoz-shard-00-00.ls9l6er.mongodb.net` |
| **Cloudinary** | ✅ Live | Cloud: `dpekqbt25` |
| **Firebase Admin** | ✅ Live | Project: `testotp-bcd85` |
| **Gmail SMTP** | ✅ Live | `smtp.gmail.com:587` |
| **MSG91 SMS** | ✅ Live | OTP API verified |
| **JWT** | ✅ Working | Tokens issued, verified, rotated, blacklisted |
| **Redis Blacklist Layer** | ✅ Code Ready | Redis-backed blacklist with in-memory fallback active |
