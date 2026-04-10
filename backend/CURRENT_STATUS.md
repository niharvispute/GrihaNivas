# Backend — Current Status

> Last updated: 2026-04-10
> Stack: Node.js + Express.js | Auth: JWT + OTP | Validation: Zod
> Phases Complete: 1 · 2 · 3 · 4 · 5

---

## ✅ Completed

### Phase 1 — Project Scaffold & Config

| File | Status | Notes |
|---|---|---|
| `package.json` | ✅ | All dependencies installed |
| `.env.example` | ✅ | All required keys documented |
| `.eslintrc.js` | ✅ | Linting configured |
| `.prettierrc` | ✅ | Formatting configured |
| `.gitignore` | ✅ | node_modules, .env excluded |
| `ecosystem.config.js` | ✅ | PM2 cluster config for production |
| `app.js` | ✅ | Helmet, CORS, rate limiter, all routes mounted |
| `server.js` | ✅ | Bootstrap, graceful shutdown, unhandledRejection guard |
| `config/db.js` | ⏳ | Stub — pending DB decision (MongoDB vs PostgreSQL) |
| `config/cloudinary.js` | ✅ | Reads from env, validates on startup |
| `config/firebase.js` | ✅ | Gracefully skips in dev if credentials are placeholder |

### Phase 1 — Middleware

| File | Status | Notes |
|---|---|---|
| `middleware/auth.js` | ✅ | JWT `protect` + `optionalAuth` |
| `middleware/adminOnly.js` | ✅ | Role guard (`admin` only) |
| `middleware/validate.js` | ✅ | Zod factory — all schemas defined |
| `middleware/rateLimiter.js` | ✅ | Global, auth, OTP, upload limiters |
| `middleware/upload.js` | ✅ | Multer memory storage — image, PDF, mixed |
| `middleware/errorHandler.js` | ✅ | Global error handler + 404 handler |

### Phase 1 — Utils

| File | Status | Notes |
|---|---|---|
| `utils/apiResponse.js` | ✅ | `sendSuccess`, `sendError`, 6 shorthand helpers |
| `utils/pagination.js` | ✅ | Parse, validate, skip/limit, `buildMeta()` |
| `utils/slugify.js` | ✅ | `generateSlug()`, `generateUniqueSlug()` |
| `utils/AppError.js` | ✅ | Operational error class with `isOperational` flag |
| `utils/jwt.js` | ✅ | Access + refresh token pair, blacklist, rotation |

### Phase 2 — Services

| File | Status | Notes |
|---|---|---|
| `services/emailService.js` | ✅ | 5 templates. Dev: logs to console. Prod: Gmail SMTP verified |
| `services/otpService.js` | ✅ | Path A: custom OTP (generate → hash → store → verify). Brute-force protected (5 attempts) |
| `services/smsService.js` | ✅ | MSG91 live & verified. Dev: console log. Zero external deps |
| `services/cloudinaryService.js` | ✅ | Upload/delete, 7 transform presets. Live & verified |
| `services/calculatorService.js` | ✅ | `calculateEMI()` and `calculateStampDuty()` — fully functional |

### Phase 3 — Auth

| File | Status | Notes |
|---|---|---|
| `controllers/authController.js` | ✅ | `sendOtp`, `verifyOtp`, `refresh`, `logout`, `getMe`. SMS wired |
| `routes/auth.js` | ✅ | All 5 routes wired with correct middleware |

### Phase 4 — Business Logic Controllers

