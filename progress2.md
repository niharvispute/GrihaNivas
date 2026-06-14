# progress2.md — Project / Bulk Unit Registration Feature

**Scope:** Admin 5-step wizard for creating/editing Projects with configurations, unit inventory, media, and publishing.  
**Branch:** `project`  
**Backend base:** `/api/projects` (all routes live, Phase 1 backend is done)

---

## Architecture Decision (Read Before Implementing)

The wizard uses a **save-on-advance** pattern, not a hold-all-in-memory-until-publish pattern:

| Step | What happens on "Next Phase" |
|---|---|
| Step 1 | `POST /api/projects` → creates project in `draft` status → returns `projectId` stored in URL/context |
| Step 2 | `PUT /api/projects/:id` for location + scale; configs created/edited in real-time via side panel (`POST/PUT /api/projects/:id/configurations`) |
| Step 3 | `PUT /api/projects/:id` with `multipart/form-data` for heroImage, gallery, masterPlan, brochure; config floor plans via `PUT /api/projects/project-configurations/:id` |
| Step 4 | Config pricing via `PUT /api/projects/project-configurations/:id`; units via `POST/PUT/DELETE /api/projects/:id/units`; bulk import via `POST /api/projects/:id/bulk-import-units` |
| Step 5 | `PUT /api/projects/:id` for SEO fields; publish via `PATCH /api/projects/:id/status` |

**Why this approach:**  
- Data survives page refresh (persisted in DB after each step)  
- "Save as Draft" button at every step works trivially (data already saved)  
- Media upload at Step 3 only, keeps Step 1 form fast  
- Edit flow (`/admin/projects/:id/edit`) pre-populates from `GET /api/projects/:id`  

**Frontend state:** `ProjectFormContext` holds `{ projectId, currentStep, formData, isDirty }` — shared across all step components via React Context.

---

## Phase 0 — UI Replication (HTML → Next.js, No API Wiring)

> Goal: Get all 5 steps rendering correctly in the admin panel with static/dummy data. Zero API calls. Visual parity with HTML mockups.

### P0-1 — Scaffold routes and layout

- [ ] **P0-1a** Create `frontend/src/app/admin/projects/page.js` — admin projects list page (table + filters, static data for now)
- [ ] **P0-1b** Create `frontend/src/app/admin/projects/new/page.js` — mounts the multi-step wizard at step 1
- [ ] **P0-1c** Create `frontend/src/app/admin/projects/[id]/edit/page.js` — same wizard, loads existing project by id
- [ ] **P0-1d** Add `{ name: 'Projects', icon: 'domain', href: '/admin/projects' }` to `AdminSidebar.jsx` nav array (after Properties, before Builders)

### P0-2 — Project Form Context

- [ ] **P0-2a** Create `frontend/src/context/ProjectFormContext.jsx` — provides `{ projectId, setProjectId, currentStep, goToStep, formData, updateFormData, isDirty, setIsDirty }`
- [ ] **P0-2b** Create `frontend/src/components/admin/projects/ProjectFormWizard.jsx` — wrapper that reads `currentStep` from context, renders correct step component, shows sidebar progress stepper

### P0-3 — Sidebar stepper + shared wizard chrome

- [ ] **P0-3a** Create `frontend/src/components/admin/projects/WizardSidebar.jsx` — left sidebar with 5-step progress (step number, label, % bar, support box). Steps: Basic Info / Location & Config / Media & Docs / Pricing & Inventory / Review & Publish
- [ ] **P0-3b** Create `frontend/src/components/admin/projects/WizardFooter.jsx` — sticky bottom bar with Back / Save Draft / Next Phase buttons; receives `onBack`, `onSaveDraft`, `onNext`, `isLoading` props

### P0-4 — Step 1: Basic Information

