# Bricks Webapp Audit, Business Model, and Growth Roadmap

Date: 2026-04-15
Owner: Product + Engineering
Scope: Frontend + Backend + Revenue Model + Missing Features + Improvement Plan

## 1) Executive Summary

Bricks already has a strong foundation: backend domain coverage is broad, frontend surface area is wide, and the product vision is clear (Mumbai-focused editorial property platform).

Current bottleneck is not raw feature count. The bottleneck is consistency:
- Data contract consistency across API -> mapper -> UI
- Operational consistency in approval-to-publish lifecycle
- Monetization consistency (lead value capture and attribution)

Priority recommendation:
- Stabilize core buyer journey first: discovery -> detail -> enquiry -> conversion tracking
- Productize monetization rails: premium listing, builder plans, referral-led ancillary revenue
- Add instrumentation and funnel dashboards immediately so decisions are data-driven

## 2) Business Model Design (Revenue-First)

### 2.1 Core Customer Segments

- Demand side: buyers, renters, investors
- Supply side: builders, channel partners, property owners
- Service partners: banks/NBFCs, legal service providers, registration/loan consultants

### 2.2 Value Proposition

- Curated, trust-first inventory instead of spam listing marketplace
- Faster matching with structured filters and high-quality media
- Concierge layer: guided buying journey + legal/loan support

### 2.3 Revenue Streams

1. Lead Monetization
- Charge builders/agents per qualified lead
- Tiered pricing by locality, budget, and lead intent

2. Listing Subscription (SaaS-like)
- Monthly package for builders/partners
- Includes listing slots, analytics, and CRM features

3. Premium Placement
- Hero spots, category boosts, campaign banners
- CPC, CPM, or fixed campaign pricing

4. Transaction Services
- Home loan referral commissions
- Rent agreement / registration service fee
- Legal documentation and due diligence package

5. Data/Insights Product (Phase 2)
- Area demand heatmaps, pricing trend exports, competitor benchmark reports

### 2.4 Pricing Blueprint (Starter)

- Starter Builder Plan: fixed monthly listing + basic dashboard
- Growth Plan: higher listing volume + CRM automations + priority support
- Enterprise Plan: multi-project account + API integrations + account manager

Lead pricing rule of thumb:
- Premium segment leads priced higher
- Contacts with budget + timeline + financing profile qualify as high-intent

## 3) Product and Engineering Architecture (Current)

### 3.1 Frontend (Next.js App Router)

- Route groups: public, dashboard, admin
- Service layer: API domain modules
- Mapper layer: DTO normalization before rendering
- Componentized UI for listing, detail, compare, calculators, and dashboards

Key strength:
- Fast visual iteration and broad page coverage

Key risk:
- Mixed data shapes can break rendering if mapper assumptions are strict

### 3.2 Backend (Express + MongoDB)

- Domain routes: auth, properties, users, leads, blogs, banners, testimonials, calculators, contact, dashboard, property submissions
- Middleware: auth, admin guard, validation, upload, rate-limit
- Models: property lifecycle, lead CRM, content modules

Key strength:
- Broad API contract and production hardening posture

Key risk:
- Need stronger observability + attribution + conversion analytics

## 4) Feature Coverage Snapshot

### 4.1 What is Working

- Public listing and detail flows
- Lead capture APIs
- User saved/compare APIs
- Admin moderation for properties/submissions
- Calculators and content modules

### 4.2 Recently Stabilized (This Audit Pass)

- Property data mapping hardened for mixed payload shapes (media, price, BHK, area)
- Detail gallery now degrades gracefully when media is absent
- Card and sticky panels now show safer fallbacks (price/config/area/location)
- Home featured section prioritizes listings with media via API query
- API support added for media-aware listing filter (`hasMedia`)

## 5) Missing Features and How to Implement

## P0 (Must-Have for Growth)

### 5.1 End-to-End Conversion Attribution

Problem:
- Revenue cannot be optimized without source-level conversion visibility.

Implement:
- Add UTM + first-touch fields in lead model (`sourceCampaign`, `sourceMedium`, `sourceChannel`)
- Capture on frontend and include in lead/create payloads
- Build admin funnel dashboard: impressions -> clicks -> leads -> qualified -> closed