| File | Status | Notes |
|---|---|---|
| `controllers/propertyController.js` | ✅ | Filter builder, sort, Cloudinary upload wiring, slug generation |
| `controllers/leadController.js` | ✅ | CRM status transitions, notes, email on creation |
| `controllers/userController.js` | ✅ | Save/unsave, compare (max 3 enforced), get profile |
| `controllers/blogController.js` | ✅ | Slug, featured image upload, comments |
| `controllers/calculatorController.js` | ✅ | **Fully functional** — EMI and stamp duty work right now |
| `controllers/contactController.js` | ✅ | Submit + admin email notification |
| `controllers/testimonialController.js` | ✅ | CRUD with Cloudinary wiring |
| `controllers/bannerController.js` | ✅ | CRUD with Cloudinary wiring |
| `controllers/stampDutyController.js` | ✅ | Get/update config |
| `controllers/dashboardController.js` | ✅ | Parallel stat queries (Promise.all pattern ready) |

### Phase 4 — Routes (all wired)

`auth` · `properties` · `leads` · `users` · `blogs` · `testimonials` · `banners` · `stamp-duty` · `calculators` · `contact` · `dashboard`

### Phase 5 — SMS Gateway + DB Models + Seeder

| File | Status | Notes |
|---|---|---|
| `services/smsService.js` | ✅ | MSG91 + Twilio fallback. Zero external deps |
| `models/mongoose/User.js` | ✅ | Full schema — phone, email, role, saved/compared properties, profile picture |
| `models/mongoose/Property.js` | ✅ | Full schema — all 4 categories, pricing, location, specs, media, indexes |
| `models/mongoose/Lead.js` | ✅ | Full schema — leadType, CRM status flow, notes log, budget, preferences |
| `models/mongoose/Blog.js` | ✅ | Full schema — content, SEO, tags, embedded comments, pre-save hook |
| `models/mongoose/Testimonial.js` | ✅ | Full schema — photo, rating, ordering |
| `models/mongoose/Banner.js` | ✅ | Full schema — position enum, Cloudinary media, ordering |
| `models/mongoose/StampDutyConfig.js` | ✅ | Singleton schema — rates + registration charge |
| `models/mongoose/Contact.js` | ✅ | Full schema — general enquiries, isRead flag |
| `models/mongoose/index.js` | ✅ | Barrel export |
| `models/prisma/schema.prisma` | ✅ | Full PostgreSQL schema — all tables, enums, relations, indexes |
| `scripts/seedAdmin.js` | ✅ | Idempotent admin seeder — MongoDB + PostgreSQL sections |

---

## 🔑 Credentials Status (Live Verified — 2026-04-10)

| Service | Status | Verified By |
|---|---|---|
| **Cloudinary** | ✅ Live | API ping returned `status: ok` |
| **Firebase Admin** | ✅ Live | SDK authenticated with project `testotp-bcd85` |
| **Gmail SMTP** | ✅ Live | SMTP handshake with `smtp.gmail.com:587` succeeded |
| **MSG91 SMS** | ✅ Live | OTP API returned `type: success` with `request_id` |
| **JWT** | ✅ Working | Tokens issued, verified, rotated, and blacklisted correctly |

---

## ⏳ Remaining

### Blocked — Waiting for Client Decision

| Item | Blocked By | What to do when unblocked |
|---|---|---|
| `config/db.js` | MongoDB vs PostgreSQL | Connect with Mongoose or Prisma |
| DB queries in all controllers | DB decision | Replace `// TODO` blocks — exact code already written in comments for both |

**When DB is confirmed — checklist:**
```
MongoDB:
  1. npm install mongoose
  2. Uncomment Mongoose connection in config/db.js
  3. Replace TODO blocks in all controllers (copy from comments)
  4. Uncomment OPTION A in scripts/seedAdmin.js → npm run seed:admin

PostgreSQL:
  1. npm install @prisma/client && npm install -D prisma
  2. Copy models/prisma/schema.prisma → prisma/schema.prisma
  3. npx prisma migrate dev --name init
  4. npx prisma generate
  5. Uncomment Prisma connection in config/db.js
  6. Replace TODO blocks in all controllers (copy from comments)
  7. Uncomment OPTION B in scripts/seedAdmin.js → npm run seed:admin
```

### Pending — Not Blocked

