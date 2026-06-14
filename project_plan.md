# Project Plan: Projects / Bulk Property Registration Module

---

## 1. Current Codebase Analysis

### 1.1 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 19, Tailwind CSS, JSConfig path aliases |
| Backend | Node.js 18+, Express 4.21.2 |
| Database | MongoDB 9.4.1 via Mongoose ODM |
| Auth | Firebase OTP + JWT (access + refresh tokens) |
| File Storage | Multer (memoryStorage) → Cloudinary |
| Caching | Redis (JWT blacklist, with in-memory fallback) |
| Process Manager | PM2 (production) |
| Containerization | Docker + docker-compose |

---

### 1.2 Folder Structure

```
Bricks/
├── backend/
│   ├── app.js                      # Express app (security middleware, route mounting)
│   ├── server.js                   # Bootstrap + graceful shutdown
│   ├── config/                     # db.js, cloudinary.js, firebase.js, redis.js
│   ├── models/mongoose/            # 15 Mongoose schemas (source of truth)
│   ├── controllers/                # 14 request handlers
│   ├── routes/                     # 14 route groups, aggregated in routes/index.js
│   ├── middleware/                 # auth.js, adminOnly.js, upload.js, validate.js, rateLimiter.js, errorHandler.js
│   ├── services/                   # emailService, cloudinaryService, otpService, calculatorService, etc.
│   ├── utils/                      # apiResponse.js, AppError.js, jwt.js, pagination.js, slugify.js
│   └── scripts/                    # Seed and migration scripts
│
└── frontend/
    └── src/
        ├── app/
        │   ├── (public)/           # Public routes (home, buy, rent, builders, blogs, etc.)
        │   ├── (dashboard)/        # Auth-protected user routes (account, profile, saved)
        │   ├── (form)/             # List-property submission form
        │   └── admin/              # Admin console pages
        ├── components/             # admin/, auth/, blog/, builder/, common/, dashboard/, forms/, home/, listing/, property/
        ├── lib/                    # api.js (Axios wrapper), hooks/, utils/
        └── styles/globals.css      # Tailwind config + design tokens
```

---

### 1.3 Current Property Listing Flow

1. Admin creates property via `POST /api/properties` (or user submits via `/api/properties/submit`)
2. Controller auto-generates slug via `slugify.js`, uploads media to Cloudinary via `cloudinaryService`
3. Admin approves/rejects: `PATCH /api/properties/:id/approve` or `/reject`
4. Frontend fetches `GET /api/properties?category=buy&area=Andheri&minPrice=...` with pagination
5. Detail page: `GET /api/properties/slug/:slug` or `GET /api/properties/:id`
6. Enquiry/lead captured via `POST /api/leads` with `leadType: buy | rent`

---

### 1.4 Current Buy/Rent Implementation

- Single `Property` model with `category` enum: `buy | rent | commercial | new_launch`
- Each property is one standalone unit — no parent/child concept
- Pricing is flat: single `price` field + `priceUnit` (total | per_sqft | per_month)
- No configuration or inventory layer
- `new_launch` is just another category — no structured sub-units or configurations

**Relevant files:**
- `backend/models/mongoose/Property.js`
- `backend/controllers/propertyController.js`
- `backend/routes/properties.js`
- `frontend/src/app/(public)/buy/page.js`
- `frontend/src/app/(public)/property/[id]/page.js`

---

### 1.5 Current Builder Implementation

- `Builder` model: name, slug, description, logo, coverImage, faqs[], testimonials[], stats (totalProjects, completedDeliveries), RERA fields, isFeatured, SEO
- No direct link from Builder → Projects. The `Property` model has a `builder: ObjectId → Builder` ref, but that is a loose ref on individual property docs — not a structured project grouping
- Public: `GET /api/builders`, `GET /api/builders/:slug`
- Admin CRUD: `POST/PUT/DELETE /api/admin/builders`

**Relevant files:**
- `backend/models/mongoose/Builder.js`
- `backend/controllers/builderController.js`
- `backend/controllers/adminBuilderController.js`
- `backend/routes/builders.js`, `backend/routes/adminBuilders.js`
- `frontend/src/app/(public)/builders/[slug]/page.js`

---

### 1.6 Current Enquiry/Lead Flow

- Single `Lead` collection: `leadType: buy | rent | loan | agreement`
- `propertyId` field is optional — links lead to a specific property
- No project-level, configuration-level, or unit-level context on a lead
- Status: `new → contacted → qualified → closed`
- CRM notes array, admin assignment, source tracking

**Relevant file:** `backend/models/mongoose/Lead.js`

---

### 1.7 Current Auth & Admin Flow

- Protected routes use `protect` middleware (JWT verification)
- Admin-exclusive routes use `protect` + `adminOnly` middleware
- Role stored on `User.role`: `user | admin`
- Pattern in routes: `router.post('/', protect, adminOnly, ...controller)`

---

### 1.8 Existing Reusable Components & Patterns