- [ ] **P0-4a** Create `frontend/src/components/admin/projects/steps/Step1BasicInfo.jsx`
  - Listing Mode toggle (Single Property / Project Bulk Units) — UI-only routing hint, not sent to backend
  - Listing Type pills (Sale / Rent / New Launch / Commercial) — UI-only for now (Phase 3 wires backend)
  - Project Name text input
  - Builder/Developer select (static options for now)
  - Contact Person Name text input
  - Contact Number tel input
  - RERA Number text input
  - RERA URL url input
  - Project Type pills: Residential / Commercial / Mixed Use / Plotting
  - Project Status pills: New Launch / Under Construction / Ready To Move
  - Configurations Available multi-select pills: Studio / 1 BHK / 2 BHK / 3 BHK / 4 BHK / 4+ BHK / Penthouse

### P0-5 — Step 2: Location & Config

- [ ] **P0-5a** Create `frontend/src/components/admin/projects/steps/Step2LocationConfig.jsx`
  - Locality/Area text input with location icon
  - Area, City, State, Pincode, Complete Address fields
  - Map placeholder div (grey box with pin icon + "Adjust Location" button — non-functional for now)
  - Project Scale cards (Total Towers / Floors / Units / Land Area) — number inputs
  - BHK Configuration cards list (static dummy cards) with edit icons
  - "Add Configuration" dashed button

- [ ] **P0-5b** Create `frontend/src/components/admin/projects/ConfigSidePanel.jsx` — right slide-in panel (400px) with:
  - BHK Type select
  - Config Title text input
  - Carpet Area Min / Max number inputs
  - Bathrooms / Balconies / Parking selects
  - Available Units number input
  - Save Configuration / Cancel buttons

### P0-6 — Step 3: Media & Documents

- [ ] **P0-6a** Create `frontend/src/components/admin/projects/steps/Step3MediaDocs.jsx`
  - Hero Image upload zone (drag-drop + preview with delete X)
  - Project Gallery grid (up to 20, thumbnail previews + delete X per image + dashed add cells)
  - Master Plan upload zone (JPG/PNG, 5MB)
  - Project Brochure upload zone (PDF, 20MB, shows filename preview + Replace button)
  - Video URL text input
  - Configuration Floor Plans section: BHK tabs (1BHK / 2BHK / 3BHK), floor plan cards per tab (plan title, area range, image preview + upload zone)

- [ ] **P0-6b** Create `frontend/src/components/admin/projects/FileUploadZone.jsx` — reusable drag-drop upload zone component; props: `accept`, `maxSizeMB`, `preview`, `onFileSelect`, `label`

### P0-7 — Step 4: Pricing & Inventory

- [ ] **P0-7a** Create `frontend/src/components/admin/projects/steps/Step4PricingInventory.jsx`
  - Project Price Summary: Starting Price, Maximum Price, Price per Sq.Ft, Maintenance/Other Charges inputs
  - Configuration Pricing cards (one per config) with Edit Pricing button
  - Unit Inventory table: Tower / Floor / Unit No. / Configuration / Carpet Area / Facing / Price / Status columns; edit + 3-dot action per row
  - Filter bar: Tower / Floor / Configuration / Status dropdowns
  - Add Unit button + Download Inventory button
  - Bulk Import section: drag-drop zone for CSV/XLSX, Download Template button, Preview Import button, Validation Summary cards (Ready/Duplicates/Errors)

- [ ] **P0-7b** Create `frontend/src/components/admin/projects/UnitFormModal.jsx` — modal for adding/editing a single unit (Tower, Floor, Unit No., Configuration select, Carpet Area, Facing, Price, Status)

- [ ] **P0-7c** Create `frontend/src/components/admin/projects/BulkImportPanel.jsx` — drag-drop + validation summary display component (static for now)

### P0-8 — Step 5: Review & Publish