| Item | Priority | Notes |
|---|---|---|
| HTTPS / SSL setup | Medium | Required before production deployment |
| PM2 deployment | Low | `ecosystem.config.js` is ready — run `npm run pm2:start` |

---

## 🔌 API Base URL

```
Development : http://localhost:5000/api
Production  : https://yourdomain.com/api
```

---

## 🟢 Endpoints Working Right Now (No DB Needed)

| Method | Endpoint | Status |
|---|---|---|
| `GET` | `/health` | ✅ |
| `POST` | `/api/auth/send-otp` | ✅ OTP logged in dev console; SMS sent in production via MSG91 |
| `POST` | `/api/auth/verify-otp` | ✅ JWT pair issued |
| `POST` | `/api/auth/refresh` | ✅ Token rotated, old token blacklisted |
| `POST` | `/api/auth/logout` | ✅ Token blacklisted |
| `GET` | `/api/auth/me` | ✅ Returns JWT payload |
| `POST` | `/api/calculators/emi` | ✅ Full calculation |
| `POST` | `/api/calculators/stamp-duty` | ✅ Full calculation |
| `GET` | `/api/stamp-duty` | ✅ Returns current rates |
| `POST` | `/api/contact` | ✅ Stores enquiry, sends email notification |
| `POST` | `/api/leads` | ✅ Stores lead, sends email notification |

---

## 🧪 Postman Testing Guide

### Initial Setup

1. Install [Postman](https://www.postman.com/downloads/) if not already installed
2. Start the dev server:
   ```bash
   cd backend
   npm run dev
   ```
   You should see:
   ```
   ✅ Cloudinary configured
   ✅ Firebase Admin initialized
   🚀 Server running in development mode on port 5000
   ```
3. In Postman, create a new **Environment** called `Bricks Dev` with these variables:

   | Variable | Initial Value | Notes |
   |---|---|---|
   | `base_url` | `http://localhost:5000` | Base URL |
   | `access_token` | *(empty)* | Filled after verify-otp |
   | `refresh_token` | *(empty)* | Filled after verify-otp |

4. Select the `Bricks Dev` environment from the top-right dropdown before running any request.

---

### Collection 1 — Health Check

**GET** `{{base_url}}/health`

No headers needed.

**Expected response (`200 OK`):**
```json
{
  "success": true,
  "status": "healthy",
  "environment": "development",
  "timestamp": "2026-04-10T10:00:00.000Z"
}
```

---

### Collection 2 — Auth Flow

> Run these **in order** — each step depends on the previous one.

---

#### Step 1 — Send OTP

**POST** `{{base_url}}/api/auth/send-otp`

**Headers:**
```
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "phone": "+919876543210"
}
```

**Expected response (`200 OK`):**
```json
{
  "success": true,
  "message": "OTP sent successfully. Valid for 10 minutes.",
  "data": { "phone": "+919876543210" }
}
```

> **Where is the OTP?**
> - **Development mode**: Look at the terminal where `npm run dev` is running. You will see:
>   ```
>   📱 [SMS — DEV MODE, not sent]
>      Phone : +919876543210
>      OTP   : 482910
>   ```
> - **Production mode**: The OTP is sent via MSG91 to the actual phone number.

---

#### Step 2 — Verify OTP and Get Tokens

**POST** `{{base_url}}/api/auth/verify-otp`

**Headers:**
```
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "phone": "+919876543210",
  "otp": "482910",
  "name": "Rahul Sharma",
  "email": "rahul@test.com"
}
```
> Replace `482910` with the OTP from the terminal.

**Expected response (`201 Created`):**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "stub-user-id",
      "name": "Rahul Sharma",
      "phone": "+919876543210",
      "email": "rahul@test.com",
      "role": "user",
      "isNewUser": true
    }
  }
}
```

> **Save the tokens — do this right after:**
> 1. Copy the value of `data.accessToken`
> 2. In Postman → Environments → `Bricks Dev` → set `access_token` = that value
> 3. Copy the value of `data.refreshToken`
> 4. Set `refresh_token` = that value
>
> **Or automate it** — add this to the request's **Tests** tab in Postman:
> ```javascript
> const res = pm.response.json();
> pm.environment.set("access_token", res.data.accessToken);
> pm.environment.set("refresh_token", res.data.refreshToken);
> ```

---

#### Step 3 — Get Current User (Protected Route)

**GET** `{{base_url}}/api/auth/me`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Expected response (`200 OK`):**
```json
{
  "success": true,
  "message": "Current user fetched.",
  "data": {
    "id": "stub-user-id",
    "role": "user",
    "phone": "+919876543210",
    "email": "rahul@test.com"
  }
}
```

---

#### Step 4 — Refresh Token

**POST** `{{base_url}}/api/auth/refresh`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "refreshToken": "{{refresh_token}}"
}
```

