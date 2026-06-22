# Website QA Testing Report — grihanivas.in

**Date:** 2026-06-21
**Tester:** Claude Code (Chrome DevTools MCP — live browser automation against production)
**Roles attempted:** Guest, Admin (Super Admin), User
**Testing terminated early** due to a critical, reproducible rate-limiting bug (see BUG-001) that locked the tester out of login entirely. Findings below reflect what was verified before the lockout.

---

## 1. Executive Summary

- **Website tested:** https://www.grihanivas.in/
- **Roles tested:** Guest (public site — partial), Admin (login + dashboard + 3 sections — partial), User (not reached — blocked by lockout before user-credential testing began)
- **Overall quality:** The UI is polished and the core browsing experience (homepage, hero search, project/builder cards, login modal, admin dashboard shell) works and looks production-grade. However, a critical session/rate-limiting defect was discovered that locks users — including admins — out of login entirely after a short burst of normal navigation.
- **Major risk:** **BUG-001** — the app's own client-side request behavior (duplicate Next.js route prefetches) appears to trip a server-side rate limiter, which then rejects legitimate calls including `POST /api/auth/login` and `GET /api/auth/me`. This silently logs out an active admin session and then blocks all subsequent login attempts for a period. This is a launch-blocking defect.
- **Production readiness status:** **Not ready, major fixes required**

---

## 2. Test Coverage Summary

| Area | Status | Notes |
|---|---|---|
| Public Pages | Partial | Homepage fully reviewed; other public pages not reached before lockout |
| Admin Dashboard | Partial | Login, dashboard overview, Properties list, Property Submissions list reviewed; CRUD/forms/uploads not tested |
| User Dashboard | Fail (not tested) | Blocked — lockout occurred before user-credential testing began |
| Authentication | Partial | Empty-field, wrong-password, valid-login all verified; logout/session-expiry behavior surfaced the critical bug |
| Forms | Partial | Login form validation verified; lead/property/contact forms not submitted (avoided creating data once instability was found) |
| Performance | Not tested | Lighthouse/trace audits not run — blocked by lockout |
| Responsiveness | Not tested | Blocked by lockout |
| UI/UX | Partial | Homepage and admin shell reviewed visually |
| SEO | Partial | Only homepage `<title>` captured; meta/OG/canonical not audited |
| Accessibility | Partial | DevTools a11y issues captured incidentally on every page visited |
| Security Checks | Partial | No-enumeration on login confirmed; role-boundary tests (admin-only URL as normal user) not completed — blocked |

---

## 3. Pages Tested

| Page Name | URL | Role | Status | Notes |
|---|---|---|---|---|
| Homepage | https://www.grihanivas.in/ | Guest | Pass (with issues) | Loads correctly; 4 API calls aborted (see BUG-003) |
| Login modal | (overlay on homepage) | Guest | Pass | Validation correct, no credential enumeration |
| Login page (`/login`) | https://www.grihanivas.in/login | Guest | Pass | Same form as modal, full-page variant |
| Admin Dashboard | https://www.grihanivas.in/admin | Admin | Pass (once) | Loaded with live stats; later inaccessible due to BUG-001 |
| Admin Properties | https://www.grihanivas.in/admin/properties | Admin | Pass | List, search, filter, export-to-Excel UI present |
| Admin Property Submissions | https://www.grihanivas.in/admin/property-submissions | Admin | Fail | Triggered BUG-001 — session dropped, redirected to `/login` |
| Admin Leads | https://www.grihanivas.in/admin/leads | Admin | Not reached | Blocked by BUG-001 |
| User dashboard / any user-role page | — | User | Not reached | Blocked by BUG-001 before user credentials were tried |

---

## 4. Bugs Found

### BUG-001
- **Title:** Server-side rate limiting locks out legitimate users, including active admin sessions and the login endpoint itself
- **Severity:** Critical
- **Priority:** P0 — blocks launch
- **Page URL:** Site-wide (observed on `/admin/property-submissions` navigation, then `/admin`, then `/login`)
- **Role:** Admin (Super Admin)
- **Steps to Reproduce:**
  1. Log in as admin at `/login` or via the homepage modal.
  2. Navigate through a few admin sidebar links in normal succession (Dashboard → Properties → Property Submissions).
  3. Observe `GET /api/auth/me`, `/api/system/config`, `/api/system/areas`, `/api/offers` etc. start returning `429`.
  4. The app interprets the failed `/api/auth/me` as "not authenticated" and redirects to `/login`.
  5. Attempt to log back in with correct credentials — `POST /api/auth/login` itself now also returns `429`, displaying "Request failed" with no way to log in.
