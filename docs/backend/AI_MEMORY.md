# 🧠 AI_MEMORY.md — InvoicePK Project Context

> This file is a persistent context document for AI assistants and both developers working on InvoicePK. Always read this first before making any code suggestions or changes.

---

## 📌 What Is InvoicePK?

InvoicePK is a **SaaS web application** for Pakistani freelancers to:
- Generate GST-compliant PDF invoices
- Auto-calculate GST as per FBR rules
- Manage clients, invoice history, and tax records
- Bill in PKR and USD

---

## 🏗️ Tech Stack (Always Use These)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Use `app/` directory, NOT `pages/` |
| Styling | Tailwind CSS | No CSS modules, no styled-components |
| Theme | `styles/theme.ts` | All colors/tokens live here — change theme here only |
| Backend | Next.js API Routes | Under `app/api/` — keep lightweight |
| Database | MongoDB Atlas (free tier) | 512MB free — no SQL, flexible schema |
| ODM | Mongoose | Schema validation, models, hooks |
| Auth | Firebase Auth | Free unlimited users, token verified server-side |
| PDF | `@react-pdf/renderer` | Server-side only, in API route |
| File Storage | Cloudinary (free tier) | Logos + generated PDFs |
| Hosting | Vercel (free tier) | Deploy on every push to `main` |

> ⚠️ This stack is fully free of cost. Do not introduce paid services without team discussion.

---

## 📂 Project Directory Structure

```
invoicepk/
├── app/
│   ├── (auth)/                  # Login, Register pages
│   ├── dashboard/               # Stats + invoice list
│   ├── invoices/                # New/Edit/View invoice pages
│   ├── clients/                 # Client CRUD pages
│   ├── settings/                # Profile + GST config page
│   └── api/                     # ALL backend API routes
│       ├── auth/
│       ├── business/
│       ├── clients/
│       ├── invoices/
│       └── dashboard/
├── components/                  # Reusable UI components (frontend)
│   ├── Navbar/
│   │   ├── Logo/
│   │   ├── SearchBar/
│   │   └── DropdownMenu/
│   ├── InvoiceForm/
│   ├── InvoicePDF/
│   ├── ClientCard/
│   └── Dashboard/
├── styles/
│   └── theme.ts                 # ← SINGLE SOURCE OF TRUTH for all colors/tokens
├── lib/
│   ├── gst.ts                   # GST logic (used both client + server side)
│   ├── db.ts                    # MongoDB/Mongoose connection
│   ├── firebase-admin.ts        # Firebase Admin SDK (server only)
│   ├── withAuth.ts              # Auth middleware for API routes
│   ├── cloudinary.ts            # Cloudinary config
│   └── invoice-number.ts        # INV-001 sequential number generator
├── models/                      # Mongoose models (backend)
│   ├── Business.ts
│   ├── Client.ts
│   └── Invoice.ts
├── scripts/
│   └── seed.ts                  # ← Inserts real test data into Atlas on Day 1
├── types/
│   └── index.ts                 # ← SHARED types — both devs use, neither changes alone
├── __tests__/                   # Jest test files (backend)
└── public/
    └── assets/
```

---

## 👥 Developer Split

| Area | Owner |
|---|---|
| `app/api/` | Backend developer |
| `models/` | Backend developer |
| `lib/db.ts`, `lib/firebase-admin.ts`, `lib/withAuth.ts`, `lib/cloudinary.ts` | Backend developer |
| `scripts/seed.ts` | Backend developer |
| `app/(pages)/`, `components/` | Frontend developer |
| `styles/theme.ts` | Frontend developer |
| `lib/gst.ts` | Both (backend validates server-side, frontend uses for live UI calc) |
| `types/index.ts` | Both — discuss before any change |
| `API_REFERENCE.md` | Contract — neither changes without notifying the other |

---

## 🔑 Key Business Rules (Never Violate)