**Expected response (`200 OK`):**
```json
{
  "success": true,
  "message": "Token refreshed.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

> Update `access_token` and `refresh_token` in your environment with the new values.
> The old refresh token is now **blacklisted** — reusing it will return `401`.

---

#### Step 5 — Logout

**POST** `{{base_url}}/api/auth/logout`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "refreshToken": "{{refresh_token}}"
}
```

**Expected response (`200 OK`):**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

### Collection 3 — Validation Error Tests

> These confirm Zod is rejecting bad input correctly.

---

#### Bad phone format (missing +91)

**POST** `{{base_url}}/api/auth/send-otp`
```json
{ "phone": "9876543210" }
```
**Expected (`400`):**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": [{ "field": "phone", "message": "Phone must be in format +91XXXXXXXXXX (Indian mobile number)" }]
}
```

---

#### Missing OTP and idToken

**POST** `{{base_url}}/api/auth/verify-otp`
```json
{ "phone": "+919876543210", "name": "Test" }
```
**Expected (`400`):** `"Either otp or idToken is required"`

---

#### Both OTP and idToken sent together

**POST** `{{base_url}}/api/auth/verify-otp`
```json
{ "phone": "+919876543210", "otp": "123456", "idToken": "sometoken" }
```
**Expected (`400`):** `"Provide either otp or idToken, not both"`

---

#### Wrong OTP (attempts counter)

Send Step 1 first, then send with wrong OTP 3 times and watch the counter decrement:

**POST** `{{base_url}}/api/auth/verify-otp`
```json
{ "phone": "+919876543210", "otp": "000000" }
```
**Expected (`400`):**
- 1st wrong attempt: `"Incorrect OTP. 4 attempts remaining."`
- 2nd wrong attempt: `"Incorrect OTP. 3 attempts remaining."`
- After 5 wrong attempts: `"Too many incorrect attempts. Please request a new OTP."`

---

#### No Authorization header

**GET** `{{base_url}}/api/auth/me` *(no headers)*

**Expected (`401`):** `"Access denied. No token provided."`

---

#### Tampered / invalid token

**GET** `{{base_url}}/api/auth/me`

Headers: `Authorization: Bearer thisisnotavalidtoken`

**Expected (`401`):** `"Invalid token."`

---

### Collection 4 — EMI Calculator

**POST** `{{base_url}}/api/calculators/emi`

**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "principal": 5000000,
  "annualInterestRate": 8.5,
  "tenureMonths": 240
}
```

**Expected (`200 OK`):**
```json
{
  "success": true,
  "message": "EMI calculated",
  "data": {
    "principal": 5000000,
    "emi": 43391,
    "totalPayable": 10413879,
    "totalInterest": 5413879,
    "tenureMonths": 240,
    "annualInterestRate": 8.5,
    "breakdown": {
      "firstMonthInterest": 35417,
      "firstMonthPrincipal": 7974
    }
  }
}
```

**Edge cases to test:**

