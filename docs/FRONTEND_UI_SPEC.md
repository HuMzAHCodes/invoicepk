# 🎨 FRONTEND_UI_SPEC.md — InvoicePK Global Frontend UI Specification

> This document defines the global UI rules that apply to EVERY page in InvoicePK.
> Read this before building any component or page.
> These rules were defined by the project owner and are non-negotiable.

---

## 1. Color Theme — Theme A (Ledger)

All colors come from `styles/theme.ts` — never hardcode hex values anywhere else.

### Primary — brand, buttons, active states
| Token | Hex | Usage |
|---|---|---|
| primary-50 | `#E8F0EA` | hover backgrounds, light tints |
| primary-200 | `#A9C9B4` | disabled buttons, subtle accents |
| primary-400 | `#4B8867` | hover state for buttons |
| primary-600 | `#1F5C3F` | main brand color, buttons, active nav |
| primary-900 | `#0F2E1F` | dark brand, footer background |

### Accent — used sparingly, highlights only
| Token | Hex | Usage |
|---|---|---|
| accent-50 | `#FBF3E6` | light accent backgrounds |
| accent-200 | `#E9C98C` | accent borders |
| accent-400 | `#CBA05A` | accent highlights, notes border |
| accent-600 | `#B8863B` | accent text |
| accent-900 | `#5C431D` | dark accent |

### Success — paid invoices, positive amounts
| Token | Hex | Usage |
|---|---|---|
| success-50 | `#EAF5EC` | paid badge background |
| success-200 | `#A8D9B4` | paid badge border |
| success-400 | `#5CB975` | success icons |
| success-600 | `#2F8F4E` | paid badge text |
| success-900 | `#163A22` | dark success |

### Warning — draft, sent, pending
| Token | Hex | Usage |
|---|---|---|
| warning-50 | `#FBF1DF` | draft/sent badge background |
| warning-200 | `#EFCB8A` | draft/sent badge border |
| warning-400 | `#DE9F3E` | warning icons |
| warning-600 | `#B87A1E` | draft/sent badge text |
| warning-900 | `#5C3D0F` | dark warning |

### Danger — errors, delete actions, overdue
| Token | Hex | Usage |
|---|---|---|
| danger-50 | `#FBEAEA` | error message background |
| danger-200 | `#E9A8A8` | error message border |
| danger-400 | `#D66565` | danger icons |
| danger-600 | `#B23333` | error text |
| danger-900 | `#591919` | dark danger |

### Neutral — body text, borders, backgrounds
| Token | Hex | Usage |
|---|---|---|
| neutral-50 | `#F7F5EF` | page background, muted sections |
| neutral-200 | `#DEDACB` | borders, dividers, table rows |
| neutral-400 | `#A8A395` | placeholder text, secondary labels |
| neutral-600 | `#6E6A5D` | secondary body text |
| neutral-900 | `#2B2924` | primary body text, headings |

### Surface colors
| Token | Hex | Usage |
|---|---|---|
| white | `#FFFFFF` | cards, modals, sidebar, navbar |
| surface | `#F7F5EF` | page background (same as neutral-50) |

---

## 2. Section Banding — Landing Page Rule

**Technique:** Alternating section backgrounds create visual rhythm without hard borders.

**Rule:** Alternate between two neutral tones — never swap saturated colors between sections.

```
Section 1 (Hero)          → white (#FFFFFF)
Section 2 (How it Works)  → neutral-50 (#F7F5EF)
Section 3 (Built for PK)  → white (#FFFFFF)
Section 4 (Pricing)       → neutral-50 (#F7F5EF)
Section 5 (FAQ)           → white (#FFFFFF)
Section 6 (CTA Banner)    → primary-600 (#1F5C3F)  ← ONE bold section only
Section 7 (Footer)        → primary-900 (#0F2E1F)  ← dark footer
```

**Rules:**
- Never use more than one bold/saturated section on the whole page
- The CTA band is the ONLY section with a saturated brand color
- Footer is always dark (primary-900)
- Navbar sits above all sections on white background

