# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bricks** is a Mumbai-focused real estate platform ("Mumbai Editorial") consisting of:
- **Stitch/** — Static HTML UI prototypes for all pages, built with Tailwind CSS (CDN) and Material Symbols icons
- **masterbackend.md** — Authoritative backend specification (source of truth for schemas, API contracts, and logic)
- **MakeMyBridge Clone.md** — High-level backend overview and feature documentation

The project is in the **design/specification phase** — the `Stitch/` folder contains complete static HTML mockups, and the backend is planned but not yet implemented.

## Repository Structure

```
Stitch/              # Static HTML UI mockups (one folder per page)
  <page_name>/
    code.html        # Full page implementation
    screen.png       # Visual reference screenshot
  my_design_system/
    DESIGN.md        # Design token definitions (colors, fonts, spacing)
  marine_drive_luxe/
    DESIGN.md        # Alternate luxury theme tokens
masterbackend.md     # Master backend spec (schemas, APIs, middleware)
MakeMyBridge Clone.md # Overview backend doc (simpler version)
```

## Frontend Stack (Stitch UI Prototypes)

- **Tailwind CSS** via CDN (`https://cdn.tailwindcss.com?plugins=forms,container-queries`) — no build step
- **Google Fonts**: Manrope (headlines) + Inter (body/labels)
- **Material Symbols Outlined** (Google icon font)
- Custom Tailwind config inline in each `code.html` using `<script id="tailwind-config">`

### Design System Tokens (Primary Theme)

Defined in `Stitch/my_design_system/DESIGN.md`:
- Primary: `#2F6FED` (blue), Secondary: `#FF7A1A` (orange), Tertiary: `#EAF2FF` (light blue)
- All fonts: Inter; Roundedness level 2; Normal spacing

The home page / most pages use a **pink/rose theme** (`primary: #b80049`) — the Tailwind config in each `code.html` is the ground truth for that page's tokens.

## Backend Architecture (Planned — Node.js/Express)

Fully specified in `masterbackend.md`. Key design decisions:

- **MVC pattern**: controllers → models → routes, with services layer for email/OTP/Cloudinary
- **Single Lead collection** for all lead types (`buy | rent | loan | agreement | list_property`)
- **JWT + Firebase OTP** auth; role field on User (`user | admin`)
- Admin routes protected by `adminOnly.js` middleware
- Standardized API responses via `utils/apiResponse.js`
- File uploads: Multer → Cloudinary via `middleware/upload.js`

### Core Models

| Model | Key fields |
|---|---|
| User | role, savedProperties[], comparedProperties[] (max 3), isVerified |
| Property | category (buy/rent/commercial/new_launch), location.area, bhk, price, reraNumber, isFeatured |
| Lead | leadType, status (new→contacted→qualified→closed), assignedTo (admin), notes[] |
| Blog | slug (auto), category, tags[], comments[], SEO meta fields |
| Banner | position, image, link, isActive |
| StampDutyConfig | maleRate, femaleRate, jointRate, registrationCharge |

### API Base Path

All routes under `/api/`: auth, properties, leads, users, blogs, testimonials, banners, stamp-duty, calculators, contact, dashboard.

Property filtering: `GET /api/properties?type=buy&bhk=2&minPrice=5000000&area=Andheri` with pagination and sorting.

## Pages in Stitch/

| Folder | Description |
|---|---|
| `mumbai_real_estate_home_page` | Main landing page |
| `mumbai_property_listings` | Property search/filter results |
| `mumbai_property_detail_page` | Single property detail |
| `compare_properties` | Side-by-side property comparison |
| `saved_properties` / `saved_properties_user_panel` | User saved properties |
| `my_dashboard_user_panel` | User dashboard |
| `my_enquiries_user_panel` | User's submitted enquiries |
| `my_profile_user_panel` | User profile settings |
| `emi_calculator_mumbai_editorial` | EMI calculator tool |
| `stamp_duty_calculator_mumbai_editorial` | Stamp duty calculator |
| `blogs_mumbai_editorial` / `blog_detail_mumbai_editorial` | Blog listing and detail |
| `admin_dashboard_overview` | Admin analytics dashboard |
| `property_management_admin_console` | Admin CRUD for properties |
| `lead_crm_admin_console` | Admin CRM for leads |
| `blog_cms_admin_console` | Admin blog management |
| `banner_management_admin_console` | Admin banner management |
| `user_management_admin_console` | Admin user management |
| `testimonial_manager_admin_console` | Admin testimonial management |
| `header_footer_system` | Shared header/footer component |
