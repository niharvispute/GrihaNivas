# Website QA Testing Report — grihanivas.in

**Tested by:** QA Engineer (Claude Code)
**Test date:** 2026-06-21
**Target:** https://grihanivas.in/ (redirects to https://www.grihanivas.in/)
**Stack detected:** Next.js (App Router / RSC) + Node API under `/api/`, JWT auth, Cloudinary media.
**Roles tested:** Guest (public), Admin (`+919876543210`), User (`+919172008630`).
**Method:** Live manual + automated testing via Playwright browser automation (navigation, form fill, click, console & network capture, DOM/SEO inspection, viewport resizing, API probing). Non-destructive; dummy data created and deleted with permission.

---

## 1. Executive Summary

GrihaNivas is a functional, well-structured real-estate platform. Core engines work: authentication, role-based access control (RBAC), the 5-step project creation wizard with full CRUD, the EMI calculator (math verified), the user dashboard, and the admin console are all operational. Security fundamentals are notably strong — backend enforces auth + admin role on every protected endpoint, passwords are masked, login errors are generic (no user enumeration), and logout fully clears the session.

However, the site is **not yet production-ready** due to two systemic issues:

1. **Wrong canonical domain across the entire site (Critical SEO).** Every page's `<link rel=canonical>`, `og:image`, `robots.txt` sitemap reference, and `sitemap.xml` URLs point to **`bricksmumbai.com`**, not `grihanivas.in`. Google will consolidate/deindex grihanivas.in toward a different domain. Root cause: one wrong site-base-URL env variable.

2. **Aggressive rate limiting trips on normal use (Critical reliability).** The app prefetches ~50 routes on homepage load and fires 5 parallel API calls; the rate limiter returns **429** on the homepage's own `system/config`, `areas`, `options`, `offers`, `testimonials` calls. Worse, a 429/transient failure causes the app to **wipe tokens and force-logout** mid-session. Real visitors and admins will hit degraded pages and random logouts.

Plus a set of data-quality and UX/SEO defects (implausible prices, missing price units, broken/missing project image, duplicate page titles, soft-404s, leftover test data in production).

**Production readiness status: ❌ Not ready — major fixes required** (primarily the two systemic issues above; both are config/logic-level and fixable quickly).

---

## 2. Test Coverage Summary

| Area | Status | Notes |
|---|---|---|
| Public Pages | ⚠️ Partial | Render & navigate well; SEO/canonical broken sitewide; data-quality defects; 429 degradation |
| Admin Dashboard | ✅ Pass | Dashboard + Project CRUD verified end-to-end; 2 dashboard stat cards blank |
| User Dashboard | ✅ Pass | Account, profile, listings, comparison all load correctly |
| Authentication | ✅ Pass | Valid/invalid/masking/logout/back-button all correct |
| Authorization (RBAC) | ✅ Pass | UI + API both enforce admin-only; user gets 403 |
| Forms | ⚠️ Partial | Submit/validate work; no styled/aria error messaging |
| Performance | ⚠️ Partial | Fast TTFB but FCP ~3.3s; prefetch storm; unoptimized external images |
| Responsiveness | ⚠️ Partial | Nav collapses well; horizontal overflow at mobile (8px) & tablet (44px) |
| UI/UX | ✅ Pass | Clean, consistent design; minor missing toasts/empty-state polish |
| SEO | ❌ Fail | Wrong canonical/og/sitemap domain; duplicate titles; no JSON-LD |
| Accessibility | ⚠️ Partial | Alt text/labels/single-H1 good; icon-font noise, no aria-invalid |
| Security Checks | ✅ Pass | Strong RBAC, masking, session hygiene; tokens in localStorage (XSS risk) |

---

## 3. Pages Tested

