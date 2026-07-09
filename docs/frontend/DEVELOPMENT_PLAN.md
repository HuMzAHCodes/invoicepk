# 🗓️ DEVELOPMENT_PLAN.md — InvoicePK 14-Day Build Plan

> Two developers working in parallel: one frontend, one backend.
> Backend connects to real MongoDB Atlas from Day 1 — no mock data, ever.
> Frontend codes against the API shapes defined in API_REFERENCE.md.
> Both developers sync for 10 minutes every day.

---

## Ground Rules

| Rule | Detail |
|---|---|
| No mock data | Backend uses real MongoDB Atlas from Day 1. Seed script populates test data. |
| Test per feature | Every backend route gets Jest tests + manual check before moving on |
| API contract | API_REFERENCE.md is law — no changes without notifying the other dev |
| Branch per feature | Never work directly on `main` or `dev` |
| Daily sync | 10-minute standup: what's done, what's today, any API change? |
| Console logs | Every backend route logs request + response |
| Atomic components | Every frontend component lives in its own folder |
| Theme file | All colors come from `styles/theme.ts` only |

---

## Parallel Work Overview

```
BACKEND DEV                          FRONTEND DEV
─────────────────────────────────────────────────────────
Day 1:  Project setup + Atlas        Project setup + theme file
Day 2:  Auth API routes              Auth UI pages
Day 3:  Business + Client APIs       Dashboard skeleton + Client UI
Day 4:  Invoice API (create/list)    Invoice list page
Day 5:  Invoice API (detail/edit)    Invoice creation form + live GST
Day 6:  Status + Delete APIs         Invoice detail page
Day 7:  QA Week 1 + fix bugs         QA Week 1 + fix bugs
Day 8:  PDF API route                PDF template + preview UI
Day 9:  PDF save to Cloudinary       PDF download button + settings page
Day 10: Dashboard stats API          Dashboard stats UI
Day 11: Free tier limits + polish    Mobile responsiveness pass
Day 12: Full test suite              Component cleanup + reusability pass
Day 13: Security + rate limiting     Landing page
Day 14: Final QA + deploy            Final QA + deploy
─────────────────────────────────────────────────────────
```

---

## Day-by-Day Detail

---

### Day 1 — Project Setup

#### Backend
- [ ] Initialize Next.js 14 project with TypeScript and Tailwind
- [ ] Set up folder structure exactly as defined in ARCHITECTURE.md
- [ ] Create `.env.example` and `.env.local` with all variables from ENV_VARIABLES.md
- [ ] Set up MongoDB Atlas free cluster — create `invoicepk` and `invoicepk_test` databases
- [ ] Write `lib/db.ts` — Mongoose singleton connection
- [ ] Write all three Mongoose models: `Business`, `Client`, `Invoice`
- [ ] Write and run `scripts/seed.ts` — verify real test data appears in Atlas
- [ ] Set up Firebase project — enable Email/Password auth
- [ ] Write `lib/firebase-admin.ts` and `lib/withAuth.ts`
- [ ] Set up Jest: `jest.config.ts`, `jest.setup.ts` (test DB swap)
- [ ] Push to `backend/day-1-setup` branch

**Done when:** `scripts/seed.ts` runs successfully, Atlas shows 1 business + 2 clients + 2 invoices, `connectDB()` logs success.

#### Frontend
- [ ] Pull the initialized repo from backend dev (or initialize together)
- [ ] Set up `styles/theme.ts` with full color token system
- [ ] Set up Tailwind config to reference theme tokens
- [ ] Set up Firebase JS SDK client-side (`lib/firebase-client.ts`)
- [ ] Set up `types/index.ts` with shared interfaces from API_REFERENCE.md
- [ ] Create placeholder folder structure for all components (empty `index.tsx` files)
- [ ] Build `app/(dashboard)/layout.tsx` and `app/(auth)/layout.tsx` shells (see GLOBAL_LAYOUT.md)
- [ ] Set up Next.js middleware (`middleware.ts`) for route protection
- [ ] Deploy skeleton to Vercel — confirm it builds with no errors
- [ ] Push to `frontend/day-1-setup` branch

**Done when:** App deploys to Vercel, theme file exists, all component folders scaffolded.

---

### Day 2 — Authentication

#### Backend
- [ ] `POST /api/auth/register` — create Firebase user + Business document in MongoDB
- [ ] `POST /api/auth/login` — verify Firebase credentials, return token
- [ ] Write Jest tests for both routes (4-5 cases each) against `invoicepk_test` DB
- [ ] Manual test: register a new user → check Atlas for new Business document
- [ ] Push to `backend/auth-routes` branch → PR to `dev`

