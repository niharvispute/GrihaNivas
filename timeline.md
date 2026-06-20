# timeline.md — Project / Bulk Unit Registration Feature

Live log of every task done, how it was done, and why decisions were made that way.  
Updated after every piece of work — implementation, debug, error fix, decision change.

---

## Format

```
### [TASK-ID] — Short title
**Date:** YYYY-MM-DD  
**Phase:** P0 / P1 / P2 / P3  
**Status:** done / in-progress / blocked  
**Files changed:** list  

**What was done:**  
**Why this approach:**  
**Gotchas / errors hit:**  
```

---

## Log

---

### [INIT] — Created progress2.md and timeline.md
**Date:** 2026-06-14  
**Phase:** Planning  
**Status:** done  
**Files changed:** `progress2.md`, `timeline.md`

**What was done:**  
Analyzed all 5 UI step HTML mockups against backend models/routes/controllers. Produced a field-level compatibility report. Created progress2.md with 76 atomic tasks across 4 phases.

**Why this approach:**  
Save-on-advance pattern chosen over hold-in-memory because: data survives refresh, Save Draft works trivially at every step, media upload isolated to Step 3, edit flow re-populates from real API without complex state reconstruction.

**Gotchas:**  
- `bhkType` enum mismatch: UI shows "1 BHK" (with space), backend stores `"1BHK"` (no space). Must map on send and reverse-map on load.
- `listingStatus` label mismatch: UI says "Published", backend enum value is `"active"`.
- Gallery maxCount in `upload.js` is 10 but UI supports 20 — needs Phase 2 fix.
- Bulk import endpoint accepts JSON array, but UI expects CSV/XLSX file drop — Phase 1 handles with client-side parse, Phase 3 upgrades to file-based endpoint after Phase 2 adds it.
- `projectType: 'plotting'` not in backend enum — Phase 2 adds it.
- 5 lead capture toggle fields do not exist on Project model — Phase 2 adds them.
- `contactPerson`, `contactPhone`, `pricePerSqft`, `maintenanceCharges`, `reraVerified` — all missing from backend — Phase 2 adds them.

---

### [P0-DIRS] — Created directory structure
**Date:** 2026-06-14  
**Phase:** P0  
**Status:** done  
**Files changed:** directory tree

**What was done:**  
Created all required directories before writing files:
- `frontend/src/app/admin/projects/new/`
- `frontend/src/app/admin/projects/[id]/edit/`
- `frontend/src/components/admin/projects/steps/`
- `frontend/src/context/` (already existed)

**Why this approach:**  
Next.js App Router requires exact folder-per-route structure. `[id]` is the dynamic segment for edit flow.

---

### [P0-2a] — Created ProjectFormContext
**Date:** 2026-06-14  
**Phase:** P0  
**Status:** done  
**Files changed:** `frontend/src/context/ProjectFormContext.jsx`

**What was done:**  
Created React Context that holds the entire wizard state: `projectId`, `currentStep` (1-5), `formData` (per-step slices), `isDirty`. Exposes `goToStep`, `updateFormData`, `setProjectId`.

**Why this approach:**  
Context over URL params for step state because the wizard is a single-page experience — no deep-linking to mid-step. `projectId` IS stored in URL (the page is `/admin/projects/:id/edit`) so refresh stays on correct project. formData is keyed by step number (`step1`, `step2`, etc.) so steps don't clobber each other.

**Gotchas:**  
None at this stage — pure in-memory state, no API calls yet.

---

### [P0-1d] — Added Projects to AdminSidebar
**Date:** 2026-06-14  
**Phase:** P0  
**Status:** done  
**Files changed:** `frontend/src/components/layout/AdminSidebar.jsx`

**What was done:**  
Added `{ name: 'Projects', icon: 'domain', href: '/admin/projects' }` after Properties in the menuItems array.

**Why this approach:**  
`domain` Material Symbol icon represents a building/project. Positioned after Properties because Projects is the new bulk property system — conceptually adjacent. Sidebar uses `pathname.startsWith(item.href + '/')` for active detection, so all sub-routes (`/new`, `/:id/edit`) auto-highlight the nav item.

---

### [P0-1a/b/c] — Created admin project pages
**Date:** 2026-06-14  
**Phase:** P0  
**Status:** done  
**Files changed:**  
- `frontend/src/app/admin/projects/page.js`
- `frontend/src/app/admin/projects/new/page.js`
- `frontend/src/app/admin/projects/[id]/edit/page.js`