| Page | URL | Role | Status | Notes |
|---|---|---|---|---|
| Home | `/` | Guest | ⚠️ | Renders well; 429 on own APIs; data defects; wrong canonical |
| Buy listings | `/buy` | Guest | ✅ | Filters/sort/pagination work; 1 listing only; slider min mismatch |
| Rent / New Launch / Projects / Builders / Blogs | various | Guest | ✅ | Reachable, 200 |
| Contact | `/contact` | Guest | ⚠️ | Form works; office address differs from footer; no styled validation |
| EMI Calculator | `/emi-calculator` | Guest | ✅ | Math verified correct |
| FAQs | `/faqs` (`/faq` alias) | Guest | ✅ | Both render FAQ |
| About / Privacy / Terms / Home-loan / Stamp-duty / Rent-agreement / Compare | various | Guest | ⚠️ | Load OK; some duplicate/missing titles; wrong canonical |
| Login | `/login` | Guest | ✅ | Tabs (Login/Sign Up/Forgot); masking; generic errors |
| Admin Dashboard | `/admin` | Admin | ✅ | Stats + recent leads; 2 cards blank |
| Admin Projects + Create wizard | `/admin/projects`, `/new` | Admin | ✅ | Full CRUD verified; 429 broke form once |
| Admin Users | `/admin/users` | Admin | ⚠️ | Got force-logged-out en route (429/session bug) |
| User Dashboard | `/account` | User | ✅ | Clean; stats, quick actions |
| User Profile | `/account/profile` | User | ✅ | Name editable; phone/email locked |
| Invalid property slug | `/property/<bad>` | Guest | ❌ | Soft-404 (returns 200 shell) |

---

## 4. Bugs Found

#### BUG-001 — Canonical / OG / sitemap point to wrong domain (bricksmumbai.com)
- **Severity:** Critical · **Priority:** P0
- **Page URL:** All pages, plus `/robots.txt`, `/sitemap.xml`
- **Role:** Guest (SEO/crawlers)
- **Steps:** View source of any page → inspect `<link rel="canonical">` and `og:image`; fetch `/robots.txt` and `/sitemap.xml`.
- **Expected:** Canonical/og/sitemap use `https://www.grihanivas.in/...`.
- **Actual:** Canonical = `https://bricksmumbai.com/` on all 17 routes checked; `og:image` = `https://bricksmumbai.com/og-default.jpg`; robots `Sitemap:` line and all sitemap `<loc>` entries = `bricksmumbai.com`.
- **Impact:** Google treats bricksmumbai.com as the canonical source → grihanivas.in loses rankings / gets deindexed; broken social-share preview image.
- **Suggested fix:** Set the site base-URL env var (e.g. `NEXT_PUBLIC_SITE_URL`) to `https://www.grihanivas.in` and redeploy. One change fixes canonical, og, robots, and sitemap.
- **Screenshot needed:** No (evidence in source).

#### BUG-002 — Aggressive rate limiting (429) degrades the public homepage
- **Severity:** Critical · **Priority:** P0
- **Page URL:** `/` (and admin forms)
- **Role:** Guest + Admin
- **Steps:** Load homepage normally → observe Network/Console.
- **Expected:** All first-party API calls return 200.
- **Actual:** `429 Too Many Requests` on `/api/system/config`, `/api/system/areas`, `/api/system/options`, `/api/offers`, `/api/testimonials`. The homepage also prefetches ~50 RSC routes (every nav link, many duplicated e.g. `/contact` ×6) which inflates request volume.
- **Impact:** Testimonials/offers/config sections fail to load for real visitors; admin forms break (see BUG-003). Self-inflicted under normal traffic.
- **Suggested fix:** Raise/relax the per-IP rate limit for read endpoints; deduplicate and reduce route prefetching (`prefetch={false}` on non-critical links); batch `system/*` into one endpoint; add client retry with backoff.
- **Screenshot needed:** No (console evidence).

#### BUG-003 — Transient/429 error force-logs-out the user and wipes tokens
- **Severity:** Critical · **Priority:** P0
- **Page URL:** `/admin/*` (observed navigating `/admin` → `/admin/users`)
- **Role:** Admin
- **Steps:** Log in as admin → navigate between admin pages while system APIs are rate-limited.
- **Expected:** A 429/transient API failure does not affect the session.
- **Actual:** App cleared `bricks_access_token` + `bricks_refresh_token` from localStorage and redirected to `/login` mid-session.
- **Impact:** Admins doing normal work get randomly ejected and lose unsaved context.
- **Suggested fix:** In the API/axios interceptor, only clear tokens + redirect on a genuine `401` with a failed refresh — never on `429`/`5xx`/network errors. Implement refresh-token retry before logout.
- **Screenshot needed:** No.