**Done when:** All Jest tests pass. New user document visible in Atlas after register call.

#### Frontend
- [ ] Build `/login` page — email + password form
- [ ] Build `/register` page — email + password + business name form
- [ ] Wire Firebase client SDK for login and register
- [ ] Store Firebase token in a cookie after login (see DATA_FETCHING.md — required for Server Components to read it)
- [ ] Redirect to `/dashboard` after successful login
- [ ] Handle and display auth error messages
- [ ] Push to `frontend/auth-pages` branch → PR to `dev`

**Done when:** User can register, login, and reach dashboard. Invalid credentials show error.

---

### Day 3 — Business Profile + Client List

#### Backend
- [ ] `GET /api/business` — fetch business profile by Firebase UID
- [ ] `PUT /api/business` — update business profile (partial updates)
- [ ] `POST /api/business/logo` — upload logo to Cloudinary, save URL to Business document
- [ ] `GET /api/clients` — list clients with pagination and search
- [ ] `POST /api/clients` — create new client
- [ ] Write Jest tests for all 5 routes
- [ ] Manual test: hit each endpoint via Postman, check Atlas for changes
- [ ] Push to `backend/business-clients-api` branch → PR to `dev`

**Done when:** All routes return correct shaped responses matching API_REFERENCE.md. Atlas shows updates.

#### Frontend
- [ ] Build dashboard skeleton layout (sidebar + header using Navbar components)
- [ ] Build `Navbar/Logo`, `Navbar/SearchBar`, `Navbar/DropdownMenu` as separate components
- [ ] Build `/clients` page — list clients from `GET /api/clients`
- [ ] Build `ClientCard` component
- [ ] Build client create form (calls `POST /api/clients`)
- [ ] Push to `frontend/clients-ui` branch → PR to `dev`

**Done when:** Clients page shows real data from Atlas via API. New client form works.

---

### Day 4 — Invoice List + Create (Part 1)

#### Backend
- [ ] `GET /api/invoices` — list invoices with filters (status, client, date range, pagination)
- [ ] `POST /api/invoices` — create invoice with server-side GST recalculation
  - Import `calculateInvoice` from `lib/gst.ts`
  - Validate GST rate with `validateGSTRate`
  - Auto-generate invoice number via `lib/invoice-number.ts`
  - Save calculated totals — never save client-submitted totals
- [ ] Write Jest tests: happy path, empty items, invalid GST rate, unauthorized, duplicate invoice number
- [ ] Manual test: create invoice via Postman → check Atlas for correct calculated values
- [ ] Push to `backend/invoice-create` branch → PR to `dev`

**Done when:** `POST /api/invoices` saves correct server-calculated GST values in Atlas. Tests pass.

#### Frontend
- [ ] Build `/invoices` page — invoice list with status filter tabs (Draft / Sent / Paid)
- [ ] Build invoice list table rows with status badges
- [ ] Push to `frontend/invoice-list` branch → PR to `dev`

**Done when:** Invoice list page shows real invoices from Atlas with correct status badges.

---

### Day 5 — Invoice Form + Live GST

#### Backend
- [ ] `GET /api/invoices/:id` — single invoice with populated client info
- [ ] `PUT /api/invoices/:id` — update invoice (draft only), recalculate GST server-side
- [ ] Write Jest tests: get own invoice, get another user's invoice (403), update sent invoice (409)
- [ ] Manual test: update an invoice → confirm Atlas shows recalculated totals
- [ ] Push to `backend/invoice-detail` branch → PR to `dev`

**Done when:** GET and PUT routes work. Updating a sent invoice correctly returns 409.

#### Frontend
- [ ] Build `/invoices/new` page — full invoice creation form
- [ ] Build `InvoiceForm/LineItems` — add/remove/edit line items
- [ ] Build `InvoiceForm/GSTSection` — GST type selector + rate input
- [ ] Build `InvoiceForm/TotalsSidebar` — live totals that update as user types
- [ ] Wire `calculateInvoice()` from `lib/gst.ts` for live calculation
- [ ] On submit: `POST /api/invoices` → redirect to invoice detail page
- [ ] Push to `frontend/invoice-form` branch → PR to `dev`

**Done when:** User can fill the form, see live GST calculation, submit and have invoice appear in Atlas.

---

