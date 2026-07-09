# 🚀 LANDING_PAGE_SPEC.md — InvoicePK Landing Page Specification

> This document defines the complete structure, content, and design rules
> for the InvoicePK landing page (`/`).
> Read FRONTEND_UI_SPEC.md first for global color, font, and animation rules.
> This page is public — no authentication required.

---

## Page Overview

The landing page is the first thing a potential user sees. It must:
- Immediately communicate what InvoicePK does and who it's for
- Build trust with Pakistani freelancers specifically
- Convert visitors to sign-ups via Google Sign-In
- Load fast — no heavy libraries on the critical path

---

## Section Structure & Banding

```
┌─────────────────────────────────────────────────────┐
│  NAVBAR                          white background   │
├─────────────────────────────────────────────────────┤
│  1. HERO                         white (#FFFFFF)    │
├─────────────────────────────────────────────────────┤
│  2. HOW IT WORKS                 neutral-50         │
│                                  (#F7F5EF)          │
├─────────────────────────────────────────────────────┤
│  3. BUILT FOR PAKISTAN           white (#FFFFFF)    │
├─────────────────────────────────────────────────────┤
│  4. PRICING                      neutral-50         │
│                                  (#F7F5EF)          │
├─────────────────────────────────────────────────────┤
│  5. FAQ                          white (#FFFFFF)    │
├─────────────────────────────────────────────────────┤
│  6. FINAL CTA BANNER             primary-600        │
│                                  (#1F5C3F) ← BOLD  │
├─────────────────────────────────────────────────────┤
│  7. FOOTER                       primary-900        │
│                                  (#0F2E1F) ← DARK  │
└─────────────────────────────────────────────────────┘
```

---

## Section 0 — Navbar

**Background:** white, sticky top, `border-bottom: 1px solid neutral-200`

**Left:** InvoicePK wordmark (Fraunces 700, primary-600)

**Right:**
- "Sign In" link (Public Sans, neutral-600, hover: primary-600)
- "Get Started Free" button (primary-600 bg, white text, rounded)

**Mobile:** hamburger menu → full screen overlay with nav links

---

## Section 1 — Hero

**Background:** white
**Layout:** two-column on desktop (text left, visual right), stacked on mobile

### Left side — text
**Headline (H1):**
```
Generate GST invoices
in 2 minutes.
```
- Font: Fraunces 900, ~3.75rem desktop / ~2.25rem mobile
- Color: neutral-900
- `font-optical-sizing: auto`

**Subheadline:**
```
FBR-compliant invoices with auto GST, WHT, and NTN/STRN
for Pakistani freelancers and agencies. Free forever.
```
- Font: Public Sans 400, ~1.125rem
- Color: neutral-600
- Max width: 480px

**CTA Buttons (side by side):**
- Primary: "Start for free" → `/login` (primary-600 bg, white text)
- Secondary: "See how it works" → scrolls to How it Works section (outlined, primary-600 border)

**Trust line below buttons:**
```
✓ Free forever  ✓ No credit card  ✓ FBR-compliant
```
- Font: Public Sans 400, 0.875rem, neutral-400

### Right side — visual
- Animated mock invoice card (Framer Motion — fade in + float)
- Shows: INV-001, line items, GST breakdown, net payable
- Uses Theme A Ledger colors
- Subtle drop shadow

**Animation:** hero text fades in from bottom on page load, invoice card fades in from right with slight delay

---

## Section 2 — How It Works

**Background:** neutral-50 (`#F7F5EF`)
**Layout:** centered, 3 steps in a row (desktop) / stacked (mobile)

**Section label (above heading):**
```
HOW IT WORKS
```
- Font: Public Sans 600, 0.75rem, primary-400, letter-spacing wide, uppercase

**Heading (H2):**
```
From zero to invoice in 3 steps
```
- Font: Fraunces 600, ~2.25rem
- Color: neutral-900

**3 Steps:**

| Step | Icon | Title | Description |
|---|---|---|---|
| 1 | 📋 | Fill your invoice | Add client, line items, GST type |
| 2 | 🧮 | GST auto-calculated | WHT, zero-rated, standard — all handled |
| 3 | 📄 | Download PDF | FBR-compliant PDF ready to send |

- Step number: IBM Plex Mono, primary-600, large
- Title: Public Sans 600, neutral-900
- Description: Public Sans 400, neutral-600

**Animation:** steps fade in left to right as user scrolls into view (Framer Motion)

---

## Section 3 — Built for Pakistan

**Background:** white
**Layout:** two-column (features left, visual right) on desktop / stacked mobile

**Section label:**
```
BUILT FOR PAKISTAN
```

**Heading (H2):**
```
Every Pakistani tax rule,
built right in.
```
- Font: Fraunces 600, ~2.25rem
- Color: neutral-900

**Feature list (6 items):**

| Feature | Description |
|---|---|
| ✅ GST at 17% | Standard FBR rate, configurable per invoice |
| ✅ Zero-rated GST | For IT export services (STZA exemption) |
| ✅ WHT support | Withholding tax for corporate clients |
| ✅ NTN on invoice | Your National Tax Number on every PDF |
| ✅ STRN on invoice | Sales Tax Reg Number shown when applicable |
| ✅ PKR + USD | Bill locally and internationally |

- Checkmark color: success-600 (`#2F8F4E`)
- Feature title: Public Sans 600, neutral-900
- Description: Public Sans 400, neutral-600