#### BUG-004 — Add Project form unusable when builders API is rate-limited
- **Severity:** High · **Priority:** P1
- **Page URL:** `/admin/projects/new`
- **Role:** Admin
- **Steps:** Open Add Project when `/api/admin/builders` returns 429.
- **Expected:** Builder list loads or retries; clear recoverable error.
- **Actual:** Builder dropdown (required field `*`) shows only "Select Builder" with tiny "Request failed" text, no retry; form cannot be submitted. Required manual page reload.
- **Impact:** Core admin task (create project) blocked intermittently.
- **Suggested fix:** Retry-with-backoff on dependency loads; show a "Retry" button; disable submit with explicit "Builders failed to load" message.
- **Screenshot needed:** Yes (builder dropdown error state).

#### BUG-005 — Implausible / unit-less property & project pricing
- **Severity:** High · **Priority:** P1
- **Page URL:** `/`, `/buy`, project cards
- **Role:** Guest
- **Steps:** View "Apartment in Nigdi" and "ShaktiTwo" cards.
- **Expected:** Sensible price with correct unit.
- **Actual:** "Apartment in Nigdi" = **₹4.52 Lac** for **1,550 sq.ft** (implausibly low for Mumbai); "ShaktiTwo" = **"Starting ₹150"** (no unit — Lac/Cr?).
- **Impact:** Destroys credibility on a real-estate site; misleads buyers.
- **Suggested fix:** Add price validation (min/max sanity + mandatory unit) on the property/project form; backfill correct data.
- **Screenshot needed:** Yes.

#### BUG-006 — Missing/broken project image renders placeholder
- **Severity:** Medium · **Priority:** P1
- **Page URL:** `/` (Trending), `/admin/projects`
- **Role:** Guest
- **Steps:** View "Shakti" (Hiranandani) project card.
- **Expected:** Project thumbnail.
- **Actual:** `image_not_supported` placeholder (no image / broken URL).
- **Impact:** Looks unfinished on the landing page.
- **Suggested fix:** Make project image required on publish; add a branded fallback image instead of the raw icon.
- **Screenshot needed:** Yes.

#### BUG-007 — "Mumbai" platform showing Pune projects; inconsistent location casing
- **Severity:** Medium · **Priority:** P2
- **Page URL:** `/`, `/admin/projects`
- **Role:** Guest
- **Steps:** Read "Trending Projects in Mumbai".
- **Expected:** Mumbai projects, consistent casing.
- **Actual:** ShaktiTwo & Shakti are in **Wakad, Pune**; casing inconsistent ("Wakad" vs "wakad"). "Apartment in Nigdi" labeled "Nigdi, Mumbai" (Nigdi is Pune).
- **Impact:** Brand/SEO mismatch; data integrity.
- **Suggested fix:** Validate/normalize city field; either expand branding beyond Mumbai or restrict listings to Mumbai.
- **Screenshot needed:** No.

#### BUG-008 — Inconsistent office address (NAP) between pages
- **Severity:** Medium · **Priority:** P2
- **Page URL:** `/contact` vs footer/home
- **Role:** Guest
- **Actual:** Contact page: "The Pavilion, Worli Sea Face, South Mumbai 400018". Footer/home: "Heera Panna Shopping Complex, Powai Hiranandani Garden, Mumbai 400076".
- **Impact:** Confuses customers; harms local-SEO (inconsistent Name/Address/Phone).
- **Suggested fix:** Single source of truth for address; pick the correct one.
- **Screenshot needed:** No.

#### BUG-009 — Duplicate/missing page titles
- **Severity:** Medium · **Priority:** P2
- **Page URL:** `/about`, `/rent-agreement`, `/login` (and admin pages)
- **Actual:** All use the generic homepage title "GrihaNivas — Mumbai Real Estate" instead of page-specific titles.
- **Impact:** Weak SEO; poor browser-tab/bookmark UX.
- **Suggested fix:** Add `generateMetadata`/`<title>` per route. Set `/login` and `/admin/*` to `noindex`.
- **Screenshot needed:** No.

#### BUG-010 — Soft-404 for invalid property slug
- **Severity:** Medium · **Priority:** P2
- **Page URL:** `/property/<nonexistent>`
- **Actual:** Returns HTTP **200** with a "Property Details" shell instead of a 404. (Garbage non-property URLs correctly 404.)
- **Impact:** SEO indexes empty pages; users see a blank/error shell with a success status.
- **Suggested fix:** Return `notFound()` (404) when the property/project ID doesn't exist.
- **Screenshot needed:** No.