- [ ] **P0-8a** Create `frontend/src/components/admin/projects/steps/Step5ReviewPublish.jsx`
  - Top bar: Completion %, Listing Status dropdown (Draft/Published), RERA Verification badge, Preview button
  - Project Overview section: hero image + project details grid + Edit button
  - Media Review section: thumbnails grid for all uploaded media + Edit button
  - Configuration Summary table: BHK / Carpet Area / Price Range / Bathrooms / Parking / Available Units / Floor Plan thumbnail / Edit per row
  - Inventory Summary: 5 stat cards (Total / Available / Hold / Booked / Sold) + mini inventory table
  - Lead Capture Settings: 5 toggle switches (Enable Price Request / Callback / Brochure Download / WhatsApp CTA / Site Visit)
  - SEO Preview: Google snippet preview box + SEO Title input (70 char counter) + SEO Description textarea (160 char counter) + URL Slug input (75 char counter)
  - Footer: Back / Save as Draft / Preview Listing / PUBLISH PROJECT buttons

---

## Phase 1 — Wire Compatible Fields to Backend

> Goal: All fields that exist in both UI and backend start making real API calls. No new backend code needed in this phase.

### P1-1 — Project Service

- [ ] **P1-1a** Create `frontend/src/services/projectService.js` with these functions:
  ```js
  // Admin
  adminListProjects(params)         → GET /api/projects/admin
  getProjectById(id)                → GET /api/projects/:id  (admin, includes configs)
  createProject(formData)           → POST /api/projects      (multipart)
  updateProject(id, formData)       → PUT /api/projects/:id   (multipart)
  deleteProject(id)                 → DELETE /api/projects/:id
  setProjectStatus(id, listingStatus) → PATCH /api/projects/:id/status
  toggleFeatured(id, isFeatured)    → PATCH /api/projects/:id/featured

  // Configurations
  createConfiguration(projectId, formData) → POST /api/projects/:id/configurations  (multipart)
  updateConfiguration(configId, formData)  → PUT /api/projects/project-configurations/:id (multipart)
  deleteConfiguration(configId)            → DELETE /api/projects/project-configurations/:id

  // Units
  listUnits(projectId, params)      → GET /api/projects/:id/units
  createUnit(projectId, data)       → POST /api/projects/:id/units
  updateUnit(unitId, data)          → PUT /api/projects/project-units/:id
  deleteUnit(unitId)                → DELETE /api/projects/project-units/:id
  bulkImportUnits(projectId, units) → POST /api/projects/:id/bulk-import-units  (JSON body)
  exportUnits(projectId, params)    → GET /api/projects/:id/units/export  (file download)
  ```

### P1-2 — Admin Projects List Page

- [ ] **P1-2a** Wire `adminListProjects()` in `admin/projects/page.js` — replace static data; show loading skeleton, error state
- [ ] **P1-2b** Add search, listingStatus filter, builderId filter using query params
- [ ] **P1-2c** Add Delete action with confirmation dialog calling `deleteProject(id)`
- [ ] **P1-2d** Add Featured toggle calling `toggleFeatured(id)`
- [ ] **P1-2e** Add Status change dropdown calling `setProjectStatus(id, status)`

### P1-3 — Step 1 Wiring (Basic Info)

- [ ] **P1-3a** Fetch builders list from `GET /api/builders` on Step 1 mount; populate Builder/Developer select dropdown
- [ ] **P1-3b** On "Next Phase" from Step 1: call `createProject(formData)` with `name`, `builderId`, `reraNumber`, `reraUrl`, `projectType`, `projectStatus`, `listingStatus: 'draft'`; store returned `projectId` in `ProjectFormContext`; advance to Step 2
- [ ] **P1-3c** On "Save Draft" from Step 1: same call as above but stay on Step 1
- [ ] **P1-3d** Edit flow: if `projectId` exists in URL params, call `getProjectById(id)` and pre-populate all Step 1 fields on mount
- [ ] **P1-3e** Handle API error on Step 1 submit — show inline error message under the form

### P1-4 — Step 2 Wiring (Location & Config)

- [ ] **P1-4a** On "Next Phase" from Step 2: call `updateProject(projectId, formData)` with `location.area`, `location.address`, `location.city`, `location.state`, `location.pincode`, `totalTowers`, `totalFloors`, `totalUnits`, `landArea`
- [ ] **P1-4b** ConfigSidePanel "Save Configuration":
  - If creating new: call `createConfiguration(projectId, { bhkType, title, carpetAreaMin, carpetAreaMax, bathrooms, balconies, parking, totalUnits })`
  - If editing existing: call `updateConfiguration(configId, { ...fields })`
  - On success: refresh config cards in Step 2 list
