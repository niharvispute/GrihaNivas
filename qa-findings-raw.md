# Raw QA Findings — grihanivas.in (working notes)

## Stack
- Next.js (App Router, RSC). Hosted, redirects grihanivas.in → www.grihanivas.in.
- APIs under /api/: system/config, system/areas, system/options, testimonials, offers, properties, projects, builders, blogs, leads, auth.

## Homepage (/)
- Title: "GrihaNivas — Mumbai Real Estate" ✓
- Meta description present ✓
- H1 single ✓, lang=en ✓, viewport ✓, all imgs have alt ✓
- robots index,follow ✓
- **BUG canonical = https://bricksmumbai.com/ — WRONG DOMAIN (Critical SEO)**
- **BUG og:image = https://bricksmumbai.com/og-default.jpg — wrong domain**
- No JSON-LD structured data (SEO medium — no RealEstate/Organization schema)
- Console: 0 errors, preload warnings (unused preloaded googleusercontent image)
- **PERF: homepage prefetches ~50 RSC routes on load, many duplicated (contact ×6, compare ×4, stamp-duty ×3...). Network waste / bandwidth.**
- DATA: "Apartment in Nigdi" Cost ₹4.52 Lac for 1,550 sq.ft — implausibly low (data validation)
- DATA: "ShaktiTwo" Starting ₹150 — missing unit (Lac/Cr?)
- DATA: "Shakti" project image = image_not_supported (broken/missing image)
- DATA: Trending "in Mumbai" section shows Pune projects (Wakad, Pune); "wakad" lowercase

## SEO sweep (17 routes via SSR HTML)
- **CRITICAL: canonical = https://bricksmumbai.com (wrong domain) on ALL 17 routes** — every page tells Google the real URL is a different domain. Will deindex grihanivas.in.
- Titles present & good on: /contact, /faqs, /home-loan, /emi-calculator, /stamp-duty, /compare, /privacy, /terms, /buy(via nav)
- **DUPLICATE/MISSING TITLE: /about, /rent-agreement, /login all use generic "GrihaNivas — Mumbai Real Estate"** instead of page-specific titles (SEO medium). /about h1 = "Redefining Mumbai's Luxury..." but title generic.
- /login indexable (canonical+robots index) — login pages should be noindex (minor SEO/security).
- All pages: no JSON-LD structured data.

## /buy (listing)
- Filters: Location, Min/Max budget sliders, BHK, Furnishing. Sort: Newest/Price asc/desc (URL param, SSR). Grid/List toggle. Pagination.
- Only 1 property in entire Buy catalog ("Apartment in Nigdi") — thin inventory (content).
- Budget slider min ₹50 Lakh, but only property is ₹4.52 Lac (below min) — budget filter would hide it. Slider range mismatch.
- Title "Buy Property in Mumbai | GrihaNivas" ✓, breadcrumb present ✓

## Functional tools
- EMI calculator: math CORRECT (₹75L@8.5%/20yr=₹65,087/mo, total ₹1.56Cr, amortization zeroes 2045). Download Report + "Speak to Advisor" passes calc to /contact. ✓
- Contact form: Name/Phone/Message HTML5 required; Email NOT required. Empty submit → native browser validation only, no styled errors, no aria-invalid (a11y). Office address on /contact ("The Pavilion, Worli Sea Face") DIFFERS from footer/home ("Heera Panna, Powai 400076") — inconsistent NAP (bad for local SEO).
- /faq == /faqs (alias, both render FAQ) — NOT a bug.
- 404: garbage URL → real 404 ✓. BUT /property/<bad-slug> → 200 "Property Details" shell = SOFT-404 (no 404 for invalid property/maybe project slugs). SEO + UX.

