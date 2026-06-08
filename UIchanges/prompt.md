# UI Generation Prompt — Projects / Bulk Property Registration Module

Use this prompt verbatim (or as the system context) when generating new page files for the Projects feature. It encodes the existing design system so output matches the current site exactly.

---

## Design System Context

You are building pages for **GrihaNivas**, a Mumbai real estate platform built with:
- **Next.js 14 App Router** + **React 19** + **Tailwind CSS v4**
- **Fonts**: `font-sans` = Inter (body); `font-heading` = Playfair Display (headlines)
- **Icons**: Material Symbols Outlined — used as `<span className="material-symbols-outlined">icon_name</span>`

### Color Tokens (globals.css `@theme`)
| Token | Value | Usage |
|---|---|---|
| `primary` | `#B80049` | CTAs, active states, accent badges, links |
| `secondary` | `#e61a61` | Gradient partner to primary |
| `tertiary` | `#008c47` | Success / availability indicators |
| `neutral` | `#F6F3F2` | Neutral section backgrounds |
| `background` | `#ffffff` | Page background |

### Typography Conventions
- Section labels / table headers: `text-[10px] font-black uppercase tracking-[0.2em] text-slate-400`
- Card titles: `font-black text-slate-900 tracking-tight`
- Body text: `font-bold text-slate-500` or `font-bold text-slate-600`
- Price display: `font-black text-primary`
- Page H1 (admin): `text-4xl font-black text-slate-900 tracking-tighter`
- Page H1 (public): `text-3xl sm:text-4xl md:text-5xl font-heading font-black tracking-tight text-slate-900`

### Component Patterns
```
Cards:           bg-white rounded-2xl shadow-sm border border-slate-50
Input fields:    bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20
Select:          appearance-none bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold
Buttons (CTA):   bg-primary text-white rounded-2xl font-black uppercase tracking-[0.18em] hover:bg-primary/90
Buttons (ghost): border border-slate-200 rounded-xl font-black text-slate-600 hover:bg-slate-50
Status badges:   bg-emerald-50 text-emerald-700 OR bg-slate-100 text-slate-400 — rounded-full text-[10px] font-black uppercase
Table rows:      bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group rounded-2xl
                 border-separate border-spacing-y-2
Pagination:      w-10 h-10 rounded-xl font-black — active: bg-primary text-white; inactive: bg-white border border-slate-100
```

### Admin Layout Shell
- Sidebar: `fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white` — active link: `bg-primary text-white`
- Main area: `ml-64 flex flex-col min-h-screen bg-[#f8f7f5]`
- Content: `pt-20 px-6 pb-8` inside `max-w-7xl mx-auto`

### Public Layout Shell
- Uses `Header` + `Footer` wrappers (not included inline — assume they exist)
- Page max-width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Breadcrumb: `text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400`

---

## Pages to Generate

### Page 1 — Public: `/projects` (Projects Listing)
**File:** `frontend/src/app/(public)/projects/page.js`  
**Purpose:** Browse all active projects with filters.

**Layout:**
- Breadcrumb: Home → Projects
- Page header with H1 "New Launch Projects in Mumbai" + short subtitle
- Left sidebar filters (same pattern as `PropertyFilters`) for: Area, Project Status (`new_launch | under_construction | ready_to_move`), BHK type, Price range
- Right: `ProjectSortBar` + grid of `ProjectCard` components (2-col desktop, 1-col mobile)
- Empty state with `apartment` icon
- Pagination identical to buy page

**ProjectCard fields to display:**
- Hero image (16:9 ratio)
- `isFeatured` badge (primary gradient)
- `projectStatus` badge (colour-coded: new_launch=amber, under_construction=primary/rose, ready_to_move=emerald)
- Project name (font-heading font-black)
- Builder name with small builder logo
- Location area with pin icon
- BHK summary badges row (e.g., "1BHK", "2BHK", "3BHK" — each `bg-primary/10 text-primary`)
- Price range: "₹X Lac – ₹Y Cr"
- Carpet area range
- CTA button "View Project" → `/projects/[slug]`

---