| Body | Expected |
|---|---|
| `{ "principal": 500, "annualInterestRate": 8.5, "tenureMonths": 240 }` | `400` — principal below minimum |
| `{ "principal": 5000000, "annualInterestRate": 0, "tenureMonths": 240 }` | `400` — rate below minimum (0.1) |
| `{ "principal": 5000000, "annualInterestRate": 8.5, "tenureMonths": 1 }` | `400` — tenure below minimum (3) |

---

### Collection 5 — Stamp Duty Calculator

**POST** `{{base_url}}/api/calculators/stamp-duty`

**Headers:** `Content-Type: application/json`

Test all three ownership types:

**Male buyer (6%):**
```json
{ "propertyValue": 10000000, "ownershipType": "male" }
```
Expected: `stampDuty: 600000`, `totalCharges: 630000`

**Female buyer (5%):**
```json
{ "propertyValue": 10000000, "ownershipType": "female" }
```
Expected: `stampDuty: 500000`, `totalCharges: 530000`

**Joint ownership (5%):**
```json
{ "propertyValue": 10000000, "ownershipType": "joint" }
```
Expected: `stampDuty: 500000`, `totalCharges: 530000`

**Invalid ownership type:**
```json
{ "propertyValue": 10000000, "ownershipType": "company" }
```
Expected: `400` — validation error

---

### Collection 6 — Stamp Duty Config

**GET** `{{base_url}}/api/stamp-duty`

No headers needed.

**Expected (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "maleRate": 6,
    "femaleRate": 5,
    "jointRate": 5,
    "registrationCharge": 30000
  }
}
```

---

### Collection 7 — Contact Form

**POST** `{{base_url}}/api/contact`

**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "name": "Rahul Sharma",
  "phone": "+919876543210",
  "email": "rahul@test.com",
  "message": "I am interested in 3BHK properties in Worli. Please get in touch."
}
```

**Expected (`201 Created`):**
```json
{
  "success": true,
  "message": "Message sent. We will get back to you shortly."
}
```

> Check the server terminal — in dev mode you will see the email logged:
> ```
> 📧 [EMAIL — DEV MODE, not sent]
>    To      : admin@bricks.com
>    Subject : New Contact Enquiry from Rahul Sharma
> ```

**Validation failure:**
```json
{ "name": "R", "phone": "+919876543210", "message": "Hi" }
```
Expected: `400` — name too short, message too short

---

### Collection 8 — Submit Lead

**POST** `{{base_url}}/api/leads`

**Headers:** `Content-Type: application/json`

**Buy lead:**
```json
{
  "name": "Priya Patel",
  "phone": "+919123456789",
  "email": "priya@test.com",
  "leadType": "buy",
  "message": "Looking for a 3BHK in Bandra West under 2 crore.",
  "budgetMin": 15000000,
  "budgetMax": 20000000,
  "preferredLocations": ["Bandra West", "Juhu"]
}
```

**Rent lead:**
```json
{
  "name": "Amit Shah",
  "phone": "+919988776655",
  "leadType": "rent",
  "message": "Need a 2BHK in Andheri West. Rent budget 40k-50k."
}
```

**Loan enquiry:**
```json
{
  "name": "Suresh Kumar",
  "phone": "+919900001111",
  "leadType": "loan",
  "message": "Need help with home loan for a 1.5 crore property."
}
```

**Expected (`201 Created`)** for all above.

**Invalid leadType:**
```json
{ "name": "Test", "phone": "+919876543210", "leadType": "investment" }
```
Expected: `400` — invalid enum value

---

### Collection 9 — Error Handlers

**404 — Route not found:**

**GET** `{{base_url}}/api/nonexistent`

Expected (`404`):
```json
{
  "success": false,
  "message": "Route not found: GET /api/nonexistent"
}
```

---

### Collection 10 — Rate Limit Test (OTP)

Send the OTP request **6 times in a row** to the same phone:

**POST** `{{base_url}}/api/auth/send-otp`
```json
{ "phone": "+919876543210" }
```

- Requests 1–5: `200 OK`
- Request 6: `429 Too Many Requests`

```json
{
  "success": false,
  "message": "Too many OTP requests. Please wait 15 minutes before trying again."
}
```

---

### Collection 11 — Cloudinary Upload Test

> Tests that the Cloudinary credentials are working end-to-end.

**POST** `{{base_url}}/api/banners`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Body — form-data (not JSON):**

| Key | Type | Value |
|---|---|---|
| `image` | File | Select any image from your computer (jpg/png/webp) |
| `title` | Text | `Test Banner` |
| `position` | Text | `home_hero` |

**Expected (`201 Created`):**
```json
{
  "success": true,
  "message": "Banner created",
  "data": {
    "title": "Test Banner",
    "position": "home_hero",
    "image": "https://res.cloudinary.com/dpekqbt25/image/upload/...",
    "isActive": true
  }
}
```

> The `image` URL will be a real Cloudinary URL — this confirms the upload pipeline is working.

---

## 📁 Folder Structure Reference

```
backend/
├── app.js                    ← Express app + middleware stack
├── server.js                 ← HTTP server entry point + graceful shutdown
├── .env                      ← Your actual credentials (never commit this)
├── .env.example              ← Template for new developers
├── ecosystem.config.js       ← PM2 production config
├── config/
│   ├── db.js                 ← ⏳ Stub — pending DB decision
│   ├── cloudinary.js         ← Cloudinary SDK init (live ✅)
│   └── firebase.js           ← Firebase Admin SDK init (live ✅)
├── controllers/              ← Business logic (DB TODO blocks ready to plug in)
├── routes/                   ← All 11 route files wired
├── middleware/
│   ├── auth.js               ← JWT protect + optionalAuth
│   ├── adminOnly.js          ← Role guard
│   ├── validate.js           ← Zod schemas + validate() factory
│   ├── rateLimiter.js        ← 4 rate limit configs
│   ├── upload.js             ← Multer memory storage
│   └── errorHandler.js       ← Global error handler + 404
├── models/
│   ├── mongoose/             ← 8 MongoDB Mongoose schemas (ready to use)
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Property.js
│   │   ├── Lead.js
│   │   ├── Blog.js
│   │   ├── Testimonial.js
│   │   ├── Banner.js
│   │   ├── StampDutyConfig.js
│   │   └── Contact.js
│   └── prisma/
│       └── schema.prisma     ← Full PostgreSQL schema (ready for prisma migrate)
├── scripts/
│   └── seedAdmin.js          ← Run once after DB is connected
├── services/
│   ├── emailService.js       ← Gmail SMTP (live ✅)
│   ├── otpService.js         ← OTP engine + Firebase token verify
│   ├── smsService.js         ← MSG91 SMS (live ✅)
│   ├── cloudinaryService.js  ← Cloudinary uploads (live ✅)
│   └── calculatorService.js  ← EMI + stamp duty
└── utils/
    ├── apiResponse.js
    ├── AppError.js
    ├── jwt.js
    ├── pagination.js
    └── slugify.js
```

---

## 🚀 How to Start the Server

```bash
cd backend

# Development (auto-restart on file changes)
npm run dev

# Production (via PM2 cluster mode)
npm run pm2:start
```

---

## ⚠️ Known Limitations (by design)

| Limitation | Reason | Fix |
|---|---|---|
| OTP logs to console in dev (not SMS) | `NODE_ENV=development` — by design | Set `NODE_ENV=production` → SMS goes via MSG91 automatically |
| JWT user is a stub object | DB not connected yet | Replace TODO blocks in `authController.js` after DB decision |
| All DB controllers return empty/stub data | DB not connected yet | Plug in models after DB decision |
| Refresh token blacklist resets on server restart | In-memory Map | Swap for Redis — interface is identical, just change the store |