**What was done:**  
- List page: static table showing placeholder rows, Add Project button linking to `/admin/projects/new`, filter bar (search + status filter) wired to UI state only (no API yet).
- New page: mounts `ProjectFormProvider` wrapping `ProjectFormWizard`. No `projectId` pre-set.
- Edit page: reads `params.id`, sets it as initial `projectId` in context, mounts same `ProjectFormWizard`.

**Why this approach:**  
New and Edit use identical `ProjectFormWizard` component — the wizard reads `projectId` from context to decide create vs update. This avoids duplicating step components. Edit page passes `initialProjectId` prop to the provider.

---

### [P0-1d/P0-3a/P0-3b] — Created WizardSidebar, WizardFooter, ProjectFormWizard
**Date:** 2026-06-14  
**Phase:** P0  
**Status:** done  
**Files changed:**  
- `frontend/src/components/admin/projects/WizardSidebar.jsx`
- `frontend/src/components/admin/projects/WizardFooter.jsx`
- `frontend/src/components/admin/projects/ProjectFormWizard.jsx`

**What was done:**  
- `WizardSidebar`: left panel (w-72), dark background (`bg-slate-900`), shows 5 steps with circle indicators (filled maroon = done, maroon ring = current, gray = upcoming), progress % bar, support box at bottom.
- `WizardFooter`: sticky bottom bar with Back (outline), Save Draft (outline), Next Phase (filled primary) buttons. Receives `isLoading`, `onBack`, `onSaveDraft`, `onNext` props. Hides Back on step 1, changes Next label to "Publish" on step 5.
- `ProjectFormWizard`: layout wrapper — WizardSidebar on left, scrollable content area on right, WizardFooter fixed at bottom. Renders correct step component based on `currentStep`. Step advance/back handled here, then delegated to context.

**Why this approach:**  
Sticky footer pattern matches HTML mockup exactly. WizardFooter is dumb (no business logic) — all step navigation logic lives in ProjectFormWizard which has the context. This way steps don't need to know about navigation.

---

### [P0-4a] — Created Step1BasicInfo
**Date:** 2026-06-14  
**Phase:** P0  
**Status:** done  
**Files changed:** `frontend/src/components/admin/projects/steps/Step1BasicInfo.jsx`

**What was done:**  
Full Step 1 form: Listing Mode toggle, Listing Type pills, 2-col details grid (Name, Builder, Contact Person, Contact Number, RERA Number, RERA URL), Project Type pills (incl. Plotting), Project Status pills, Configurations multi-select pills. All state stored in `formData.step1` via context. Builder dropdown has static placeholder options — wired to API in Phase 1.

**Why this approach:**  
Listing Mode and Listing Type are UI-only fields in Phase 0 (not sent to backend) — stored in formData but clearly commented as routing hints. Plotting included from start even though backend doesn't have it yet — the enum guard will just fail gracefully when hit in Phase 1; Phase 2 adds it to backend.

---

### [P0-5a/P0-5b] — Created Step2LocationConfig + ConfigSidePanel
**Date:** 2026-06-14  
**Phase:** P0  
**Status:** done  
**Files changed:**  
- `frontend/src/components/admin/projects/steps/Step2LocationConfig.jsx`
- `frontend/src/components/admin/projects/ConfigSidePanel.jsx`

**What was done:**  
Step 2: Location form (6 fields), Map placeholder div, Project Scale 4-number-input row, BHK Config cards list (renders from `formData.step2.configurations`), Add Configuration dashed button.  
ConfigSidePanel: slide-in from right (translate-x animation), BHK Type select, Config Title, Carpet Area Min/Max, Bathrooms/Balconies/Parking selects, Available Units input, Save/Cancel buttons. Panel open/close state lives in Step2.

**Why this approach:**  
Config side panel state (open/close, editing config index) is local to Step2 — not in global context — because it's transient UI state, not persisted form data. Configurations array IS in context (`formData.step2.configurations`) so data persists across step navigation.

**Gotchas:**  
BHK Type select values use backend enum format (`1BHK`, `2BHK`) from the start — label displays "1 BHK" but value is `"1BHK"`. Avoids a mapping step later.

---

### [P0-6a/P0-6b] — Created Step3MediaDocs + FileUploadZone
**Date:** 2026-06-14  
**Phase:** P0  
**Status:** done  
**Files changed:**  
- `frontend/src/components/admin/projects/FileUploadZone.jsx`
- `frontend/src/components/admin/projects/steps/Step3MediaDocs.jsx`

**What was done:**  
`FileUploadZone`: reusable drag-drop component. Props: `accept`, `maxSizeMB`, `multiple`, `onFilesChange`, `label`, `hint`, `previewUrls`, `onRemove`. Shows file preview with delete X. Validates size client-side, shows inline error. Uses `URL.createObjectURL` for previews.  
Step 3: Hero Image zone, Gallery grid (20-slot), Master Plan zone, Brochure zone, Video URL input, Config Floor Plans section with BHK tab switcher.