### Page 2 — Public: `/projects/[slug]` (Project Detail)
**File:** `frontend/src/app/(public)/projects/[slug]/page.js`  
**Purpose:** Full project detail with configuration tabs, unit availability, enquiry form, gallery.

**Sections (top to bottom):**
1. **Breadcrumb** — Home → Projects → Project Name
2. **Hero Section** — Full-width hero image with overlay; project name (font-heading font-black 5xl), builder name + logo, RERA badge, location, key stats bar (Total Units / Towers / Launch Date / Possession)
3. **Configuration Tabs** — "All | 1BHK | 2BHK | 3BHK" tab row; clicking tab filters `ConfigurationCard` grid below. Active tab: `bg-primary text-white rounded-full`. Each `ConfigurationCard` shows: BHK type, carpet area range, price range, floor plan thumbnail, "Enquire" CTA.
4. **About Project** — rich text description
5. **Amenities Grid** — icon + label chips (like `PropertyAmenities`)
6. **Gallery** — 3-col image grid with lightbox hint (like `PropertyGallery`)
7. **Master Plan** — full-width image if present
8. **Brochure Download** — CTA card "Download Brochure" with PDF icon
9. **Map Section** — Google Maps iframe embed
10. **Builder Profile** — builder logo, name, tagline, "View Builder" link
11. **Right Sidebar (sticky)** — `ProjectEnquiryForm`: name, phone, email, message, enquiry type select (`general | price_request | brochure | site_visit | callback`), configuration select (dropdown populated from configs), submit button

---

### Page 3 — Admin: `/admin/projects` (Project List)
**File:** `frontend/src/app/admin/projects/page.js`  
**Purpose:** Admin table of all projects with status controls.

**Layout (matches `admin/properties/page.js` exactly):**
- Page header: "Projects" H1 + "Manage new launch projects and their configurations." subtitle
- Top right: total count badge + "Create Project" button (→ `/admin/projects/new`)
- Filter bar (white card): Search input, Project Type select, Status (listingStatus) select, Builder select
- Table with `border-separate border-spacing-y-2`:
  - Columns: Project | Builder | Location | BHK Types | Price Range | Project Status | Listing Status | Featured | Actions
  - Each row: hero image thumbnail (rounded-2xl), project name + RERA number, builder name, area, BHK badges, price, status badges, featured star toggle, `more_horiz` action menu
  - Action menu: Edit, Manage Configurations, Manage Inventory, Open Public Page, Set Status (active/inactive/draft), Delete
- Pagination

---

### Page 4 — Admin: `/admin/projects/new` (Create Project)
**File:** `frontend/src/app/admin/projects/new/page.js`  
**Purpose:** Multi-section form to create a new project.

**Form sections (use card panels with section dividers):**
1. **Identity** — Builder (searchable select), Project Name, Short Description, Full Description (textarea), Project Type (`residential | commercial | mixed`)
2. **Status & Dates** — Project Status, Listing Status, Launch Date, Possession Date
3. **Location** — Area, Address, City, State, Pincode, Lat/Lng
4. **RERA** — RERA Number, RERA URL
5. **Scale** — Total Towers, Total Floors, Total Units, Land Area
6. **Media** — Hero Image upload (drag-drop zone), Gallery (multi-upload up to 10), Master Plan upload, Brochure (PDF) upload, Video URL input
7. **Amenities** — Checkbox grid of common amenities (Swimming Pool, Gym, Clubhouse, Security, Parking, Garden, etc.)
8. **SEO** — SEO Title (70 chars), SEO Description (160 chars), isFeatured toggle
- Bottom: Cancel + "Create Project" submit button

**UI conventions:**
- Section titles: `text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5 ml-1 border-b border-slate-100 pb-3`
- Input grid: `grid grid-cols-1 md:grid-cols-2 gap-5`
- File upload zones: dashed border, `border-dashed border-2 border-slate-200 rounded-2xl p-8 text-center`

---

### Page 5 — Admin: `/admin/projects/[id]/configurations` (Configuration Manager)
**File:** `frontend/src/app/admin/projects/[id]/configurations/page.js`  
**Purpose:** Add/edit/delete BHK configurations for a project.

