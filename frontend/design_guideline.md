# Bricks — UI Design Guidelines

> **Source of truth** for visual consistency across all pages.  
> When building or editing any page, refer here first. Do not deviate without a documented reason.

---

## 1. Color Tokens

Defined in `src/app/globals.css` under `@theme`. Use these class names — never hardcode hex values in components.

| Token | Class | Hex | Usage |
|---|---|---|---|
| Primary | `text-primary` / `bg-primary` / `border-primary` | `#B80049` | CTAs, links, accents, active states |
| Secondary | `text-secondary` / `bg-secondary` | `#e61a61` | Hero highlights, decorative text |
| Tertiary | `text-tertiary` | `#008c47` | Success states, verified badges |
| Neutral | `bg-neutral` | `#F6F3F2` | Subtle fills (use `bg-[#f8f7f5]` for warm section bg — see Section Backgrounds) |
| Slate-900 | `bg-slate-900` | — | Dark sections (blogs) |
| White | `bg-white` | — | Default card and section surface |

### Opacity variants
- `primary/10` → icon backgrounds, tinted fill
- `primary/25` → hover borders
- `primary/40` → shadows on primary-bg elements
- `primary/80` → slightly subdued primary text labels

---

## 2. Typography

### Fonts
- **Brand / Headings:** Montserrat (`font-brand`, `font-heading`)
- **Body / UI:** Inter (`font-sans`)
- **Decorative:** Damion (`font-script`) — use sparingly, display only

### Semantic Type Classes (use these, not raw `text-*` sizes)

| Class | Size | Weight | Use |
|---|---|---|---|
| `.type-large-title` | clamp 2.25–2.5rem | 400 | Hero script decorative |
| `.type-large-title-32` | clamp 1.75–2rem | 700 | Page H1 / hero headline |
| `.type-heading-26` | 1.625rem | 600 | Section headings (Value Prop, etc.) |
| `.type-heading-24` | 1.5rem | 600 | Card headings, sub-sections |
| `.type-subheading-20` | 1.25rem | 600 | Sidebar headings, modal titles |
| `.type-body-16` | 1rem | 400 | Body copy, descriptions |
| `.type-subheading-14` | 0.875rem | 600 | Labels, metadata |
| `.type-caption-12` | 0.75rem | 500 | Tags, timestamps, secondary info |
| `.type-small-10` | 0.625rem | 500 | Eyebrow labels (auto uppercase) |

### Hero headline responsive scale
```
type-large-title-32 md:text-4xl lg:text-5xl
```

### Section / carousel heading scale
```
text-xl sm:text-2xl md:text-3xl font-black tracking-tight
```
Never go beyond `md:text-3xl` on section headings — larger sizes make the page feel bloated.

### Hero subtitle
```
text-sm sm:text-base font-bold text-slate-700
max-w-2xl mx-auto
```

### Eyebrow label pattern (above section headings)
```jsx
<div className="flex items-center gap-3 mb-2 md:mb-3">
  <span className="w-10 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">
    Label Text
  </p>
</div>
```

---

## 3. Spacing & Layout

### Page container (use on every section's inner div)
```
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```
Never use `max-w-screen-2xl` or `max-w-screen-xl` — they make content too wide on large monitors.

### Section vertical padding (applies to ALL sections except hero and carousels)
```
py-6 md:py-10 lg:py-14
```
This is the **one** standard. Do not use `py-16`, `py-20`, `py-24`, or anything larger.

### Carousel sections (SectionCarousel component owns this internally)
```
py-6 md:py-10 lg:py-14
```

### Carousel header bottom margin
```
mb-5 md:mb-7 lg:mb-10
```

### Hero section
```
min-h-[340px] md:min-h-[440px]
py-8 md:py-16
```
No `overflow-hidden` on the hero section — it clips absolutely positioned child dropdowns.

---

## 4. Section Background Alternation

Consecutive sections **must** alternate backgrounds. Never place two `bg-white` sections next to each other.