**Why this approach:**  
`FileUploadZone` is generic — reused 5+ times in Step 3 alone. Preview via `createObjectURL` is immediate and doesn't hit network — actual upload deferred to "Next Phase" click (Phase 1 implementation). Tab switcher in floor plans reads `formData.step1.configurations` to know which tabs to show — cross-step data read.

**Gotchas:**  
Floor plan tabs depend on Step 1 configurations being set. If user skips Step 1 configs, Step 3 shows an empty tab area. Added a fallback "No configurations added yet — go back to Step 2" message.

---

### [P0-7a/P0-7b/P0-7c] — Created Step4PricingInventory + UnitFormModal + BulkImportPanel
**Date:** 2026-06-14  
**Phase:** P0  
**Status:** done  
**Files changed:**  
- `frontend/src/components/admin/projects/UnitFormModal.jsx`
- `frontend/src/components/admin/projects/BulkImportPanel.jsx`
- `frontend/src/components/admin/projects/steps/Step4PricingInventory.jsx`

**What was done:**  
`UnitFormModal`: modal overlay, form for single unit (Tower, Floor, Unit No., Configuration select, Carpet Area, Facing select, Price, Status select), Save/Cancel buttons.  
`BulkImportPanel`: drag-drop zone for CSV/XLSX (file validation only, no parse yet), Download Template button (Phase 1 adds real template), Preview Import button, Validation Summary cards (Ready/Duplicates/Errors).  
Step 4: Price Summary (4 inputs), Config Pricing cards (from step2 configs), Inventory table (static rows for now), filter bar, Add Unit button, Download button, Bulk Import section at bottom.

**Why this approach:**  
Inventory table shows static placeholder rows in Phase 0 — real data wired in Phase 1 (P1-6a). `UnitFormModal` is a portal-less overlay (fixed inset-0) — same pattern as other admin modals in codebase.

**Gotchas:**  
Config Pricing cards cross-read from `formData.step2.configurations`. If Step 2 was skipped, cards array is empty — added "No configurations — complete Step 2 first" fallback.

---

### [P0-8a] — Created Step5ReviewPublish
**Date:** 2026-06-14  
**Phase:** P0  
**Status:** done  
**Files changed:** `frontend/src/components/admin/projects/steps/Step5ReviewPublish.jsx`

**What was done:**  
Step 5: Top bar (completion %, Listing Status select, RERA badge), Project Overview section (reads from all form data slices), Media Review grid, Configuration Summary table, Inventory Summary stat cards, Lead Capture 5 toggles (non-functional, "Coming Soon" tooltip), SEO section (Google preview box, SEO Title/Desc/Slug inputs with char counters).

**Why this approach:**  
Review step reads from ALL formData slices (`step1`, `step2`, `step3`, `step4`) to render the summary — this is the only cross-step reader. SEO slug auto-derives from `formData.step1.projectName` if not manually set. Lead capture toggles stored in `formData.step5.leadCapture` object — wired to backend in Phase 3.

**Gotchas:**  
Char counter for SEO fields uses `value.length` with color feedback: green < 80% limit, amber 80-100%, red over limit. Google preview box truncates title at 60 chars and description at 155 chars with ellipsis — matches real Google behavior.

---

### [BUG-P0-01] — useState inside .map() in Step4 ConfigPricingCard
**Date:** 2026-06-14  
**Phase:** P0  
**Status:** done  
**Files changed:** `frontend/src/components/admin/projects/steps/Step4PricingInventory.jsx`

**What was done:**  
Initial write had `const [editMode, setEditMode] = useState(false)` inside `configs.map()`. React forbids hooks inside loops. Extracted into a named `ConfigPricingCard` sub-component defined at module level, then called it from the map.

**Why this approach:**  
Rules of Hooks — hooks must be called at top level of a React function, not inside callbacks or loops. Sub-component extraction is the correct pattern — each `ConfigPricingCard` instance gets its own isolated `editMode` state.

---

### [BUG-P0-02] — setState during render in ConfigSidePanel re-sync
**Date:** 2026-06-14  
**Phase:** P0  
**Status:** done  
**Files changed:** `frontend/src/components/admin/projects/ConfigSidePanel.jsx`

**What was done:**  
Initial write had a direct `if (editingConfig && ...) setLocal(...)` during render body — triggers React warning and potential infinite re-render loop. Moved to `useEffect` with `[editingConfig?._tempId]` dependency. Added `useEffect` to import.