| Pattern | Location | Notes |
|---|---|---|
| API response wrapper | `utils/apiResponse.js` | `sendSuccess`, `sendCreated`, `sendError`, etc. — all controllers use this |
| Custom error | `utils/AppError.js` | `new AppError(message, statusCode)` |
| Slug generation | `utils/slugify.js` | Used for property + builder slugs |
| Pagination | `utils/pagination.js` | Cursor + offset helpers |
| Zod validation middleware | `middleware/validate.js` | `validate(schemas.X)` pattern, schemas in same file |
| File upload | `middleware/upload.js` | Multer memoryStorage, `propertyUploadFields`, `builderUploadFields` |
| Cloudinary | `services/cloudinaryService.js` | Upload + delete by publicId |
| Rate limiting | `middleware/rateLimiter.js` | `uploadLimiter` for file endpoints |
| Auth middleware | `middleware/auth.js` | `protect`, `optionalAuth` |
| Admin guard | `middleware/adminOnly.js` | `adminOnly` |

---

### 1.9 Existing API Pattern

All routes mounted under `/api` via `routes/index.js`.

Route style:
```js
// Public
router.get('/', optionalAuth, validate(schemas.X.list, 'query'), controller.list);
router.get('/:id', optionalAuth, controller.getOne);

// Admin only
router.post('/', protect, adminOnly, uploadRateLimit, uploadFields, validate(schemas.X.create), controller.create);
router.put('/:id', protect, adminOnly, uploadRateLimit, uploadFields, controller.update);
router.delete('/:id', protect, adminOnly, controller.remove);
```

Response envelope:
```json
{ "success": true, "message": "...", "data": {...}, "meta": { "pagination": {...} } }
```

---

### 1.10 Media Upload Handling

- Multer: `memoryStorage` (Buffer in RAM)
- After Multer, controller calls `cloudinaryService.upload(buffer, folder, options)`
- Each media item stored as `{ url: String, publicId: String }` — publicId required for deletion
- Existing upload field configs: `propertyUploadFields`, `builderUploadFields` in `middleware/upload.js`
- For projects: new upload field set needed covering project hero, gallery, brochure (PDF), floor plans (per configuration), and master plan

---

## 2. Current Limitations

### 2.1 No Project Entity

No concept of a "Project" as a parent container. `new_launch` is just another property category — it maps to a single property entry. There is no way to group multiple unit types under one named project.

### 2.2 No Builder → Project Relationship

`Builder` has `totalProjects` and `ongoingProjects` as plain integers. There is no foreign-key relationship where a Builder has a list of Projects. Properties only have a loose `builder: ObjectId` ref.

### 2.3 No Configuration Layer

No concept of a "configuration" (1BHK / 2BHK / 3BHK variant within a project). Each property is a flat single-unit record. A project with 4 BHK types would require 4 separate property entries with no grouping — impossible to render as a project detail page with tab-based configuration switching.

### 2.4 No Unit Inventory

No unit-level record (Tower A, Floor 5, Unit 502). No `status: available | sold | booked | hold` at unit level. No floor-level or block-level organization.

### 2.5 No Configuration-Level Media

`Property` has `gallery[]` and `floorPlans[]` at the property level. For projects, each configuration (1BHK / 2BHK) may have its own distinct floor plan images and layout photos. This is not supported.

### 2.6 No Project-Level Brochure / Master Plan

`Property` has a single `brochure` field. Projects need a downloadable brochure at project level, plus a master plan image, plus per-configuration floor plans. Multiple media types need to be organized by type and by configuration.

### 2.7 No BHK-Based Filtering Within a Project

No UI mechanism to filter `All | 1BHK | 2BHK | 3BHK | 4BHK` within a single project detail page, because all BHK configs are independent property records, not sub-resources of a project.

### 2.8 No Project-Scoped Enquiry Context

Current `Lead` model has `propertyId` but no `projectId`, `configurationId`, or `unitId`. An enquiry submitted from a project detail page cannot capture which project/config/unit the user was looking at.

### 2.9 No Enquiry Type Classification

Current `leadType` enum is `buy | rent | loan | agreement`. Project-specific enquiry types (brochure download, site visit scheduling, price request, callback) are not captured.

### 2.10 No Possession / Launch Date Tracking at Project Level

Property has `possession` as a free-text `String`. Projects need structured `possessionDate` (Date), `launchDate`, and `projectStatus: new_launch | under_construction | ready_to_move` as first-class fields for proper filtering and display.

### 2.11 No Bulk Unit Import

No CSV/Excel import mechanism for bulk-adding units (Tower A — Floor 1-20 — Units 01-04 per floor, all `available`). Required for large projects with 200-500 units.

### 2.12 No Project Listing Page / Admin Console

No admin UI for creating projects, adding configurations, managing inventory, or tracking project-specific leads.

---

## 3. Recommended Data Model

All models follow Mongoose schema style used in the codebase. Media stored as `{ url, publicId }`. Timestamps auto-managed via `{ timestamps: true, versionKey: false }`.

---

### 3.1 Builder (extend, do not replace)

Add one field to the existing `Builder` schema:

```js
// In Builder.js — add to builderSchema definition:
website: {
  type: String,
  trim: true,
  default: null,
},
```

No other changes. Projects will reference `Builder._id`. The computed `totalProjects` and `ongoingProjects` counters will be kept but can also be derived from the `Project` collection in the future.

---

### 3.2 Project (new model)

**File:** `backend/models/mongoose/Project.js`