#### BUG-011 — Admin dashboard "Banners" & "Testimonials" stat cards blank
- **Severity:** Medium · **Priority:** P2
- **Page URL:** `/admin`
- **Actual:** Both cards show "—" instead of a count (other cards show numbers).
- **Impact:** Incomplete analytics; looks broken.
- **Suggested fix:** Wire the count queries (or render `0`); handle the API failure gracefully.
- **Screenshot needed:** Yes.

#### BUG-012 — Horizontal overflow on tablet/mobile
- **Severity:** Medium · **Priority:** P2
- **Page URL:** `/` at 768px (44px overflow) and 360px (8px overflow)
- **Actual:** Page scrolls horizontally; offenders are the horizontal carousels (Master Builders / Trending, `min-w-[270px]` cards) not fully clipped, plus the BUY/RENT toggle pill on mobile.
- **Impact:** Janky mobile/tablet experience.
- **Suggested fix:** Wrap carousels in `overflow-x: hidden` parent / contain the scroll track; constrain toggle width to viewport.
- **Screenshot needed:** Yes.

#### BUG-013 — No styled / accessible form validation feedback
- **Severity:** Medium · **Priority:** P2
- **Page URL:** `/contact`, `/admin/projects/new`
- **Actual:** Empty/invalid submit relies on native HTML5 popups only (contact) or silently fails to advance (wizard) with no field-level error text or `aria-invalid`/`role=alert`.
- **Impact:** Users unsure why submission failed; screen readers get no error announcement.
- **Suggested fix:** Add inline error messages + `aria-invalid`/`aria-describedby`; show which step/field is invalid in the wizard.
- **Screenshot needed:** No.

#### BUG-014 — No success confirmation after save (admin create/draft)
- **Severity:** Low · **Priority:** P3
- **Page URL:** `/admin/projects/new`
- **Actual:** "Save as Draft" creates the record (201) but shows no toast and does not redirect — looks like nothing happened.
- **Impact:** Admin may re-click and create duplicates.
- **Suggested fix:** Success toast + redirect to list (or "saved" badge).
- **Screenshot needed:** No.

#### BUG-015 — "Configs" column always shows "—" in admin Projects
- **Severity:** Low · **Priority:** P3
- **Page URL:** `/admin/projects`
- **Actual:** Configs column is "—" for every project even when Units = 170/480.
- **Suggested fix:** Populate config count or remove the column.

#### BUG-016 — Leftover test data in production
- **Severity:** Low · **Priority:** P3
- **Page URL:** `/admin/projects`
- **Actual:** "first project" and "yjs-test-project" exist as live (draft) projects.
- **Suggested fix:** Remove test records before launch.

#### BUG-017 — Stale hardcoded year in user dashboard
- **Severity:** Low · **Priority:** P3
- **Page URL:** `/account`
- **Actual:** Featured guide reads "5 Tips for Investing in Mumbai Real Estate **2024**" (current year 2026).
- **Suggested fix:** Remove hardcoded year or make it dynamic/content-driven.

#### BUG-018 — Provided admin username is malformed
- **Severity:** Info (credential note) · **Priority:** P3
- **Detail:** Supplied admin login `+91987653210` is 9 digits and is rejected by validation ("Identifier must be a valid email or phone +91XXXXXXXXXX"). Working number is **`+919876543210`** (10 digits). Validation behavior is correct; flagging the credential typo.

---

## 5. Performance Report

> Note: exact Google Lighthouse scores were not runnable against this remote site through the automation harness. Scores below are **estimates** derived from observed Navigation Timing, paint timing, resource counts, network status, and DOM inspection. Field metrics will vary with cache/network.

| Page URL | Performance | Accessibility | Best Practices | SEO | Key Issue | Recommendation |
|---|---|---|---|---|---|---|
| `/` (Home) | ~55–65 (est.) | ~85 (est.) | ~75 (est.) | ~60 (est.) | FCP ~3.3s; 429 on own APIs; ~50 prefetches; unoptimized ext. images | Fix rate limit/prefetch; optimize images; SSR critical data |
| `/buy` | ~70 (est.) | ~85 | ~80 | ~80 | Light page, few listings | OK; add image lazy-load |
| `/emi-calculator` | ~75 (est.) | ~85 | ~80 | ~85 | Mostly client compute | OK |
| `/admin` | ~60 (est.) | ~80 | ~75 | n/a (noindex rec.) | Multiple system calls + 429 | Batch calls; cache config |
| `/account` | ~70 (est.) | ~85 | ~80 | n/a | Clean | OK |

