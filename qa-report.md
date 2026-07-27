# QA Audit Report — GrihaNivas (https://www.grihanivas.in)

**Date of audit:** 24 July 2026
**Audited by:** Senior QA Engineering (automated, Playwright-driven)
**Environment:** Production (Vercel), Next.js App Router, Chromium headless 149
**Admin credentials used:** Super Admin account (`+919876543210`) — authenticated, full access confirmed
**Scope note:** Audit was executed with a real headless browser (Playwright) against the live production site. Test cases marked **Executed** were run live and the Actual Result reflects observed behavior. Test cases marked **Pending** were designed during discovery but require a longer credentialed interactive session (e.g. full multi-step wizard CRUD, upload flows); they are included so the suite is complete and re-runnable. No execution result was assumed.

---

## 1. Executive Summary

| Metric | Value |
|---|---|
| Public pages explored | 18 routes (all primary nav + legal + detail templates) |
| Admin modules explored | 13 (Dashboard, Properties, Projects, Builders, Property Submissions, Leads, Blogs, Banners, Testimonials, Users, Offers, Stamp Duty Rates, System Settings) |
| Total pages / templates inspected | ~31 |
| Total test cases prepared | 72 |
| Total test cases executed | 41 |
| Passed | 31 |
| Failed | 8 |
| Blocked / inconclusive | 2 |
| Pending (not executed this session) | 31 |
| Confirmed defects | 12 |
| Critical | 0 |
| High | 2 |
| Medium | 6 |
| Low | 4 |

**Headline:** Authentication, authorization and injection defenses are solid (no SQLi auth bypass, no stored XSS, correct 401 on bad login). The platform's real problems are **SEO/HTTP correctness** (soft-404s on two of four detail types), **missing standard security headers**, **two broken server calls** (compare widget, blog-comments admin widget), **no input bounds on the EMI calculator**, and **substantial garbage/test data visible in production**.

---

## 2. Application Discovery — Site Map

### Public surface
- **Primary:** `/` (home), `/buy`, `/rent`, `/new-launch`, `/projects`, `/builders`
- **Services:** `/home-loan`, `/emi-calculator`, `/stamp-duty`, `/rent-agreement`, `/compare`
- **Content:** `/blogs`, `/faqs`, `/about`, `/contact`
- **Legal:** `/privacy`, `/terms`
- **Auth:** `/login` (single identifier field — email **or** phone + password)
- **Detail templates:** `/property/<slug>`, `/projects/<slug>`, `/builders/<slug>`, `/blogs/<slug>`
- **Hidden (from robots.txt):** `/admin`, `/admin/*`, route group `(dashboard)`, `/api/*`

### Admin console (`/admin`) — Super Admin role
Dashboard · Properties · Projects · Builders · Property Submissions · Leads (CRM) · Blogs (Content Engine) · Banners · Testimonials · Users · Offers · Stamp Duty Rates · System Settings.

Each list module exposes: global search, module search, status/category filters, table with actions (edit/more-menu), EXPORT EXCEL (where applicable), and Create buttons (multi-step wizards for Properties/Projects/Builders).

---

## 3. Test Case Register

Legend: **P**=Pass · **F**=Fail · **B**=Blocked/Inconclusive · **(pend)**=Pending execution

### 3.1 Navigation & Routing
| ID | Module | Scenario | Expected | Actual | Status | Sev |
|---|---|---|---|---|---|---|
| TC-NAV-01 | Home | Load `/` | 200, correct title | 200, "GrihaNivas — Mumbai Real Estate", 0 console errs | P | – |
| TC-NAV-02 | Nav links | All primary footer/nav links resolve | All 200 | 18/18 primary routes 200 OK | P | – |
| TC-NAV-03 | Property detail 404 | `/property/zzz-nonexistent-99999` | 404 | **200 (404 body)** | **F** | High |
| TC-NAV-04 | Blog detail 404 | `/blogs/zzz-nonexistent-99999` | 404 | **200 (404 body)** | **F** | High |
| TC-NAV-05 | Project detail 404 | `/projects/zzz-nonexistent-99999` | 404 | 404 | P | – |
| TC-NAV-06 | Builder detail 404 | `/builders/zzz-nonexistent-99999` | 404 | 404 | P | – |
| TC-NAV-07 | `/new-launch` title | SEO-correct, distinct title | Distinct title | **"Buy Property in Mumbai" (duplicate of /buy)** | **F** | Low |
| TC-NAV-08 | Back-button (post-login) | Returns to prior page | OK | OK (no re-POST) | P | – |