```js
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  { url: { type: String, required: true }, publicId: { type: String, required: true } },
  { _id: false }
);

const coordinatesSchema = new mongoose.Schema(
  { lat: { type: Number, default: null }, lng: { type: Number, default: null } },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    builderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Builder',
      required: [true, 'Builder is required'],
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
    },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, default: null },
    shortDescription: { type: String, trim: true, maxlength: [400, 'Short description max 400 chars'], default: null },

    // ── Classification ────────────────────────────────────────────────────────
    projectType: {
      type: String,
      enum: { values: ['residential', 'commercial', 'mixed'], message: 'Invalid project type' },
      default: 'residential',
    },
    projectStatus: {
      type: String,
      enum: { values: ['new_launch', 'under_construction', 'ready_to_move'], message: 'Invalid project status' },
      default: 'new_launch',
    },
    listingStatus: {
      type: String,
      enum: { values: ['active', 'inactive', 'draft'], message: 'Invalid listing status' },
      default: 'draft',
    },

    // ── Location ──────────────────────────────────────────────────────────────
    location: {
      area:    { type: String, required: [true, 'Area is required'], trim: true },
      address: { type: String, trim: true, default: null },
      city:    { type: String, default: 'Mumbai', trim: true },
      state:   { type: String, default: 'Maharashtra', trim: true },
      pincode: { type: String, trim: true, default: null },
      coordinates: { type: coordinatesSchema, default: () => ({}) },
    },

    // ── Regulatory ────────────────────────────────────────────────────────────
    reraNumber: { type: String, trim: true, default: null },
    reraUrl:    { type: String, trim: true, default: null },

    // ── Dates ─────────────────────────────────────────────────────────────────
    possessionDate: { type: Date, default: null },
    launchDate:     { type: Date, default: null },

    // ── Scale ─────────────────────────────────────────────────────────────────
    totalTowers: { type: Number, min: 0, default: null },
    totalFloors: { type: Number, min: 0, default: null },
    totalUnits:  { type: Number, min: 0, default: null },
    landArea:    { type: Number, min: 0, default: null }, // in sq ft

    // ── Price Summary (auto-computed or manually set) ─────────────────────────
    priceMin: { type: Number, min: 0, default: null },
    priceMax: { type: Number, min: 0, default: null },
    areaMin:  { type: Number, min: 0, default: null }, // carpet area in sq ft
    areaMax:  { type: Number, min: 0, default: null },

    // ── BHK Summary (e.g., ["1BHK", "2BHK", "3BHK"]) ────────────────────────
    bhkSummary: { type: [String], default: [] },

    // ── Media ─────────────────────────────────────────────────────────────────
    heroImage:  { type: mediaSchema, default: null },
    gallery:    { type: [mediaSchema], default: [], validate: { validator: a => a.length <= 20, message: 'Max 20 gallery images' } },
    masterPlan: { type: mediaSchema, default: null },
    brochure:   { type: mediaSchema, default: null },
    videoUrl:   { type: String, trim: true, default: null }, // YouTube/Vimeo embed URL

    // ── Flags ─────────────────────────────────────────────────────────────────
    isFeatured: { type: Boolean, default: false },

    // ── Amenities ─────────────────────────────────────────────────────────────
    amenities: { type: [String], default: [] },

    // ── SEO ───────────────────────────────────────────────────────────────────
    seoTitle:       { type: String, trim: true, maxlength: [70, 'SEO title max 70 chars'], default: null },
    seoDescription: { type: String, trim: true, maxlength: [160, 'SEO description max 160 chars'], default: null },

    // ── Meta ──────────────────────────────────────────────────────────────────
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    views: { type: Number, default: 0, min: 0 },
    enquiryCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, versionKey: false }
);

// Indexes
projectSchema.index({ builderId: 1 });
projectSchema.index({ 'location.area': 1 });
projectSchema.index({ listingStatus: 1 });
projectSchema.index({ projectStatus: 1 });
projectSchema.index({ isFeatured: 1 });
projectSchema.index({ priceMin: 1, priceMax: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ listingStatus: 1, projectStatus: 1, 'location.area': 1 });
projectSchema.index({ listingStatus: 1, isFeatured: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
```

---

### 3.3 ProjectConfiguration (new model)

**File:** `backend/models/mongoose/ProjectConfiguration.js`

Represents one BHK/unit-type variant within a project (e.g., "2BHK - 850 sqft").

