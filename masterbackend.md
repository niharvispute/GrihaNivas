# Mumbai Editorial — Master Backend Specification

> Single source of truth for all database schemas, API contracts, and backend logic.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [Database Schemas](#3-database-schemas)
4. [API Contracts](#4-api-contracts)
5. [Backend Logic & Functions](#5-backend-logic--functions)
6. [Authentication Flow](#6-authentication-flow)
7. [Middleware](#7-middleware)
8. [Email System](#8-email-system)
9. [File Storage](#9-file-storage)
10. [Enumerations & Constants](#10-enumerations--constants)
11. [Security Rules](#11-security-rules)
12. [Development Order](#12-development-order)

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + OTP (Firebase) |
| File Storage | Cloudinary |
| Email | Nodemailer / SendGrid |
| Process Manager | PM2 |
| Hosting | Hostinger VPS |

---

## 2. Project Structure

```
backend/
├── controllers/
│   ├── authController.js
│   ├── propertyController.js
│   ├── leadController.js
│   ├── userController.js
│   ├── blogController.js
│   ├── testimonialController.js
│   ├── bannerController.js
│   ├── stampDutyController.js
│   ├── calculatorController.js
│   ├── contactController.js
│   └── dashboardController.js
├── models/
│   ├── User.js
│   ├── Property.js
│   ├── Lead.js
│   ├── Blog.js
│   ├── Testimonial.js
│   ├── Banner.js
│   ├── StampDutyConfig.js
│   ├── Newsletter.js
│   └── Enquiry.js
├── routes/
│   ├── auth.js
│   ├── properties.js
│   ├── leads.js
│   ├── users.js
│   ├── blogs.js
│   ├── testimonials.js
│   ├── banners.js
│   ├── stampDuty.js
│   ├── calculators.js
│   ├── contact.js
│   └── dashboard.js
├── middleware/
│   ├── auth.js          // JWT verification
│   ├── adminOnly.js     // Admin role guard
│   ├── rateLimiter.js
│   ├── validate.js      // Joi/Zod input validation
│   └── upload.js        // Multer + Cloudinary
├── services/
│   ├── emailService.js
│   ├── otpService.js
│   ├── cloudinaryService.js
│   └── calculatorService.js
├── utils/
│   ├── apiResponse.js   // Standardized response helpers
│   ├── pagination.js
│   └── slugify.js
├── config/
│   ├── db.js
│   ├── cloudinary.js
│   └── firebase.js
├── app.js
└── server.js
```

---

## 3. Database Schemas

### 3.1 User

```js
// models/User.js
{
  name:                { type: String, required: true, trim: true },
  email:               { type: String, required: true, unique: true, lowercase: true },
  phone:               { type: String, required: true, unique: true },  // +91XXXXXXXXXX
  passwordHash:        { type: String },                                 // null for OTP-only users
  profilePicture:      { type: String },                                 // Cloudinary URL
  role:                { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified:          { type: Boolean, default: false },
  isActive:            { type: Boolean, default: true },

  // Admin-only fields
  adminTitle:          { type: String },                                 // "Head of Sales", "Super Admin"
  department:          { type: String },

  // User features
  savedProperties:     [{ type: ObjectId, ref: 'Property' }],
  comparedProperties:  [{ type: ObjectId, ref: 'Property' }],           // max 3

  // Preferences
  preferredLocations:  [String],
  notificationPrefs: {
    email:             { type: Boolean, default: true },
    sms:               { type: Boolean, default: false },
  },

  lastLogin:           { type: Date },
  createdAt:           { type: Date, default: Date.now },
}
```

---

### 3.2 Property

```js
// models/Property.js
{
  title:               { type: String, required: true, trim: true },
  description:         { type: String, required: true },
  slug:                { type: String, unique: true },                   // auto-generated

  // Categorization
  category:            { type: String, enum: ['buy', 'rent', 'commercial', 'new_launch'], required: true },
  propertyType:        { type: String, enum: ['Apartment', 'Penthouse', 'Villa', 'Commercial', 'Land'] },

  // Location
  location: {
    city:              { type: String, default: 'Mumbai' },
    area:              { type: String, required: true },                 // "Worli", "Andheri"
    address:           { type: String },
    coordinates: {
      lat:             Number,
      lng:             Number,
    },
  },

  // Pricing
  price:               { type: Number, required: true },                 // in INR
  pricePerSqft:        { type: Number },
  priceOnRequest:      { type: Boolean, default: false },

  // Specifications
  bhk:                 { type: String, enum: ['1BHK', '2BHK', '3BHK', '4BHK', '5+BHK'] },
  superArea:           { type: Number },                                 // sq.ft
  builtArea:           { type: Number },
  carpetArea:          { type: Number },
  floorNumber:         { type: Number },
  totalFloors:         { type: Number },

  // Status
  possessionStatus:    { type: String, enum: ['Ready to Move', 'Within 1 Year', 'Under Construction'] },
  possessionDate:      { type: Date },
  furnishingType:      { type: String, enum: ['Fully-furnished', 'Semi-furnished', 'Unfurnished'] },

  // Legal
  reraNumber:          { type: String },
  reraRegistered:      { type: Boolean, default: false },
  verificationStatus:  { type: String, enum: ['Verified', 'Pending', 'Unverified'], default: 'Pending' },

  // Builder
  builderName:         { type: String },
  keyHighlights:       [String],
  amenities:           [String],                                         // see Amenities enum

  // Media
  images:              [String],                                         // Cloudinary URLs
  heroImage:           { type: String },
  videos:              [String],
  floorPlans:          [String],
  brochureUrl:         { type: String },

  // Flags
  isFeatured:          { type: Boolean, default: false },
  isActive:            { type: Boolean, default: true },

  // Counters
  viewsCount:          { type: Number, default: 0 },
  savedCount:          { type: Number, default: 0 },
  inquiriesCount:      { type: Number, default: 0 },

  createdAt:           { type: Date, default: Date.now },
  updatedAt:           { type: Date, default: Date.now },
}
```

---

### 3.3 Lead

```js
// models/Lead.js
{
  // Contact
  name:                { type: String, required: true },
  phone:               { type: String, required: true },
  email:               { type: String },

  // Lead classification
  leadType:            { type: String, enum: ['buy', 'rent', 'loan', 'agreement', 'list_property'], required: true },
  propertyId:          { type: ObjectId, ref: 'Property' },             // optional
  propertyTitle:       { type: String },                                 // snapshot at lead creation

  // Context
  message:             { type: String },
  budgetMin:           { type: Number },
  budgetMax:           { type: Number },
  monthlyIncome:       { type: Number },                                 // for loan leads
  preferredLocations:  [String],

  // CRM
  status:              { type: String, enum: ['new', 'contacted', 'qualified', 'closed'], default: 'new' },
  assignedTo:          { type: ObjectId, ref: 'User' },                 // admin user
  notes: [{
    text:              String,
    addedBy:           { type: ObjectId, ref: 'User' },
    addedAt:           { type: Date, default: Date.now },
  }],
  lastContactedAt:     { type: Date },

  // Source tracking
  source:              { type: String, enum: ['website', 'admin', 'referral'], default: 'website' },

  createdAt:           { type: Date, default: Date.now },
  updatedAt:           { type: Date, default: Date.now },
}
```

---

### 3.4 Blog

```js
// models/Blog.js
{
  title:               { type: String, required: true },
  slug:                { type: String, unique: true, required: true },   // auto-generated

  // Content
  content:             { type: String, required: true },                 // HTML from rich text editor
  excerpt:             { type: String },                                 // short summary / meta description

  // Categorization
  category:            {
    type: String,
    enum: ['Market Trends', 'Legal Guides', 'Investment Tips', 'Neighbourhood Reviews',
           'Home Renovation', 'Community Spotlight', 'Lifestyle', 'Interior Design', 'Legal & Tax'],
    required: true,
  },
  tags:                [String],

  // SEO
  metaTitle:           { type: String },
  metaDescription:     { type: String },
  focusKeyword:        { type: String },

  // Media
  featuredImage:       { type: String },                                 // Cloudinary URL
  featuredImageAlt:    { type: String },

  // Authorship
  author:              { type: String, required: true },
  authorBio:           { type: String },
  authorImage:         { type: String },

  // Publishing
  status:              { type: String, enum: ['draft', 'scheduled', 'published'], default: 'draft' },
  scheduledAt:         { type: Date },                                   // used when status = 'scheduled'
  publishedAt:         { type: Date },
  readTimeMinutes:     { type: Number },                                 // auto-calculated

  // Flags
  isFeatured:          { type: Boolean, default: false },

  // Engagement
  viewsCount:          { type: Number, default: 0 },
  comments: [{
    name:              String,
    email:             String,
    comment:           { type: String, required: true },
    isApproved:        { type: Boolean, default: false },
    createdAt:         { type: Date, default: Date.now },
  }],

  createdAt:           { type: Date, default: Date.now },
  updatedAt:           { type: Date, default: Date.now },
}
```

---

### 3.5 Testimonial

```js
// models/Testimonial.js
{
  authorName:          { type: String, required: true },
  authorImage:         { type: String },                                 // Cloudinary URL
  authorTitle:         { type: String },                                 // "Homeowner", "Luxury Portfolio Owner"

  quote:               { type: String, required: true },
  starRating:          { type: Number, min: 1, max: 5, required: true },
  propertyReference:   { type: String },                                 // optional property name

  // Video testimonial
  videoUrl:            { type: String },

  // Admin controls
  isVerified:          { type: Boolean, default: false },
  isFeatured:          { type: Boolean, default: false },
  displayOrder:        { type: Number, default: 0 },
  isActive:            { type: Boolean, default: true },

  createdAt:           { type: Date, default: Date.now },
}
```

---

### 3.6 Banner

```js
// models/Banner.js
{
  name:                { type: String, required: true },

  // Content
  imageUrl:            { type: String, required: true },                 // Cloudinary URL
  imageAlt:            { type: String },
  ctaLink:             { type: String },
  ctaText:             { type: String },

  // Placement
  position:            { type: String, enum: ['hero', 'home_2', 'home_3', 'sidebar'], required: true },

  // Status & Scheduling
  status:              { type: String, enum: ['live', 'scheduled', 'inactive'], default: 'inactive' },
  scheduledLiveDate:   { type: Date },
  scheduledEndDate:    { type: Date },

  // Analytics
  views:               { type: Number, default: 0 },
  clicks:              { type: Number, default: 0 },                    // CTR = clicks/views

  createdBy:           { type: ObjectId, ref: 'User' },
  createdAt:           { type: Date, default: Date.now },
  updatedAt:           { type: Date, default: Date.now },
}
```

---

### 3.7 StampDutyConfig

```js
// models/StampDutyConfig.js
{
  // Rates by buyer type (percentage)
  maleRate:            { type: Number, required: true },                 // e.g., 6
  femaleRate:          { type: Number, required: true },                 // e.g., 5
  jointRate:           { type: Number, required: true },                 // e.g., 5.5
  nriRate:             { type: Number },

  // Registration charges (flat amount)
  registrationCharge:  { type: Number, required: true },                 // in INR

  state:               { type: String, default: 'Maharashtra' },
  updatedBy:           { type: ObjectId, ref: 'User' },
  updatedAt:           { type: Date, default: Date.now },
}
```

---

### 3.8 Newsletter

```js
// models/Newsletter.js
{
  email:               { type: String, required: true, unique: true, lowercase: true },
  name:                { type: String },
  isActive:            { type: Boolean, default: true },
  subscribedAt:        { type: Date, default: Date.now },
  unsubscribedAt:      { type: Date },
}
```

---

### 3.9 Enquiry (User-side view of Leads)

The `Lead` model serves as the single enquiry collection. The user-facing "My Enquiries" page reads from `Lead` filtered by `phone` or linked `userId`. No separate model is needed.

---

## 4. API Contracts

All responses follow this envelope:

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "pagination": {}   // only on list endpoints
}
```

Pagination object:

```json
{
  "total": 120,
  "page": 1,
  "limit": 12,
  "totalPages": 10
}
```

---

### 4.1 Auth Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup/request` | Public | Start signup and email OTP |
| POST | `/api/auth/signup/verify-email` | Public | Verify signup OTP (OTP-only payload) |
| POST | `/api/auth/signup/resend-otp` | Public | Resend signup OTP |
| POST | `/api/auth/login` | Public | Login with email/phone + password |
| POST | `/api/auth/forgot-password/request` | Public | Request reset OTP using email/phone |
| POST | `/api/auth/forgot-password/verify` | Public | Verify reset OTP (OTP-only payload) |
| POST | `/api/auth/forgot-password/reset` | Public | Reset password after OTP verify |
| POST | `/api/auth/refresh` | Public | Refresh JWT token |
| POST | `/api/auth/logout` | User | Invalidate token |

**POST /api/auth/signup/request**

Request:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "+919876543210",
  "password": "TestPass123"
}
```
Response `200`:
```json
{ "success": true, "message": "Signup initiated. OTP sent to your email address." }
```

**POST /api/auth/signup/verify-email**

Request:
```json
{ "otp": "123456" }
```
Response `201`:
```json
{
  "success": true,
  "data": {
    "accessToken": "<JWT>",
    "refreshToken": "<JWT>",
    "user": { "_id": "...", "name": "...", "email": "...", "role": "user" }
  }
}
```

---

### 4.2 Property Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/properties` | Public | List properties with filters + pagination |
| GET | `/api/properties/:id` | Public | Single property detail |
| POST | `/api/properties` | Admin | Create property |
| PUT | `/api/properties/:id` | Admin | Update property |
| DELETE | `/api/properties/:id` | Admin | Soft-delete property |
| POST | `/api/properties/:id/upload-images` | Admin | Upload images to Cloudinary |

**GET /api/properties — Query Params:**

| Param | Type | Example |
|---|---|---|
| `category` | string | `buy`, `rent`, `commercial`, `new_launch` |
| `area` | string | `Worli` |
| `bhk` | string (comma-sep) | `2BHK,3BHK` |
| `minPrice` | number | `5000000` |
| `maxPrice` | number | `20000000` |
| `possessionStatus` | string | `Ready to Move` |
| `furnishingType` | string | `Fully-furnished` |
| `amenities` | string (comma-sep) | `Gym,Pool` |
| `reraRegistered` | boolean | `true` |
| `isFeatured` | boolean | `true` |
| `sortBy` | string | `price_asc`, `price_desc`, `newest`, `popular` |
| `page` | number | `1` |
| `limit` | number | `12` |

**POST /api/properties — Request Body:**

```json
{
  "title": "Sea-view Penthouse in Worli",
  "description": "...",
  "category": "buy",
  "propertyType": "Penthouse",
  "location": { "area": "Worli", "address": "..." },
  "price": 50000000,
  "bhk": "3BHK",
  "carpetArea": 2200,
  "possessionStatus": "Ready to Move",
  "reraNumber": "P51800012345",
  "builderName": "Lodha Group",
  "amenities": ["Gym", "Pool", "Sea View"],
  "keyHighlights": ["Panoramic sea view", "Private terrace"],
  "isFeatured": false
}
```

---

### 4.3 Lead Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/leads` | Public | Submit a new lead |
| GET | `/api/leads` | Admin | List all leads with filters |
| GET | `/api/leads/:id` | Admin | Single lead detail |
| PUT | `/api/leads/:id/status` | Admin | Update lead status |
| POST | `/api/leads/:id/notes` | Admin | Add note to lead |
| GET | `/api/leads/export` | Admin | Export leads as CSV |
| GET | `/api/leads/analytics` | Admin | Lead KPI data |

**POST /api/leads — Request Body:**

```json
{
  "name": "Rahul Sharma",
  "phone": "+919876543210",
  "email": "rahul@email.com",
  "leadType": "buy",
  "propertyId": "64abc...",
  "message": "Interested in the 3BHK",
  "budgetMin": 10000000,
  "budgetMax": 20000000
}
```

**GET /api/leads — Query Params:**

| Param | Type |
|---|---|
| `leadType` | `buy`, `rent`, `loan`, `agreement`, `list_property` |
| `status` | `new`, `contacted`, `qualified`, `closed` |
| `search` | name / phone / email string |
| `fromDate` | ISO date string |
| `toDate` | ISO date string |
| `page` | number |
| `limit` | number |

**PUT /api/leads/:id/status — Request Body:**

```json
{ "status": "contacted" }
```

**POST /api/leads/:id/notes — Request Body:**

```json
{ "text": "Called, asked for site visit on Friday" }
```

**GET /api/leads/analytics — Response:**

```json
{
  "success": true,
  "data": {
    "totalLeads": 1284,
    "totalLeadsTrend": 12,
    "conversionRate": 7.4,
    "conversionRateTrend": 2,
    "avgResponseTimeHours": 2.3,
    "leadsByType": {
      "buy": 540, "rent": 310, "loan": 180, "agreement": 150, "list_property": 104
    },
    "leadsByStatus": {
      "new": 420, "contacted": 510, "qualified": 260, "closed": 94
    }
  }
}
```

---

### 4.4 User Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | User | Get own profile |
| PUT | `/api/users/me` | User | Update own profile |
| POST | `/api/users/me/change-password` | User | Change password |
| POST | `/api/users/me/save-property/:id` | User | Save a property |
| DELETE | `/api/users/me/save-property/:id` | User | Unsave a property |
| GET | `/api/users/me/saved` | User | Get saved properties |
| POST | `/api/users/me/compare/:id` | User | Add to compare list |
| DELETE | `/api/users/me/compare/:id` | User | Remove from compare |
| GET | `/api/users/me/compare` | User | Get compare list (max 3) |
| GET | `/api/users/me/enquiries` | User | User's own leads |
| GET | `/api/users` | Admin | List all users |
| PUT | `/api/users/:id/status` | Admin | Activate / deactivate user |

---

### 4.5 Blog Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/blogs` | Public | List blogs with filters |
| GET | `/api/blogs/:slug` | Public | Single blog by slug |
| POST | `/api/blogs` | Admin | Create blog post |
| PUT | `/api/blogs/:id` | Admin | Update blog post |
| DELETE | `/api/blogs/:id` | Admin | Delete blog post |
| POST | `/api/blogs/:id/comment` | Public | Submit comment (pending approval) |
| PUT | `/api/blogs/:id/comments/:cid/approve` | Admin | Approve comment |

**GET /api/blogs — Query Params:**

| Param | Type |
|---|---|
| `category` | Blog category string |
| `status` | `draft`, `scheduled`, `published` |
| `isFeatured` | boolean |
| `search` | title keyword |
| `page` | number |
| `limit` | number |

**POST /api/blogs/:id/comment — Request Body:**

```json
{
  "name": "Priya Mehta",
  "email": "priya@email.com",
  "comment": "Great article on stamp duty!"
}
```

---

### 4.6 Testimonial Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/testimonials` | Public | Get active testimonials |
| POST | `/api/testimonials` | Admin | Create testimonial |
| PUT | `/api/testimonials/:id` | Admin | Update testimonial |
| DELETE | `/api/testimonials/:id` | Admin | Delete testimonial |
| PATCH | `/api/testimonials/:id/verify` | Admin | Toggle verified status |
| PATCH | `/api/testimonials/:id/feature` | Admin | Toggle featured status |
| PUT | `/api/testimonials/reorder` | Admin | Update displayOrder array |

**PUT /api/testimonials/reorder — Request Body:**

```json
{ "order": ["id1", "id2", "id3"] }
```

---

### 4.7 Banner Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/banners` | Public | Get live banners by position |
| POST | `/api/banners` | Admin | Create banner |
| PUT | `/api/banners/:id` | Admin | Update banner |
| DELETE | `/api/banners/:id` | Admin | Delete banner |
| PATCH | `/api/banners/:id/status` | Admin | Change status (live/scheduled/inactive) |

**GET /api/banners — Query Params:**

| Param | Example |
|---|---|
| `position` | `hero`, `home_2`, `sidebar` |

---

### 4.8 Calculator Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/calculators/emi` | Public | Calculate EMI |
| POST | `/api/calculators/stamp-duty` | Public | Calculate stamp duty |
| GET | `/api/stamp-duty/config` | Public | Get current stamp duty rates |
| PUT | `/api/stamp-duty/config` | Admin | Update stamp duty rates |

**POST /api/calculators/emi — Request Body:**

```json
{
  "loanAmount": 5000000,
  "interestRate": 8.5,
  "tenureYears": 20
}
```

**POST /api/calculators/emi — Response:**

```json
{
  "success": true,
  "data": {
    "monthlyEmi": 43391,
    "totalInterest": 5413840,
    "totalPayable": 10413840,
    "principalAmount": 5000000,
    "amortizationSchedule": [
      { "year": 1, "principal": 198720, "interest": 422172, "totalPayment": 620892, "balance": 4801280 }
    ]
  }
}
```

**POST /api/calculators/stamp-duty — Request Body:**

```json
{
  "propertyValue": 10000000,
  "buyerType": "male",
  "propertyType": "residential"
}
```

**POST /api/calculators/stamp-duty — Response:**

```json
{
  "success": true,
  "data": {
    "stampDutyRate": 6,
    "stampDutyAmount": 600000,
    "registrationCharge": 30000,
    "totalCost": 630000
  }
}
```

---

### 4.9 Contact & Newsletter Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/contact` | Public | Submit contact form |
| POST | `/api/newsletter/subscribe` | Public | Subscribe to newsletter |
| POST | `/api/newsletter/unsubscribe` | Public | Unsubscribe |

**POST /api/contact — Request Body:**

```json
{
  "name": "Priya Mehta",
  "phone": "+919876543210",
  "email": "priya@email.com",
  "message": "I'm looking for a 3BHK in South Mumbai"
}
```

This automatically creates a Lead with `leadType: "buy"` and sends an email notification to admin.

---

### 4.10 Admin Dashboard Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/kpis` | Admin | All KPI card data |
| GET | `/api/dashboard/leads-chart` | Admin | Lead counts by type (bar chart) |
| GET | `/api/dashboard/top-properties` | Admin | Top properties by enquiries |
| GET | `/api/dashboard/recent-leads` | Admin | Latest 5 leads |

**GET /api/dashboard/kpis — Response:**

```json
{
  "success": true,
  "data": {
    "totalLeads":        { "value": 1284, "trend": 12 },
    "propertiesListed":  { "value": 452,  "trend": 5 },
    "websiteVisits":     { "value": 45820, "trend": 18 },
    "conversions":       { "value": 96,   "trend": 8 },
    "avgResponseHours":  { "value": 2.3,  "trend": -0.5 },
    "conversionRate":    { "value": 7.4,  "trend": 2 }
  }
}
```

---

## 5. Backend Logic & Functions

### 5.1 Property Service

**`generateSlug(title)`**
- Converts title to lowercase, replaces spaces with hyphens, strips special chars.
- Appends a short unique suffix if slug already exists.

**`applyPropertyFilters(query, filters)`**
- Builds a Mongoose query object from filter params.
- Handles price range with `$gte` / `$lte`.
- Handles multi-value fields (bhk, amenities) with `$in`.
- Default: `isActive: true`.

**`incrementViewCount(propertyId)`**
- Called on GET /api/properties/:id.
- Uses `$inc` to avoid read-modify-write race.

**`updateSavedCount(propertyId, delta)`**
- Called +1 when user saves, -1 when user unsaves.

---

### 5.2 Lead Service

**`createLead(data)`**
- Saves lead to DB.
- Triggers `emailService.sendLeadNotification(lead)` to admin.
- Increments `property.inquiriesCount` if `propertyId` is set.

**`updateLeadStatus(leadId, status)`**
- Validates status transition is forward-only: `new → contacted → qualified → closed`.
- Updates `updatedAt` and `lastContactedAt` when moving out of `new`.

**`addNote(leadId, adminId, text)`**
- Pushes to `lead.notes` array with timestamp.

**`exportLeadsCSV(filters)`**
- Runs filtered query, maps to flat object, converts to CSV using a library (e.g., `csv-stringify`).
- Returns buffer with `Content-Disposition: attachment`.

**`getLeadAnalytics()`**
- Runs MongoDB aggregation:
  - `$group` by `leadType` for bar chart data.
  - `$group` by `status` for funnel data.
  - `$count` for totals.
  - Trend calculations compare last 30 days vs prior 30 days.

---

### 5.3 Blog Service

**`generateSlug(title)`**
- Same utility as property slug.

**`calculateReadTime(content)`**
- Strips HTML tags, counts words, divides by 200 (avg words/minute).
- Rounds up to nearest minute.

**`publishScheduledPosts()`**
- Cron job: runs every minute.
- Query: `{ status: 'scheduled', scheduledAt: { $lte: new Date() } }`.
- Updates matching docs to `status: 'published', publishedAt: Date.now()`.

---

### 5.4 Calculator Service

**`calculateEMI(loanAmount, interestRate, tenureYears)`**

```
monthlyRate = interestRate / 12 / 100
n = tenureYears * 12
emi = loanAmount * monthlyRate * (1 + monthlyRate)^n / ((1 + monthlyRate)^n - 1)
```

**`buildAmortizationSchedule(loanAmount, emi, monthlyRate, tenureYears)`**
- Iterates year by year.
- Accumulates `principal paid`, `interest paid`, and `remaining balance`.

**`calculateStampDuty(propertyValue, buyerType, config)`**

```
rate = config[buyerType + 'Rate']   // maleRate | femaleRate | jointRate
stampDuty = propertyValue * rate / 100
total = stampDuty + config.registrationCharge
```

---

### 5.5 User Service

**`saveProperty(userId, propertyId)`**
- Checks property is not already saved (idempotent).
- Pushes to `user.savedProperties`.
- Calls `updateSavedCount(propertyId, +1)`.

**`unsaveProperty(userId, propertyId)`**
- Pulls from `user.savedProperties`.
- Calls `updateSavedCount(propertyId, -1)`.

**`addToCompare(userId, propertyId)`**
- Validates `comparedProperties.length < 3`. Returns `400` if already at max.
- Checks not already in list.
- Pushes propertyId.

---

### 5.6 Banner Service

**`scheduleBanners()`**
- Cron job: runs every minute.
- Sets `status: 'live'` for banners where `scheduledLiveDate <= now`.
- Sets `status: 'inactive'` for banners where `scheduledEndDate <= now`.

**`trackBannerClick(bannerId)`**
- `$inc { clicks: 1 }`.

**`trackBannerView(bannerId)`**
- `$inc { views: 1 }`.

---

### 5.7 Cloudinary Upload Helper

**`uploadImage(file, folder)`**
- Uploads buffer to Cloudinary under the given folder (`properties/`, `blogs/`, `testimonials/`, `banners/`).
- Returns `secure_url`.
- Auto-generates responsive versions via Cloudinary transformations.

**`deleteImage(publicId)`**
- Called when admin deletes a property or replaces an image.

---

## 6. Authentication Flow

### Credential Auth + Email OTP

```
1. Client sends signup payload to /api/auth/signup/request
2. Server stores OTP flow context and emails OTP to the user
3. Client submits OTP-only payload to /api/auth/signup/verify-email
4. Server verifies OTP via flow cookie context, marks email as verified, and issues JWT pair
5. Client logs in later through /api/auth/login with identifier + password
6. Forgot-password flow uses /request -> /verify -> /reset with OTP-only verify payload
7. Password reset increments tokenVersion, invalidating older sessions
```

### JWT Structure

```json
{
  "id": "64abc...",
  "role": "user",
  "tokenVersion": 1,
  "iat": 1700000000,
  "exp": 1700604800
}
```

### Token Usage

- Client sends: `Authorization: Bearer <token>`
- Protected routes verify and decode token via `authMiddleware`.
- Admin routes additionally check `role === 'admin'` via `adminOnlyMiddleware`.

---

## 7. Middleware

### `authMiddleware`

```js
// Verifies JWT, attaches req.user = { userId, role }
// Returns 401 if missing or invalid token
```

### `adminOnlyMiddleware`

```js
// Must come after authMiddleware
// Returns 403 if req.user.role !== 'admin'
```

### `rateLimiter`

- OTP endpoint: 5 requests per phone per 10 minutes.
- Lead submission: 10 requests per IP per hour.
- General API: 200 requests per IP per 15 minutes.

### `validate(schema)`

- Uses Joi or Zod schemas.
- Returns `400` with field-level errors on validation failure.

### `upload`

- Multer memory storage (no local disk writes).
- Passes buffer to Cloudinary service.
- Accepts: `image/jpeg`, `image/png`.
- Max file size: 10 MB.

---

## 8. Email System

### Templates

| Trigger | Recipients | Template |
|---|---|---|
| New lead submitted | Admin | Lead details + property link |
| Contact form submitted | Admin | Contact details + message |
| OTP (fallback) | User | OTP code |
| Newsletter confirm | Subscriber | Welcome + unsubscribe link |

### `sendLeadNotification(lead)`

```
Subject: New {leadType} Lead — {lead.name}
Body:
  Name: {lead.name}
  Phone: {lead.phone}
  Email: {lead.email}
  Type: {lead.leadType}
  Property: {lead.propertyTitle}
  Message: {lead.message}
  View in CRM: {adminUrl}/leads/{lead._id}
```

---

## 9. File Storage

### Cloudinary Folders

| Content | Folder |
|---|---|
| Property images | `bricks/properties/` |
| Property floor plans | `bricks/floor-plans/` |
| Property brochures | `bricks/brochures/` |
| Blog featured images | `bricks/blogs/` |
| Testimonial images | `bricks/testimonials/` |
| Banner images | `bricks/banners/` |
| User profile pictures | `bricks/avatars/` |

### Upload Limits

| Type | Max Size | Formats |
|---|---|---|
| Property images | 10 MB | JPG, PNG |
| Blog images | 5 MB | JPG, PNG |
| Brochure PDFs | 20 MB | PDF |
| Banners | 10 MB | JPG, PNG |

---

## 10. Enumerations & Constants

### Property Category
`buy` `rent` `commercial` `new_launch`

### Property Type
`Apartment` `Penthouse` `Villa` `Commercial` `Land`

### BHK
`1BHK` `2BHK` `3BHK` `4BHK` `5+BHK`

### Possession Status
`Ready to Move` `Within 1 Year` `Under Construction`

### Furnishing
`Fully-furnished` `Semi-furnished` `Unfurnished`

### Verification Status
`Verified` `Pending` `Unverified`

### Amenities
`Gym` `Pool` `Infinity Pool` `Sea View` `Spa` `Club` `Parking` `24/7 Security` `Garden` `Balcony` `Playground` `Community Center` `Concierge`

### Lead Type
`buy` `rent` `loan` `agreement` `list_property`

### Lead Status
`new` `contacted` `qualified` `closed`

### Blog Category
`Market Trends` `Legal Guides` `Investment Tips` `Neighbourhood Reviews` `Home Renovation` `Community Spotlight` `Lifestyle` `Interior Design` `Legal & Tax`

### Blog Status
`draft` `scheduled` `published`

### Banner Position
`hero` `home_2` `home_3` `sidebar`

### Banner Status
`live` `scheduled` `inactive`

### User Role
`user` `admin`

### Lead Source
`website` `admin` `referral`

---

## 11. Security Rules

| Rule | Implementation |
|---|---|
| All inputs validated | Joi/Zod schema per endpoint |
| Phone format enforced | Regex: `/^\+91[6-9]\d{9}$/` |
| Email format enforced | Joi `email()` |
| Admin routes guarded | `adminOnlyMiddleware` on all admin routes |
| File type enforced | Multer `fileFilter` + MIME type check |
| Rate limiting | `express-rate-limit` per endpoint group |
| XSS prevention | `express-mongo-sanitize` + `helmet` |
| Blog HTML content | Sanitize with `DOMPurify` / `sanitize-html` before save |
| Comment spam | Comments default to `isApproved: false`, admin must approve |
| JWT expiry | 7 days, refresh token flow for extension |
| Password hashing | `bcrypt` with salt rounds ≥ 12 |

---

## 12. Development Order

1. **Setup** — Express app, MongoDB connection, environment config, error handler, response helpers
2. **Auth** — OTP via Firebase, JWT sign/verify, auth + admin middleware
3. **Property APIs** — CRUD, filters, pagination, slug generation, Cloudinary upload
4. **Lead APIs** — Submit lead, list/filter (admin), status update, notes, email notification
5. **User Features** — Profile, save property, compare (max 3), user enquiries view
6. **Admin Dashboard** — KPI aggregations, leads analytics chart, top properties
7. **Blog & CMS** — CRUD, slug, read time, scheduled publish cron, comment approval
8. **Testimonials & Banners** — CRUD, verify/feature toggles, banner scheduler cron
9. **Calculators** — EMI formula, amortization schedule, stamp duty config + calculation
10. **Contact & Newsletter** — Contact form (→ Lead + email), newsletter subscribe/unsubscribe
11. **Exports & Reporting** — CSV export for leads, PDF download for calculators

---

*This document is the canonical backend specification for the Bricks / Mumbai Editorial real estate platform.*