**Why this approach:**  
Side effects and state updates must go in `useEffect`. The `?._tempId` optional chain avoids crashing when `editingConfig` is null (add mode vs edit mode).

---

### [BUG-P0-03] — Server/Client boundary on page files
**Date:** 2026-06-14  
**Phase:** P0  
**Status:** done  
**Files changed:** `frontend/src/app/admin/projects/new/page.js`, `frontend/src/app/admin/projects/[id]/edit/page.js`

**What was done:**  
Pages importing client-only Context providers cannot use `export const metadata` (server-only). Added `'use client'` directive and removed metadata export. Edit page uses `use(params)` from React 19 to unwrap the async params Promise (Next.js 15 App Router requirement for dynamic route params in client components).

**Why this approach:**  
Next.js 15 + React 19: `params` is a Promise in dynamic routes — must be unwrapped with `use()` in client components or `await` in async server components.

---

### [P1-1a] — Created projectService.js
**Date:** 2026-06-14  
**Phase:** P1  
**Status:** done  
**Files changed:** `frontend/src/services/projectService.js`

**What was done:**  
Created the full admin project service using the codebase's existing `authedApiFetch` (token-refresh-aware) and `downloadAuthedFile` helpers. Functions: project CRUD (`adminListProjects`, `getProjectById`, `createProject`, `updateProject`, `deleteProject`, `setProjectStatus`, `toggleFeatured`), configuration CRUD (`createConfiguration`, `updateConfiguration`, `deleteConfiguration`, `listConfigurations`), unit CRUD (`listUnits`, `createUnit`, `updateUnit`, `deleteUnit`, `bulkImportUnits`, `exportUnits`). Added label↔enum mapping helpers: `toBackendListingStatus`/`toListingStatusLabel` (Published↔active) and `toBackendBhkType`/`toBhkLabel` ("1 BHK"↔"1BHK").

**Why this approach:**  
Mirrored `builderService.js` exactly so the new service is idiomatic. All admin project routes live under `/api/projects` (e.g. list = `/api/projects/admin`), NOT `/api/admin/projects` — confirmed against `backend/routes/projects.js`. FormData bodies are auto-detected by the shared `apiFetch` client (no manual Content-Type), so multipart create/update "just works."

**Gotchas:**  
- `bulkImportUnits` body must be `{ units: [...] }` (verified against `schemas.project.bulkImportUnits`), not a bare array.
- listingStatus remap lives in the service layer per the architecture note, so components never deal with "active" vs "Published".

---

### [P1-2] — Wired admin Projects list page
**Date:** 2026-06-14  
**Phase:** P1  
**Status:** done  
**Files changed:** `frontend/src/app/admin/projects/page.js`

**What was done:**  
Replaced placeholder rows with live `adminListProjects()` data. Added: loading skeleton + error banner with Retry; debounced search (300ms) + listingStatus filter via query params; inline listing-status `<select>` per row calling `setProjectStatus`; star button calling `toggleFeatured`; 3-dot menu Delete with a confirmation modal calling `deleteProject`. Builder name resolved from populated `builderId.name`.

**Why this approach:**  
Debounce avoids a request per keystroke. Status is an inline select (not a separate dialog) because the list already shows the badge — turning the badge into a control is the least-friction UX. Delete uses a modal because it cascades to configs + units.

**Gotchas:**  
The backend `adminList` populates `builderId` with `{name,slug,logo,isActive}`, so `row.builderId` is an object, not a string — handled with a `builderName()` helper.

---

### [P1-3..P1-7 orchestration] — Wizard turned into the save-on-advance orchestrator
**Date:** 2026-06-14  
**Phase:** P1  
**Status:** done  
**Files changed:** `frontend/src/components/admin/projects/ProjectFormWizard.jsx`

**What was done:**  
Rewrote `ProjectFormWizard` from a dumb step-switcher into the orchestrator that owns all project-level persistence, reading slices from `ProjectFormContext`:
- **Edit hydration** (P1-3d/4e/5d/6a/7a): on entry, if `projectId` is set and the form is empty, calls `getProjectById` + `listUnits`, maps the backend doc into all 5 formData slices via `mapProjectToFormData`, then clears `isDirty`.
- **`saveCurrentStep()`** dispatches per step: Step 1 `createProject` (or update); Step 2 `updateProject` (location+scale) + `syncConfigurations`; Step 3 multipart `updateProject` (hero/gallery/masterPlan/brochure/videoUrl); Step 4 `updateProject` (priceMin/Max) + per-config pricing updates; Step 5 `updateProject` (SEO+slug).
- **`handleNext`** saves then advances; on Step 5 it saves then calls `setProjectStatus`. **`handleSaveDraft`** saves the current step + forces `listingStatus: draft`. Inline error banner + "Loading project…" state.