## Auth
- Provided admin number +91987653210 = 9 digits = INVALID. Real = +919876543210. API validation rejects bad format with clear field message ✓.
- Invalid password → POST /api/auth/login 401, UI shows "Invalid credentials." (generic, no user-enumeration) ✓
- Password field type=password (masked) ✓. No show/hide toggle, no Remember Me.
- Valid admin login → redirect /admin ✓.
- **SECURITY: access+refresh JWT stored in localStorage (bricks_access_token/refresh) — NOT httpOnly cookie → XSS token theft risk. Refresh token ~30-day life. Login JSON returns full token + user PII (email shreegurudevproperties@gmail.com, role, phone).**
- Admin/* pages have generic title "GrihaNivas — Mumbai Real Estate" (no per-page <title>).

## Admin dashboard
- Sidebar 13 sections: Dashboard, Properties, Projects, Builders, Property Submissions, Leads, Blogs, Banners, Testimonials, Users, Offers, Stamp Duty Rates, System Settings.
- Stats: Leads 7, Properties 2, New Leads 7, Closed 0, Users 8, Blogs 4. **Banners & Testimonials cards show "—" (no count loaded).**
- Recent Leads table shows real customer names+phones (admin-only, expected).

## Admin: Project CRUD — PASS
- Create wizard 5 steps (Basic / Location / Media / Pricing / Review). Required: Project Name*, Builder*, Area*.
- **BUG (High): /admin/projects/new hit 429 on system/config, system/areas, system/options, admin/builders. Builder dropdown (required) failed → "Request failed", empty, NO auto-retry → form unusable until manual reload. Aggressive rate limit; tripped easily by app's own route-prefetch storm.**
- Empty-required + Next → stays on step (blocks) but NO field-level error text shown (UX).
- Advancing step 1 AUTO-CREATES draft (heading flips New→Edit Project). POST /api/projects 201.
- Create persisted in list ✓. Save as Draft works but NO success toast and no redirect (UX).
- Delete → confirmation modal ("cannot be undone") ✓ → DELETE 200 → row removed ✓.
- "Configs" column shows "—" for ALL projects even with 170/480 units (display bug).
- Leftover test data in PROD: "first project", "yjs-test-project".
- Pune projects (Wakad/wakad) with inconsistent casing on Mumbai site.

## RBAC / session
- API auth enforced: admin endpoint no-token → 401 "Access denied. No token provided." ✓
- /api/auth/login has strict rate limit (429 on burst) — good brute-force protection, but very tight.
- General API rate limit VERY aggressive: 429 trips during normal admin form load (4 parallel system calls). Real production risk.
- **BUG (High): a 429/transient API failure causes app to CLEAR tokens from localStorage and force-redirect to /login mid-session. Navigated /admin → /admin/users and got logged out with localStorage emptied. Rate-limit/transient error should NOT destroy session. Admins doing normal work could be randomly ejected.**
- Role-segregation (user token on admin endpoint) NOT fully confirmed — blocked by 429 (inconclusive).
- /admin page-level guard: redirects to /login when unauthenticated ✓ (observed via forced logout).
- **RBAC CONFIRMED (positive): user token → admin endpoints (/api/leads, POST /api/projects) = 403 "Access denied. Admin privileges required." Both UI (/admin→/account) and API enforce role separation. STRONG.**
- Logout: clears tokens ✓, redirect /login ✓, back-button → guard re-redirects to /login (no session restore) ✓.

## User dashboard (/account) — PASS
- Login as user → /account. Sidebar: Dashboard, Saved, Comparison, Enquiries, My Listings, Profile, Logout.
- Stats: Saved 0, Comparing 3/3. Quick actions, account overview. Clean UI, 0 console errors.
- Profile: Name editable; Phone + Email disabled ("Email cannot be changed"). No change-password on profile (minor).
- Content: "5 Tips for Investing in Mumbai Real Estate 2024" — stale year (2024 in 2026).

## Performance (homepage)
- TTFB ~33ms (cached), DOMContentLoaded 261ms, load 700ms — server/transport fast.
- **FCP ~3.3s = SLOW (poor). Heavy client-side render/hydration delays first paint despite fast DOM.** Likely client-fetched data (config/areas/options/offers/testimonials) + 429 retries block render.
- 100 resources, 22 images on homepage; many external (unsplash, cloudinary, googleusercontent) lacking Timing-Allow-Origin (size hidden) — no Next/Image optimization on those.
- Preload warnings: googleusercontent/unsplash images preloaded but unused (wasteful).
- **Route-prefetch storm: ~50 RSC route prefetches on homepage load (every nav link, many duplicated) — combines with tight rate limit to cause 429 on the page's own API calls.**

## Console errors
- Homepage (real visitor): 429 on /api/system/config, /api/system/areas, /api/system/options, /api/offers, /api/testimonials → CRITICAL: public page degraded by self-inflicted rate limiting.
- Otherwise no uncaught JS errors; warnings are image preload + 429.

## Responsiveness
- 360px: nav→hamburger ("Open menu") ✓; ~8px horizontal overflow (BUY/RENT toggle/carousel). Hero/search render clean.
- 768px: ~44px horizontal overflow from horizontal carousels (Master Builders/Trending, min-w-[270px] cards) not fully clipped → page horizontal scroll. Nav still hamburger.
- 1366/1920: full nav, no overflow.

## Accessibility (basics)
- Homepage: single H1 ✓, lang=en ✓, all 20 imgs have alt ✓, viewport ✓.
- Password masked ✓. Form labels present (contact/login). 
- Gaps: no aria-invalid/role=alert on form errors; decorative Material-Symbols icon spans read as text in a11y tree (e.g. "expand_more", "payments", "square_foot" announced); no visible skip-link; focus states not verified.

## SEO extras
- No JSON-LD (Organization/RealEstate/BreadcrumbList) anywhere.
- robots index,follow; sitemap not verified.
- og:image on bricksmumbai.com (wrong domain, broken social preview).
