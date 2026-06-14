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