### Day 6 — Invoice Status + Delete

#### Backend
- [ ] `PATCH /api/invoices/:id/status` — status transitions (draft→sent→paid only)
- [ ] `DELETE /api/invoices/:id` — delete draft invoices only
- [ ] Write Jest tests: valid transition, invalid backward transition, delete paid invoice (409)
- [ ] Manual test: transition statuses via Postman → confirm Atlas updates
- [ ] Push to `backend/invoice-status` branch → PR to `dev`

**Done when:** Status transitions work correctly. Deleting a paid invoice returns 409.

#### Frontend
- [ ] Build `/invoices/:id` — invoice detail page
- [ ] Show all invoice info, line items, and GST breakdown
- [ ] Add status transition buttons (Mark as Sent / Mark as Paid) — calls PATCH route
- [ ] Add delete button (only visible on draft invoices) — calls DELETE route
- [ ] Push to `frontend/invoice-detail` branch → PR to `dev`

**Done when:** User can view invoice, change status, and delete drafts from the UI.

---

### Day 7 — Week 1 QA

#### Both Developers
- [ ] Merge all open PRs into `dev`
- [ ] Pull latest `dev` and run the full app locally end-to-end
- [ ] Walk through the full user flow: register → create client → create invoice → change status
- [ ] Backend: run full Jest test suite (`npm test`) — all tests must pass
- [ ] Fix any bugs found — small PRs directly to `dev`
- [ ] Review console logs — are they meaningful and consistent?
- [ ] Review API responses — do they match API_REFERENCE.md exactly?

**Done when:** Full user flow works end-to-end with real data. Zero failing Jest tests.

---

### Day 8 — PDF Generation

#### Backend
- [ ] `GET /api/invoices/:id/pdf` — fetch invoice from Atlas, render PDF, stream to browser
- [ ] Import `InvoicePDFTemplate` from frontend (coordinate with frontend dev on props interface)
- [ ] Set correct response headers: `Content-Type: application/pdf`, `Content-Disposition`
- [ ] Write Jest test: hit the route, confirm Content-Type header is `application/pdf`
- [ ] Manual test: open in browser — PDF should download correctly
- [ ] Push to `backend/pdf-route` branch → PR to `dev`

**Done when:** Clicking the download URL in the browser downloads a real PDF.

#### Frontend
- [ ] Build `InvoicePDF/InvoicePDFTemplate.tsx` using `@react-pdf/renderer`
- [ ] Include: logo, business name, NTN, STRN, client info, line items table, GST breakdown, totals
- [ ] Follow layout and color spec from PDF_TEMPLATE_SPEC.md
- [ ] Push to `frontend/pdf-template` branch → PR to `dev`

**Done when:** PDF renders correctly with all invoice data. Layout matches spec.

---

### Day 9 — PDF Save + Settings Page

#### Backend
- [ ] `POST /api/invoices/:id/pdf/save` — generate PDF, upload to Cloudinary, save URL in Atlas
- [ ] Write Jest test: call save route → confirm `pdfUrl` field updated in Atlas
- [ ] Push to `backend/pdf-save` branch → PR to `dev`

**Done when:** After calling save route, the invoice document in Atlas has a valid Cloudinary `pdfUrl`.

#### Frontend
- [ ] Build `/settings` page — business name, NTN, STRN, address, default GST rate, currency
- [ ] Logo upload UI — calls `POST /api/business/logo`
- [ ] Add "Download PDF" button to invoice detail page — calls `GET /api/invoices/:id/pdf`
- [ ] Add "Save PDF" button — calls `POST /api/invoices/:id/pdf/save`
- [ ] Push to `frontend/settings-pdf-ui` branch → PR to `dev`

**Done when:** Settings page saves correctly. PDF downloads and saves from invoice detail page.

---

### Day 10 — Dashboard Stats

#### Backend
- [ ] `GET /api/dashboard/stats` — aggregate query: total invoices, by status, revenue this month, outstanding
- [ ] Use MongoDB aggregation pipeline for stats — not multiple separate queries
- [ ] Write Jest tests against real `invoicepk_test` data from seed script
- [ ] Push to `backend/dashboard-stats` branch → PR to `dev`

**Done when:** Stats route returns correct numbers matching what is in the test Atlas database.

#### Frontend
- [ ] Build dashboard stats cards: Total Invoices, Revenue This Month, Outstanding Amount
- [ ] Build recent invoices list on dashboard (last 5)
- [ ] Wire both to real API data
- [ ] Push to `frontend/dashboard-stats` branch → PR to `dev`