- **Expected Result:** Normal navigation should never exhaust a rate limit; an authenticated session should persist across admin page navigation; login should remain available even if other endpoints are throttled.
- **Actual Result:** Active admin session is silently dropped mid-task, and the login endpoint becomes unusable for a sustained period afterward, with no countdown, retry-after messaging, or graceful degradation shown to the user.
- **Impact:** Any real user (admin or customer) browsing normally for a short time can be locked out of login/checkout entirely. This is especially dangerous for users on shared/NAT IPs (offices, cafes) where one rate-limit bucket may be shared across multiple real visitors, locking all of them out simultaneously.
- **Likely root cause:** Next.js Link/Router prefetching is firing duplicate requests to the same API routes on every render (see BUG-002 evidence — the same `/admin/banners` route was fetched 5 times within seconds, `/api/system/config` 2–3 times per page). This request volume appears to be exhausting a per-IP or global rate-limit bucket shared with auth endpoints. Auth-critical endpoints (`/api/auth/me`, `/api/auth/login`) should be excluded from the same limiter as bulk content-prefetch routes, or prefetching should be deduplicated/throttled client-side.
- **Suggested Fix:**
  1. Exclude or use a separate, more generous rate-limit bucket for `/api/auth/*` endpoints.
  2. De-duplicate/cancel redundant Next.js prefetch requests (cache-control / `dedupe` on fetch, or disable aggressive `<Link prefetch>` on the admin sidebar where it provides little benefit).
  3. Add exponential backoff and a clear "Too many requests, retry in Xs" UI state instead of silently treating 429 as "logged out."
  4. Add server-side logging/alerting on 429 spikes so this is caught before users report it.
- **Screenshot Needed:** Yes (network panel + the "Request failed" login screen)

### BUG-002
- **Title:** Duplicate/redundant API and route prefetch requests on every page
- **Severity:** High
- **Priority:** P1
- **Page URL:** Site-wide, clearly observed on `/admin/properties` and `/`
- **Role:** Guest & Admin
- **Steps to Reproduce:** Load any page and open the Network tab; observe the same RSC/API route (e.g. `/admin/banners?_rsc=...`, `/api/system/config`) requested 2–5 times within a few seconds with different cache-busting query params.
- **Expected Result:** Each distinct resource should be fetched once per navigation (or served from cache on repeat).
- **Actual Result:** Sidebar links and homepage cards appear to trigger hover/render-time prefetches for every nav item simultaneously, multiplying request volume needlessly.
- **Impact:** Wastes bandwidth/server capacity and is the direct contributing cause of BUG-001.
- **Suggested Fix:** Audit `<Link prefetch>` usage; disable prefetch on admin sidebar (low navigation-speed benefit, high request cost) or set `prefetch={false}` selectively; ensure SWR/React Query (or equivalent) dedupes in-flight identical requests.
- **Screenshot Needed:** No (network log sufficient)

### BUG-003
- **Title:** Four API calls aborted on homepage initial load (`net::ERR_ABORTED`)
- **Severity:** Medium
- **Priority:** P2
- **Page URL:** https://www.grihanivas.in/
- **Role:** Guest
- **Steps to Reproduce:** Load the homepage fresh and check Network tab.
- **Expected Result:** `/api/system/config`, `/api/system/areas`, `/api/testimonials`, `/api/offers` should return 200 and populate their respective UI sections.
- **Actual Result:** All four requests show `net::ERR_ABORTED`. Consistent with this, **no testimonials section renders on the homepage** despite the design clearly having one planned (admin has a "Testimonials" management section with content).
- **Impact:** A built feature (testimonials, possibly offers banner) is invisible to visitors; looks like a silent content/feature regression.
- **Suggested Fix:** Investigate whether these fetches are being aborted by a competing navigation/unmount (e.g., `AbortController` tied to a component that re-renders before the fetch resolves), or if it's another symptom of the BUG-001 request-cancellation pattern.
- **Screenshot Needed:** No (network log sufficient)