**Detailed notes (home page):**
- TTFB ~33ms, DOMContentLoaded ~261ms, load ~700ms — **server/transport is fast**.
- **FCP ~3.3s** is the headline problem: first paint is blocked well after the DOM is interactive, consistent with client-side data fetching (config/areas/options/offers/testimonials) plus 429 retries gating render.
- ~100 resources, 22 images; many from `images.unsplash.com`, `res.cloudinary.com`, `lh3.googleusercontent.com` — served without `next/image` optimization and lacking `Timing-Allow-Origin` (no perf visibility).
- Preload warnings: images preloaded via `<link rel=preload>` but never used (wasted bandwidth).
- ~50 RSC route prefetches on load (many duplicated) — network waste + the trigger for rate-limit 429s.

**Optimizations:** server-render or cache the `system/*`/testimonials/offers data; use `next/image` for thumbnails; reduce/disable prefetch on secondary links; remove unused preloads; add CDN caching headers for first-party APIs.

---

## 6. Admin Testing Report

- **Login:** ✅ via `+919876543210 / Aadmin@1234` → `/admin`.
- **Sections present:** Dashboard, Properties, Projects, Builders, Property Submissions, Leads, Blogs, Banners, Testimonials, Users, Offers, Stamp Duty Rates, System Settings (13).
- **Dashboard:** Leads 7, Properties 2, New Leads 7, Closed 0, Users 8, Blogs 4. **Banners & Testimonials cards blank (BUG-011).** Recent Leads table shows real customer names/phones (acceptable — admin-only CRM).
- **CRUD tested — Projects (full):**
  - **Create:** 5-step wizard (Basic / Location / Media / Pricing / Review). Advancing Step 1 auto-creates a draft → `POST /api/projects` **201**. ✅
  - **Edit:** wizard auto-saves (`PUT /api/projects/:id` 200, `PATCH .../status` 200). ✅
  - **Persistence:** "QA Test Project - Do Not Use" appeared in list after refresh. ✅
  - **Delete:** confirmation modal ("cannot be undone") → `DELETE /api/projects/:id` **200** → row removed. ✅
- **Data created:** 1 dummy project ("QA Test Project - Do Not Use", builder GHP Group, Powai). **Data deleted:** the same dummy project (cleaned up). No production data altered.
- **Validation:** empty required fields block step progression (no field-level error text — BUG-013).
- **Issues found:** BUG-003, BUG-004, BUG-011, BUG-014, BUG-015, BUG-016.
- **Admin UX feedback:** Clean console layout, good iconography, inline status dropdowns and delete confirmation are nice. Needs success toasts, builder-load resilience, and protection against rate-limit logouts.
- **Not exhaustively covered (time/rate-limit constraints):** Property CRUD (same wizard pattern, likely equivalent), image upload execution, Blogs/Banners/Testimonials/Users/Offers/Stamp-Duty CRUD, status-change persistence. Recommend a follow-up pass once rate limiting is relaxed.

---

## 7. User Testing Report

- **Login:** ✅ via `+919172008630 / Vishal1226@` → `/account`.
- **Features tested:** Dashboard (saved 0, comparing 3/3, quick actions), My Profile (name editable; phone + email locked, "Email cannot be changed"), sidebar nav (Saved, Comparison, Enquiries, My Listings, Profile).
- **Restrictions tested:** Navigating to `/admin` → redirected to `/account` (no admin UI). User JWT against admin APIs → **403 "Access denied. Admin privileges required."** ✅
- **Issues found:** stale "2024" content (BUG-017); no change-password on profile (minor).
- **User UX feedback:** Clean, friendly dashboard with sensible quick actions and clear empty/active states. 0 console errors on the account pages.

---

## 8. Authentication & Role Access Report

| Test Case | Expected | Actual | Status |
|---|---|---|---|
| Valid admin login | Success → admin area | `/admin`, token issued | ✅ |
| Valid user login | Success → account | `/account`, role "user" | ✅ |
| Invalid password | Reject, generic error | 401 "Invalid credentials." | ✅ |
| Malformed mobile (9-digit) | Validation error | 400 clear field message | ✅ |
| Password masking | Hidden input | `type=password` | ✅ |
| Guest → `/admin` | Block/redirect | Redirect to `/login` | ✅ |
| User → `/admin` | Block/redirect | Redirect to `/account` | ✅ |
| User JWT → admin API | 403 | 403 "Admin privileges required" | ✅ |
| No token → admin API | 401 | 401 "Access denied. No token provided." | ✅ |
| Logout clears session | Tokens removed | localStorage emptied | ✅ |
| Back button after logout | No session restore | Redirected to `/login` | ✅ |
| Brute-force on login | Throttled | 429 after burst | ✅ (good) |
| 429 during session | Stay logged in | **Force logout + tokens wiped** | ❌ (BUG-003) |