**Layout:**
- Back link to `/admin/projects`
- Page header: "Configurations — [Project Name]" + "Add Configuration" button (opens modal)
- Grid of `ConfigurationCard` admin cards (2-col desktop):
  - BHK type badge, title, price range, carpet area range, total/available units
  - Thumbnail of first floor plan image
  - Edit (pencil) + Delete (trash) icon buttons
- **Add/Edit Configuration Modal** (same pattern as edit modal in properties page):
  - BHK Type select, Property Type select, Title input, Description, Price Min/Max, Carpet Area Min/Max, Builtup Area Min/Max, Bathrooms, Balconies, Parking, Total Units, Sort Order, Active toggle
  - Floor Plans upload (up to 5), Gallery upload (up to 5)
  - Cancel + Save buttons

---

### Page 6 — Admin: `/admin/projects/[id]/inventory` (Unit Inventory Manager)
**File:** `frontend/src/app/admin/projects/[id]/inventory/page.js`  
**Purpose:** View and manage individual units, bulk import.

**Layout:**
- Back link + "Inventory — [Project Name]" H1
- Stats row: Total Units / Available / Sold / Booked / Hold — each in a white card with large number + label + color indicator
- Filter bar: Configuration select, Tower input, Status select (`available | sold | booked | hold`), Floor range
- Two action buttons: "Add Unit" (modal) + "Bulk Import" (modal with JSON textarea)
- Table:
  - Columns: Unit | Configuration | Tower | Floor | Area | Facing | Price | Status | Actions
  - Status badge colour map: available=emerald, sold=slate, booked=amber, hold=rose
  - Actions: Edit status (quick dropdown), Edit full details, Delete
- **Bulk Import Modal**: JSON textarea with format example, "Preview" button showing parsed table, "Import" button with result summary (`{inserted, failed}`)
- Pagination

---

## Shared Components to Create

### `components/project/ProjectCard.js`
Props: `{ project }` — renders card as described in Page 1.

### `components/project/ProjectConfigTabs.js`
Props: `{ configurations, activeTab, onTabChange }` — renders "All | 1BHK | 2BHK…" pill tabs.

### `components/project/ConfigurationCard.js`
Props: `{ config, projectSlug }` — renders single configuration card for public detail page.

### `components/project/ProjectEnquiryForm.js`
Props: `{ project, configurations }` — sticky sidebar enquiry form.

### `components/admin/ProjectForm.js`
Props: `{ project?, builders, onSubmit, onCancel }` — multi-section create/edit form for admin.

### `components/admin/ConfigurationForm.js`
Props: `{ config?, projectId, onSave, onClose }` — modal form for add/edit configuration.

### `components/admin/UnitForm.js`
Props: `{ unit?, configurations, onSave, onClose }` — modal form for add/edit unit.

### `components/admin/BulkUnitImport.js`
Props: `{ projectId, configurations, onImported, onClose }` — bulk import modal.

---

## Key Constraints for Code Generation

1. **No new dependencies** — use only what is already in the project (`next`, `react`, `tailwindcss`, existing services).
2. **Server components by default** — mark `'use client'` only when state/effects are needed (admin list pages, forms, tabs).
3. **Existing service pattern** — API calls via `frontend/src/lib/api/client.js`. Add project functions to `frontend/src/lib/api/index.js` (or `src/services/projectService.js` following the same structure as `propertyService.js`).
4. **Auth guard** — admin pages rely on `AdminLayout` with `<AuthGuard requireAdmin>` already wrapping them. Do not duplicate auth logic.
5. **Match existing admin sidebar** — the sidebar is in `AdminSidebar.jsx`. Add `{ name: 'Projects', icon: 'domain', href: '/admin/projects' }` to `menuItems` array (between "Builders" and "Property Submissions").
6. **Media upload** — use `multipart/form-data` + `FormData` exactly as `adminBuilderController` does it; pass `{ headers: { 'Content-Type': 'multipart/form-data' } }`.
7. **Slug navigation** — public project detail uses `/projects/[slug]`; admin uses `/admin/projects/[id]/...` with MongoDB ObjectId.
8. **BHK summary auto-update** — after save/delete of a configuration, re-fetch the parent project's `bhkSummary`.