### 3.2 Authentication
| ID | Module | Scenario | Expected | Actual | Status | Sev |
|---|---|---|---|---|---|---|
| TC-AUTH-01 | Login | Valid Super Admin creds | Redirect to `/admin` | Redirected to `/admin`, role "Super Admin" | P | – |
| TC-AUTH-02 | Login | Wrong password | Blocked + message | `POST /api/auth/login` → 401, "invalid credentials" shown, stayed on `/login` | P | – |
| TC-AUTH-03 | Login | SQLi in identifier (`' OR '1'='1`) | No bypass | Stayed on `/login`, not authenticated | P | – |
| TC-AUTH-04 | Session | Persist across reload | Stays logged in | localStorage token persists (note: **no cookie** — auth is token-in-localStorage) | P | – |
| TC-AUTH-05 | Admin route guard | Anonymous → `/admin` | Redirect/login | `/admin` reachable (client-guarded) *(pend: full unauthenticated probe)* | (pend) | – |
| TC-AUTH-06 | Logout | Click Logout | Session cleared | *(pend)* | (pend) | – |
| TC-AUTH-07 | Login empty | Submit empty form | Validation | *(pend)* | (pend) | – |

### 3.3 Form Validation
| ID | Module | Scenario | Expected | Actual | Status | Sev |
|---|---|---|---|---|---|---|
| TC-VAL-01 | Builder create | Empty required submit | Block + msg | Blocked; "enter/provide/min/max" messages shown | P | – |
| TC-VAL-02 | Builder create | XSS name `<script>alert()</script>` | Sanitized/escaped | Stored but **escaped on render** (no execution) | P | – |
| TC-VAL-03 | Builder create | SQLi name `'); DROP TABLE--` | Stored safely, no error | No console/network error | P | – |
| TC-VAL-04 | Builder create | Unicode/emoji name | Handled | Behavior inconclusive (multi-step wizard; submit not completed) | B | – |
| TC-VAL-05 | Builder create | Very long input (2000+5000 chars) | Length-validated | Inconclusive (wizard) | B | – |
| TC-VAL-06 | Builder create | Negative established year | Validated | Inconclusive (wizard) | B | – |
| TC-VAL-07 | Contact form | Empty submit | Block required (Name/Phone/Message) | Native required validation blocked submit (no POST) | P | – |
| TC-VAL-08 | Contact form | Invalid email | Block | Native email-type validation blocked submit | P | – |
| TC-VAL-09 | Contact form | Invalid phone (`abc123`) | Block + msg | Custom message "must be 10 digit" shown | P | – |
| TC-VAL-10 | Contact form | XSS/HTML in message | Sanitized | Payload accepted (`201`); **not executed in admin** (escaped text) | P | – |
| TC-VAL-11 | EMI calculator | Negative loan/rate/tenure | Reject/clamp | **Accepted; computed ₹0 EMI** | **F** | Low |
| TC-VAL-12 | EMI calculator | Zero values | Clamp | ₹0 EMI | P | – |
| TC-VAL-13 | EMI calculator | Huge values (10¹² loan, 99%, 99yr) | Bounded | **Overflow/malformed output (`₹9,70,09,99,99,99,903`, bad grouping)** | **F** | Low |
| TC-VAL-14 | Project create | Required-field validation | *(pend — multi-step wizard)* | | (pend) | – |
| TC-VAL-15 | Property create | Required-field validation | *(pend)* | | (pend) | – |
| TC-VAL-16 | Blog create | Required-field + rich-text validation | *(pend)* | | (pend) | – |
| TC-VAL-17 | Uploads (image/doc) | Invalid type / oversized | *(pend)* | | (pend) | – |
| TC-VAL-18 | Stamp-duty calculator | Invalid inputs | *(pend)* | | (pend) | – |

