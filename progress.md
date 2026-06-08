# Projects / Bulk Property Registration Module — Progress

> Companion to `project_plan.md`. Tracks what is required to implement the
> feature in the current codebase, split by **backend + DB**, **frontend**,
> and the **data** layer.

---

## 0. Status Snapshot (Backend + DB only)

| # | Area | Status |
|---|---|---|
| 1 | New Mongoose models (`Project`, `ProjectConfiguration`, `ProjectUnit`) | ⏳ pending |
| 2 | `models/mongoose/index.js` barrel export | ⏳ pending |
| 3 | `Lead.js` extended (project context, extended enum, index) | ⏳ pending |
| 4 | `Builder.js` extended (`website` field) | ⏳ pending |
| 5 | Zod schemas in `validate.js` (project + extended lead) | ⏳ pending |
| 6 | Multer upload fields in `upload.js` (`projectUploadFields`, `configUploadFields`) | ⏳ pending |
| 7 | Cloudinary helpers (`uploadProjectMedia`, `uploadConfigurationMedia`) | ⏳ pending |
| 8 | `controllers/projectController.js` (public endpoints) | ⏳ pending |
| 9 | `controllers/adminProjectController.js` (CRUD + bulk import + export) | ⏳ pending |
| 10 | `routes/projects.js` (public + admin) | ⏳ pending |
| 11 | `routes/index.js` mount point | ⏳ pending |
| 12 | `dashboardController.js` project stats | ⏳ pending |
| 13 | `scripts/seedProjects.js` seed script | ⏳ pending |

> **Out of scope for this update:** frontend pages, components, sidebar/nav
> changes, API client functions — covered in `project_plan.md` Section 6 and
> tracked separately.

---

## 1. New Database Collections

| Collection | Created in | Notes |
|---|---|---|
| `projects` | `models/mongoose/Project.js` | Top-level project entity |
| `projectconfigurations` | `models/mongoose/ProjectConfiguration.js` | BHK/unit-type variants per project |
| `projectunits` | `models/mongoose/ProjectUnit.js` | Individual unit inventory |

## 2. Schema Changes to Existing Collections

| Collection | Change |
|---|---|
| `builders` | **Add** `website: String` (nullable, trimmed) |
| `leads` | **Add** `projectId`, `configurationId`, `unitId`, `enquiryType`; **extend** `leadType` enum with `'project'`; **add** index on `projectId` |

> All `Lead` changes are **additive only** — existing `buy/rent/loan/agreement`
> leads keep working because the new fields default to `null` and the new enum
> value is appended.

## 3. New API Surface (mounted under `/api`)

### Public
```
GET    /api/projects
GET    /api/projects/slug/:slug
GET    /api/projects/:id/configurations
GET    /api/projects/:id/units
POST   /api/projects/:id/enquiry
```

### Admin (protect + adminOnly)
```
GET    /api/projects/admin
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
PATCH  /api/projects/:id/status
PATCH  /api/projects/:id/featured

POST   /api/projects/:id/configurations
PUT    /api/project-configurations/:id
DELETE /api/project-configurations/:id

POST   /api/projects/:id/units
PUT    /api/project-units/:id
DELETE /api/project-units/:id
POST   /api/projects/:id/bulk-import-units
GET    /api/projects/:id/units/export
```

---

## 4. Files Created / Modified — Complete List

### Created
- `backend/models/mongoose/Project.js`
- `backend/models/mongoose/ProjectConfiguration.js`
- `backend/models/mongoose/ProjectUnit.js`
- `backend/controllers/projectController.js`
- `backend/controllers/adminProjectController.js`
- `backend/routes/projects.js`
- `backend/scripts/seedProjects.js`

### Modified
- `backend/models/mongoose/index.js` — export 3 new models
- `backend/models/mongoose/Lead.js` — project fields + enum
- `backend/models/mongoose/Builder.js` — `website` field
- `backend/middleware/validate.js` — `schemas.project`, lead enum update
- `backend/middleware/upload.js` — `projectUploadFields`, `configUploadFields`
- `backend/services/cloudinaryService.js` — project media helpers
- `backend/routes/index.js` — mount `/projects`
- `backend/controllers/dashboardController.js` — project counts

---

## 5. Key Design Decisions (from plan)

1. **Slug uniqueness** — checked in a loop (`ensureUniqueSlug`) just like
   `Builder` does; uniqueness scoped to the `projects` collection only.
2. **Cloudinary folders** — `bricks/projects/{projectId}/` for project media;
   `bricks/projects/{projectId}/configs/{configId}/` for configuration media.
3. **Auto-derivation on Configuration create/update/delete:**
   - `Project.bhkSummary` recomputed from all active configurations.
   - `Project.priceMin` / `Project.priceMax` recomputed from active configurations.
4. **Auto-derivation on Unit status change:**
   - `ProjectConfiguration.availableUnits` recomputed via
     `countDocuments({ configurationId, status: 'available' })`.
5. **Bulk import cap:** 500 units/request, `insertMany({ ordered: false })`,
   return `{ inserted, failed, errors[] }`.
6. **No breaking changes to existing routes/controllers/models.**