---

## 3. Font System — Three Fonts, Three Roles

### Display Font — Fraunces
- **Role:** Hero headlines, page titles, section H2s, big callout numbers
- **Weights:** 600 (semibold), 900 (black)
- **Special:** `font-optical-sizing: auto` must be set for weight 900
- **CSS variable:** `var(--font-display)`
- **NEVER use for:** body copy, buttons, forms, nav links, labels

### Body Font — Public Sans
- **Role:** ALL UI text — paragraphs, buttons, nav links, form inputs, labels, badges
- **Weights:** 400 (regular), 500 (medium), 600 (semibold)
- **CSS variable:** `var(--font-body)`
- **This font handles 100% of UI chrome**

### Data/Numeric Font — IBM Plex Mono
- **Role:** Currency amounts, invoice numbers, percentages, dates in tables, stats
- **Weights:** 400 (regular), 500 (medium)
- **Special:** Always use `font-variant-numeric: tabular-nums` for column alignment
- **CSS variable:** `var(--font-mono)`
- **NEVER use for:** regular text, headings, buttons

### Forbidden Fonts
Never use these anywhere in this project:
- Inter
- Poppins
- Manrope
- DM Sans
- Space Grotesk

---

## 4. Animations — Framer Motion

All reusable animation presets live in a single shared file.
Import from there — never write one-off animations inline in components.

**Library:** Framer Motion (already installed)
**Shared file:** `lib/animations.ts`

**General rules:**
- Page transitions: subtle fade + slight upward slide (not dramatic)
- Hover effects: scale or color transition, max 0.2s
- Loading states: skeleton shimmer, not spinners where possible
- Scroll animations: fade-in-up as elements enter viewport
- Never animate things that don't need animation — keep it purposeful

---

## 5. Custom Cursor

- **Count:** One custom cursor only
- **Location:** Landing page only — specific section TBD by project owner
- **Component:** `components/Cursor/index.tsx`
- **Rule:** Never show custom cursor inside the app dashboard — only on the public landing page

---

## 6. Responsiveness — Mobile First

Every component and page must work on all screen sizes.

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 768px | single column, stacked |
| Tablet | 768px — 1024px | condensed sidebar (icons only) |
| Desktop | 1024px+ | full sidebar + content |

**Rules:**
- Build mobile layout first, then add desktop styles
- No horizontal scrolling on any screen size
- Touch targets minimum 44px × 44px
- Font sizes must be readable on mobile without zooming
- Tables become scrollable cards on mobile

---

## 7. Authentication — Google Sign-In Only

- No email/password forms anywhere in the app
- Single login page (`/login`) with "Continue with Google" button
- No separate register page — Google Sign-In handles new and existing users
- New users → Business document auto-created on first login
- Logged-in users visiting `/login` → redirected to `/dashboard`
- Unauthenticated users visiting app pages → redirected to `/login`

---

## 8. Pages Overview

### Public Pages (no auth required)
| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Marketing page — 8 sections |
| `/login` | Login | Google Sign-In only |

### App Pages (auth required)
| Route | Page | Description |
|---|---|---|
| `/dashboard` | Dashboard | Stats + recent invoices |
| `/invoices` | Invoice List | All invoices with filters |
| `/invoices/new` | New Invoice | Invoice creation form |
| `/invoices/[id]` | Invoice Detail | View + edit + PDF download |
| `/clients` | Client List | All clients |
| `/settings` | Settings | Business profile + GST config |

**Total: 8 pages** (2 public + 6 app)

---

## Component Rules

- Every component lives in its own folder with `index.tsx`
- Sub-components of a parent go in separate files inside that folder
- No component imports from another component's internals
- All colors from `theme.ts` — never hardcode hex values
- All fonts via CSS variables — never hardcode font family names
- Tailwind utility classes for layout/spacing — inline styles only when Tailwind can't do it

---

*Last updated: July 2026 | These rules apply to every page and component in InvoicePK*