| Section | Background |
|---|---|
| Hero | `bg-white` (image overlay on top) |
| Properties Carousel | `bg-white` |
| Builders Carousel | `bg-[#f8f7f5]` |
| Discovery Path (Categories) | `bg-white` |
| Value Proposition | `bg-[#f8f7f5]` |
| Blogs | `bg-slate-900 text-white` ← permanent dark break |
| Testimonials | `bg-white` |
| Lead Capture | `bg-white` (card itself is `bg-primary`) |
| FAQ | `bg-[#f8f7f5]` |

**Rule:** When adding a new section, check its neighbors. If both neighbors are `bg-white`, use `bg-[#f8f7f5]`, and vice versa. The dark `bg-slate-900` section counts as a break and resets the alternation after it.

---

## 5. Cards

### Standard card shell (Property, Builder, Blog, Testimonial)
```
bg-white
rounded-2xl
overflow-hidden
border border-slate-200
hover:border-primary/25
shadow-sm
hover:shadow-lg hover:shadow-slate-200/80
transition-all duration-500
```

Key rules:
- **Always** include `border border-slate-200` — without it, white cards vanish against `bg-white` sections
- `rounded-2xl` everywhere — do not use `rounded-3xl`, `rounded-[2rem]`, or `rounded-[3rem]` on cards
- Shadow only on hover (`shadow-sm` at rest, `hover:shadow-lg` on hover)
- `overflow-hidden` is required to clip the image to the border radius

### Card image area
```
h-36 sm:h-44 md:h-48
overflow-hidden
bg-gradient-to-br from-slate-100 to-slate-50
```
The gradient bg is the placeholder shown when no image is available.

### Card image itself
```
w-full h-full object-cover
group-hover:scale-110 transition-transform duration-700
```

### Card content padding & gap
```
p-3 sm:p-4 md:p-5
gap-2 sm:gap-3
```

### Card title
```
text-xs sm:text-sm font-black text-slate-900 uppercase leading-tight line-clamp-1
```

### Card price / primary stat
```
text-xs sm:text-sm font-black text-primary tracking-tighter
```

### Card stats row (Config / Area)
```
py-2 sm:py-3 border-t border-slate-100
```
- Label: `text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider`
- Icon: `text-sm sm:text-base text-primary` (Material Symbol)
- Value: `text-xs sm:text-sm font-black text-slate-900`

### Card CTA buttons (vertical card layout)
```
flex flex-col w-full gap-2
```
- **Primary (View Property):** `w-full h-9 sm:h-10 bg-gradient-to-r from-primary to-primary/85 text-white rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-tighter hover:shadow-lg hover:shadow-primary/40`
- **Secondary (Compare Now):** `w-full h-9 sm:h-10 border border-slate-200 text-slate-600 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-tighter hover:bg-primary/5 hover:border-primary/25 hover:text-primary`

---

## 6. Buttons

### Primary button (standalone / CTA sections)
```
bg-primary text-white font-black rounded-full
px-8 py-3
shadow-lg shadow-primary/30
hover:scale-105 active:scale-95 transition-all
```

### Primary button (inline pill)
```
bg-gradient-to-r from-primary to-primary/85 text-white
rounded-lg font-black tracking-tighter text-[10px] sm:text-xs uppercase
h-9 sm:h-10
hover:shadow-lg hover:shadow-primary/40 transition-all
```

### Ghost / outline button
```
border-2 border-slate-200 text-slate-700 rounded-lg
font-black text-[10px] sm:text-xs tracking-tighter uppercase
h-9 sm:h-10
hover:border-primary hover:text-primary hover:bg-primary/5 transition-all
```

### Text link button (navigation / "View All" style)
```
font-black uppercase text-xs tracking-widest
hover:translate-x-1 transition-transform
flex items-center gap-2
```

### Icon-only round button (carousel nav arrows)
- **Forward (active):** `w-9 h-9 md:w-14 md:h-14 rounded-full border-2 border-primary bg-primary text-white hover:bg-primary/90 hover:shadow-lg`
- **Back (active):** `w-9 h-9 md:w-14 md:h-14 rounded-full border-2 border-primary/10 bg-white text-slate-700 hover:border-primary hover:text-primary`
- **Disabled:** `border-slate-100 text-slate-200 bg-slate-50/50 cursor-not-allowed`