### BUG-004
- **Title:** Form inputs missing associated `<label>` and `id`/`name` attributes (recurring across the app)
- **Severity:** Medium
- **Priority:** P2
- **Page URL:** Login modal (homepage + `/login`), `/admin/properties` filters, `/admin/property-submissions` filters — pattern repeats on every form encountered
- **Role:** Guest & Admin
- **Steps to Reproduce:** Open browser DevTools console (Issues tab) on any page with a form/search input.
- **Expected Result:** Every input should have a programmatically associated label and an `id`/`name` attribute for accessibility tooling and autofill.
- **Actual Result:** Chrome DevTools consistently reports "No label associated with a form field" and "A form field element should have an id or name attribute" — seen on at least 4 different pages/forms during this short session.
- **Impact:** Screen reader users cannot reliably determine field purpose; autofill/password managers may not work correctly (browser also separately warned the password field is missing an `autocomplete="current-password"` hint).
- **Suggested Fix:** Add `<label htmlFor>` + matching `id` to every input across the shared form components; add `name` attributes; add `autoComplete` hints to login/password fields.
- **Screenshot Needed:** No

### BUG-005 (data point, not a confirmed bug — needs your input)
- **Title:** Provided admin credential was off by one digit
- **Severity:** N/A (test-data issue, not a site defect)
- **Notes:** The admin phone number you originally supplied (`+91987653210`) had only 9 digits. You confirmed the correct number was `+919876543210`, which logged in successfully. Flagging only so the credential on file gets corrected wherever it's stored/documented.

---

## 5. Performance Report

**Not completed.** `lighthouse_audit` / `performance_start_trace` were not run because live testing was halted after BUG-001 to avoid extending the rate-limit lockout window. Recommend re-running this section once BUG-001 is fixed:

| Page URL | Performance | Accessibility | Best Practices | SEO | Key Issue | Recommendation |
|---|---|---|---|---|---|---|
| `/` | Not tested | Not tested | Not tested | Not tested | — | Re-run after fix |
| `/login` | Not tested | Not tested | Not tested | Not tested | — | Re-run after fix |
| `/admin` | Not tested | Not tested | Not tested | Not tested | — | Re-run after fix |
| Property/project detail page | Not tested | Not tested | Not tested | Not tested | — | Re-run after fix |
| User dashboard | Not tested | Not tested | Not tested | Not tested | — | Re-run after fix |

One observation without formal Lighthouse numbers: the homepage requests several large hero/card images directly from Unsplash and Cloudinary without an obvious `loading="lazy"` strategy visible in the accessibility tree below the fold, and the console flagged multiple `<link rel=preload>` resources that went unused within a few seconds of load — both are easy wins once revisited.

---

## 6. Admin Testing Report

- **Admin login status:** Successful with corrected credential `+919876543210` / `Aadmin@1234`.
- **Features tested:** Login, dashboard overview (stat cards: Total Leads 7, Properties Listed 2, New Leads 7, Leads Closed 0; Recent Leads table with name/type/phone/status), Properties list (search/filter/export-to-Excel UI, status & "New Launch" toggle buttons, Featured star toggle), Property Submissions list (9 pending submissions, owner/phone/locality/RERA-presence flag, "Move To…" action).
- **CRUD operations tested:** None completed — session was lost (BUG-001) before any create/edit/delete action was attempted. Deliberately avoided mutating the 9 real property submissions or 7 real leads visible in the data.
- **Data created / edited / deleted:** None.
- **Issues found:** BUG-001 (critical), BUG-002, BUG-004 (forms in admin filters).
- **Admin UX feedback:** The dashboard layout, stat cards, and table design are clean and readable. The "Properties" list lacks an obvious "Add Property" button — properties appear to be created exclusively via approving a Property Submission, which is a reasonable workflow but should be confirmed as intentional (or surfaced as a documented flow) rather than discovered by exploration.

---

## 7. User Testing Report

**Not completed.** The lockout (BUG-001) occurred while exploring the admin side, before user-credential (`+919172008630` / `Vishal1226@`) testing began. No findings to report for the user role. Recommend re-running the full Section 3 (User Dashboard Testing) plan from `test-plan.md` once the rate-limit bug is fixed.