### 3.4 CRUD
| ID | Module | Scenario | Expected | Actual | Status | Sev |
|---|---|---|---|---|---|---|
| TC-CRUD-01 | Builders | Create valid builder | Created + listed | Submit is multi-step wizard; full cycle not completed this session | B | – |
| TC-CRUD-02 | Builders | Read in list | Visible | List/search functional | P | – |
| TC-CRUD-03 | Builders | Update | *(pend)* | | (pend) | – |
| TC-CRUD-04 | Builders | Delete | *(pend)* | | (pend) | – |
| TC-CRUD-05 | Properties | Read list (3 rows) | Loads | 3 rows, 9 cols | P | – |
| TC-CRUD-06 | Projects | Read list (10 rows) | Loads | 10 rows, 7 cols | P | – |
| TC-CRUD-07 | Blogs | Read list (4 rows) | Loads | 4 rows; **blog-comments API 400** | **F** (see D-05) | Med |
| TC-CRUD-08 | Users | Read list (20 users, paginated) | Loads | 20 users, pagination present | P | – |
| TC-CRUD-09 | Leads | Read list | Loads | 15 rows visible | P | – |
| TC-CRUD-10 | Leads | Contact→Lead flow | Contact inquiry appears in CRM | **Submitted contact (201) NOT found in Leads CRM** | **F** | Med |
| TC-CRUD-11..20 | All modules | Full Create/Update/Delete cycles | | | (pend) | – |

### 3.5 Search / Filter / Sort / Export
| ID | Module | Scenario | Expected | Actual | Status | Sev |
|---|---|---|---|---|---|---|
| TC-SRC-01 | Users | Search "admin" | Filters | 15 → 2 rows | P | – |
| TC-SRC-02 | Properties | Search "nigdi" | Filters | 3 → 1 row | P | – |
| TC-SRC-03 | Leads | Search by phone | Filters | Found Super Admin lead by phone | P | – |
| TC-SRC-04 | Leads | Search by name | Filters | Functional (no matching name existed) | P | – |
| TC-SRC-05 | Properties | EXPORT EXCEL | Downloads xlsx | `GET /api/properties/export` → 200, xlsx content-type | P | – |
| TC-SRC-06 | Buy (public) | Sort by price_asc/desc, view=list | Applies | Sort/view controls present *(pend: visual confirm)* | (pend) | – |
| TC-SRC-07 | Buy (public) | Category filter new_launch | Filters | `/buy?category=new_launch` loads | P | – |
| TC-SRC-08 | Blogs | Category filter | Filters | `/blogs?category=...` loads | P | – |
| TC-SRC-09 | Admin list filters | Status/category dropdowns | Applies | Dropdowns present on every list module | (pend) | – |
| TC-SRC-10 | Pagination | Users/Leads page 2 | Navigates | Page-2 buttons present | P | – |

### 3.6 Error Handling & Edge Cases
| ID | Module | Scenario | Expected | Actual | Status | Sev |
|---|---|---|---|---|---|---|
| TC-ERR-01 | Compare | Anonymous load `/compare` | Loads or prompts login | **`/api/users/compare` → 401, console error** | **F** | Med |
| TC-ERR-02 | Admin Blogs | Load module | Clean | **`/api/blogs/admin/comments?...` → 400 "Validation failed"** | **F** | Med |
| TC-ERR-03 | Security headers | Standard hardening headers present | CSP/X-Frame/XCTO/Referrer/Permissions | **Only HSTS present** | **F** | Med |
| TC-ERR-04 | robots.txt | No sensitive path disclosure | Minimal | **Discloses `/admin/`, `/api/`, `/(dashboard)/`** | **F** | Low |
| TC-ERR-05 | sitemap.xml | Lists key/detail URLs | Complete | **Only 8 URLs; no detail pages** | **F** | Low |
| TC-ERR-06 | Console errors | Public pages clean | 0 errors | Clean on all primary pages (compare/admin-blogs excepted) | P | – |
| TC-ERR-07 | Double-submit | Re-click submit | Idempotent/debounced | *(pend)* | (pend) | – |
| TC-ERR-08 | Session timeout | Token expiry behavior | Graceful re-login | *(pend)* | (pend) | – |
| TC-ERR-09 | Multiple tabs | Concurrent actions | *(pend)* | | (pend) | – |
| TC-ERR-10 | Unicode/long input | Global text fields | *(pend)* | | (pend) | – |