---

## 7. Badges & Tags

### Featured badge (on card images)
```
bg-gradient-to-r from-primary to-primary/80 text-white
px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full
text-[8px] sm:text-[10px] font-black tracking-wider uppercase
shadow-lg
```

### Category pill (blog, filters)
```
bg-primary text-white
text-[8px] sm:text-[9px] font-black
px-2 sm:px-3 py-0.5 sm:py-1 rounded-full
uppercase tracking-tighter
```

### Eyebrow chip (white label on image or dark bg)
```
bg-white/95 backdrop-blur-sm
px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full
text-[8px] sm:text-[10px] font-black tracking-wider uppercase text-primary
shadow-lg
```

---

## 8. Section Header Component

Use `<SectionHeader>` from `@/components/common/SectionHeader` for consistent title + subtitle blocks.

```jsx
<SectionHeader
  title="Section Title"
  subtitle="One line of descriptive copy."
  align="center"  // or "left"
/>
```

For carousel sections, the eyebrow + title + subtitle pattern is built into `SectionCarousel` — do not duplicate it manually.

---

## 9. Carousels

Use `<SectionCarousel>` from `@/components/home/SectionCarousel`. Pass:
- `title` / `subtitle` / `emptyMessage`
- `items` array
- `renderItem` function
- `itemClassName` for card widths
- `sectionClassName` to control the section background

```jsx
<SectionCarousel
  title="..."
  subtitle="..."
  items={items}
  sectionClassName="bg-[#f8f7f5]"
  itemClassName="w-full min-w-full md:w-[calc(50%-0.875rem)] lg:w-[calc(33.333%-1rem)] md:min-w-[calc(50%-0.875rem)] lg:min-w-[calc(33.333%-1rem)]"
  renderItem={(item) => <YourCard item={item} />}
/>
```

**Do not** add a background color on the outer page section when wrapping a carousel — `SectionCarousel` owns its own `<section>` tag with padding.

---

## 10. Hero Search Bar

The `<HeroSearch>` component contains:
- Intent tabs (Buy / Rent / New Launch) — pill toggle, `bg-white/80 backdrop-blur-md`
- Search bar — `bg-white rounded-2xl sm:rounded-full shadow-2xl border border-slate-100` with **no** `overflow-hidden`
- BHK is a **custom dropdown** (not a native `<select>`) with `z-[9999]` on the panel to escape the hero stacking context
- Location input must have `outline-none focus:outline-none focus:ring-0` to suppress browser native focus ring

---

## 11. Forms & Inputs

### Input field
```
w-full border border-slate-200 rounded-xl
px-4 py-3
text-sm font-medium text-slate-900
placeholder:text-slate-400
focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10
transition-all
```

### Select / dropdown (custom, not native)
Use a `<button>` toggle + absolutely positioned panel (`z-[9999]` inside hero, `z-50` elsewhere). Never use native `<select>` — it can't be styled consistently.

### Form section background
Use `bg-primary` card approach for lead capture. Inputs inside the primary-colored block need explicit `bg-white text-slate-900`.

---

## 12. FAQ / Accordion

```jsx
<details className="group bg-white rounded-2xl p-4 sm:p-5 md:p-6 cursor-pointer border border-slate-200 open:border-primary/25 transition-all">
  <summary className="flex justify-between items-center gap-3 font-bold text-base md:text-lg list-none text-slate-900 group-open:text-primary transition-colors">
    Question text
    <svg className="transition-transform group-open:rotate-180 text-primary" ...chevron... />
  </summary>
  <p className="mt-4 text-slate-500 leading-relaxed font-medium">Answer text</p>
</details>
```

FAQ section: `bg-[#f8f7f5]`. Each item: `bg-white border-slate-200`, turns `border-primary/25` when open.

---

## 13. Dark Section (Blogs / Editorial)

Background: `bg-slate-900 text-white`
This is the **only** section allowed to break the white/warm alternation — it acts as a full visual separator.

