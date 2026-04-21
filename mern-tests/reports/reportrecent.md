# Bricks API — Post-Deployment Test Report

> Generated: **2026-04-21 22:35:35**
> App: `http://localhost:5000` (backend) · `http://localhost:3000` (frontend)

---

## Summary

| Metric | Count |
|--------|-------|
| ✅ Passed | **5** |
| ❌ Failed | **0** |
| ⚠️ Warnings | **0** |
| 🚨 Critical Failures | **0** |

## Results by Skill

| Skill | Pass | Fail | Status |
|-------|------|------|--------|
| Smoke (10) | 5 | 0 | ✅ |

## Optimization Recommendations

### High Impact

#### Mongoose .find() without .select() — fetches all fields
**File:** `/backend/controllers/blogController.js:296`

**Issue:** Fetching all document fields over the wire increases payload size and memory usage.

**Current:**
```js
const comment = blog.comments.find((item) => item._id.toString() === commentId);
```
**Optimized:**
```js
const comment = blog.comments.find((item) => item._id.toString() === commentId);
  .select("title slug price category location.area status createdAt")
```

#### Mongoose .find() without .select() — fetches all fields
**File:** `/backend/controllers/contactController.js:52`

**Issue:** Fetching all document fields over the wire increases payload size and memory usage.

**Current:**
```js
const contacts = await Contact.find(filter).sort({ createdAt: -1 });
```
**Optimized:**
```js
const contacts = await Contact.find(filter).sort({ createdAt: -1 });
  .select("title slug price category location.area status createdAt")
```

#### Mongoose .find() without .select() — fetches all fields
**File:** `/backend/controllers/leadController.js:51`

**Issue:** Fetching all document fields over the wire increases payload size and memory usage.

**Current:**
```js
Lead.find(ownershipFilter)
```
**Optimized:**
```js
Lead.find(ownershipFilter)
  .select("title slug price category location.area status createdAt")
```

#### Mongoose .find() without .select() — fetches all fields
**File:** `/backend/controllers/leadController.js:85`

**Issue:** Fetching all document fields over the wire increases payload size and memory usage.

**Current:**
```js
Lead.find(filter)
```
**Optimized:**
```js
Lead.find(filter)
  .select("title slug price category location.area status createdAt")
```

#### Mongoose .find() without .select() — fetches all fields
**File:** `/backend/controllers/leadController.js:117`

**Issue:** Fetching all document fields over the wire increases payload size and memory usage.

**Current:**
```js
const leads = await Lead.find(filter)
```
**Optimized:**
```js
const leads = await Lead.find(filter)
  .select("title slug price category location.area status createdAt")
```

#### Mongoose .find() without .select() — fetches all fields
**File:** `/backend/controllers/propertyController.js:327`

**Issue:** Fetching all document fields over the wire increases payload size and memory usage.

**Current:**
```js
Property.find(filter)
```
**Optimized:**
```js
Property.find(filter)
  .select("title slug price category location.area status createdAt")
```

#### Mongoose .find() without .select() — fetches all fields
**File:** `/backend/controllers/propertySubmissionController.js:86`

**Issue:** Fetching all document fields over the wire increases payload size and memory usage.

**Current:**
```js
PropertySubmission.find(filter)
```
**Optimized:**
```js
PropertySubmission.find(filter)
  .select("title slug price category location.area status createdAt")
```

#### Mongoose .find() without .select() — fetches all fields
**File:** `/backend/controllers/propertySubmissionController.js:117`

**Issue:** Fetching all document fields over the wire increases payload size and memory usage.

**Current:**
```js
PropertySubmission.find(filter)
```
**Optimized:**
```js
PropertySubmission.find(filter)
  .select("title slug price category location.area status createdAt")
```

#### No response-level caching detected
**File:** `backend/controllers/`

**Issue:** Property listings and public endpoints are hit on every request with no caching layer.

**Current:**
```js
// No cache
const properties = await Property.find(filter).limit(20);
```
**Optimized:**
```js
const cacheKey = 'props:' + JSON.stringify(filter);
const cached = await redis.get(cacheKey);
if (cached) return res.json(JSON.parse(cached));
const properties = await Property.find(filter).limit(20);
await redis.set(cacheKey, JSON.stringify(properties), { EX: 300 }); // 5 min TTL
```

### Medium Impact

#### No code splitting (React.lazy / next/dynamic) detected
**File:** `frontend/src/`

**Issue:** All components are bundled in the initial JS bundle, increasing TTI (Time to Interactive).

**Current:**
```js
import HeavyComponent from './HeavyComponent'
```
**Optimized:**
```js
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('./HeavyComponent'), { ssr: false });
```

#### Mongoose connection pool size not configured
**File:** `backend/config/db.js`

**Issue:** Default pool size (5) may be insufficient under load. Configure maxPoolSize for production.

**Current:**
```js
mongoose.connect(uri)
```
**Optimized:**
```js
mongoose.connect(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 })
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/app/(public)/about/page.js`

**Issue:** 3 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/app/(public)/blogs/page.js`

**Issue:** 2 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/app/(public)/contact/page.js`

**Issue:** 2 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/app/(public)/home-loan/page.js`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/app/(public)/page.js`

**Issue:** 4 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/app/(public)/rent-agreement/page.js`

**Issue:** 2 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/app/admin/builders/page.js`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/app/admin/properties/page.js`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/app/admin/property-submissions/page.js`

**Issue:** 2 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/admin/banners/BannerSlotCard.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/admin/blog/BlogEditorForm.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/admin/blog/BlogManagementTable.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/admin/testimonials/TestimonialCard.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/blog/BlogCard.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/blog/details/BlogBody.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/blog/details/BlogHero.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/blog/details/BlogSidebar.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/builder/BuilderCard.jsx`

**Issue:** 2 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/builder/FeaturedBuilder.jsx`

**Issue:** 2 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/builders/BuilderAbout.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/builders/BuilderCard.jsx`

**Issue:** 2 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/builders/BuilderHero.jsx`

**Issue:** 2 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/builders/BuilderPortfolio.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/builders/BuilderTestimonials.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/builders/FeaturedBuildersCarousel.jsx`

**Issue:** 2 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/calculator/StampDutyCalculator.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/dashboard/enquiries/ConciergePromo.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/dashboard/enquiries/EnquiryTable.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/dashboard/FeaturedGuideCard.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/dashboard/ListedPropertyCard.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/dashboard/profile/ProfileHero.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/dashboard/profile/ProfileStats.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/dashboard/SavedPropertyCard.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

#### Images without explicit width/height cause layout shift (CLS)
**File:** `/frontend/src/components/home/HomePageTestimonials.jsx`

**Issue:** 1 <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.

**Current:**
```js
<img src={url} alt="Property" />
```
**Optimized:**
```js
<Image src={url} alt="Property" width={400} height={300} /> // next/image
```

### Low Impact

#### ✅ Compound indexes defined on Property model
**File:** `backend/models/mongoose/Property.js`

**Issue:** Compound indexes are present — queries on { category, isActive, price } will be fast.

## Quick-Win Checklist

- [ ] Fix all CRITICAL failures first
- [ ] Fix all HIGH severity failures
- [ ] Review MEDIUM severity warnings
- [ ] Apply High-impact optimizations
- [ ] Re-run `node run-all.js --phase smoke` after each fix
- [ ] Re-run `node run-all.js --phase all` before next release
