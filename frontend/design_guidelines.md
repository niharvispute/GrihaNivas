# Bricks — Frontend Design Guidelines

> **Source of truth** extracted from the home page (`app/(public)/page.js`) and `globals.css`.  
> All pages should follow these patterns consistently.

---

## 1. Color Tokens

Defined in `globals.css` via `@theme`:

| Token | Value | Usage |
|---|---|---|
| `primary` | `#B80049` | CTAs, active states, icons, accents, borders on hover |
| `secondary` | `#e61a61` | Underlines, gradient endpoints |
| `tertiary` | `#008c47` | Badges, success indicators |
| `neutral` | `#F6F3F2` | Light background alternative |

**Background surfaces used across sections:**

| Surface | Class / Value | Typical use |
|---|---|---|
| White | `bg-white` | Cards, most sections |
| Off-white warm | `bg-[#f8f7f5]` | Alternating sections (Value Prop, FAQ) |
| Dark | `bg-slate-900` | Blog section, dark feature areas |
| Near-black | `bg-slate-950` | Lead capture card |
| Overlay glass | `bg-white/75 backdrop-blur-md` | Hero badges, search bar |

---

## 2. Typography

### Font Families

| Role | CSS Variable | Resolves to |
|---|---|---|
| Body / UI | `font-sans` (`--font-sans`) | Inter |
| Headings / Labels / Brand | `font-brand` (`--font-brand`) | Montserrat |
| Decorative | `font-script` | Damion (cursive) |

### Semantic Type Scale (utility classes from `globals.css`)

| Class | Size | Weight | Notes |
|---|---|---|---|
| `.type-large-title-32` | `clamp(1.25rem, 2.5vw, 1.625rem)` | 700 | Page H1s, hero title |
| `.type-heading-26` | `1.375rem` | 600 | Section H2s |
| `.type-heading-24` | `1.25rem` | 600 | Card headings |
| `.type-subheading-20` | `1.125rem` | 600 | Sub-section titles |
| `.type-body-16` | `1rem` | 400 | Body paragraphs |
| `.type-subheading-14` | `0.875rem` | 600 | Labels, small headings |
| `.type-caption-12` | `0.75rem` | 500 | Captions |
| `.type-small-10` | `0.625rem` | 500 | Eyebrows, micro-labels (auto-uppercased) |

### Eyebrow Labels (micro-labels above headings)

Always use this pattern for section eyebrows:
```jsx
<span className="type-small-10 text-primary mb-4 block tracking-[0.3em]">
  Section Label
</span>
```
Or inline with a decorative line:
```jsx
<div className="flex items-center gap-3 mb-3 md:mb-4">
  <span className="w-10 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full"></span>
  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">Curated Selection</p>
</div>
```

### Heading Style Rules

- Hero H1: `type-large-title-32 text-slate-950 uppercase tracking-tight`; responsive via `md:text-4xl lg:text-5xl`
- Section H2: `text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight`  
  or `text-4xl font-extrabold tracking-tighter text-slate-900` (SectionHeader component)
- Card H3: `font-bold text-slate-900` or `font-black text-slate-900 tracking-tight`
- On dark bg: `text-white` with `font-black tracking-tighter`
- `font-black` (900) is used extensively — it's the brand weight for headings and CTAs
- `tracking-tight` / `tracking-tighter` on all headings — no loose letter-spacing on large text

---

## 3. Spacing & Layout

### Page Width & Max Container

```jsx
<div className="max-w-7xl mx-auto">
```

Use `max-w-7xl mx-auto` as the standard content container. Never let content span full viewport width.

### Section Padding (vertical)

```jsx
<section className="py-6 md:py-10 lg:py-14 ...">
```

| Breakpoint | Vertical padding |
|---|---|
| Mobile | `py-6` (24px) |
| Tablet | `md:py-10` (40px) |
| Desktop | `lg:py-14` (56px) |

### Section Horizontal Padding

```jsx
px-4 sm:px-6 lg:px-8
```

Always apply this exact pattern to every section — it's the consistent gutter system.

### Alternating Section Backgrounds

