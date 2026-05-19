# Bricks Frontend - Page & Integration Status

## Update - 2026-04-21

### Current Snapshot
- Frontend integration is ~95% complete. All admin console pages and all user dashboard pages are fully wired to the backend.
- Public flows (listing, detail, blogs, calculators, forms, builders) are live-data driven.
- Auth: credential login + email OTP signup + forgot-password flow fully wired.
- Route protection: `AuthGuard` component covers `/admin/*` (requireAdmin) and `/account/*` routes via layout.js files.
- **3 confirmed hardcoded-data issues** remaining (see Known Issues section).
- Backend dashboard stats bug (New/Closed leads KPI) fixed 2026-04-21 — admin dashboard now renders correctly.
- Responsive: 15 pages fully responsive, 12 partial, 11 admin pages desktop-only.

### What Is Fully Complete
- All admin console pages: properties, builders, leads, blogs, banners, testimonials, users, property-submissions, system config.
- All user dashboard pages: profile, saved properties, enquiries, compare.
- All public listing pages: buy, rent, new-launch, builders list/detail, property detail.
- All tool pages: EMI calculator, stamp duty calculator, home loan, rent agreement.
- Blogs list + detail with comments.
- Contact form + newsletter subscription.
- Auth: login, signup with OTP, forgot password.

### Known Issues (Confirmed by Code Audit)

| # | Issue | File | Severity | Fix |
|---|-------|------|----------|-----|
| 1 | `MOCK_BLOGS` hardcoded array used as initial state and API fallback on home page | `app/(public)/page.js:12-53` | Medium | Remove `MOCK_BLOGS`, show empty state when API returns no blogs |
| 2 | `FALLBACK_BANNERS` returned when banner API fails/returns empty | `services/bannerService.js:4-78` | Medium | Remove fallback, return `[]` and show empty state in admin banner page |
| 3 | `next.config.mjs` missing `images.remotePatterns` for external domains | `next.config.mjs` | High | Add `lh3.googleusercontent.com` and `res.cloudinary.com` to remotePatterns (16 files use `next/image`) |
| 4 | Frontend `.env.local` not created | root of `frontend/` | High | Create from `.env.example` with production API URL |
| 5 | `systemService.js` defaults for areas/options — acceptable for MVP | `services/systemService.js` | Low | Works fine; defaults kick in when API empty or fails |

> **Note on Issue #3**: The app uses `next/image` in 16 files. Without `remotePatterns`, Next.js will throw errors for all external images (Cloudinary property images, Google-hosted placeholder images) in production. This is a **deploy blocker**.

### What Is Still In Progress
- Mobile optimization backlog on 12 public pages and 11 admin pages (admin pages are desktop-only and acceptable for launch).
- Admin contact submissions UI (backend endpoint exists, no frontend admin view built yet).

---

## Page Status

### Admin Pages (`/admin`) — All Wired ✅

| Page | Route | API Wired | Responsive | Notes |
|------|-------|-----------|-----------|-------|
| Dashboard | `/admin` | ✅ | ❌ | All 4 KPIs (Total Leads, Properties Listed, New Leads, Leads Closed) render correctly — backend fix applied 2026-04-21 |
| Properties Management | `/admin/properties` | ✅ | ❌ | CRUD, featured toggle, new-launch flag working |
| Property Submissions | `/admin/property-submissions` | ✅ | ❌ | Review workflow (new→reviewing→approved) |
| Builders Management | `/admin/builders` | ✅ | ❌ | Full CRUD, featured toggle |
| New Builder | `/admin/builders/new` | ✅ | ❌ | |
| Edit Builder | `/admin/builders/[id]/edit` | ✅ | ❌ | |
| Leads/CRM | `/admin/leads` | ✅ | ❌ | Status workflow, notes, assignment wired |
| Blogs Management | `/admin/blogs` | ✅ | ❌ | Editor + comment moderation |
| Banners Management | `/admin/banners` | ⚠️ | ❌ | Falls back to FALLBACK_BANNERS if API empty |
| Testimonials Management | `/admin/testimonials` | ✅ | ❌ | CRUD + image upload |
| Users Management | `/admin/users` | ✅ | ❌ | List, activate, deactivate |
| System Config | `/admin/system` | ✅ | ❌ | Dynamic config editor |

---

### User Dashboard Pages (`/account`) — All Wired ✅

| Page | Route | API Wired | Responsive |
|------|-------|-----------|-----------|
| My Dashboard | `/account` | ✅ | ✅ |
| My Profile | `/account/profile` | ✅ | ✅ |
| Saved Properties | `/account/saved` | ✅ | ✅ |
| My Enquiries | `/account/enquiries` | ✅ | ✅ |
| My Listings | `/account/listings` | ✅ | ✅ |

---

### Public Pages

| Page | Route | API Wired | Responsive | Notes |
|------|-------|-----------|-----------|-------|
| Home | `/` | ⚠️ | ⚠️ | MOCK_BLOGS hardcoded fallback |
| Buy Properties | `/buy` | ✅ | ✅ | |
| Rent Properties | `/rent` | ✅ | ✅ | |
| Commercial | `/commercial` | ✅ | ⚠️ | Redirects to `/builders` |
| New Launches | `/new-launch` | ✅ | ⚠️ | |
| Launches | `/launches` | ✅ | ⚠️ | |
| Property Detail | `/property/[id]` | ✅ | ✅ | |
| Compare | `/compare` | ✅ | ✅ | |
| Builders List | `/builders` | ✅ | ✅ | |
| Builder Detail | `/builders/[slug]` | ✅ | ✅ | |
| Blogs List | `/blogs` | ✅ | ⚠️ | |
| Blog Detail | `/blogs/[slug]` | ✅ | ⚠️ | |
| EMI Calculator | `/emi-calculator` | ✅ | ✅ | |
| Stamp Duty | `/stamp-duty` | ✅ | ✅ | |
| Home Loan | `/home-loan` | ✅ | ✅ | |
| Rent Agreement | `/rent-agreement` | ✅ | ✅ | |
| Contact | `/contact` | ✅ | ✅ | |
| List Property | `/list-property` | ✅ | ⚠️ | |
| Loan | `/loan` | — | — | Redirect to `/home-loan` |
| About | `/about` | — | ⚠️ | Static page, hardcoded team images |
| FAQ | `/faqs` | — | ⚠️ | Static content |
| Login | `/login` | ✅ | ⚠️ | |

---

## Pre-Deploy Checklist

### 🔴 Blocking (must fix before deploy)
- [ ] Create `frontend/.env.local` with `NEXT_PUBLIC_API_BASE_URL=<production URL>`
- [ ] Add `images.remotePatterns` to `next.config.mjs` for `lh3.googleusercontent.com` and `res.cloudinary.com`
- [ ] Fix backend dashboard stats bug (see `backend/progress.md`)

### 🟡 Should Fix
- [ ] Remove `MOCK_BLOGS` from `app/(public)/page.js` — replace with empty state
- [ ] Remove `FALLBACK_BANNERS` from `services/bannerService.js` — return `[]` on failure

### 🟢 Acceptable for Launch
- [ ] Admin pages not responsive (desktop-only is fine for admin)
- [ ] `systemService.js` hardcoded defaults (good resilience pattern, not a bug)
- [ ] About/FAQ pages with static content (fine for now)

---

## Responsive Design Summary

- **✅ Fully Responsive**: 15 pages (all account + key public pages)
- **⚠️ Partial**: 12 pages (home, blogs, service pages, login)
- **❌ Not Responsive**: 11 admin pages (desktop-only, acceptable)
- **Total Pages**: ~38 pages