**Why this approach:**  
Centralizing persistence in the wizard keeps step components presentational (they only read/write context). Config persistence is **batched on Step 2 "Next"** rather than per-keystroke real-time (a deviation from the literal P1-4b wording) — simpler, fewer requests, and still survives refresh because Step 1 already created the project.

**Gotchas / decisions:**  
- Project is created on **Step 1 → Next**, but the backend requires `location.area` at create and area isn't collected until Step 2 → send the project **name as a placeholder area**, overwritten on Step 2. Logged as backend blocker #2.
- `updateProject` with a plain object sends JSON to the multipart route; multer ignores non-multipart bodies and `express.json` parses it, so nested `location` works. Multipart FormData is only built for Step 3 media.
- Step 3 update is skipped entirely when there are no new files and no videoUrl, to avoid the backend "at least one field" rejection.

---

### [P1-3a/d] — Step 1 builder dropdown + edit prefill
**Date:** 2026-06-14  
**Phase:** P1  
**Status:** done  
**Files changed:** `frontend/src/components/admin/projects/steps/Step1BasicInfo.jsx`

**What was done:**  
Replaced static builder options with a `listAdminBuilders({limit:200})` fetch on mount. Selecting a builder stores both `builderId` and `builderName` (for the Step 5 review label). Builder fetch errors shown inline.

**Why this approach:**  
Used `listAdminBuilders` (raw `{_id,name}` docs) rather than the public `listBuilders` (card view-models) so the option values are real ObjectIds the backend accepts directly.

---

### [P1-4b/c/d/e] — Step 2 configuration CRUD
**Date:** 2026-06-14  
**Phase:** P1  
**Status:** done  
**Files changed:**  
- `frontend/src/components/admin/projects/steps/Step2LocationConfig.jsx`
- `frontend/src/components/admin/projects/ConfigSidePanel.jsx`

**What was done:**  
Configs now carry a backend `_id` once persisted (alongside the legacy `_tempId` for unsaved ones); introduced a `cfgKey()` helper used everywhere as the React key and pricing-map key. Delete hits `deleteConfiguration` immediately for persisted configs (with busy state + error), and just drops local state for unsaved ones. ConfigSidePanel's re-sync effect and header now key off `_id || _tempId`. BHK enum values were already stored backend-style ("1BHK") from Phase 0, so P1-4d needed no mapping.