- [ ] **P1-4c** Config card delete icon: call `deleteConfiguration(configId)` with confirm dialog; refresh list
- [ ] **P1-4d** BHK Type select in ConfigSidePanel must map UI labels to backend enum values:
  - "Studio" → `"studio"` | "1 BHK" → `"1BHK"` | "2 BHK" → `"2BHK"` | etc.
- [ ] **P1-4e** On Step 2 mount in edit flow: call `GET /api/projects/:id/configurations` and render existing config cards

### P1-5 — Step 3 Wiring (Media & Docs)

- [ ] **P1-5a** On "Next Phase" from Step 3: build `FormData` object, append `heroImage`, `gallery[]`, `masterPlan`, `brochure`, `videoUrl`; call `updateProject(projectId, formData)` with `Content-Type: multipart/form-data`
- [ ] **P1-5b** Configuration Floor Plans: for each config tab, on floor plan image select, call `updateConfiguration(configId, formData)` with `floorPlans[]` files; each tab save is immediate (not waiting for Next Phase)
- [ ] **P1-5c** Hero image, gallery, masterPlan, brochure: show upload preview immediately using `URL.createObjectURL()` — do not upload until Next Phase
- [ ] **P1-5d** On Step 3 mount in edit flow: show existing Cloudinary URLs in preview slots (use `<CloudinaryImage>` component for images, filename + size for PDF brochure)
- [ ] **P1-5e** Gallery delete: if image already uploaded (has `publicId`), note it for removal — pass `removeGalleryIds[]` in PUT body; if not yet uploaded, just remove from local state

### P1-6 — Step 4 Wiring (Pricing & Inventory)

- [ ] **P1-6a** On Step 4 mount: call `listUnits(projectId, {})` and populate inventory table; also fetch configs for the configuration filter dropdown
- [ ] **P1-6b** Configuration Pricing cards "Edit Pricing": open inline edit for `priceMin`, `priceMax` on that config card; on save call `updateConfiguration(configId, { priceMin, priceMax })`
- [ ] **P1-6c** Project Price Summary fields `priceMin`, `priceMax`: on Next Phase call `updateProject(projectId, { priceMin, priceMax })` (pricePerSqft and maintenanceCharges wired in Phase 3)
- [ ] **P1-6d** Inventory table filters: Tower / Floor / Configuration / Status dropdowns call `listUnits(projectId, { tower, floor, configurationId, status })` and re-render table
- [ ] **P1-6e** Add Unit button → opens `UnitFormModal` → on submit calls `createUnit(projectId, data)` → refreshes table
- [ ] **P1-6f** Unit row edit (pencil icon) → opens `UnitFormModal` pre-populated → on submit calls `updateUnit(unitId, data)` → refreshes table
- [ ] **P1-6g** Unit row delete (3-dot menu) → confirm dialog → calls `deleteUnit(unitId)` → refreshes table
- [ ] **P1-6h** `UnitFormModal` configuration select: populate from fetched project configurations list
- [ ] **P1-6i** Download Inventory button: calls `exportUnits(projectId, { tower, floor, configurationId, status })` (current filter state) → triggers `.xlsx` file download via `downloadAuthedFile`
- [ ] **P1-6j** Bulk Import — Download Template button: serve a static sample CSV template from `/public/templates/unit-import-template.csv` (see schema in P1-6k)
- [ ] **P1-6k** Create `public/templates/unit-import-template.csv` with headers: `configurationId,tower,block,floor,unitNumber,carpetArea,builtupArea,facing,viewType,price,status,notes`
- [ ] **P1-6l** Bulk Import — "Preview Import" button: parse the dropped CSV/XLSX file client-side using a library (`papaparse` for CSV); map rows to unit objects; call `bulkImportUnits(projectId, units)` with the JSON array; display returned `{ inserted, failed, errors[] }` in Validation Summary cards

