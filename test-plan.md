# Test Plan — grihanivas.in QA Testing

**Prepared by:** QA Engineer (Claude Code)
**Date:** 2026-06-21
**Target:** https://grihanivas.in/
**Type:** Full manual + automated production-readiness QA

---

## 1. Objective

Perform a complete professional QA review of grihanivas.in covering public site, admin dashboard, user dashboard, authentication, forms, performance, responsiveness, UI/UX, SEO, accessibility, and security-aware checks. Produce an evidence-based `qa-report.md` developers can act on directly.

---

## 2. Test Environment

| Item | Value |
|---|---|
| Base URL | https://grihanivas.in/ |
| Admin login | +91987653210 / Aadmin@1234 |
| User login | +919172008630 / Vishal1226@ |
| Browser tooling | Claude-in-Chrome / Playwright MCP (navigate, screenshot, console, network, fill, click) |
| Viewports | 360, 390, 768, 1366, 1920 px |
| Test date | 2026-06-21 |

---

## 3. Testing Tools & Method

- **Browser automation** — navigate, click, fill, screenshot via MCP browser tools.
- **Console capture** — read JS errors/warnings on each page.
- **Network capture** — observe API calls, status codes, timing, failures.
- **Responsive** — resize window to each breakpoint, capture layout issues.
- **Performance** — Lighthouse-style metrics (FCP, LCP, TBT, CLS, Speed Index) where measurable; note image weight, render-blocking, unused JS/CSS.
- **SEO/Accessibility** — inspect DOM for title, meta, headings, alt text, labels, ARIA, contrast.
- **Security-aware** — safe checks only: role boundaries, direct-URL access, session clearing, token exposure, input safety with harmless values. No destructive attacks.

---

## 4. Scope & Approach (per area)

### 4.1 Public Website
- Crawl all reachable public pages from nav + footer.
- Per page: load, header nav, footer links, buttons, CTAs, forms, images, text, broken links, console errors, layout at all breakpoints, SEO title/meta/H1, OG tags.

### 4.2 Admin Dashboard (login: +91987653210)
- Login / logout.
- Dashboard overview + analytics numbers.
- Project CRUD (create / edit / delete).
- Property CRUD (create / edit / delete).
- Unit/listing create if present.
- Image/file upload.
- User management (view / status change).
- Search / filter / sort / pagination.
- Notes/comments, status updates.
- Form validation, required fields, error/success messages.
- Data persistence after refresh.
- Role-based access, navigation.

### 4.3 User Dashboard (login: +919172008630)
- Login / logout.
- Pages/data visible to user.
- User forms, notes, profile.
- Role security: block admin pages, block restricted data, direct-URL access control, data isolation.

### 4.4 Authentication & Authorization
- Valid / invalid / wrong-password / empty-field login.
- Logout + back-button behavior.
- Protected route without login.
- Admin route as normal user.
- Session expiry, token/cookie/localStorage behavior.
- Password masking, remember-me.

### 4.5 Forms
- Required, email, number, date, file/image validation.
- Min/max length, special chars, empty, duplicate.
- Success / error / loading states, submit enable/disable.
- Tabulate every form.

### 4.6 Performance
- Per key page: Performance / Accessibility / Best-Practices / SEO scores + FCP, LCP, TBT, CLS, Speed Index.
- Flag large images, unoptimized media, unused JS/CSS, render-blocking, slow APIs, layout shift, heavy third-party, lazy-load, caching.

### 4.7 UI/UX
- Visual consistency, button/font/spacing/alignment, contrast, responsiveness, loading/empty/error/success states, dashboard readability, navigation clarity, flow smoothness.

### 4.8 Responsiveness
- Navbar, sidebar, cards/tables, forms, buttons, images, modals, overflow, text wrap, horizontal scroll at each breakpoint.

### 4.9 API / Network
- Failed/slow/duplicate calls, 4xx/5xx, missing loading states, unauthorized access, response delays.

### 4.10 Console Errors
- JS errors, framework warnings, failed assets, CORS, source-map, deprecation, unhandled rejections.

### 4.11 Accessibility
- Heading hierarchy, alt text, button/form labels, keyboard nav, focus states, contrast, ARIA, modal/menu a11y.

### 4.12 SEO
- Title, meta description, H1, heading structure, alt text, canonical, OG, sitemap/robots, URL structure, indexability.

### 4.13 Security-Aware
- Admin pages blocked for user, protected pages blocked without login, no sensitive data/tokens in frontend/URL, no stack traces in API errors, file-upload restrictions, safe XSS input test, direct-URL access control, logout clears session.

---

## 5. Test Data Policy

Dummy data only, clearly marked. No real/production data deleted or overwritten without explicit permission. Delete testing only on self-created dummy records.

```
Project Name : QA Test Project - Do Not Use
Property Name: QA Test Property - Do Not Use
User Name    : QA Test User
Email        : qatesting@example.com
Notes        : Dummy data created for QA testing.
```

**OPEN QUESTION for you:** Do you authorize create + delete testing of dummy records in the live admin? If not, I will test create/edit only and skip delete.

---

## 6. Deliverable

Single `qa-report.md` with all 15 sections from your spec:
1. Executive Summary (+ production-readiness verdict)
2. Test Coverage Summary table
3. Pages Tested table
4. Bugs Found (BUG-NNN format, severity/priority)
5. Performance Report table + notes
6. Admin Testing Report
7. User Testing Report
8. Auth & Role Access Report table
9. Forms Testing Report table
10. UI/UX Improvement Suggestions (High/Med/Low)
11. Responsiveness Report table
12. SEO Report table
13. Accessibility Report table
14. Security Observations
15. Final Recommendation + Top 5 priority fixes

---

## 7. Execution Order

1. Recon — load homepage, map nav/footer, list all pages.
2. Public site sweep (all pages, all breakpoints, console, network, SEO).
3. Auth tests (invalid → valid, both roles).
4. Admin deep test (CRUD, uploads, users, analytics, forms).
5. User deep test (visibility, restrictions, role security).
6. Cross-cutting: performance, accessibility, security-aware.
7. Compile `qa-report.md`.

---

## 8. Constraints & Assumptions

- Live production site — non-destructive by default.
- Lighthouse exact scores depend on tool availability; if full Lighthouse not runnable, metrics estimated from observed load/network/DOM with that limitation stated.
- Test session limited to provided credentials; features behind other roles not covered.
- Real-data delete blocked pending your approval (Section 5).

---

**Awaiting your approval of this plan before deep testing begins.**
Please confirm: (a) plan approved? (b) delete-testing of dummy records authorized?
