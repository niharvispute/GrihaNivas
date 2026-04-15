# Frontend-Backend Feature Matrix

Date: 2026-04-15
Purpose: Keep frontend pages aligned with backend APIs and identify implementation gaps.

## 1) Public Journey Matrix

| Journey | Frontend Surface | Backend Endpoint(s) | Status | Notes |
|---|---|---|---|---|
| Home featured listings | /(public)/page.js | GET /api/properties | In Progress | Now pulls newest approved listings and prioritizes media-rich inventory via hasMedia filter. |
| Buy listings | /(public)/buy/page.js | GET /api/properties | Working | Server-side filters, sorting, and pagination active. |
| Rent listings | /(public)/rent/page.js | GET /api/properties | Working | Category-level filtering active. |
| Property detail | /(public)/property/[id]/page.js | GET /api/properties/slug/:slug, GET /api/properties/:id | Working | Dynamic detail fetch and similar listings active; gallery now has no-media fallback. |
| Compare properties | /(public)/compare/page.js | GET/POST/DELETE /api/users/compare | Working | API wired with robust mapper and error handling. |
| Save properties | cards + detail actions | GET/POST/DELETE /api/users/saved | Working | API wired for user actions. |
| Contact form | /(public)/contact/page.js | POST /api/contact | Working | Enquiry route wired. |
| Property lead forms | detail + global leads | POST /api/leads | Working | Lead type driven submission. |
| Home loan assistance | /(public)/home-loan/page.js | POST /api/leads (loan) | Working | Loan lead flow wired. |
| Rent agreement flow | /(public)/rent-agreement/page.js | POST /api/leads (agreement) | Working | Agreement lead flow wired. |
| List your property | listing console | POST /api/property-submissions | Working | Minimum media validation now enforced server-side and in UI flow. |

## 2) User Journey Matrix

| Journey | Endpoint(s) | Status | Gaps |
|---|---|---|---|
| Login / signup / OTP verify / reset | /api/auth/* | Working | Add stronger session-expiry UX copy. |
| Profile view/update | GET/PUT /api/users/me | Working | Add profile completeness score for lead conversion uplift. |
| Saved list view | GET /api/users/saved | Working | Add sort and foldering for power users. |
| Compare list view | GET /api/users/compare | Working | Add shareable compare URL and PDF export. |
| My enquiries | /api/leads/my-enquiries | Partial | Improve status timeline and admin feedback messages. |

## 3) Admin Journey Matrix

| Journey | Endpoint(s) | Status | Gaps |
|---|---|---|---|
| Property moderation | /api/properties/admin + approve/reject | Working | Add bulk moderation actions. |
| Submission moderation | /api/property-submissions/* | Working | Add SLA/aging indicators and auto-assignment rules. |
| User management | /api/users and status endpoints | Working | Add role audit log and admin activity timeline. |
| Lead CRM | /api/leads/* | Working | Add lead scoring, reminders, and conversion attribution. |
| Blog/CMS | /api/blogs/* | Working | Add content calendar and SEO score hints. |
| Banners/testimonials | /api/banners, /api/testimonials | Working | Add campaign attribution tags and click analytics. |

## 4) Data Contract Rules (Do Not Break)

1. Property mapper must accept mixed media shapes:
- `{ heroImage: { url } }`
- `{ gallery: [{ url }] }`
- legacy strings where present

2. Price rendering policy:
- Show formatted INR when numeric value exists
- Show "Price on Request" fallback when no numeric price

3. Configuration policy:
- BHK string/number should render consistently
- Commercial listings should not force a misleading BHK label

4. Gallery policy:
- Never render a blank section; show a clear no-media state

## 5) Missing Features (Priority)

P0
- Lead attribution (UTM + channel + campaign)
- Lead scoring and SLA timers in admin CRM
- Builder plan and billing controls

P1
- Builder analytics dashboard
- Recommendation engine for similar and personalized listings
- Shareable compare report

P2
- Marketing automation for dormant/intent users
- Service partner marketplace (loan, legal, registration)

## 6) Implementation Notes from Current Sprint

Completed now:
- Mapper hardening for mixed payload shapes
- Card/detail fallback rendering for missing values
- Home featured list media-first fetching
- Public properties API support for hasMedia

Recommended next engineering ticket group:
- Add mapper unit tests with payload fixtures
- Add analytics events for listing/detail/lead funnel
- Add admin lead-scoring visual indicators and filters