```js
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  { url: { type: String, required: true }, publicId: { type: String, required: true } },
  { _id: false }
);

const configurationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },

    // ── Identity ──────────────────────────────────────────────────────────────
    bhkType: {
      type: String,
      required: [true, 'BHK type is required'],
      enum: { values: ['studio', '1BHK', '2BHK', '3BHK', '4BHK', '4+BHK', 'penthouse', 'commercial'], message: 'Invalid BHK type' },
    },
    propertyType: {
      type: String,
      enum: { values: ['apartment', 'villa', 'plot', 'commercial', 'studio'], message: 'Invalid property type' },
      default: 'apartment',
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title max 200 chars'],
      default: null, // e.g., "2BHK Premium - Type A"
    },
    description: { type: String, trim: true, default: null },

    // ── Pricing ───────────────────────────────────────────────────────────────
    priceMin: { type: Number, min: 0, required: [true, 'Minimum price is required'] },
    priceMax: { type: Number, min: 0, required: [true, 'Maximum price is required'] },

    // ── Area ──────────────────────────────────────────────────────────────────
    carpetAreaMin:  { type: Number, min: 0, default: null },
    carpetAreaMax:  { type: Number, min: 0, default: null },
    builtupAreaMin: { type: Number, min: 0, default: null },
    builtupAreaMax: { type: Number, min: 0, default: null },

    // ── Specs ─────────────────────────────────────────────────────────────────
    bathrooms:  { type: Number, min: 0, default: null },
    balconies:  { type: Number, min: 0, default: null },
    parking:    { type: Number, min: 0, default: 0 },

    // ── Media (configuration-specific) ────────────────────────────────────────
    floorPlans: { type: [mediaSchema], default: [] }, // floor plan drawings for this config
    gallery:    { type: [mediaSchema], default: [], validate: { validator: a => a.length <= 10, message: 'Max 10 config images' } },

    // ── Availability ──────────────────────────────────────────────────────────
    totalUnits:     { type: Number, min: 0, default: null },
    availableUnits: { type: Number, min: 0, default: null }, // auto-derived or manually set

    // ── Sort ──────────────────────────────────────────────────────────────────
    sortOrder: { type: Number, default: 0 },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

configurationSchema.index({ projectId: 1 });
configurationSchema.index({ projectId: 1, bhkType: 1 });
configurationSchema.index({ projectId: 1, sortOrder: 1 });

module.exports = mongoose.model('ProjectConfiguration', configurationSchema);
```

---

### 3.4 ProjectUnit (new model)

**File:** `backend/models/mongoose/ProjectUnit.js`

Represents one physical unit within a project (e.g., Tower A, Floor 3, Unit 301).

```js
const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    configurationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectConfiguration',
      required: [true, 'Configuration reference is required'],
    },

    // ── Location within project ───────────────────────────────────────────────
    tower:      { type: String, trim: true, default: null }, // e.g., "Tower A"
    block:      { type: String, trim: true, default: null }, // e.g., "Block 1"
    floor:      { type: Number, default: null },
    unitNumber: { type: String, trim: true, default: null }, // e.g., "301", "A-301"

    // ── Area ──────────────────────────────────────────────────────────────────
    carpetArea:  { type: Number, min: 0, default: null },
    builtupArea: { type: Number, min: 0, default: null },

    // ── Details ───────────────────────────────────────────────────────────────
    facing:   { type: String, trim: true, default: null }, // e.g., "East", "North-East"
    viewType: { type: String, trim: true, default: null }, // e.g., "Garden view", "City view"
    price:    { type: Number, min: 0, default: null },     // Exact price if known

    // ── Inventory Status ──────────────────────────────────────────────────────
    status: {
      type: String,
      enum: { values: ['available', 'sold', 'booked', 'hold'], message: 'Invalid unit status' },
      default: 'available',
    },

    notes: { type: String, trim: true, default: null }, // internal admin note
  },
  { timestamps: true, versionKey: false }
);

unitSchema.index({ projectId: 1 });
unitSchema.index({ configurationId: 1 });
unitSchema.index({ projectId: 1, status: 1 });
unitSchema.index({ projectId: 1, configurationId: 1, status: 1 });
// Unique constraint: a unit number is unique within a project
unitSchema.index({ projectId: 1, tower: 1, floor: 1, unitNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('ProjectUnit', unitSchema);
```

---

### 3.5 Lead (extend, do not replace)

Add project-specific fields to the existing `Lead` schema. **Do not change the existing fields or enum values** — append only.

```js
// Fields to ADD to leadSchema in Lead.js:

// Project enquiry context (all optional — null for non-project leads)
projectId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Project',
  default: null,
},
configurationId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'ProjectConfiguration',
  default: null,
},
unitId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'ProjectUnit',
  default: null,
},

// Extend leadType enum: add 'project' as a new value
// Change: enum values: ['buy', 'rent', 'loan', 'agreement', 'project']

// Add enquiry subtype for project leads
enquiryType: {
  type: String,
  enum: {
    values: ['general', 'price_request', 'brochure', 'site_visit', 'callback'],
    message: 'Invalid enquiry type',
  },
  default: null,
},
```

Add index: `leadSchema.index({ projectId: 1 });`

---

### 3.6 Entity Relationships

```
Builder (1) ──────────────── (N) Project
Project (1) ──────────────── (N) ProjectConfiguration
Project (1) ──────────────── (N) ProjectUnit
ProjectConfiguration (1) ──── (N) ProjectUnit
Lead ──────── (optional) ──── Project
Lead ──────── (optional) ──── ProjectConfiguration
Lead ──────── (optional) ──── ProjectUnit
```

**Summary of new collections:**

| Collection | Purpose |
|---|---|
| `projects` | Top-level project entity |
| `projectconfigurations` | BHK/type variants within a project |
| `projectunits` | Individual unit inventory |

**Existing modified collections:**

| Collection | Change |
|---|---|
| `leads` | Add `projectId`, `configurationId`, `unitId`, `enquiryType`; extend `leadType` enum |

---

## 4. Backend Implementation Plan

### Step 1 — Create Model Files