Outcome:
- CAC optimization and campaign ROI visibility

### 5.2 Lead Scoring Engine

Problem:
- All leads are treated equally; sales effort gets diluted.

Implement:
- Score using budget completeness, timeline, contactability, location fit
- Auto-assign priority buckets (A/B/C)
- SLA timers in CRM view

Outcome:
- Better close rate per sales hour

### 5.3 Revenue Controls in Admin

Problem:
- No billing-grade control panel for monetized inventory.

Implement:
- Builder plan model (`plan`, `quota`, `renewalDate`, `overageRate`)
- Lead usage counters and overage tracking
- Invoice export endpoint (CSV/PDF starter)

Outcome:
- Predictable recurring revenue

## P1 (High Impact)

### 5.4 Builder Analytics Dashboard

Implement:
- Builder-facing metrics: listing views, saves, enquiries, qualified lead ratio
- Weekly summary email job

Outcome:
- Improves retention and plan upgrades

### 5.5 Smart Matching + Recommendations

Implement:
- Similar properties ranking using area, budget band, BHK, category
- Personalized recommendations based on saved/compare behavior

Outcome:
- Higher session depth and lead conversion

### 5.6 Trust Layer Enhancements

Implement:
- Verification badges by proof type (RERA, media verified, legal checks)
- Timestamped verification metadata on detail pages

Outcome:
- Better conversion and lower buyer hesitation

## P2 (Scale)

### 5.7 Marketing Automation

Implement:
- Drip campaigns for dormant users and abandoned enquiry intents
- WhatsApp/email templates by segment

### 5.8 Partner Marketplace

Implement:
- Expose legal, loan, and registration partners with SLA and ratings

## 6) Technical Improvements Required

### 6.1 API Contract Governance

- Version mappers and add fixture-based tests for mapping
- Keep a schema snapshot for critical endpoints (`properties`, `leads`, `users`)

### 6.2 Observability

- Add request tracing ID and structured logs
- Add API latency and error dashboards (4xx/5xx by endpoint)

### 6.3 Data Quality Rules

- Enforce media completeness by listing type
- Add periodic data cleanup jobs for orphan states

### 6.4 Performance and SEO

- Replace heavy image tags on high-traffic pages with optimized image strategy
- Add metadata automation and structured data for property/blog pages

## 7) KPI Framework (North-Star + Operating)

North-star metric:
- Qualified Leads per 1,000 Sessions

Operating metrics:
- Listing -> detail click-through rate
- Detail -> enquiry submission rate
- Enquiry -> qualified conversion
- Qualified -> closed conversion
- Revenue per active builder account
- Plan upgrade rate
- CAC payback period

Unit economics starter formulas:
- Lead Gross Margin = Lead Revenue - Acquisition Cost - Sales Handling Cost
- Plan MRR = sum(active plan subscriptions)
- Revenue Mix = Plan MRR : Lead Revenue : Service Commissions

## 8) 30/60/90 Day Execution Plan

Day 0-30
- Add attribution, lead scoring v1, and dashboard funnel metrics
- Close mapper and UI contract gaps across high-traffic pages

Day 31-60
- Launch builder analytics and usage-based plan controls
- Start automated re-engagement campaigns

Day 61-90
- Launch partner marketplace module
- Run pricing experiments and optimize conversion funnel by segment

## 9) Suggested Team Operating Model

Weekly cadence:
- Product growth review with funnel metrics
- Engineering reliability review with API and frontend error rates
- Sales feedback loop on lead quality labels

Ownership:
- PM owns KPI and experiment backlog
- Engineering owns contract reliability and platform speed
- Sales ops owns lead qualification policy

## 10) Final Recommendation

Best path for Bricks is a hybrid model:
- B2B recurring revenue (builder plans)
- B2B2C transactional upside (qualified leads + partner commissions)

That combination gives stable cash flow plus upside growth. The immediate focus should stay on conversion instrumentation and quality scoring, because both directly increase revenue without requiring a full redesign.