---

## 8. Authentication & Role Access Report

| Test Case | Expected | Actual | Status |
|---|---|---|---|
| Empty login submission | Inline validation error, no request sent for malformed input | Correct error shown: "Enter a valid email or +91 mobile number." | Pass |
| Wrong password, valid format | Generic "Invalid credentials" error, no enumeration of which field is wrong | Correct: "Invalid credentials." shown, no hint whether phone or password was wrong | Pass |
| Valid admin login | Authenticated, header updates to show role, dashboard accessible | Header showed "Super Admin", `/admin` loaded with live data | Pass |
| Session persistence across admin navigation | Should remain logged in while clicking sidebar links | **Failed** — session dropped after a few navigations, redirected to `/login` (BUG-001) | **Fail** |
| Re-login after session drop | Should be able to log back in immediately | **Failed** — `POST /api/auth/login` itself returned 429 ("Request failed") | **Fail** |
| User login | Not tested | Not tested | Not tested |
| Guest access to admin-only URL | Should redirect to login / show 403 | Not formally tested, but indirectly confirmed: once logged out, navigating to `/admin` redirected to `/login` rather than showing an error page — acceptable behavior | Pass (incidental) |
| Password field masking | Password should be masked with a reveal toggle | Confirmed — masked dots shown, "visibility" eye-icon toggle present | Pass |
| Direct URL access without login | Protected route should not render without a session | Confirmed via the forced-logout scenario above | Pass (incidental) |

---

## 9. Forms Testing Report

| Form | Page | Validation Status | Submission Status | Issues |
|---|---|---|---|---|
| Login (Email/Phone + Password) | Homepage modal & `/login` | Working — rejects malformed phone, rejects wrong password with generic message | Working for valid creds (until BUG-001 hit) | BUG-004 (missing label/id/name) |
| Admin Properties search/filter | `/admin/properties` | Not submitted/tested | N/A | BUG-004 |
| Admin Property Submissions search/filter | `/admin/property-submissions` | Not submitted/tested | N/A | BUG-004 |
| Homepage "Get Free Consultation" lead form | `/` | Not tested | Not tested | Not reached |
| Homepage hero property search (Buy/Rent/New Launch + Location + BHK) | `/` | Not tested | Not tested | Not reached |
| "List Property" submission form | Not reached | Not tested | Not tested | Not reached |

---

## 10. UI/UX Improvement Suggestions

**High Priority**
- Fix the session/rate-limit interaction (BUG-001) — this is a trust-breaking, launch-blocking defect.
- Add a visible "Add Property" / "Add Project" entry point in the admin Properties/Projects list if one is meant to exist outside the submission-approval flow; otherwise document the submission-only workflow for the admin team.

**Medium Priority**
- Restore the testimonials section on the homepage (BUG-003) — it's clearly designed for but not rendering.
- Add labels/`id`/`name` to all form inputs site-wide (BUG-004) for accessibility and autofill support.
- Add retry/backoff messaging instead of a bare "Request failed" on login.

**Low Priority**
- Clean up unused `<link rel=preload>` warnings logged in the console on the homepage.
- Add `loading="lazy"` to below-the-fold images (builder cards, blog cards) if not already present.

---

## 11. Responsiveness Report

**Not completed** — blocked by BUG-001 before the responsiveness sweep began. Recommend re-running at 360px, 390px, 768px, 1366px, 1920px on homepage, login, admin dashboard, and a property detail page once the lockout issue is resolved.

| Page | Mobile | Tablet | Desktop | Issues |
|---|---|---|---|---|
| Homepage | Not tested | Not tested | Verified at default desktop viewport only | — |
| Admin Dashboard | Not tested | Not tested | Verified at default desktop viewport only | — |

---

## 12. SEO Report

| Page | Title | Meta Description | H1 | SEO Issues | Recommendation |
|---|---|---|---|---|---|
| Homepage | Present — "GrihaNivas — Mumbai Real Estate" | Not captured (audit incomplete) | Present — "Still Looking for a Place That Feels Right?" | Heading hierarchy looks correct (single H1, H2s for sections) | Re-run full Lighthouse SEO audit once BUG-001 fixed; verify meta description, canonical, and OG tags directly in `<head>` |

---