**Why this approach:**  
Keeping configs in context and batch-creating them on Step 2 "Next" (in the wizard's `syncConfigurations`) means the side panel stays a pure local editor. Create sends `priceMin:0/priceMax:0` because the backend marks them required even though pricing is a Step 4 concern (backend blocker #3).

---

### [P1-6] — Step 4 unit inventory wired to API
**Date:** 2026-06-14  
**Phase:** P1  
**Status:** done (degraded by backend blocker #4)  
**Files changed:**  
- `frontend/src/components/admin/projects/steps/Step4PricingInventory.jsx`
- `frontend/src/components/admin/projects/UnitFormModal.jsx`

**What was done:**  
Removed placeholder units. Units load via `listUnits` on mount and on any filter change (Tower / Configuration / Status — server-side filtering). Added a Configuration filter dropdown. Add/Edit call `createUnit`/`updateUnit`; delete calls `deleteUnit`; all refresh the table. Download button calls `exportUnits` (xlsx via `downloadAuthedFile`). The unit row's config column resolves the label from `configurationId` against the loaded configs. `UnitFormModal` got a re-sync `useEffect` (it previously initialized state only once, so editing a 2nd unit showed stale data) and normalizes a populated `configurationId` object back to its `_id`.

**Why this approach:**  
Server-side filtering matches `listUnits` query params, so the table always reflects the DB. `listUnits` failures are surfaced as a soft amber notice rather than a hard error because GET units currently 404s for draft projects (backend blocker #4) — the rest of Step 4 stays usable.

---

### [P1-6j/k/l] — Bulk import (CSV) + template
**Date:** 2026-06-14  
**Phase:** P1  
**Status:** done  
**Files changed:**  
- `frontend/src/components/admin/projects/BulkImportPanel.jsx`
- `frontend/public/templates/unit-import-template.csv`

**What was done:**  
BulkImportPanel now parses dropped **CSV** client-side with a small built-in quoted-CSV parser (no papaparse dependency added), maps rows to the unit schema (`configurationId,tower,block,floor,unitNumber,carpetArea,builtupArea,facing,viewType,price,status,notes`), coerces numeric columns, collects per-row validation errors, then calls `bulkImportUnits(projectId, units)` and shows Inserted/Failed + an error list. Created the downloadable template CSV. XLSX shows a "comes in Phase 3" notice (the dedicated file-upload endpoint, P3-3c).

**Why this approach:**  
Avoided adding `papaparse` — a tiny hand-rolled parser covers the template format and keeps the dependency surface clean. XLSX genuinely needs a library, so it's correctly deferred to the Phase 3 server-side endpoint rather than bundling a parser now.

---

### [P1-7a] — Step 5 live inventory counts
**Date:** 2026-06-14  
**Phase:** P1  
**Status:** done  
**Files changed:** `frontend/src/components/admin/projects/steps/Step5ReviewPublish.jsx`

**What was done:**  
Inventory Summary stat cards (Total/Available/Hold/Booked/Sold) now compute from the loaded `step4.units` instead of showing "—". Publish/Save-Draft/Edit-nav were already handled by the wizard footer + `goToStep`.

---

### [FIX-B1+B4] — Fixed critical backend blockers: createdBy + admin units access
**Date:** 2026-06-14  
**Phase:** P1 → backend fixes  
**Status:** done  
**Files changed:**  
- `backend/controllers/adminProjectController.js`  
- `backend/controllers/projectController.js`  
- `backend/middleware/validate.js`

**What was done:**  
Three backend fixes applied:

1. **Blocker #1 — `createdBy` missing** (`adminProjectController.create`): After `const data = { ...req.body }`, added `data.createdBy = req.user._id;`. Without this, the Mongoose `Project.create()` call always failed with a required-field validation error (`createdBy: required: true`), making project creation impossible.

2. **Blocker #4 — admin units blocked for draft projects** (`projectController.getUnits`): Changed the project lookup from `findOne({ _id: id, listingStatus: 'active' })` to check `req.user?.role === 'admin'` first — admins bypass the `listingStatus: 'active'` filter. The admin role check for returning all unit statuses (not just `available`) was already there at line 204; the project-lookup check was the missing piece. The `optionalAuth` middleware on the route ensures `req.user` is populated when the admin sends their JWT.

3. **Silent bug — slug stripped by Zod** (`validate.js` `project.update` schema): The `slug` field was absent from the update schema, so Zod was stripping it before it reached the controller. The controller already had the logic to handle `updates.slug` (unique-check + save) — adding `slug: z.string().trim().min(2).max(250).optional()` to the schema connects it. Without this, Step 5's manual slug edits were silently ignored.

**Why this approach:**  
- Minimal, surgical patches — no schema migrations, no new routes, no middleware changes beyond a schema field addition.
- Admin units fix uses `optionalAuth`'s existing `req.user` rather than adding a new protected admin-only route, which would require client service changes.
- Kept blockers #2 (`location.area`) and #3 (`priceMin`/`priceMax`) as frontend-workaround-only: #2 uses project name as placeholder (always non-empty), #3 sends `0` (valid for `min: 0` validator). Backend still enforces the right invariants for production data.

**Gotchas:**  
- `optionalAuth` in `routes/projects.js` on `GET /:id/units` is the key enabler for the admin check — if ever removed, the units route would stop working for draft projects again.
- Blocker #2 (`location.area` required in Zod create schema) still holds — the frontend workaround (project name as placeholder area) must stay in `ProjectFormWizard.saveCurrentStep` Step 1 branch.

---

### [BLOCKERS-P1] — Backend gaps that stop Phase 1 working end-to-end
**Date:** 2026-06-14  
**Phase:** P1 → needs P2  
**Status:** flagged (not fixed — backend is "Vishal half done", avoiding conflicts)

**What was found (full detail mirrored in progress2.md status section):**  
1. `adminProjectController.create` never sets `createdBy` (required on model) → create likely 500s. One-line fix: `data.createdBy = req.user._id`.
2. `create` requires `location.area`; not known until Step 2. Worked around with placeholder; cleaner = make area optional for drafts.
3. Configuration create requires `priceMin`/`priceMax`; not known until Step 4. Worked around with `0`; cleaner = optional for drafts.
4. `GET /:id/units` (public controller) requires `listingStatus: 'active'` → admins can't list units for a draft → wizard inventory degraded. Fix = admin units endpoint or relax active-check for admins.

**Why not fixed here:**  
Backend is mid-refactor by another dev; these are Phase-2-shaped changes. Frontend is wired to the documented contract and will work once the backend lands the fixes. Flagged rather than silently patched to avoid merge conflicts.

**Verification:**  
`npx eslint` on all changed files → 0 errors (only pre-existing setState-in-effect / unescaped-quote warnings).

---

### [P2-1/P2-2] — Project model + Zod schema additions
**Date:** 2026-06-15  
**Phase:** P2  
**Status:** done  
**Files changed:** `backend/models/mongoose/Project.js`, `backend/middleware/validate.js`

**What was done:**  
Added 10 new fields to the Project Mongoose model: `contactPerson`, `contactPhone`, `pricePerSqft`, `maintenanceCharges`, `reraVerified`, and 5 lead capture Boolean toggles (`enablePriceRequest`, `enableCallback`, `enableBrochureDownload`, `whatsappCtaEnabled`, `enableSiteVisit`). Added `'plotting'` to the `projectType` enum.

Extended all three Zod schemas (`create`, `update`, `list`) to accept the new fields. Boolean model fields use a `stringBooleanSchema` helper (already present in validate.js) that coerces `'true'`/`'false'` strings from multipart FormData to real booleans. Added `removeGalleryIds: z.preprocess(parseJsonIfString, z.array(z.string()).max(20)).optional()` to the update schema.

**Why this approach:**  
Zod `safeParse` strips unknown fields — every new model field must be explicitly listed in the schema or it is silently dropped before reaching the controller. `stringBooleanSchema` is required because FormData can only carry strings, so boolean toggles arrive as `"true"`/`"false"` text.

**Gotchas / errors hit:**  
- First Edit attempt on validate.js accidentally targeted the `list` schema's `projectType` line instead of the `update` schema's — identical indentation pattern. Fixed by using a longer anchor string unique to the `update` block.
- The `projectType` enum needed updating in all three schemas (`create`, `update`, `list`) independently — one missed schema would cause filter/create to reject the `'plotting'` value.

---

### [P2-3/P2-4] — Upload middleware + XLSX bulk import endpoint
**Date:** 2026-06-15  
**Phase:** P2  
**Status:** done  
**Files changed:** `backend/middleware/upload.js`, `backend/controllers/adminProjectController.js`, `backend/routes/projects.js`

**What was done:**  
- Changed gallery `maxCount: 10 → 20` and `files: 13 → 23` in `projectUploadFields` to match the UI's 20-image cap.
- Added `csvXlsxFilter` (mime-type allowlist for CSV and XLSX) and `bulkImportUpload` (memoryStorage, 5MB, `.single('file')`) to upload.js; exported both.
- Added `bulkImportUnitsFromFile` controller: reads `req.file.buffer` via `XLSX.read(..., { type: 'buffer' })` + `sheet_to_json()`, maps both camelCase and Title Case column name variants, validates that `configurationId` values belong to the project, then runs the same `insertMany` partial-success pattern as the JSON endpoint.
- Added `POST /:id/bulk-import-file` route protected by `protect` + `adminOnly` + `bulkImportUpload` + param validation.

**Why this approach:**  
Used `xlsx` package (already in ecosystem) with `memoryStorage` so the buffer is available in-memory without writing temp files. The partial-success `insertMany` (with `ordered: false`) is consistent with the existing JSON bulk import — same returned shape (`{ inserted, failed, errors[] }`), same client-side display logic.

**Gotchas / errors hit:**  
Column name mapping handles both `configurationId` and `Configuration Id` (Title Case with spaces) because Excel downloads often reformat headers. Without this, re-importing an exported template would silently drop the config reference.

---

### [P2-5] — Admin controller: new fields passthrough confirmation
**Date:** 2026-06-15  
**Phase:** P2  
**Status:** done  
**Files changed:** `backend/controllers/adminProjectController.js` (gallery merge logic only)

**What was done:**  
Confirmed that both `create` and `update` controllers already spread `{ ...req.body }` into `data`, so all 10 new Zod-allowed fields pass through automatically — no code change needed for the fields themselves.

Restructured the `update` function's gallery handling: `removeGalleryIds` is extracted from `updates` before the Mongoose call (it is not a model field). Two cases handled:
1. **With new file uploads**: filter existing gallery by removing publicIds in the removal set, append new uploads, update `updates.gallery`. Delete removed files from Cloudinary fire-and-forget.
2. **Without new uploads but with removals**: same filter, no merge needed. Cloudinary delete still runs.

**Why this approach:**  
Without extracting `removeGalleryIds` first, Mongoose would either ignore it (unknown field, schema `strict: true`) or error, and the Cloudinary deletion would never run. Separating the two code paths (with-files and without-files) keeps the existing media upload logic intact while adding the removal side-channel.

---

### [P1-5e + P1-5b] — Gallery deletion + per-config floor plan uploads (deferred tasks)
**Date:** 2026-06-15  
**Phase:** P1 (deferred) → completed alongside P2/P3  
**Status:** done  
**Files changed:**  
- `frontend/src/context/ProjectFormContext.jsx`
- `frontend/src/components/admin/projects/steps/Step3MediaDocs.jsx`
- `frontend/src/components/admin/projects/ProjectFormWizard.jsx`

**What was done:**  

**P1-5e (gallery deletion):**  
Added `removedGalleryPublicIds: []` to `step3` initial state in `ProjectFormContext.jsx`. Updated `removeGallery` in `Step3MediaDocs.jsx` to batch both the updated gallery array and the queued publicId in a single `updateFormData('step3', patch)` call (atomic update, avoids state divergence). In `ProjectFormWizard.jsx` Step 3 save block: `JSON.stringify`s the array into a `removeGalleryIds` FormData field; clears the queue in context after the backend confirms (`updateFormData('step3', { removedGalleryPublicIds: [] })`).

**P1-5b (per-config floor plan uploads):**  
After the project-level media update in Step 3, loops over `s3.configFloorPlans` entries, filters to only `File` objects (skips already-uploaded URLs), finds the matching config by `bhkType`, builds a `FormData` with `floorPlans` files and a `sortOrder` body field, and calls `updateConfiguration(cfg._id, cfgFd)` for each config that has new files.

**Why this approach:**  
Per-config floor plans are uploaded on Step 3 "Next" (batched), not on each file select, consistent with the save-on-advance pattern. The `sortOrder` field is always included because `configurationUpdate` Zod schema has a `.refine(obj => Object.keys(obj).length > 0)` guard — if only files are sent (body is empty), Zod rejects the request. `sortOrder` is a valid schema field and makes the body non-empty.

**Gotchas / errors hit:**  
The Zod `.refine` guard on `configurationUpdate` was the blocker for P1-5b being deferred. Without appending at least one body field alongside the files, the update route returns 400 "body required". `sortOrder` was chosen because it exists on the schema with no side effects when repeated.

---

### [P3-1..P3-4] — Frontend wiring for all Phase 2 backend fields
**Date:** 2026-06-15  
**Phase:** P3  
**Status:** done  
**Files changed:**  
- `frontend/src/components/admin/projects/ProjectFormWizard.jsx`
- `frontend/src/components/admin/projects/steps/Step5ReviewPublish.jsx`
- `frontend/src/components/admin/projects/BulkImportPanel.jsx`
- `frontend/src/services/projectService.js`

**What was done:**  

**P3-1 (Step 1 — contactPerson / contactPhone):** Added both fields to the `base` payload in the Step 1 branch of `saveCurrentStep`. Added to `mapProjectToFormData`'s `step1` slice for edit-flow hydration.

**P3-3a/b (Step 4 — pricePerSqft / maintenanceCharges):** Added `pricePerSqft: numOrUndef(s4.pricePerSqft)` and `maintenanceCharges: s4.maintenanceCharges || undefined` to the Step 4 `updateProject` call. Already mapped in `mapProjectToFormData`.

**P3-3c/d (Step 4 — file-based bulk import):** Rewrote `BulkImportPanel.jsx` end-to-end: removed the ~70-line inline CSV parser, removed the `bulkImportUnits` (JSON) import, added `bulkImportUnitsFromFile` import. The component now sends the raw file to `POST /api/projects/:id/bulk-import-file`; the backend handles both CSV and XLSX parsing. Added `bulkImportUnitsFromFile` to `projectService.js`.

**P3-4a (Step 5 — lead capture toggles):** All 5 toggles wired in Step 5 `saveCurrentStep`. `mapProjectToFormData` now hydrates the full `leadCapture` object from backend data. Removed all "Wired in Phase 3" badge spans from `Step5ReviewPublish.jsx`.

**P3-4b (Step 5 — reraVerified):** Added `reraVerified: s5.reraVerified` to Step 5 save. Added "Mark Verified / Mark Pending" toggle button in `Step5ReviewPublish.jsx` next to the RERA badge. Removed "(wired in Phase 3)" annotation.

**Why this approach:**  
BulkImportPanel rewrite is a pure replacement — same UI surface (drag-drop, file name, Import button, results cards, error list), different internals. The file goes straight to the backend rather than being parsed client-side, which handles XLSX correctly without bundling a browser-side spreadsheet parser.

**Gotchas:**  
None — all Phase 2 backend fields follow the same spread-based passthrough pattern, so wiring them is mechanical once the Zod schemas accept them.

---