Create three new model files:
- `backend/models/mongoose/Project.js`
- `backend/models/mongoose/ProjectConfiguration.js`
- `backend/models/mongoose/ProjectUnit.js`

Update `backend/models/mongoose/index.js` to export the three new models.

Update `backend/models/mongoose/Lead.js`:
- Add `projectId`, `configurationId`, `unitId`, `enquiryType` fields
- Extend `leadType` enum to include `'project'`
- Add index on `projectId`

---

### Step 2 — Create Zod Validation Schemas

Extend `backend/middleware/validate.js` with new schemas under a `project` key:

```js
schemas.project = {
  create:         z.object({ /* required fields */ }),
  update:         z.object({ /* partial fields */ }),
  list:           z.object({ area, projectStatus, bhk, minPrice, maxPrice, page, limit, sort }),
  idParam:        z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
  configuration:  z.object({ bhkType, priceMin, priceMax, carpetAreaMin, ... }),
  unit:           z.object({ configurationId, tower, floor, unitNumber, status, ... }),
  bulkImportUnits: z.array(unitSchema).max(500), // parsed from .xlsx rows before Zod validation
  enquiry:        z.object({ name, phone, email, message, configurationId, unitId, enquiryType }),
};
```

---

### Step 3 — Create Cloudinary Upload Config

Add a new upload field set in `backend/middleware/upload.js`:

```js
// Project upload — hero, gallery (10), master plan, brochure (PDF), config floor plans (10)
const projectUploadFields = uploadMixed.fields([
  { name: 'heroImage',    maxCount: 1  },
  { name: 'images',       maxCount: 10 },
  { name: 'masterPlan',   maxCount: 1  },
  { name: 'brochure',     maxCount: 1  },
]);

const configUploadFields = uploadMixed.fields([
  { name: 'floorPlans',   maxCount: 5 },
  { name: 'images',       maxCount: 5 },
]);
```

Export: `projectUploadFields`, `configUploadFields`

---

### Step 4 — Create Controllers

**4a. `backend/controllers/projectController.js`** (public endpoints)

- `list` — `GET /api/projects` — paginated list with filters: area, projectStatus, bhkType, minPrice, maxPrice, isFeatured
- `getBySlug` — `GET /api/projects/slug/:slug` — full project detail with configurations populated
- `getConfigurations` — `GET /api/projects/:id/configurations` — all configs for a project
- `getUnits` — `GET /api/projects/:id/units?configurationId=&status=available` — unit inventory
- `submitEnquiry` — `POST /api/projects/:id/enquiry` — creates Lead with projectId/configId/unitId context

**4b. `backend/controllers/adminProjectController.js`** (admin endpoints)

- `adminList` — GET with pagination, filter by listingStatus, builder, area
- `create` — POST with media upload → Cloudinary
- `update` — PUT with partial update + media management (delete old Cloudinary assets)
- `remove` — DELETE with cascade cleanup (configurations, units, media on Cloudinary)
- `toggleFeatured` — PATCH /:id/featured
- `setListingStatus` — PATCH /:id/status
- `createConfiguration` — POST /api/projects/:id/configurations
- `updateConfiguration` — PUT /api/project-configurations/:id
- `deleteConfiguration` — DELETE /api/project-configurations/:id
- `createUnit` — POST /api/projects/:id/units
- `updateUnit` — PUT /api/project-units/:id
- `deleteUnit` — DELETE /api/project-units/:id
- `bulkImportUnits` — POST /api/projects/:id/bulk-import (receives `.xlsx` file, parses with `xlsx` package, validates each row via Zod, bulk inserts via `insertMany`, returns `{ inserted, failed, errors[] }`)
- `downloadImportTemplate` — GET /api/projects/units/import-template (returns a pre-built `.xlsx` template file with correct column headers and a sample row — admin fills this and re-uploads)
- `exportUnits` — GET /api/projects/:id/units/export (returns current unit inventory as `.xlsx` using existing `excelExport.js`)

Controller pattern to follow (identical to `propertyController.js`):
- Use `sendSuccess`, `sendCreated`, `sendError`, `sendNotFound` from `utils/apiResponse.js`
- Use `new AppError` for operational errors
- Wrap Cloudinary uploads in try/catch, clean up uploaded files on validation failure
- Auto-generate slug via `utils/slugify.js` on create

---

### Step 5 — Create Route Files

**`backend/routes/projects.js`** (public + admin in one file, matching pattern of `routes/properties.js`):

```
GET    /api/projects                        public, optional auth, paginated list
GET    /api/projects/slug/:slug             public, optional auth, full detail
GET    /api/projects/:id/configurations     public
GET    /api/projects/:id/units              public (show only available units to public)
POST   /api/projects/:id/enquiry            auth-optional (fire-and-forget lead creation)

POST   /api/projects                        protect + adminOnly, create project
PUT    /api/projects/:id                    protect + adminOnly, update project
DELETE /api/projects/:id                    protect + adminOnly, delete project
PATCH  /api/projects/:id/status             protect + adminOnly, set listingStatus
PATCH  /api/projects/:id/featured           protect + adminOnly, toggle isFeatured

POST   /api/projects/:id/configurations     protect + adminOnly
PUT    /api/project-configurations/:id      protect + adminOnly
DELETE /api/project-configurations/:id      protect + adminOnly

POST   /api/projects/:id/units              protect + adminOnly
PUT    /api/project-units/:id               protect + adminOnly
DELETE /api/project-units/:id               protect + adminOnly
POST   /api/projects/:id/bulk-import        protect + adminOnly (multipart .xlsx upload, max 500 rows)
GET    /api/projects/units/import-template  protect + adminOnly (.xlsx template download — no auth on id)
GET    /api/projects/:id/units/export       protect + adminOnly (.xlsx export of current inventory)
```