### P1-7 — Step 5 Wiring (Review & Publish)

- [ ] **P1-7a** On Step 5 mount: call `getProjectById(projectId)` and render all review sections from returned data
- [ ] **P1-7b** SEO fields (seoTitle, seoDescription, slug): debounced auto-save on change via `updateProject(projectId, { seoTitle, seoDescription, slug })` OR save on explicit "Save Draft"
- [ ] **P1-7c** SEO slug field: auto-generate from project name on Step 1 (slugify client-side), editable in Step 5; validate uniqueness client-side on blur
- [ ] **P1-7d** Listing Status dropdown: `"Draft"` → `listingStatus: 'draft'`; `"Published"` → `listingStatus: 'active'` (label remap, not a backend change)
- [ ] **P1-7e** "PUBLISH PROJECT" button: call `setProjectStatus(projectId, 'active')`; on success show success toast + redirect to `/admin/projects`
- [ ] **P1-7f** "Save as Draft" button: call `updateProject(projectId, { seoTitle, seoDescription, slug })` + `setProjectStatus(projectId, 'draft')`; show success toast
- [ ] **P1-7g** Section "Edit" buttons (pencil icons in review): navigate user back to that step number via `goToStep(stepNumber)` from context
- [ ] **P1-7h** Lead Capture Settings toggles (UI renders in Phase 0): leave as non-wired visual only with a "Coming Soon" tooltip — wired in Phase 3 after backend adds fields

---

## Phase 2 — Backend Changes Required

> Goal: Add missing fields/functionality to backend so Phase 3 frontend wiring can complete the remaining gaps.

### P2-1 — Project Model additions

- [ ] **P2-1a** In `backend/models/mongoose/Project.js` add:
  ```js
  contactPerson: { type: String, trim: true, default: null },
  contactPhone:  { type: String, trim: true, default: null },
  pricePerSqft:  { type: Number, default: null, min: 0 },
  maintenanceCharges: { type: String, trim: true, default: null },
  reraVerified:  { type: Boolean, default: false },
  enablePriceRequest:    { type: Boolean, default: true },
  enableCallback:        { type: Boolean, default: true },
  enableBrochureDownload:{ type: Boolean, default: true },
  whatsappCtaEnabled:    { type: Boolean, default: true },
  enableSiteVisit:       { type: Boolean, default: true },
  ```
- [ ] **P2-1b** In `projectType` enum array add `'plotting'` → `['residential', 'commercial', 'mixed', 'plotting']`

### P2-2 — Validation schema additions

- [ ] **P2-2a** In `backend/middleware/validate.js` extend `schemas.project.create` and `schemas.project.update` to accept all 11 new fields added in P2-1a/b

### P2-3 — Upload middleware fix

- [ ] **P2-3a** In `backend/middleware/upload.js` find `projectUploadFields` — change gallery `maxCount` from `10` to `20`
- [ ] **P2-3b** In `backend/middleware/upload.js` ensure Multer `fileFilter` allows `application/pdf` mimetype for the `brochure` field (currently likely only allows images)

### P2-4 — Bulk Import: file upload support

- [ ] **P2-4a** In `backend/middleware/upload.js` add a new Multer config:
  ```js
  const bulkImportUpload = multer({ storage: multer.memoryStorage(), fileFilter: csvXlsxFilter }).single('file');
  ```
  where `csvXlsxFilter` allows `text/csv`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- [ ] **P2-4b** Install `xlsx` npm package in backend: `npm install xlsx`
- [ ] **P2-4c** In `backend/controllers/adminProjectController.js` add new function `bulkImportUnitsFromFile`:
  - Reads `req.file.buffer`
  - If CSV: parse with `xlsx.read(buffer, { type: 'buffer' })`
  - If XLSX: same
  - Extract rows as JSON array
  - Map columns to unit fields (same as existing `bulkImportUnits` logic)
  - Validate and insert with same `insertMany` logic
  - Return same `{ total, inserted, failed, errors[] }` response