**Right side visual:**
- Screenshot / mockup of the GST breakdown section of an invoice PDF
- Or animated number counter showing "17% GST calculated instantly"

---

## Section 4 — Pricing

**Background:** neutral-50 (`#F7F5EF`)
**Layout:** centered, two cards side by side (desktop) / stacked (mobile)

**Section label:**
```
PRICING
```

**Heading (H2):**
```
Simple pricing.
No surprises.
```
- Font: Fraunces 600, ~2.25rem

### Free Plan Card
```
┌──────────────────────────────┐
│  Free                        │
│  PKR 0 / month               │
│                              │
│  ✓ 5 invoices/month          │
│  ✓ GST auto-calculation      │
│  ✓ PDF download              │
│  ✓ 1 business profile        │
│  ✓ 10 clients                │
│                              │
│  [Get started free]          │
└──────────────────────────────┘
```
- Border: neutral-200
- Background: white
- Button: outlined, primary-600

### Pro Plan Card
```
┌──────────────────────────────┐
│  ⭐ Pro          MOST POPULAR │
│  PKR 999 / month             │
│                              │
│  ✓ Unlimited invoices        │
│  ✓ Everything in Free        │
│  ✓ Logo upload               │
│  ✓ Save PDF to cloud         │
│  ✓ Dashboard stats           │
│                              │
│  [Start Pro — PKR 999/mo]    │
└──────────────────────────────┘
```
- Border: primary-600 (2px)
- Background: white
- Badge: "MOST POPULAR" in primary-600
- Button: primary-600 bg, white text
- Subtle box shadow

**Price:** IBM Plex Mono font for the PKR amount

---

## Section 5 — FAQ

**Background:** white
**Layout:** centered, accordion list, max-width 720px

**Heading (H2):**
```
Frequently asked questions
```
- Font: Fraunces 600, ~2.25rem

**5 Questions:**

1. **Is InvoicePK free?**
   Yes, up to 5 invoices per month. Pro is PKR 999/month for unlimited invoices.

2. **Is it FBR compliant?**
   Yes. GST at 17%, zero-rated for IT exports, WHT support, NTN and STRN on every PDF.

3. **Do I need an STRN?**
   Only if you charge GST. You can use InvoicePK without an STRN for exempt or zero-rated invoices.

4. **Can I bill in USD?**
   Yes. Each invoice can be PKR or USD.

5. **Is my data safe?**
   Yes. Your data is stored securely in MongoDB Atlas and never shared with third parties.

**Accordion behavior:** click to expand/collapse answer (Framer Motion height animation)

---

## Section 6 — Final CTA Banner

**Background:** primary-600 (`#1F5C3F`) ← the ONE bold section
**Layout:** centered text + button

**Heading:**
```
Start invoicing for free today.
```
- Font: Fraunces 900, ~2.25rem, white

**Subheading:**
```
Join Pakistani freelancers who invoice the smart way.
```
- Font: Public Sans 400, primary-200, ~1.125rem

**Button:**
```
[Get started — it's free]
```
- Background: white
- Text: primary-600
- Hover: neutral-50 bg

---

## Section 7 — Footer

**Background:** primary-900 (`#0F2E1F`)
**Layout:** 3 columns (desktop) / stacked (mobile)

**Column 1 — Brand:**
- InvoicePK wordmark (Fraunces 700, white)
- Tagline: "GST invoices for Pakistani freelancers"
- "Made in Pakistan 🇵🇰"

**Column 2 — Links:**
- How it works
- Pricing
- FAQ

**Column 3 — Legal:**
- Terms of Service
- Privacy Policy

**Bottom bar:**
```
© 2026 InvoicePK. All rights reserved.
```
- Font: Public Sans 400, 0.75rem, neutral-400

---

## Animation Summary

| Section | Animation | Library |
|---|---|---|
| Hero text | Fade in + slide up on load | Framer Motion |
| Hero invoice card | Fade in from right, float loop | Framer Motion |
| How it works steps | Stagger fade in on scroll | Framer Motion |
| Built for Pakistan features | Fade in left on scroll | Framer Motion |
| Pricing cards | Scale up on hover | Framer Motion |
| FAQ accordion | Height expand/collapse | Framer Motion |
| CTA button | Scale on hover | Framer Motion |

---

## SEO Metadata

```typescript
export const metadata = {
  title: 'InvoicePK — GST-Compliant Invoices for Pakistani Freelancers',
  description: 'Generate FBR-compliant GST invoices in 2 minutes. Auto-calculate GST, WHT, and download professional PDFs. Built for Pakistani freelancers and agencies.',
  keywords: 'invoice pakistan, GST invoice, FBR invoice, freelancer invoice pakistan, WHT invoice, NTN invoice',
}
```

---

## Component File Structure

```
app/
└── page.tsx                          ← assembles all sections

components/
└── Landing/
    ├── index.tsx                     ← main landing page assembler
    ├── Header/
    │   └── index.tsx                 ← Navbar
    ├── Hero/
    │   └── index.tsx
    ├── HowItWorks/
    │   └── index.tsx
    ├── PakistanFeatures/
    │   └── index.tsx                 ← "Built for Pakistan" section
    ├── PricingTable/
    │   └── index.tsx
    ├── FAQ/
    │   └── index.tsx
    ├── CTABanner/
    │   └── index.tsx
    └── Footer/
        └── index.tsx
```

---

*Last updated: July 2026 | Cross-reference FRONTEND_UI_SPEC.md for global design rules*
