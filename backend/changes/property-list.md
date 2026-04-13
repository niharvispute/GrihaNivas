# 🏠 PROPERTY LISTING APPROVAL SYSTEM (Backend Changes)

## 📌 OBJECTIVE

Allow users to:

* Submit property listing via multi-step form
* Store listing as **pending**
* Admin can **approve / reject**
* Approved → goes live
* Rejected → auto-delete after 30 days

---

# 🧠 CORE DESIGN CHANGE

We will introduce:

👉 **Property Lifecycle Status**

```js
status: {
  type: String,
  enum: ["pending", "approved", "rejected"],
  default: "pending"
}
```

---

# 🧩 1. UPDATE PROPERTY MODEL

## ADD FIELDS:

```js
createdBy: {
  type: ObjectId,
  ref: "User"
},

status: {
  type: String,
  enum: ["pending", "approved", "rejected"],
  default: "pending"
},

rejectedAt: Date,
approvedAt: Date,

isActive: {
  type: Boolean,
  default: false
}
```

---

## 💡 LOGIC:

| Status   | isActive | Visible to users |
| -------- | -------- | ---------------- |
| pending  | false    | ❌ No             |
| approved | true     | ✅ Yes            |
| rejected | false    | ❌ No             |

---

# 🧾 2. PROPERTY SUBMISSION FLOW (USER SIDE)

## API:

```
POST /api/properties/submit
```

## BEHAVIOR:

* Save property with:

  * status = "pending"
  * isActive = false
  * createdBy = userId

---

## IMPORTANT:

* DO NOT publish immediately
* This is only a **submission**

---

# 🧑‍💼 3. ADMIN APPROVAL SYSTEM

## ADMIN APIs:

### Get Pending Listings

```
GET /api/admin/properties?status=pending
```

---

### Approve Property

```
PATCH /api/admin/properties/:id/approve
```

## LOGIC:

```js
property.status = "approved";
property.isActive = true;
property.approvedAt = new Date();
```

---

### Reject Property

```
PATCH /api/admin/properties/:id/reject
```

## LOGIC:

```js
property.status = "rejected";
property.isActive = false;
property.rejectedAt = new Date();
```

---

# 🗑️ 4. AUTO DELETE REJECTED PROPERTIES

## RULE:

👉 Delete rejected listings after 30 days

---

## IMPLEMENTATION:

### Option A (Recommended): CRON JOB

Use:

* node-cron

### CRON LOGIC:

```js
DELETE FROM properties
WHERE status = "rejected"
AND rejectedAt < now() - 30 days
```

---

### Example:

```js
cron.schedule("0 0 * * *", async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  await Property.deleteMany({
    status: "rejected",
    rejectedAt: { $lt: cutoff }
  });
});
```

---

# 📡 5. UPDATE PUBLIC PROPERTY APIs

## VERY IMPORTANT FILTER:

Only return approved properties:

```js
filter.status = "approved";
filter.isActive = true;
```

---

## WITHOUT THIS:

❌ Pending properties will leak
❌ Rejected data visible

---

# 🧾 6. USER DASHBOARD (MY LISTINGS)

## API:

```
GET /api/user/properties
```

---

## SHOW:

* All user-submitted properties
* Include status:

```js
{
  title,
  price,
  status: "pending / approved / rejected"
}
```

---

# 🎯 7. ADMIN UI BEHAVIOR

For each submitted property:

### Show:

* Full details (same as property detail page)
* Submitted by (user info)
* Date submitted

---

### ACTION BUTTONS:

* ✅ Approve
* ❌ Reject

---

# 📦 8. MULTI-STEP FORM DATA HANDLING

Your UI (based on screenshots) = 5 steps:

1. Basic Info
2. Basic Configuration
3. Media & Highlights
4. Detailed Configuration
5. Description

---

## BACKEND APPROACH:

### Option A (Best):

👉 Store everything in ONE document
(No need separate temp tables)

---

## OPTIONAL (Advanced):

👉 Save as draft:

```js
isDraft: true
```

---

# 🔐 9. VALIDATION

* Required fields per step
* Final submission must validate all steps
* Prevent incomplete submissions

---

# ⚡ 10. PERFORMANCE & INDEXING

```js
PropertySchema.index({ status: 1 });
PropertySchema.index({ createdBy: 1 });
```

---

# 🧪 11. TEST CASES

## Submission:

* Submit property → should be pending

## Admin:

* Approve → becomes visible
* Reject → hidden

## Public API:

* Should only return approved listings

## Cron:

* Rejected > 30 days → deleted

---

# 🚨 IMPORTANT RULES

* NEVER expose pending/rejected in public APIs
* ALWAYS filter by status
* Maintain audit timestamps

---

# 🚀 FINAL RESULT

✔ Users can submit property
✔ Admin controls what goes live
✔ Clean moderation system
✔ Auto cleanup of rejected listings
✔ Production-ready workflow

---

This is exactly how real estate platforms like Housing / 99acres work internally.