1. **GST default = 17%** — Always shown as configurable, never hardcoded in UI
2. **Zero-rated GST** = for IT export services (0%) — always support this
3. **Invoice number format** = `INV-001`, `INV-002` (padded to 3 digits)
4. **Withholding Tax (WHT)** = optional toggle for corporate clients
5. **STRN field** = required if GST-registered; hide/show based on user profile
6. **Currency** = PKR primary; USD secondary with exchange rate note
7. **PDF must include**: Logo, business name, NTN, STRN, client info, line items, GST breakdown, total
8. **Server-side recalculation** = backend always recalculates GST totals, never trusts client-submitted values

---

## 🚫 Things to Avoid

### Backend
- Do NOT hardcode GST rate as `0.17` — always pull from user settings
- Do NOT use `any` TypeScript type — always type properly
- Do NOT skip testing — every route gets tested before moving to the next
- Do NOT change API route shapes without updating `API_REFERENCE.md` and notifying frontend dev
- Do NOT trust client-submitted totals — always recalculate server-side
- Do NOT use hardcoded mock data anywhere — always use real MongoDB Atlas data

### Frontend
- Do NOT use `pages/` directory — this is App Router
- Do NOT skip mobile responsiveness — many users are on phones
- Do NOT use inline styles — Tailwind utility classes only
- Do NOT hardcode colors — always use `theme.ts` values
- Do NOT create components that are not independent and reusable

### Both
- Do NOT commit `.env.local` to Git
- Do NOT change `types/index.ts` without discussing with the other developer
- Do NOT change `API_REFERENCE.md` without notifying the other developer

---

## 🧪 Development Rules

### Backend Rules
1. **Real DB from Day 1** — MongoDB Atlas is connected and seed data is inserted on Day 1. Every route is built and tested against the real database from the start. No hardcoded mock data, ever.
2. **Seed script** — `scripts/seed.ts` inserts a real test business, clients, and invoices into Atlas on Day 1 so every route has real data to work with immediately
3. **Test per feature** — every API route gets Jest tests (4-5 cases) + manual test before moving on. Tests run against a dedicated Atlas test database, not mocked or in-memory data
4. **Console log at every endpoint** — log request arrival and response at every API route
5. **Zod validation** — every API route validates its input with a Zod schema

### Frontend Rules
1. **Theme file** — all colors come from `styles/theme.ts` — changing one value updates the whole app
2. **Atomic components** — every component lives in its own folder with sub-components in separate files
3. **Independent and reusable** — components must work standalone, no hidden dependencies

### Shared Rules
1. **API contract** — `API_REFERENCE.md` is law — code against it, don't deviate
2. **Shared types** — `types/index.ts` is used by both — discuss before changing
3. **Daily sync** — 10-minute check-in: what's done, what's today, any API change?

---

## 🗓️ Development Phase Context

| Phase | Status | Description |
|---|---|---|
| MVP (Week 1–2) | 🔄 In Progress | Auth, invoices, PDF, dashboard |
| Phase 2 | ⏳ Planned | Multi-currency, recurring invoices, email (Resend) |
| Phase 3 | ⏳ Planned | FBR export, payment links, team support |

---

## 🌱 Seed Data (scripts/seed.ts)

Run once on Day 1 to populate Atlas with real test data:

- Test business: `TestFreelancer Co.`, NTN: `1234567-8`, STRN: `12-00-1234-567-89`
- Test client 1: `Acme Corp`, contact: `accounts@acme.pk`, corporate: true
- Test client 2: `John Doe`, contact: `john@example.com`, corporate: false
- Test invoice 1: INV-001, standard GST 17%, PKR 100,000 subtotal, status: draft
- Test invoice 2: INV-002, zero-rated GST, USD 2,000, status: sent

Use `npx ts-node scripts/seed.ts` to run the seed script.

---

## 📎 External References

- FBR GST: https://www.fbr.gov.pk
- STZA IT Export Exemptions: https://stza.gov.pk
- MongoDB Atlas: https://cloud.mongodb.com
- Firebase Console: https://console.firebase.google.com
- Cloudinary: https://cloudinary.com
- Next.js App Router: https://nextjs.org/docs/app

---

*Last updated: June 2026 | Stack: MongoDB + Firebase + Cloudinary + Next.js 14*