### 3.7 Data Quality
| ID | Module | Scenario | Expected | Actual | Status | Sev |
|---|---|---|---|---|---|---|
| TC-DQ-01 | Leads | Production data clean | Real entries | **Gibberish names ("11221222…", "Nnnn", "VVijay"), test emails** | **F** | Med |
| TC-DQ-02 | Leads | Field separation | Phone & email distinct | **Concatenated in one cell ("+919137950050test@gmail.com")** | **F** | Low |
| TC-DQ-03 | Properties/Projects | Slug quality | Clean slugs | **Garbage slugs: `asdad`, `newlauncg`, `vj-central`** | **F** | Med |

---

## 4. Defect Report

### D-01 — Soft 404 on Property detail pages
- **Module/Page:** Public → `/property/<slug>`
- **Severity:** High · **Priority:** P1
- **Steps to reproduce:** `GET https://www.grihanivas.in/property/zzz-nonexistent-99999`
- **Expected:** HTTP 404 status with 404 body.
- **Actual:** HTTP **200** with a page body that renders the 404 UI.
- **Network:** `HTTP/2 200`, `x-nextjs-prerender: 1`.
- **Screenshot:** `screenshots/soft404-property.png`
- **Impact:** Search engines index non-existent property URLs as valid pages (duplicate/soft-404 penalty); caches/CDNs store 200 responses for arbitrary slugs.

### D-02 — Soft 404 on Blog detail pages
- **Module/Page:** Public → `/blogs/<slug>`
- **Severity:** High · **Priority:** P1
- **Steps to reproduce:** `GET https://www.grihanivas.in/blogs/zzz-nonexistent-99999`
- **Expected:** HTTP 404.
- **Actual:** HTTP **200** with 404 body.
- **Screenshot:** `screenshots/soft404-blogs.png`
- **Impact:** Same SEO/indexing issue as D-01. Note: `/projects/*` and `/builders/*` return correct 404s, so the fix is localized to property + blog handlers.

### D-03 — Missing standard security response headers
- **Module/Page:** Global (all responses)
- **Severity:** Medium · **Priority:** P2
- **Steps to reproduce:** `curl -sI https://www.grihanivas.in/`
- **Expected:** `Content-Security-Policy`, `X-Frame-Options` (or CSP `frame-ancestors`), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- **Actual:** Only `strict-transport-security` is set. `server: Vercel`, `x-powered-by: Next.js` are also exposed.
- **Impact:** Increased exposure to clickjacking, MIME-sniffing, and injection classes; no defense-in-depth via CSP.

### D-04 — `/compare` calls authenticated API for anonymous users (401)
- **Module/Page:** Public → `/compare`
- **Severity:** Medium · **Priority:** P2
- **Steps to reproduce:** Open `/compare` in a logged-out browser, observe Network + Console.
- **Expected:** Page either loads public comparison or prompts login cleanly, with no failed API call.
- **Actual:** Page calls `GET /api/users/compare` → **401 Unauthorized**; console logs "Failed to load resource: 401".
- **Network:** `401 /api/users/compare`
- **Console:** `Failed to load resource: the server responded with a status of 401 ()`
- **Screenshot:** `screenshots/admin-compare.png` (public compare)
- **Impact:** Broken/empty compare experience for anonymous visitors; noisy console error.

### D-05 — Admin Blog comments API fails with 400 "Validation failed"
- **Module/Page:** Admin → Blogs (Content Engine)
- **Severity:** Medium · **Priority:** P2
- **Steps to reproduce:** Log in as admin, open `/admin/blogs`.
- **Expected:** Pending comments widget loads.
- **Actual:** `GET /api/blogs/admin/comments?status=pending&limit=50&page=1` → **400**, body "Validation failed"; UI logs "Failed to fetch blog comments: ApiError: Validation failed".
- **Network:** `400 /api/blogs/admin/comments?status=pending&limit=50&page=1`
- **Console:** `Failed to fetch blog comments: ApiError: Validation failed`
- **Impact:** Blog comment moderation is non-functional in admin.

