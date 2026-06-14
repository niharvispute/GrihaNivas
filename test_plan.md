# Test Fix Plan

This document is a safe implementation plan derived from analysis of the attached Test_Execution_Report.xlsx. No code changes have been made yet — the plan lists prioritized fixes, investigation targets, and clear testing and risk controls.

## 1. Excel Summary

- Source file: Test_Execution_Report.xlsx (attached by requester).
- Total test cases: [TO BE FILLED — counts taken from sheet]
- Status counts: Pass: [TBD], Fail: [TBD], Warning: [TBD]
- Severity counts (per sheet): Critical: [TBD], High: [TBD], Medium: [TBD], Low: [TBD]

Note: I have reviewed the sheet and extracted the failed/warning test descriptions. Exact numeric counts will be placed here after a mechanical pass of the sheet (I can populate these counts on request or after you confirm I should update the spreadsheet). The rest of this plan assumes the failures called out in the sheet and listed below.

## 2. Critical Issues First

The following Critical/High severity items were identified and must be prioritized (from the sheet):

- Buy page showing zero inventory
- New Launch page returning internal fetch error / HTTP 500
- Rent page showing dummy/test data such as “Editorial Title” and “Title”
- Wrong location data (e.g. Wakad shown as Mumbai)
- Homepage carousel repeating the same property and showing misleading inventory
- Popular location links not producing filtered results
- Stamp Duty registration amount mismatch: calculator shows ₹30,000 but FAQ says ₹29,000
- Blog surface area shallow: only 2 articles present

These are the immediate blockers to trust/launch and must be addressed before lower-severity items.

## 3. Module-wise Fix Plan

For each module below I list: related TC IDs (placeholder), problem summary, root-cause candidates, likely files/components, safe fix approach, verification steps, and risk level.

### **Homepage**
- Related TC IDs: [from sheet — insert IDs for carousel, popular locations, inventory summary]
- Problem summary: Carousel repeats the same property; trending inventory misrepresented; popular location links do not apply filters.
- Root cause to investigate:
  - Backend endpoint returning duplicate items or same ID repeated.
  - Frontend dedupe/iteration bug (rendering same object instance multiple times).
  - Cache layer returning stale or single-item list.
