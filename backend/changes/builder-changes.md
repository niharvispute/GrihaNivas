# 🏗️ BUILDER MODULE INTEGRATION (Backend Changes)

## 📌 OBJECTIVE

Add a new **Builder Category** to the system:

* List all builders
* Show builder detail page
* Link properties with builders
* Enable filtering properties by builder

---

# 🧠 HIGH LEVEL DESIGN

We will:

1. Create a **Builder Collection**
2. Link **Property → Builder**
3. Add **Builder APIs**
4. Update **Property APIs for filtering**
5. Add **Admin Builder Management**

---

# 🧩 1. NEW COLLECTION: BUILDER

## 📦 Builder Schema

```js
{
  name: String,
  slug: String, // for SEO URL

  description: String,
  shortDescription: String,

  logo: String,
  coverImage: String,

  establishedYear: Number,
  totalProjects: Number,

  headquarters: String,

  isFeatured: Boolean,
  isActive: Boolean,

  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },

  createdAt: Date
}
```

---

# 🔗 2. UPDATE PROPERTY MODEL

## ADD FIELD:

```js
builder: {
  type: ObjectId,
  ref: "Builder"
}
```

---

## WHY?

* Each property belongs to ONE builder
* Enables:

  * Builder detail page
  * Filtering
  * Analytics

---

# 📡 3. BUILDER APIs

## 📌 PUBLIC APIs

### Get All Builders

```
GET /api/builders
```

Features:

* Pagination
* Search by name
* Filter featured

---

### Get Builder Details

```
GET /api/builders/:slug
```

Return:

* Builder info
* All properties of builder

---

## 🔥 IMPORTANT (JOIN LOGIC)

When fetching builder details:

```js
const builder = await Builder.findOne({ slug })

const properties = await Property.find({
  builder: builder._id,
  isActive: true
})
```

---

# 🏠 4. UPDATE PROPERTY APIs

## ADD FILTER SUPPORT

### Existing API:

```
GET /api/properties
```

### ADD:

```
?builder=builderId
```

---

## IMPLEMENTATION:

```js
if (req.query.builder) {
  filter.builder = req.query.builder;
}
```

---

## OPTIONAL (BETTER UX)

Support slug:

```
?builderSlug=lodha-group
```

---

# 🧑‍💼 5. ADMIN BUILDER MANAGEMENT

## ADD ADMIN ROUTES:

```
POST /api/admin/builders
PUT /api/admin/builders/:id
DELETE /api/admin/builders/:id
GET /api/admin/builders
```

---

## ADMIN FEATURES:

* Add builder
* Upload logo + cover image
* Add SEO fields
* Activate / deactivate builder

---

# 🔄 6. DATA FLOW

## Property Creation Flow:

1. Admin selects builder
2. Store builderId in property
3. Save property

---

## Builder Page Flow:

1. User opens builder page
2. Fetch builder by slug
3. Fetch properties using builderId
4. Return combined response

---

# 🔍 7. INDEXING (IMPORTANT)

Add indexes for performance:

```js
BuilderSchema.index({ slug: 1 })
PropertySchema.index({ builder: 1 })
```

---

# ⚡ 8. PERFORMANCE OPTIMIZATION

Use populate:

```js
Property.find().populate("builder", "name logo")
```

---

# 🧪 9. TEST CASES

## Builder:

* Create builder
* Fetch all builders
* Fetch builder by slug

## Property:

* Filter by builderId
* Filter by builderSlug

## Edge Cases:

* Builder without properties
* Property without builder (handle safely)

---

# 🔐 10. VALIDATION RULES

* Builder name required
* Slug must be unique
* Property must have valid builderId

---

# 🚀 11. FRONTEND IMPACT (FOR REFERENCE)

New Pages:

* Builders Listing Page
* Builder Detail Page

Property Page:

* Show builder name + logo
* Click → redirect to builder page

---

# ⚠️ IMPORTANT NOTES

* Do NOT embed builder inside property (avoid duplication)
* Always use reference (ObjectId)
* Maintain clean relation

---

# ✅ FINAL RESULT

After implementation:

✔ Builders listing works
✔ Builder detail page works
✔ Properties linked to builders
✔ Filtering by builder works
✔ Admin can manage builders

---

This design is scalable and production-ready.