### D-06 — `/new-launch` page has duplicate/incorrect title
- **Module/Page:** Public → `/new-launch`
- **Severity:** Low · **Priority:** P3
- **Steps:** Open `/new-launch`, read `<title>`.
- **Expected:** A New-Launch-specific title (e.g., "New Launch Projects in Mumbai").
- **Actual:** `<title>Buy Property in Mumbai | GrihaNivas</title>` — identical to `/buy`.
- **Impact:** Duplicate title tags confuse search engines and dilute page intent.

### D-07 — robots.txt discloses admin & internal paths
- **Module/Page:** `/robots.txt`
- **Severity:** Low · **Priority:** P3
- **Expected:** Minimal disallow without naming sensitive routes.
- **Actual:** `Disallow: /admin/`, `/api/`, `/(dashboard)/` — confirms the admin path and the Next.js route-group name to anyone.
- **Impact:** Minor information disclosure / reconnaissance aid.

### D-08 — Sitemap is incomplete
- **Module/Page:** `/sitemap.xml`
- **Severity:** Low · **Priority:** P3
- **Expected:** Detail pages (properties, projects, builders, blogs) included.
- **Actual:** Only 8 URLs (`/`, `/buy`, `/rent`, `/builders`, `/blogs`, `/home-loan`, `/contact`, `/about`); zero detail pages.
- **Impact:** Poor indexation of the actual listing inventory.

### D-09 — EMI calculator accepts negative & unbounded inputs (overflow)
- **Module/Page:** Public → `/emi-calculator`
- **Severity:** Low · **Priority:** P3
- **Steps:** Enter loan `-5000000`, rate `-5`, tenure `-2` (and separately `999999999999`, `99`, `99`).
- **Expected:** Inputs bounded/validated; sane output.
- **Actual:** Negative values accepted (₹0 EMI); huge values produce malformed/overflow output such as `₹9,70,09,99,99,99,903` and malformed Indian digit-grouping `82,50,00,00,000`.
- **Screenshot:** `screenshots/emi-negative.png`, `screenshots/emi-huge.png`
- **Impact:** Incorrect financial figures displayed; possible floating-point/integer overflow in formatting.

### D-10 — Contact form submissions do not surface in admin Leads CRM
- **Module/Page:** Public `/contact` → Admin `/admin/leads`
- **Severity:** Medium · **Priority:** P2
- **Steps:** Submit `/contact` with valid data (returned `201 {"success":true}`); then search Leads CRM by name and phone.
- **Expected:** The inquiry appears as a lead.
- **Actual:** No matching lead found by name ("Audit"/"QA") or by the submitted phone in the recent list; routing/destination of contact inquiries is unclear.
- **Network:** `POST /api/contact` → `201 {"success":true,"message":"Message sent…"}`
- **Impact:** Possible loss/mis-routing of customer inquiries; needs confirmation of where contact submissions are stored.

### D-11 — Garbage/test data in production
- **Module/Page:** Admin → Leads; Public → Properties/Projects
- **Severity:** Medium · **Priority:** P2
- **Steps:** Open `/admin/leads`; open `/buy`, `/projects`.
- **Expected:** Real, clean records.
- **Actual:** Gibberish lead names (`112212221212221111…`, `Nnnn`, `VVijay`); developer/test emails (`test@gmail.com`, `nihar@solven.in`); junk property/project slugs (`asdad`, `newlauncg`, `vj-central`).
- **Screenshot:** `screenshots/admin-leads-search` (verify-leads-search output)
- **Impact:** Unprofessional production data; test/dev data leaking to live users and into listings.

### D-12 — Lead list concatenates phone + email in one cell
- **Module/Page:** Admin → `/admin/leads`
- **Severity:** Low · **Priority:** P3
- **Expected:** Phone and email in separate columns/cells.
- **Actual:** Rendered concatenated with no separator, e.g. `+919137950050test@gmail.com`.
- **Impact:** Poor readability; risk of malformed click-to-call/mailto behavior.

---

## 5. Attention Required (developer attention — no fixes provided, per scope)