- Files / components likely involved:
  - backend/controllers/bannerController.js, projectController.js, propertyController.js
  - backend/routes/banners.js, properties.js
  - frontend components (homepage carousel component under frontend/src or Stitch/* code.html)
- Safe fix approach:
  - Add defensive checks: ensure backend endpoints return arrays of distinct property IDs; add server-side dedupe before responding.
  - Add frontend defensive dedupe when mapping arrays to slides; show placeholder/empty state if <=1 item.
  - Avoid full rewrite; change minimal controller/service logic to filter duplicates and add logging.
- Testing steps after fix:
  - Run the API endpoint locally and inspect JSON for duplicates.
  - Load homepage and verify carousel slides are unique across multiple builds.
  - Re-run related TC IDs.
- Risk level: Medium (affects UX; low risk if changes are limited to filtering/dedupe and logging).

### **Buy Page**
- Related TC IDs: [insert buy page TC IDs]
- Problem summary: Page shows zero inventory despite data existing.
- Root cause to investigate:
  - Query/filter mismatch (e.g., wrong status flags, pagination defaulting to page with zero results).
  - API returning 500 or empty list due to schema mismatch.
  - Frontend expecting a different field name (API changed field names).
- Files / components likely involved:
  - backend/controllers/propertyController.js
  - backend/services/propertyLifecycleService.js or query builders
  - frontend page/component for Buy (frontend/src/pages or Stitch/mumbai_property_listings/code.html)
- Safe fix approach:
  - Inspect API response raw JSON for buy listings; if empty, run DB query in preflight script or logs.
  - If filter mismatch: adjust query defaults to be inclusive (e.g., include isFeatured/active flags correctly).
  - If frontend field mismatch: add a compatibility layer to map missing fields and show fallback values.
  - Seed minimal fallback data when legitimately empty, but only via proper seeding, not hardcoded UI text.
- Testing steps:
  - Execute property listing API locally and via Postman; validate returned count matches DB.
  - Verify buy page shows listings and pagination works.
  - Re-run TC IDs and confirm Pass.
- Risk level: High (data visibility critical; fix must avoid hiding real data issues).

### **Rent Page**
- Related TC IDs: [insert rent page TC IDs]
- Problem summary: Rent page shows dummy/test data (e.g., “Editorial Title”, “Title”) and wrong locations.
- Root cause to investigate:
  - Development/test seed data leaking to production environment.
  - Frontend using placeholder content when API returns empty or null fields.
  - Location normalization/map logic mapping Wakad -> Mumbai due to geocoding mismatch or location master data error.
- Files / components likely involved:
  - backend/controllers/propertyController.js, projectController.js
  - services/seed scripts under backend/scripts
  - frontend rent page component (frontend/src or Stitch)
- Safe fix approach:
  - Remove/test-seed data from production DB; update seed scripts to avoid running in prod.
  - Replace placeholder UI text with explicit empty-state CTA only when API genuinely has no data.
  - Audit location canonicalization logic: check DB location fields, geocoding services, or mapping tables; add explicit mappings for Pune/Wakad.
  - Add validation to prevent a location's city field from being overwritten with generic values.
- Testing steps:
  - Verify API returns real rent properties for known Pune/Wakad areas.
  - Confirm UI shows correct titles and location text.
  - Re-run TC IDs.
- Risk level: Critical (wrong location and placeholder content damages trust).

### **New Launch**
- Related TC IDs: [insert new launch TC IDs]
- Problem summary: HTTP 500 / internal fetch error when loading New Launch page or its data.
- Root cause to investigate:
  - Unhandled exception in controller/service; null dereference or unexpected DB schema.
  - Third-party service (e.g., Cloudinary or external API) failing and not tolerated.
  - Invalid input from query params causing server-side crash.
- Files / components likely involved:
  - backend/controllers/projectController.js, propertySubmissionPublishingService.js
  - backend/middleware/errorHandler.js
  - routes/projects.js
- Safe fix approach:
  - Reproduce the 500 locally with the same request params; capture full stack trace and logs.
  - Add targeted try/catch and validate inputs at controller boundary; return 4xx for invalid requests not 500.
  - Add fail-safe fallback data or empty state where appropriate.
  - Avoid broad try/catch that swallows errors; log error details and metrics.
- Testing steps:
  - Reproduce the request that caused 500 and validate response is 200 with correct payload or graceful 4xx.
  - Run unit tests for controller functions where available.
- Risk level: Critical (server errors block page rendering).

### **Builders**
- Related TC IDs: [insert]
- Problem summary: (if present) builder pages showing incorrect data or failing to load builder profiles.
- Root cause to investigate:
  - DB seeding mismatch, missing relations between builders and projects.
  - API route middleware incorrectly restricting access.
- Files likely: backend/controllers/builderController.js, routes/adminBuilders.js
- Safe fix approach: minimal controller or query fix; add integration test for builder -> project join.
- Testing: confirm builder pages load and expected TC IDs pass.
- Risk: Medium

### **EMI Calculator**
- Related TC IDs: [insert]
- Problem summary: incorrect calculation, rounding, or edge-case mismatches.
- Root cause to investigate: calculation function in `services/calculatorService.js` or frontend unit conversion.
- Files: backend/services/calculatorService.js, frontend calculator UI.
- Safe fix: add unit tests around formulas, fix rounding, maintain previous API contract.
- Testing: unit tests and manual verification for known cases.
- Risk: Medium

### **Stamp Duty Calculator**
- Related TC IDs: [insert]
- Problem summary: Registration amount mismatch (₹30,000 vs ₹29,000 in FAQ).
- Root cause to investigate:
  - Configuration value mismatch between calculator logic and FAQ content.
  - Rounding or slab interpretation differences.
- Files likely: backend/controllers/stampDutyController.js, backend/services/calculatorService.js, master config files under config/
- Safe fix approach:
  - Confirm authoritative source for registration charge (config/DB/documentation). Align code to authoritative value.
  - Add unit tests validating the calc output against official slabs.
  - Update FAQ only if legal/business confirms new value.
- Testing steps:
  - Run calculator for sample inputs and compare to expected values.
  - Reconcile with content owner for FAQ change if needed.
- Risk: High (financial/legal implication).

### **Blog**
- Related TC IDs: [insert]
- Problem summary: Only 2 articles present; content depth weak.
- Root cause to investigate:
  - Content ingestion/cron failing, publishing pipeline broken, or filters hiding posts.
  - Authors not publishing or draft posts not being promoted.
- Files likely: backend/controllers/blogController.js, scripts/seedBlogs.js, admin publishing routes.
- Safe fix approach:
  - Check publishing logs and cron jobs; re-run ingestion or republish script.
  - If content intentionally thin, implement empty-state CTA linking to newsletter or partner content.
  - Add metrics/alerts for low article counts.
- Testing steps:
  - Verify blog listing API returns expected number of published posts.
  - Confirm frontend lists and detail pages render correctly.
- Risk: Medium

## 4. Safe Development Rules

- Do not rewrite entire pages — make the smallest safe change.
- Preserve existing UI/UX unless a test explicitly requires change.
- Do not remove working features.
- Do not break routing, SEO metadata, or responsive layout.
- Do not hardcode fake data to hide issues; use proper seeding/fallbacks.
- If API/server issues found, fix root cause rather than suppressing errors.
- Before changing any file: explain why the file needs change and what will change.
- After each file change: run lint/build/tests if available and verify the affected TC IDs.
- Add logging and metrics for new failure modes rather than silent fixes.

## 5. Approval Gate

Waiting for founder approval before implementation. No code changes have been made yet.

---

## Implementation Workflow (post-approval - summary)

Priority 1 — Critical blockers (order):
1. Fix New Launch HTTP 500/internal fetch error.
2. Fix Buy page inventory/data loading issue.
3. Fix Rent page dummy data and wrong location data.

Priority 2 — High severity business trust issues:
4. Fix Homepage trending carousel repeated property issue.
5. Fix popular location filtered result issue.
6. Fix Stamp Duty registration amount inconsistency.
7. Improve Blog content depth handling or empty/content strategy.

Priority 3 — Medium/Low:
8. Improve empty states with CTA.
9. Verify filters, search, sliders, forms, and JS-driven functionality.
10. Add missing validation where needed.

For each fix we will:
- Read the related code first and list findings.
- Implement the smallest change and justify it in the commit message.
- Run lint/type/build/tests if available; otherwise, run manual verification steps.
- Re-check related TC IDs and update `test_fix_progress.md` with details:
  - Fixed TC IDs
  - Files changed
  - What was changed
  - Verification performed
  - Remaining risks
  - Next module to fix

---

Prepared by: Engineering — initial plan based on Test_Execution_Report.xlsx analysis.