**Done when:** Dashboard shows real numbers from Atlas. Stats match actual invoice data.

---

### Day 11 — Free Tier Limits + Mobile

#### Backend
- [ ] Enforce free tier limit: max 5 invoices per month per business (see BACKEND_PATTERNS.md's Free Tier Enforcement Pattern — requires the `plan` field added to the Business model in DATABASE_SCHEMA.md)
- [ ] Check count before creating in `POST /api/invoices` — return `429 LIMIT_EXCEEDED` if reached
- [ ] Write Jest test: create 5 invoices → 6th returns 429
- [ ] Push to `backend/rate-limiting` branch → PR to `dev`

**Done when:** 6th invoice in a month correctly returns 429 with `LIMIT_EXCEEDED` error code.

#### Frontend
- [ ] Full mobile responsiveness pass — test every page on 375px width
- [ ] Fix any layout breaks on small screens
- [ ] Add toast notifications for success and error states across all forms
- [ ] Handle `429 LIMIT_EXCEEDED` — show upgrade prompt UI
- [ ] Push to `frontend/mobile-polish` branch → PR to `dev`

**Done when:** All pages usable on mobile. Toasts appear on success and error.

---

### Day 12 — Testing + Cleanup

#### Backend
- [ ] Run full Jest suite — all tests must pass with zero failures
- [ ] Add any missing tests for edge cases found during QA
- [ ] Review all console logs — consistent format, no sensitive data logged
- [ ] Check all routes: is `connectDB()` called at the top of every route?
- [ ] Check all routes: is `businessId` always derived from Firebase token, never from request body?

#### Frontend
- [ ] Reusability pass — are all components truly independent?
- [ ] Check every component: does it import from `styles/theme.ts` for colors?
- [ ] Remove any hardcoded hex colors or inline styles
- [ ] TypeScript check: `npx tsc --noEmit` — zero errors

**Done when:** Zero TypeScript errors. Zero failing Jest tests. No hardcoded colors.

---

### Day 13 — Landing Page + Security

#### Backend
- [ ] Add Zod validation review — every route has a Zod schema, no missing fields
- [ ] Security review: every route filters by `businessId` from token — no data leaks
- [ ] Review error responses — no stack traces or internal details exposed in production errors

#### Frontend
- [ ] Build `/` landing page — hero, features, pricing tiers (PKR), CTA buttons
- [ ] Push to `frontend/landing-page` branch → PR to `dev`

**Done when:** Landing page live. Security checklist complete.

---

### Day 14 — Final QA + Deploy

#### Both Developers
- [ ] Merge `dev` into `main`
- [ ] Add all environment variables to Vercel dashboard
- [ ] Trigger Vercel deploy — confirm build succeeds
- [ ] Run full end-to-end test on production URL:
  - Register new account
  - Complete business profile
  - Upload logo
  - Create client
  - Create invoice (standard GST)
  - Create invoice (zero-rated)
  - Change invoice status
  - Download PDF
  - Check dashboard stats
- [ ] Backend: confirm production Atlas database has correct data after test flow
- [ ] Fix any production-only issues
- [ ] Tag release: `git tag v1.0.0`

**Done when:** Full user flow works on production Vercel URL with real Atlas data.

---

## Branch Naming Reference

| Developer | Branch Pattern | Example |
|---|---|---|
| Backend | `backend/<feature>` | `backend/invoice-create` |
| Frontend | `frontend/<feature>` | `frontend/invoice-form` |
| Shared fix | `fix/<description>` | `fix/gst-rounding-error` |
| Hotfix | `hotfix/<description>` | `hotfix/pdf-download-broken` |

---

## Definition of Done — Per Feature

A feature is only "done" when ALL of the following are true:

- [ ] Code is on its feature branch and pushed to GitHub
- [ ] PR is open to `dev` branch
- [ ] For backend: Jest tests pass + manual Postman test done + Atlas shows correct data
- [ ] For frontend: page works with real API data + no hardcoded colors + mobile looks correct
- [ ] Console logs are in place (backend) or removed (no debug logs in frontend)
- [ ] TypeScript shows zero errors (`npx tsc --noEmit`)
- [ ] Other developer has been notified if any shared file was changed (`types/index.ts`, `API_REFERENCE.md`, `lib/gst.ts`)

---

*Last updated: June 2026 | 14-day MVP plan | No mock data — real Atlas DB from Day 1*