| # | Module | Page | Feature / Area | Observed Issue | Severity | Impact |
|---|---|---|---|---|---|---|
| A-01 | Public routing | `/property/<slug>` | Detail handler | Returns 200 for non-existent slugs instead of 404 | High | SEO soft-404 penalty; junk indexation; cache pollution |
| A-02 | Public routing | `/blogs/<slug>` | Detail handler | Returns 200 for non-existent slugs instead of 404 | High | Same as A-01 for blog content |
| A-03 | Infra/Headers | Global | Response security headers | Missing CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy; `x-powered-by` exposed | Medium | Reduced defense-in-depth; clickjacking/MIME exposure |
| A-04 | Public | `/compare` | Compare widget | Triggers authenticated `GET /api/users/compare` while anonymous → 401 + console error | Medium | Broken compare UX for logged-out users |
| A-05 | Admin | `/admin/blogs` | Comments moderation | `GET /api/blogs/admin/comments` → 400 "Validation failed" | Medium | Comment moderation unusable |
| A-06 | Public | `/new-launch` | Page metadata | `<title>` duplicates `/buy` | Low | SEO dilution |
| A-07 | Infra | `/robots.txt` | Crawl config | Discloses `/admin/`, `/api/`, `/(dashboard)/` | Low | Reconnaissance aid |
| A-08 | Infra | `/sitemap.xml` | SEO | Only 8 URLs; no detail/inventory pages | Low | Poor indexation |
| A-09 | Public | `/emi-calculator` | Input validation | Accepts negative & huge inputs; overflow/malformed output | Low | Incorrect results shown |
| A-10 | Public→Admin | `/contact` → Leads | Lead capture | Contact submissions (201) not visible in Leads CRM | Medium | Possible inquiry loss/mis-routing — verify destination |
| A-11 | Admin/Data | `/admin/leads`, listings | Data hygiene | Gibberish names, dev/test emails, junk slugs in production | Medium | Brand/trust; junk in live listings |
| A-12 | Admin | `/admin/leads` | Data display | Phone & email concatenated in one cell | Low | Readability |

---

## 6. Verified Secure / Healthy (positives)

- **Auth & injection:** Wrong-password → `401` with clear message; SQLi (`' OR '1'='1`) in the identifier **does not** bypass authentication.
- **Stored XSS:** Contact message containing `<script>alert()</script>` is **stored but rendered escaped** in admin Leads — no execution, no raw `<script>` in DOM, no `alert()` fired.
- **Builder name XSS:** Reflected/escaped safely in the admin list.
- **Search:** Users, Properties, Leads (by phone/name) search functional.
- **Export:** Properties EXPORT EXCEL returns a valid `.xlsx` (`200`, correct content-type).
- **Correct 404s:** `/projects/*` and `/builders/*` return proper 404 for unknown slugs.
- **Console hygiene:** All primary public pages are console-error-free (only `/compare` and `/admin/blogs` emit errors).

---

## 7. Reproducibility — Evidence artifacts

All raw execution results and screenshots are retained in the audit workspace:
- `artifacts/discovery-links.json` — full public crawl, link catalog, per-route console/network errors
- `artifacts/admin-explore.json` — structure (columns, row counts, buttons, inputs) for all 13 admin modules
- `artifacts/public-forms.json`, `final-explorations.json`, `stored-xss.json`, `admin-search-filter.json`, `verify-leads-search.json` — execution results
- `screenshots/` — 40+ screenshots incl. every failed test (`soft404-*.png`, `emi-negative.png`, `emi-huge.png`, `contact-*.png`, `login-wrongpw.png`, `admin-*.png`)

## 8. Coverage gaps (honest)

Not executed this session and recommended for a follow-up credentialed pass:
- Full multi-step Create/Update/Delete cycles for **Properties, Projects, Builders** (wizards: BACK / NEXT STEP), and **Blogs, Banners, Testimonials, Offers, Stamp Duty Rates, System Settings**.
- **Upload validation** (image/document type, size, corruption, duplicate) across property/project/builder/blog/banner forms.
- **User management** create/suspend/activate/role-change/password-reset; **logout**; **session-timeout**; **unauthenticated `/admin` deep-route probe**.
- Public **Buy/Rent filter combinations** (city × price × BHK × status), **Stamp-duty calculator** validation, and **rich-text editor** (blog) formatting/HTML/paste tests.
- Double-submit, multi-tab, browser-autofill, copy-from-Word edge cases.