## 13. Accessibility Report

| Area | Issue | Impact | Recommendation |
|---|---|---|---|
| Login form (modal & full page) | Inputs lack associated `<label>`, `id`, `name` | Screen readers can't announce field purpose; password manager autofill degraded | Add proper label association + autocomplete hints |
| Admin filter/search inputs | Same missing label/id/name pattern | Same as above, affects admin staff using assistive tech | Same fix, applied to shared input component |
| Password field | Missing `autocomplete="current-password"` | Browser/password-manager autofill suggestions degraded | Add the attribute |
| Heading structure (homepage) | Appears correct (H1 → H2 → H3 nesting observed in accessibility tree) | None observed | No action needed, but verify with full axe/Lighthouse pass |

---

## 14. Security Observations

- **No credential enumeration:** Wrong password returns a generic "Invalid credentials" message rather than revealing whether the phone/email or the password was incorrect. Good practice, confirmed.
- **Session handling concern:** The most significant security-adjacent observation is that the app conflates "API rate-limited" with "user logged out" — this is not a classic vulnerability, but it's a session-integrity defect that an attacker could potentially weaponize as a cheap, unauthenticated denial-of-service against login for all users sharing a rate-limit scope (e.g., spamming a few endpoints from one IP could lock out everyone behind that IP, or — if the limiter is global rather than per-IP — every visitor to the site). **This should be verified and treated as a priority fix regardless of QA timeline.**
- No tokens or secrets were observed exposed in URLs during this session.
- No destructive actions, exploit payloads, or data deletion were performed. The 9 real property submissions and 7 real leads visible in the admin were not modified.

---

## 15. Final Recommendation

**Can this website go live? No, not in its current state.** The rate-limit/session-drop defect (BUG-001) is severe enough that real users — not just an automated tester — will get logged out mid-session and then be unable to log back in, which is launch-blocking for a real-estate lead-generation site where login/lead-capture is core to the business model.

**Must be fixed before launch:**
1. BUG-001 — rate-limit/session-drop lockout (Critical)
2. BUG-002 — duplicate prefetch requests driving BUG-001 (High)
3. BUG-004 — accessibility label/id/name gaps across forms (Medium, but cheap and wide-reaching)

**Can be improved later:**
- BUG-003 (missing testimonials section)
- Preload/lazy-load cleanup
- Full performance/responsiveness/SEO audit (re-run once BUG-001 is resolved — this report could not complete those sections live against production)

**Top 5 priority fixes:**
1. Fix rate-limiter scope/threshold so `/api/auth/*` is never starved by bulk content prefetch (BUG-001).
2. De-duplicate Next.js route prefetching across the admin sidebar and homepage cards (BUG-002).
3. Restore the testimonials/offers homepage sections that are silently failing to load (BUG-003).
4. Add proper label/id/name/autocomplete attributes to all form inputs (BUG-004).
5. Re-run the full performance, responsiveness, SEO, and user-role testing plan (Sections 5, 7, 11, 12 of this report) once #1 is fixed — this audit was cut short specifically because of that bug, not because those areas are known-good.

---

## Testing Notes / Limitations

This QA pass was cut short by the discovery of BUG-001. Per your instruction, I stopped live interaction with the production site rather than risk extending or worsening the lockout. Sections marked "Not tested" or "Not completed" above are not implicitly "Pass" — they simply were not reached. I'd recommend a follow-up session focused specifically on: (1) verifying the BUG-001 fix, (2) the User-role walkthrough, (3) performance/Lighthouse audits, and (4) the responsiveness matrix.

---

## 16. Root Cause Findings & Fixes Applied (2026-06-21, follow-up)

### BUG-001 root cause: NOT in this codebase

Audited `backend/middleware/rateLimiter.js` and every route file. Finding:

- All four limiters (`globalLimiter`, `authLimiter`, `otpLimiter`, `uploadLimiter`) are **already no-op pass-throughs** in this repo — the real `express-rate-limit` code is commented out with a note "temporarily disabled."
- No other in-app mechanism rate-limits `/api/auth/me`, `/api/auth/login`, or `/api/system/*`. The only other `429`s in the backend are the OTP brute-force guess-attempt cap in `otpService.js` (unrelated, and per your decision, left in place — it's a legitimate anti-brute-force control, not the bug).
- **Conclusion: the 429 lockout is coming from infrastructure in front of this app** — confirmed with you to be Cloudflare (proxied DNS) plus an Nginx reverse proxy on the Hostinger VPS, neither of which lives in this git repo.

**Action needed from you (infra layer, outside this repo):**
1. **Cloudflare dashboard** → Security → WAF / Rate Limiting Rules: delete or disable any rate-limiting rule scoped to `grihanivas.in`. Also check Security Level and "Bot Fight Mode" / "I'm Under Attack Mode" — these can independently trigger challenge/block behavior that looks like a 429/lockout.
2. **Nginx on the VPS**: search the active config for throttling directives and remove them:
   ```
   grep -rn "limit_req\|limit_conn" /etc/nginx/
   ```
   Remove any `limit_req_zone` / `limit_req` / `limit_conn_zone` / `limit_conn` directives found, then `nginx -t && systemctl reload nginx`.
3. I don't have SSH or Cloudflare dashboard access from this session — I can't verify or apply this part myself. Paste the relevant config back here if you want me to confirm there's nothing left, or grant terminal access via `!<command>` in this session if Nginx is reachable that way.

### BUG-002 root cause found and fixed in code

The actual trigger for the 429 cascade: **`AdminSidebar.jsx`** rendered all 13 admin nav links without `prefetch={false}`. Since the sidebar is permanently on-screen, Next.js auto-prefetched all 13 admin routes (and their server-side data) simultaneously on every render — this is what produced the "fetched 5 times" duplicate request pattern observed in the network log and is the proximate cause that exhausted whatever infra-level limiter is in place.

The same missing-`prefetch={false}` pattern also existed on the homepage for the project/builder "View" card links and the header logo link, matching the duplicate `/?_rsc=...` and `/projects/...?_rsc=...` calls seen during testing.

**Fixed in this session** (additive, low-risk, not yet deployed):
- `frontend/src/components/layout/AdminSidebar.jsx` — added `prefetch={false}` to all 13 nav links + "Back to Home" link.
- `frontend/src/components/layout/Header.jsx` — added `prefetch={false}` to the logo link.
- `frontend/src/components/home/TrendingProjectCard.jsx` — added `prefetch={false}` to both card links (image wrapper + "View Project" CTA).
- `frontend/src/components/home/TrendingBuilderCard.jsx` — added `prefetch={false}` to the "View Builder" CTA link.

This won't fully replace fixing the infra-level rate limiter/WAF rule (BUG-001's actual block), but it removes the load spike that was tripping it, and is good practice regardless (Header/Footer nav links already followed this pattern — admin sidebar and home cards were the inconsistent outliers).

### BUG-003 (aborted testimonials/offers/config/areas calls) — likely related, not separately fixed

No dedicated bug found in `HomePageTestimonials.jsx` or `systemService.js` — both already guard against state updates after unmount. The `net::ERR_ABORTED` pattern is consistent with the same request-volume spike from BUG-002 competing for connections/render cycles right after initial page load. Recommend re-testing the homepage after deploying the BUG-002 fix; if testimonials/offers still fail to load, this needs a separate investigation pass (likely an `AbortController` tied to an unrelated component lifecycle).

### BUG-004 root cause found and fixed in code

Found the exact source: the shared `Field` component in `frontend/src/components/auth/AuthModal.jsx` rendered `<label>` with no `htmlFor` and `<input>` with no `id`/`name`. This single component is reused by **every** auth form in the app (login, signup, forgot-password, reset-password), so one fix resolves the recurring issue seen across all of them.

**Fixed in this session:**
- Added `useId()`-generated unique `id` per field, wired to the `<label htmlFor>`.
- Added a `name` attribute derived from the field's label (e.g. "Email or Phone" → `email-or-phone`).

**Not yet checked:** the admin Properties/Property Submissions filter inputs that also showed this DevTools issue — those likely use a different, admin-specific input component. Flagging as a follow-up if you want it fixed in the same pass.

### Status: code changes are local, not deployed

The four files above were edited in the working tree only. Nothing has been committed, built, or deployed. Let me know if you want these committed/pushed, and confirm whether your deploy pipeline needs anything else (e.g., `next build` regenerating the admin route prefetch manifest).