- [ ] **P2-4d** In `backend/routes/projects.js` add route:
  ```js
  POST /:id/bulk-import-file  → protect, adminOnly, bulkImportUpload, adminProjectController.bulkImportUnitsFromFile
  ```

### P2-5 — Admin controller: new fields passthrough

- [ ] **P2-5a** In `backend/controllers/adminProjectController.js` — `create` function: ensure all new fields from P2-1a (`contactPerson`, `contactPhone`, `pricePerSqft`, `maintenanceCharges`, `reraVerified`, all 5 enable* toggles) are read from `req.body` and saved
- [ ] **P2-5b** Same for `update` function — new fields allowed in partial update

---

## Phase 3 — Frontend Wiring for New Backend Fields

> Depends on Phase 2 being deployed. Wire the remaining gaps.

### P3-1 — Step 1: New fields

- [ ] **P3-1a** Wire Contact Person Name → `contactPerson` field in `createProject` / `updateProject` call
- [ ] **P3-1b** Wire Contact Number → `contactPhone` field
- [ ] **P3-1c** Add `"Plotting"` to Project Type pills in Step 1 UI (now valid enum in backend)

### P3-2 — Step 3: Gallery + Brochure

- [ ] **P3-2a** Update gallery upload logic to allow up to **20** images (previously capped at 10 by Multer, now fixed in P2-3a)
- [ ] **P3-2b** Update brochure `FileUploadZone` accept prop to include `application/pdf` — now works since P2-3b allows PDF

### P3-3 — Step 4: Pricing fields + file-based bulk import

- [ ] **P3-3a** Wire Price per Sq.Ft input → `pricePerSqft` in `updateProject` call
- [ ] **P3-3b** Wire Maintenance/Other Charges input → `maintenanceCharges` in `updateProject` call
- [ ] **P3-3c** Update `BulkImportPanel` to call new `POST /api/projects/:id/bulk-import-file` with `FormData` containing the dropped CSV/XLSX file (replaces client-side papaparse parsing from P1-6l)
- [ ] **P3-3d** Remove `papaparse` dependency added in Phase 1 if P3-3c replaces it

### P3-4 — Step 5: Remaining fields

- [ ] **P3-4a** Wire all 5 Lead Capture toggle switches → `enablePriceRequest`, `enableCallback`, `enableBrochureDownload`, `whatsappCtaEnabled`, `enableSiteVisit` in `updateProject` call; remove "Coming Soon" tooltip
- [ ] **P3-4b** RERA Verification badge: show "Verified" (green) if `reraVerified === true`, show "Pending" (amber) otherwise; admin toggle button calls `updateProject(projectId, { reraVerified: true/false })`

---

## Dependency Map

```
P0 (UI) ──────► P1 (wire compatible fields)
                      │
                      ▼
               P2 (backend additions)
                      │
                      ▼
               P3 (wire new backend fields)
```

P0 and P2 can be worked in **parallel** by different people.  
P1 requires P0 done.  
P3 requires P1 + P2 both done.

---

## Status Tracking

| Phase | Tasks | Done | Status |
|---|---|---|---|
| Phase 0 — UI Replication | 22 | 22 | ✅ Complete |
| Phase 1 — Wire Compatible | 32 | 0  | 🔴 Not Started |
| Phase 2 — Backend Changes | 11 | 0  | 🔴 Not Started |
| Phase 3 — Wire New Fields | 11 | 0  | 🔴 Not Started |
| **Total** | **76** | **22** | |

---

## Notes

- `bhkType` enum mapping required in frontend: UI shows "1 BHK" but backend stores `"1BHK"` (no space). Map on send, reverse-map on load.
- `listingStatus` label remap: UI "Published" = backend `"active"`. Handle in service layer, not in component.
- Slug auto-generation: slugify `projectName` client-side for Step 5 preview; server also auto-generates if not provided.
- Multi-step edit flow entry point: `/admin/projects/:id/edit` loads project by id, detects current completion and jumps to last incomplete step OR step 1.
- Config floor plan uploads in Step 3 are **per-config saves** (not batched with project save) because each config is a separate document with its own `floorPlans[]`.