**Verdict:** Authentication and authorization are a **strength** — the only failure is the session-destroying reaction to 429 (BUG-003), which is a logic fix, not an access-control hole.

---

## 9. Forms Testing Report

| Form | Page | Validation Status | Submission Status | Issues |
|---|---|---|---|---|
| Login | `/login` | ✅ generic error, masking | ✅ 401/200 correct | No "remember me" / show-password |
| Contact "Send Message" | `/contact` | ⚠️ HTML5 required only (email optional) | Submits | No styled/aria errors (BUG-013) |
| Home "Get Free Consultation" | `/` | ⚠️ Phone required | Submits | Same as contact |
| Project Create (5-step) | `/admin/projects/new` | ⚠️ blocks but no field errors | ✅ 201 create / draft | Builder-load failure (BUG-004), no toast (BUG-014) |
| Profile update | `/account/profile` | Name editable; phone/email locked | Save Changes present | Not submitted (no change desired) |
| EMI calculator | `/emi-calculator` | n/a (live compute) | ✅ correct math | — |

---

## 10. UI/UX Improvement Suggestions

#### High Priority
- Fix the rate-limit / prefetch storm so sections (testimonials, offers) actually render for visitors (BUG-002).
- Never log users out on transient errors (BUG-003).
- Add success/error **toasts** for all admin create/edit/delete actions (BUG-014).
- Fix data credibility: price units + sanity validation, real images (BUG-005, BUG-006).

#### Medium Priority
- Inline, accessible form validation messages with `aria-invalid` (BUG-013).
- Resolve horizontal overflow on tablet/mobile carousels (BUG-012).
- Single source of truth for office address; fix Mumbai/Pune data (BUG-007, BUG-008).
- Fill or hide the blank admin dashboard stat cards (BUG-011).
- Per-page titles + `noindex` on login/admin (BUG-009).

#### Low Priority
- Add show/hide password toggle and "remember me" on login.
- Add change-password to user profile.
- Redirect to list after "Save as Draft".
- Remove leftover test projects and stale "2024" copy (BUG-016, BUG-017).
- Branded fallback image instead of raw `image_not_supported` icon.

---

## 11. Responsiveness Report

| Page | Mobile (360/390) | Tablet (768) | Desktop (1366/1920) | Issues |
|---|---|---|---|---|
| Home | ⚠️ usable, ~8px overflow, hamburger ✅ | ⚠️ ~44px overflow from carousels | ✅ no overflow, full nav | Carousel/toggle overflow (BUG-012) |
| Buy / listings | ✅ (filters stack) | ✅ | ✅ | — |
| Contact / forms | ✅ | ✅ | ✅ | — |
| Admin console | not retested mobile* | — | ✅ | *logged out before mobile admin pass |

Nav correctly collapses to a hamburger ("Open menu") below the desktop breakpoint; hero, search, and cards reflow cleanly. Main defect is page-level horizontal scroll caused by horizontal carousels not being clipped to the viewport.

---

## 12. SEO Report

| Page | Title | Meta Description | H1 | SEO Issues | Recommendation |
|---|---|---|---|---|---|
| `/` | ✅ | ✅ | ✅ single | **canonical+og = bricksmumbai.com**; no JSON-LD | Fix base URL; add Organization/RealEstate schema |
| `/buy` | ✅ | ✅ | ✅ | wrong canonical; budget slider mismatch | Fix base URL |
| `/contact` | ✅ | ✅ | ✅ | wrong canonical; NAP mismatch | Fix base URL + address |
| `/about` | ❌ generic | ✅ | ✅ | duplicate title; wrong canonical | Per-page title |
| `/rent-agreement` | ❌ generic | ❌ generic | ✅ | duplicate title/desc; wrong canonical | Per-page metadata |
| `/login` | ❌ generic | ❌ | ✅ | indexable login page | `noindex` + title |
| sitewide | — | — | — | sitemap.xml + robots `Sitemap:` on bricksmumbai.com | Fix base URL |

Positives: `robots.txt` correctly disallows `/admin/`, `/api/`, dashboard; meta descriptions present on most pages; clean URL structure; single H1 per page.