**`backend/routes/index.js`** — add:
```js
router.use('/projects', require('./projects'));
router.use('/project-configurations', require('./projectConfigurations')); // or handle in projects.js
router.use('/project-units', require('./projectUnits'));
```

---

### Step 6 — Update Dashboard

`backend/controllers/dashboardController.js` — add project counts to analytics:
- Total projects (by listingStatus)
- Total project enquiries
- Total available units across all projects

---

### Step 7 — Excel Bulk Import Service

**New dependency:** `xlsx` (SheetJS community edition — zero native deps, MIT license)

```
npm install xlsx --save   # backend only
```

**New file:** `backend/services/unitImportService.js`

Responsibilities:
1. Receive `Buffer` from Multer (single `.xlsx` file, `memoryStorage`)
2. Parse workbook: `xlsx.read(buffer, { type: 'buffer' })`
3. Read first sheet: `xlsx.utils.sheet_to_json(sheet, { defval: null })`
4. Map column headers → unit fields. Expected template columns:

| Column header (exact) | Maps to field | Required |
|---|---|---|
| `configurationId` | `configurationId` | Yes |
| `tower` | `tower` | No |
| `block` | `block` | No |
| `floor` | `floor` (Number) | No |
| `unitNumber` | `unitNumber` | Yes |
| `carpetArea` | `carpetArea` (Number) | No |
| `builtupArea` | `builtupArea` (Number) | No |
| `facing` | `facing` | No |
| `viewType` | `viewType` | No |
| `price` | `price` (Number) | No |
| `status` | `status` (available/sold/booked/hold, default: available) | No |
| `notes` | `notes` | No |

5. Validate each row via Zod `schemas.project.unit` — collect `errors[]` per row index
6. Bulk insert valid rows: `ProjectUnit.insertMany(validRows, { ordered: false })`
7. Return `{ total, inserted, failed, errors: [{ row, field, message }] }`

**Template generation** (`downloadImportTemplate` controller action):
- Build a workbook with `xlsx.utils.book_new()`
- Add one header row + one sample data row (Tower A, Floor 1, unit 101, available)
- Freeze top row, set column widths
- Stream buffer as response:
  ```
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="units-import-template.xlsx"');
  res.send(buffer);
  ```

**Upload field config** — add to `backend/middleware/upload.js`:
```js
const uploadXlsx = multer({
  storage: memoryStorage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new AppError('Only .xlsx files allowed', 400), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const unitImportUpload = uploadXlsx.single('file');
```

Export: `unitImportUpload`

---

### Step 9 — Data Migration / Seed Script

Create `backend/scripts/seedProjects.js`:
- Creates 2-3 sample projects linked to existing builders
- Creates 3-4 configurations per project (1BHK through 3BHK)
- Creates 10-20 sample units per configuration
- Useful for development and demo resets

---

## 5. API Design Reference

All responses use `{ success, message, data, meta }` envelope from `utils/apiResponse.js`.

### 5.1 Public Project APIs

```
GET /api/projects
  Query: area, projectStatus, bhkType, minPrice, maxPrice, isFeatured, page, limit, sort
  Response: { data: [Project], meta: { pagination } }

GET /api/projects/slug/:slug
  Response: { data: { ...project, builder: { name, logo, slug }, configurations: [...] } }

GET /api/projects/:id/configurations
  Response: { data: [ProjectConfiguration] }

GET /api/projects/:id/units
  Query: configurationId, status (default: available), floor, tower
  Response: { data: [ProjectUnit] }

POST /api/projects/:id/enquiry
  Body: { name, phone, email?, message?, configurationId?, unitId?, enquiryType }
  Response: { data: { leadId } }
```

### 5.2 Admin Project APIs

```
GET    /api/projects/admin?listingStatus=&builderId=&area=&page=&limit=
POST   /api/projects                  (multipart/form-data with heroImage, images, brochure, masterPlan)
PUT    /api/projects/:id              (multipart/form-data)
DELETE /api/projects/:id
PATCH  /api/projects/:id/status       Body: { listingStatus: 'active' | 'inactive' | 'draft' }
PATCH  /api/projects/:id/featured     Body: { isFeatured: true | false }

POST   /api/projects/:id/configurations   (multipart/form-data with floorPlans, images)
PUT    /api/project-configurations/:id    (multipart/form-data)
DELETE /api/project-configurations/:id

POST   /api/projects/:id/units            Body: single unit JSON
PUT    /api/project-units/:id             Body: partial unit fields
DELETE /api/project-units/:id

POST   /api/projects/:id/bulk-import
  Content-Type: multipart/form-data
  Field: file (.xlsx, max 5 MB, max 500 data rows)
  Response: { data: { total, inserted, failed, errors: [{ row, field, message }] } }

GET    /api/projects/units/import-template
  Response: .xlsx file download (pre-built template with headers + 1 sample row)
  Content-Disposition: attachment; filename="units-import-template.xlsx"

GET    /api/projects/:id/units/export
  Response: .xlsx file download of current unit inventory for that project
  Content-Disposition: attachment; filename="units-{projectId}.xlsx"
```