Inner content rules:
- Muted text: `text-slate-400`
- Empty state: `border-white/10 bg-white/5` dashed border
- Blog cards: image with `opacity-70 group-hover:opacity-100`, no white card shell
- Category badge on image: `bg-primary text-white`

---

## 14. Empty States

### On light sections
```jsx
<div className="flex flex-col items-center justify-center py-16 md:py-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
  <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">inventory_2</span>
  <p className="text-slate-500 font-bold text-sm md:text-base">Message here.</p>
</div>
```

### On dark sections
```jsx
<div className="flex flex-col items-center justify-center py-16 md:py-20 rounded-2xl border-2 border-dashed border-white/10 bg-white/5">
  <span className="material-symbols-outlined text-5xl text-white/20 mb-4">article</span>
  <p className="text-white/40 font-bold text-sm md:text-base">Message here.</p>
</div>
```

---

## 15. Icons

Use **Material Symbols Outlined** exclusively (`<span className="material-symbols-outlined">`).

For inline SVG icons (arrows, pins, area):
- Metadata rows: `width="11" height="11"`, `strokeWidth="2.5"`
- Feature items: `width="20" height="20"`, `strokeWidth="2"`

Fill variation for stars:
```jsx
fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0"
```

---

## 16. Transitions & Animations

| Interaction | Classes |
|---|---|
| Card hover lift | `transition-all duration-500` |
| Image zoom on card hover | `group-hover:scale-110 transition-transform duration-700` |
| Button scale press | `hover:scale-105 active:scale-95 transition-all` |
| Chevron rotation (accordion/dropdown) | `transition-transform duration-200 rotate-180` |
| Link arrow nudge | `group-hover:translate-x-2 transition-transform` |
| Carousel scroll | Framer Motion spring `stiffness: 300, damping: 30` |

Keep durations between 200ms–700ms. Do not use `transition-all` on text color changes inside Framer Motion elements.

---

## 17. Admin Pages

Admin pages (`/admin/*`) use the same token system with a different layout shell (`admin/layout.js`).

- Page bg: `bg-slate-50`
- Table container: `min-h-[calc(100vh-22rem)] flex flex-col` — prevents dropdown clipping when few rows exist
- `<thead>`: `sticky top-0 z-10 bg-white`
- **No** `overflow-hidden` on outer table wrappers — it clips absolutely positioned dropdowns
- Dropdown panels: `absolute right-0 top-full mt-1 z-50 shadow-lg border border-slate-200 rounded-xl bg-white`

---

## 18. What NOT to Do

| ❌ Don't | ✅ Do instead |
|---|---|
| `py-16 md:py-20 lg:py-24` on sections | `py-6 md:py-10 lg:py-14` |
| `py-10 md:py-14 lg:py-20` | Still too large — use `py-6 md:py-10 lg:py-14` |
| `rounded-3xl` or `rounded-[2rem]` on cards | `rounded-2xl` |
| `shadow-md` at rest on cards | `shadow-sm` at rest, `hover:shadow-lg` on hover |
| No border on cards | `border border-slate-200` always |
| `max-w-screen-2xl` or `max-w-screen-xl` | `max-w-7xl` |
| Two adjacent `bg-white` sections | Alternate with `bg-[#f8f7f5]` |
| `bg-slate-50` for warm section bg | `bg-[#f8f7f5]` (warmer, less clinical) |
| `md:text-4xl` or larger on section headings | `md:text-3xl` max |
| `md:text-6xl lg:text-7xl` on hero H1 | `md:text-4xl lg:text-5xl` |
| Native `<select>` for custom dropdowns | Custom button + panel with `z-[9999]` |
| `overflow-hidden` on hero section | Remove it — clips dropdowns |
| `h-9 sm:h-11` on card buttons | `h-9 sm:h-10` |
| `p-3 sm:p-5 md:p-6` on cards | `p-3 sm:p-4 md:p-5` |
| `h-40 sm:h-48 md:h-52` card images | `h-36 sm:h-44 md:h-48` |
| Hardcode hex colors | Use `primary`, `secondary`, `tertiary` tokens |