Alternate section backgrounds to visually separate content:
1. `bg-white`
2. `bg-[#f8f7f5]`
3. `bg-slate-900` (dark, use sparingly)
4. Back to `bg-white`

---

## 4. Responsive Grid System

| Pattern | Usage |
|---|---|
| `grid grid-cols-2 lg:grid-cols-4` | Category cards (2 col mobile, 4 col desktop) |
| `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` | Blog cards, testimonials |
| `grid grid-cols-1 lg:grid-cols-2` | Two-column layouts (text + image) |
| `grid grid-cols-1 sm:grid-cols-3` | Trust signals, feature mini-cards |
| `flex flex-col sm:flex-row` | Header rows with title + CTA link |
| `flex flex-col lg:flex-row` | Lead capture (form + copy) |

Gaps: `gap-3 sm:gap-6` for cards, `gap-8 md:gap-12 lg:gap-16` for major layout splits.

---

## 5. Card Design Patterns

### Standard Card

```jsx
className="bg-white rounded-2xl border border-slate-200 shadow-sm 
           hover:shadow-lg hover:shadow-slate-200/80 hover:border-primary/20 
           transition-all duration-500"
```

### Image Card (category/blog)

```jsx
className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm 
           hover:shadow-xl hover:shadow-slate-200/80 transition-all duration-500"
```
- Image always: `w-full h-full object-cover transition-all duration-700 group-hover:scale-110`
- Gradient overlay: `bg-gradient-to-t from-slate-950/95 via-slate-900/35 to-transparent`

### Glass / Backdrop Card (hero area)

```jsx
className="rounded-2xl border border-white/70 bg-white/75 backdrop-blur-md shadow-sm"
```

### Dark Card (inside dark sections)

```jsx
className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
```

### Testimonial Card

```jsx
className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 
           hover:shadow-lg hover:shadow-slate-200/80 hover:border-primary/20 
           transition-all duration-500 flex flex-col justify-between group"
```

---

## 6. Border Radius

| Usage | Class |
|---|---|
| Sections, large cards | `rounded-2xl` |
| Buttons (pill) | `rounded-full` |
| Small chips / tags | `rounded-full` |
| Search bar mobile | `rounded-2xl` |
| Search bar desktop | `rounded-full` |
| Icon containers | `rounded-xl` or `rounded-full` |
| FAQ items | `rounded-2xl` |

**Rule:** Default to `rounded-2xl` for containers, `rounded-full` for pills and icon circles.

---

## 7. Buttons

### Primary CTA (filled)

```jsx
className="bg-primary hover:bg-primary/90 active:scale-95 text-white 
           font-black text-xs uppercase tracking-widest rounded-full 
           px-8 py-3 shadow-lg shadow-primary/30 transition-all duration-200"
```

### Primary CTA (pill, with icon)

```jsx
className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white 
           font-black text-sm rounded-full shadow-lg shadow-primary/30 
           hover:scale-105 active:scale-95 transition-all"
```

### Ghost / Outline Button (light bg)

```jsx
className="rounded-full border-2 border-primary/20 bg-white w-9 h-9 
           flex items-center justify-center text-slate-600 
           hover:border-primary hover:text-primary transition-all"
```

### Ghost Button (dark bg)

```jsx
className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl 
           px-5 py-3 transition-all"
```

### Text / Link Button

```jsx
className="text-white font-black flex items-center gap-2 
           hover:translate-x-1 transition-transform uppercase text-xs tracking-widest"
```

### Pill / Tag Button (popular areas)

```jsx
className="text-slate-600 hover:text-primary text-xs font-bold bg-white/70 
           hover:bg-white backdrop-blur-sm border border-white/80 
           hover:border-primary/20 px-4 py-1.5 rounded-full shadow-sm transition-all duration-200"
```

---

## 8. Carousel Navigation Buttons

Two variants — header controls (above carousel) and overlay controls (beside carousel).