---

## 6. Frontend Implementation Plan

### 6.1 New Pages Required

| Route | File | Purpose |
|---|---|---|
| `/projects` | `app/(public)/projects/page.js` | Projects listing page with filters |
| `/projects/[slug]` | `app/(public)/projects/[slug]/page.js` | Project detail page |
| `/admin/projects` | `app/admin/projects/page.js` | Admin project list |
| `/admin/projects/new` | `app/admin/projects/new/page.js` | Create new project form |
| `/admin/projects/[id]/edit` | `app/admin/projects/[id]/edit/page.js` | Edit project |
| `/admin/projects/[id]/configurations` | `app/admin/projects/[id]/configurations/page.js` | Manage configurations |
| `/admin/projects/[id]/inventory` | `app/admin/projects/[id]/inventory/page.js` | Manage unit inventory |

---

### 6.2 New Components Required

**Project Listing:**
- `components/project/ProjectCard.js` — card showing hero image, name, builder, location, price range, BHK badges, status badge
- `components/project/ProjectFilters.js` — area, projectStatus, BHK, price range filters

**Project Detail:**
- `components/project/ProjectHero.js` — hero image + name + builder + RERA + key stats bar
- `components/project/ProjectGallery.js` — image gallery modal with Cloudinary images
- `components/project/ProjectConfigTabs.js` — "All | 1BHK | 2BHK | 3BHK" tab switcher
- `components/project/ConfigurationCard.js` — shows area range, price range, floor plan thumbnail, CTA
- `components/project/UnitAvailabilityTable.js` — tower/floor/unit grid with status badges
- `components/project/ProjectEnquiryForm.js` — sticky sidebar or modal, captures config + unit context, maps to `enquiryType`
- `components/project/ProjectAmenities.js` — amenities icon grid
- `components/project/BrochureDownload.js` — gated or direct brochure download

**Admin Components:**
- `components/admin/ProjectForm.js` — full project create/edit form
- `components/admin/ConfigurationForm.js` — add/edit configuration modal
- `components/admin/UnitForm.js` — add/edit unit modal
- `components/admin/BulkUnitImport.js` — Excel import UI: "Download Template" button → file picker (`.xlsx` only) → upload → shows result table (`inserted N / failed M`) with per-row error details if any rows failed

---

### 6.3 API Client Functions