---

## 13. Accessibility Report

| Area | Issue | Impact | Recommendation |
|---|---|---|---|
| Images | Homepage: all 20 imgs have alt ✅ | Good | Maintain on all pages |
| Headings | Single H1, logical order ✅ | Good | Keep |
| Forms | No `aria-invalid`/`role=alert` on errors | SR users miss errors | Add ARIA + inline messages |
| Icon fonts | Material-Symbols text ("expand_more", "payments", "square_foot") announced as content | Noise for SR | `aria-hidden="true"` on decorative icons |
| Password | Masked ✅ | Good | Add toggle (still accessible) |
| Keyboard/focus | Focus states & skip-link not verified | Possible nav friction | Add visible focus + skip-to-content |
| Lang/viewport | `lang=en`, viewport set ✅ | Good | Keep |

Estimated accessibility score ~85/100 — solid foundation, mainly ARIA/error-state and icon-font cleanup needed.

---

## 14. Security Observations (safe checks only)

**Strengths**
- Backend enforces auth on every protected endpoint: no token → **401**; user token on admin route → **403**. UI guards mirror this (`/admin` → redirect). RBAC is robust.
- Login errors are generic ("Invalid credentials") — no user enumeration.
- Password input masked; brute-force throttling present (login 429 on burst).
- Logout clears tokens; back-button cannot restore the session.
- `robots.txt` blocks `/admin/` and `/api/`.
- API errors return clean JSON messages — no stack traces leaked.

**Concerns**
- **JWTs in localStorage:** both `bricks_access_token` and a long-lived (~30-day) `bricks_refresh_token` live in `localStorage`, readable by any injected script → XSS = full token theft. Prefer httpOnly, Secure, SameSite cookies for the refresh token.
- **Login response returns full tokens + PII** (admin email `shreegurudevproperties@gmail.com`, role, phone) in the JSON body. Expected for token auth, but minimize PII in the payload.
- **Session destroyed on 429** (BUG-003) — reliability, but also means a rate-limit can be used to nuisance-logout users.
- File-upload restrictions (type/size) were **not** exercised in this pass — recommend verifying server-side validation and Cloudinary signed uploads.
- Recommend `noindex` on `/login` and `/admin/*`.

No destructive or intrusive testing was performed.

---

## 15. Final Recommendation

**Can it go live now?** No — fix the two systemic blockers first; both are config/logic-level and quick.

**Must fix before launch (blockers):**
1. **BUG-001** — Correct the site base URL so canonical/og/sitemap/robots use `grihanivas.in` (kills the SEO/deindex risk).
2. **BUG-002** — Relax rate limiting + cut the prefetch storm so the public site and admin forms stop hitting 429.
3. **BUG-003** — Stop wiping tokens / logging out on 429 & transient errors.
4. **BUG-005 / BUG-006** — Fix pricing (units + sanity) and missing project images (credibility).
5. **BUG-004** — Make the Add-Project builder load resilient (retry/error).

**Fix soon (post-launch acceptable):** BUG-007–BUG-013 (data consistency, titles, soft-404, dashboard cards, responsive overflow, form a11y).

**Polish later:** BUG-014–BUG-017 (toasts, configs column, test-data cleanup, stale copy), password toggle, change-password, JSON-LD, image optimization, move refresh token to httpOnly cookie.

### Top 5 Priority Fixes
1. Set correct site base URL → fixes canonical, og:image, robots, sitemap (BUG-001).
2. Relax rate limits + remove duplicate route prefetching + batch `system/*` (BUG-002).
3. Don't logout on 429/transient — only on confirmed 401 + failed refresh (BUG-003).
4. Validate property/project pricing (unit + sanity) and require valid images (BUG-005, BUG-006).
5. Add resilient loading + success toasts in admin create flows (BUG-004, BUG-014).

---

### Appendix — Evidence & Limitations
- Raw working notes: `qa-findings-raw.md`. Mobile screenshot: `mobile-home-360.jpeg`.
- Dummy data created and deleted: project "QA Test Project - Do Not Use" (id `6a374b9269427aa304809117`). No production data modified.
- Limitations: exact Lighthouse scores estimated (remote site, harness); deep Property/Blog/Banner/Testimonial/User CRUD and file-upload execution not fully exercised due to aggressive API rate limiting during the session — recommend a follow-up pass after BUG-002 is fixed.