**Header controls:**
```jsx
// Inactive
className="w-9 h-9 md:w-14 md:h-14 rounded-full border-2 border-slate-100 
           text-slate-200 cursor-not-allowed bg-slate-50/50"
// Active (prev)
className="w-9 h-9 md:w-14 md:h-14 rounded-full border-2 border-primary/10 
           bg-white text-slate-700 hover:border-primary hover:text-primary 
           hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
// Active (next — filled)
className="w-9 h-9 md:w-14 md:h-14 rounded-full border-2 border-primary 
           bg-primary text-white hover:bg-primary/90 
           hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
```

**Progress bar:**
```jsx
<div className="h-1 bg-slate-100 rounded-full overflow-hidden w-32 md:w-40">
  {/* animated fill via framer-motion, color: from-primary to-primary/60 */}
</div>
```

---

## 9. Icon System

**Material Symbols Outlined** — the single icon library used throughout.

```jsx
<span className="material-symbols-outlined text-primary text-xl">{iconName}</span>
```

- Default size: `text-xl` (20px) for inline icons, `text-5xl` for empty state hero icons
- Filled variant: `style={{ fontVariationSettings: "'FILL' 1" }}`
- Icon + label pattern always uses `gap-2` or `gap-3`

---

## 10. SectionHeader Component

Use `<SectionHeader>` from `@/components/common/SectionHeader` for standard section headings:

```jsx
<SectionHeader
  title="Section Title"
  subtitle="Supporting description text."
  align="center" // "left" | "center" | "right"
/>
```

- Has `mb-12` built in — don't add extra margin below it
- For carousel sections use the inline header pattern in `SectionCarousel` instead

---

## 11. Empty States

All empty states follow the same pattern:

```jsx
<div className="flex flex-col items-center justify-center py-16 md:py-20 
                rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
  <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">
    {icon}
  </span>
  <p className="text-slate-500 font-bold text-sm md:text-base">{message}</p>
</div>
```

On dark backgrounds, use `border-white/10 bg-white/5` and `text-white/40`.

---

## 12. Badge / Chip Patterns

### Category badge (top-left of image card)

```jsx
<div className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 
                text-[9px] font-black uppercase tracking-widest text-primary shadow-sm">
  01
</div>
```

### Content badge (on image)

```jsx
<span className="bg-primary text-white text-[9px] font-black px-3 py-1 
                 rounded-full uppercase tracking-tighter">
  {label}
</span>
```

### Floating info card (on image overlay)

```jsx
<div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 
                bg-white/90 p-4 shadow-lg backdrop-blur-md">
  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Label</p>
  <p className="mt-1 text-sm font-black text-slate-900">Content text here.</p>
</div>
```

---

## 13. Gradient Patterns

| Use | Value |
|---|---|
| Hero image overlay | `bg-gradient-to-b from-white/20 via-white/55 to-white` |
| Hero bottom fade | `bg-gradient-to-t from-white to-transparent` (h-32) |
| Image card overlay | `bg-gradient-to-t from-slate-950/95 via-slate-900/35 to-transparent` |
| Dark image overlay | `bg-gradient-to-t from-slate-950/50 via-transparent to-transparent` |
| Lead capture bg | `radial-gradient(circle at top left, rgba(184,0,73,0.35), transparent 34%)` |
| Accent line | `bg-gradient-to-r from-primary to-primary/60` |

---

## 14. FAQ Pattern

```jsx
<details className="group bg-white rounded-2xl p-4 sm:p-5 md:p-6 cursor-pointer 
                    border border-slate-200 open:border-primary/25 transition-all">
  <summary className="flex justify-between items-center gap-3 font-bold 
                      text-base md:text-lg list-none text-slate-900 
                      group-open:text-primary transition-colors">
    {question}
    <svg className="transition-transform group-open:rotate-180 text-primary" ...chevron... />
  </summary>
  <p className="mt-4 text-slate-500 leading-relaxed font-medium">{answer}</p>
</details>
```

Wrap multiple items in `<div className="space-y-4">`.

---

## 15. Lead Capture / CTA Section Pattern

Dark card inside a white section:

```jsx
<section className="py-6 md:py-10 lg:py-14 px-4 sm:px-6 lg:px-8 bg-white">
  <div className="max-w-7xl mx-auto">
    <div className="bg-slate-950 rounded-2xl p-6 sm:p-8 md:p-12 lg:p-16 text-white 
                    flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16 
                    items-start lg:items-center shadow-2xl shadow-slate-300/80 
                    relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(...)]"></div>
      <div className="relative z-10 lg:w-1/2">
        {/* copy */}
      </div>
      <div className="relative z-10 lg:w-1/2 w-full">
        {/* form */}
      </div>
    </div>
  </div>
</section>
```

---

## 16. Shadows

| Usage | Class |
|---|---|
| Default card | `shadow-sm` |
| Card hover | `shadow-lg shadow-slate-200/80` |
| Heavy card hover | `shadow-xl shadow-slate-200/80` |
| Search bar | `shadow-2xl shadow-black/20` |
| Dark CTA card | `shadow-2xl shadow-slate-300/80` |
| Primary button | `shadow-lg shadow-primary/30` |
| Carousel nav active | `shadow-lg shadow-primary/20` or `shadow-primary/30` |

---

## 17. Transition & Animation Defaults

| Element | Transition |
|---|---|
| Cards (hover) | `transition-all duration-500` |
| Image zoom | `transition-all duration-700 group-hover:scale-110` |
| Buttons | `transition-all duration-200` |
| Link arrows | `hover:translate-x-1 transition-transform` |
| Icon buttons | `hover:translate-x-1 transition-transform` |
| CTA scale | `hover:scale-105 active:scale-95 transition-all` |
| FAQ chevron | `transition-transform group-open:rotate-180` |
| Carousel | framer-motion spring `{ stiffness: 300, damping: 30 }` |

---

## 18. Text Color Palette

| Color | Usage |
|---|---|
| `text-slate-950` | Hero H1, highest emphasis |
| `text-slate-900` | Section headings, card titles |
| `text-slate-700` | Body on white, strong subtext |
| `text-slate-500` | Supporting body text, captions |
| `text-slate-400` | Search placeholders, dividers |
| `text-slate-300` | Empty state icons on dark |
| `text-primary` | Accent text, eyebrows, hover state |
| `text-white` | Text on dark/primary backgrounds |
| `text-white/80` | Muted body on dark backgrounds |
| `text-white/60` | De-emphasized on dark |
| `text-white/40` | Empty state text on dark |

---

## 19. Responsive Breakpoints

| Tailwind prefix | Width | Use for |
|---|---|---|
| _(base)_ | 0+ | Mobile-first, single column |
| `sm:` | 640px | Tablets, 2-col grids start |
| `md:` | 768px | Medium tablets, nav changes |
| `lg:` | 1024px | Desktop, 3-4 col grids, sidebar layouts |
| `nav:` | 1086px | Custom — header nav collapse point |
| `xl:` | 1280px | Wide layouts |

---

## 20. Do's & Don'ts

**Do:**
- Use `font-black` (900) for all headings, buttons, eyebrows, and CTAs
- Use `tracking-tight` or `tracking-tighter` on headings; `tracking-widest` on uppercase labels
- Use `rounded-2xl` for all containers and cards
- Use `max-w-7xl mx-auto` for all content containers
- Apply `px-4 sm:px-6 lg:px-8` as horizontal padding on every section
- Use `py-6 md:py-10 lg:py-14` for section vertical rhythm
- Alternate bg colors between sections (white → off-white → dark → white)
- Always add `group` class to card wrappers and use `group-hover:` for child interactions
- Use `transition-all duration-500` on cards, `duration-200` on buttons
- Use Material Symbols Outlined exclusively for icons

**Don't:**
- Don't use `font-normal` or `font-medium` for headings or CTAs
- Don't use loose `tracking-wide` on headings
- Don't use `rounded-lg` — always go `rounded-xl` minimum, prefer `rounded-2xl`
- Don't use `shadow-md` — use `shadow-sm` (resting) or `shadow-lg`/`shadow-xl` (hover)
- Don't nest sections without consistent padding — match the gutter system
- Don't mix icon libraries — only Material Symbols Outlined
- Don't use `text-gray-*` — use `text-slate-*` throughout