Add to `frontend/src/lib/api.js`:
```js
// Public
export const getProjects = (params) => api.get('/projects', { params });
export const getProjectBySlug = (slug) => api.get(`/projects/slug/${slug}`);
export const getProjectConfigurations = (id) => api.get(`/projects/${id}/configurations`);
export const getProjectUnits = (id, params) => api.get(`/projects/${id}/units`, { params });
export const submitProjectEnquiry = (id, data) => api.post(`/projects/${id}/enquiry`, data);

// Admin
export const adminGetProjects = (params) => api.get('/projects/admin', { params });
export const adminCreateProject = (formData) => api.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdateProject = (id, formData) => api.put(`/projects/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminDeleteProject = (id) => api.delete(`/projects/${id}`);
export const adminCreateConfiguration = (projectId, formData) => api.post(`/projects/${projectId}/configurations`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const downloadImportTemplate = () => api.get('/projects/units/import-template', { responseType: 'blob' });
export const adminBulkImportUnits = (projectId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/projects/${projectId}/bulk-import`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const exportProjectUnits = (projectId) => api.get(`/projects/${projectId}/units/export`, { responseType: 'blob' });
```

---

### 6.4 Navigation & Sidebar Updates

**Header (`components/common/Header.js`):**
- Add "Projects" link to main nav between "New Launches" and "Builders"

**Admin Sidebar:**
- Add "Projects" menu item in admin navigation with sub-items: All Projects, Configurations, Inventory

**Home Page:**
- Optional: Add a "Featured Projects" section between the current featured properties and builder section

---

## 7. Implementation Order (Suggested Sequence)

Phase 1 — Backend Models & APIs (do first, unblocks frontend)
1. Create `Project.js`, `ProjectConfiguration.js`, `ProjectUnit.js` model files
2. Update `Lead.js` (add project fields, extend enum)
3. Update `models/index.js` exports
4. Create validation schemas in `validate.js`
5. Add `projectUploadFields`, `configUploadFields`, `unitImportUpload` to `upload.js`; install `xlsx` package
6. Create `services/unitImportService.js` (xlsx parse → Zod validate → insertMany → result summary)
7. Create `projectController.js` (public read endpoints + enquiry)
8. Create `adminProjectController.js` (full CRUD + Excel bulk import + template download + inventory export)
9. Create `routes/projects.js` and mount in `routes/index.js`
10. Add project stats to `dashboardController.js`
11. Create `scripts/seedProjects.js`

Phase 2 — Admin UI
11. `admin/projects/page.js` — list with status filter
12. `admin/projects/new/page.js` + `ProjectForm.js` — create project
13. `admin/projects/[id]/edit/page.js` — edit project
14. `admin/projects/[id]/configurations/page.js` + `ConfigurationForm.js`
15. `admin/projects/[id]/inventory/page.js` + `UnitForm.js` + `BulkUnitImport.js`

Phase 3 — Public UI
16. `(public)/projects/page.js` + `ProjectCard.js` + `ProjectFilters.js`
17. `(public)/projects/[slug]/page.js` + all detail sub-components
18. `ProjectEnquiryForm.js` wired to `POST /api/projects/:id/enquiry`
19. Update Header nav
20. Optional: "Featured Projects" section on Home page

---

## 8. Key Constraints and Notes

### Do Not Break Existing Features
- `Lead.js` changes are additive only — all new fields have `default: null`. Existing buy/rent/loan leads will continue to work without modification.
- `leadType` enum extension adds `'project'` — all existing enum values remain valid.
- No changes to `Property.js`, `Builder.js` (except optional `website` field), or any existing route.

### Slug Uniqueness
- `Project.slug` must be unique across the `projects` collection only, not across `properties`.
- Use the existing `utils/slugify.js` + a uniqueness check loop (same pattern as `propertyController.js`).

### Cloudinary Folder Convention
- Project media: `bricks/projects/{projectId}/`
- Configuration media: `bricks/projects/{projectId}/configs/{configId}/`
- Follow existing folder convention in `cloudinaryService.js`

### BHK Summary Auto-Update
- After adding/removing a configuration, the parent `Project.bhkSummary` array should be recomputed and saved. Best done at end of `createConfiguration` / `deleteConfiguration` controller methods.

### Price Range Auto-Update
- Similarly, `Project.priceMin` and `Project.priceMax` should be recomputed from all active configurations when a configuration is saved or deleted.

### Unit `availableUnits` Count
- `ProjectConfiguration.availableUnits` should be updated when a unit status changes. Done in `updateUnit` controller via a `countDocuments` query on `ProjectUnit` where `configurationId` matches and `status === 'available'`.

### Bulk Import Limit
- Cap at 500 units per import request. Use `mongoose.insertMany` with `ordered: false` to continue on partial failures. Return a summary: `{ inserted, failed, errors[] }`.

### Admin Lead CRM
- Existing admin leads page at `/admin/leads` will automatically show project leads since they share the `Lead` collection. The `leadType: 'project'` filter option should be added to the CRM filter UI.

---

## 9. Files to Create

### Backend (new files)
```
backend/models/mongoose/Project.js
backend/models/mongoose/ProjectConfiguration.js
backend/models/mongoose/ProjectUnit.js
backend/controllers/projectController.js
backend/controllers/adminProjectController.js
backend/routes/projects.js
backend/services/unitImportService.js
backend/scripts/seedProjects.js
```

### Backend (modified files)
```
backend/models/mongoose/Lead.js           (add project fields + extend enum)
backend/models/mongoose/index.js          (add new model exports)
backend/middleware/validate.js            (add project schemas)
backend/middleware/upload.js              (add projectUploadFields, configUploadFields)
backend/routes/index.js                   (mount /projects route)
backend/controllers/dashboardController.js (add project stats)
```

### Frontend (new files)
```
frontend/src/app/(public)/projects/page.js
frontend/src/app/(public)/projects/[slug]/page.js
frontend/src/app/admin/projects/page.js
frontend/src/app/admin/projects/new/page.js
frontend/src/app/admin/projects/[id]/edit/page.js
frontend/src/app/admin/projects/[id]/configurations/page.js
frontend/src/app/admin/projects/[id]/inventory/page.js

frontend/src/components/project/ProjectCard.js
frontend/src/components/project/ProjectFilters.js
frontend/src/components/project/ProjectHero.js
frontend/src/components/project/ProjectGallery.js
frontend/src/components/project/ProjectConfigTabs.js
frontend/src/components/project/ConfigurationCard.js
frontend/src/components/project/UnitAvailabilityTable.js
frontend/src/components/project/ProjectEnquiryForm.js
frontend/src/components/project/ProjectAmenities.js
frontend/src/components/project/BrochureDownload.js

frontend/src/components/admin/ProjectForm.js
frontend/src/components/admin/ConfigurationForm.js
frontend/src/components/admin/UnitForm.js
frontend/src/components/admin/BulkUnitImport.js
```

### Frontend (modified files)
```
frontend/src/lib/api.js                   (add project API client functions)
frontend/src/components/common/Header.js  (add Projects nav link)
frontend/src/app/admin/layout.js          (add Projects to admin sidebar)
```

---

## 10. Out of Scope (Post-MVP)

The following are good ideas but should not block the initial implementation:

- **Map view** for projects (2dsphere index already commented in `projectSchema`)
- **Virtual tours / 360° images**
- **EMI calculator embedded on project detail page** (existing `/emi-calculator` page can be linked)
- **Project comparison** (compare 2 projects side-by-side)
- **Project-level analytics** (most viewed project, most enquired config)
- **User alerts** (notify user when a project goes live in their saved area)
- **Agent/broker assignment** to projects
- **Construction update timeline** (milestone tracking per project)
