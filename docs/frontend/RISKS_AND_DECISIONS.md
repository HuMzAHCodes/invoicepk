# ⚠️ RISKS_AND_DECISIONS.md — InvoicePK Risks & Key Decisions

> This document records risks the team is aware of and key architectural decisions already made.
> Do not re-debate decisions listed here — they are final for the MVP.
> Update the risk register if new risks are identified during development.

---

## 📋 Key Architectural Decisions

These decisions are locked for the MVP. They were made deliberately — read the reasoning before questioning them.

---

### Decision 1: MongoDB Atlas over PostgreSQL/Supabase

**Decision:** Use MongoDB Atlas (free tier) with Mongoose instead of PostgreSQL with Prisma.

**Reasoning:**
- Free tier is sufficient for MVP (512MB, unlimited API calls)
- No SQL setup or migration files to manage
- Flexible schema suits invoice line items well (embedded array)
- Team has prior Mongoose experience from MovieVerse project
- Avoids Supabase paid tier dependency

**Trade-offs accepted:**
- No built-in Row Level Security (handled in application layer instead)
- No relational joins (use Mongoose populate or denormalize where needed)
- Aggregation pipelines required for dashboard stats instead of simple SQL GROUP BY

---

### Decision 2: Firebase Auth over Supabase Auth / NextAuth

**Decision:** Use Firebase Auth for authentication.

**Reasoning:**
- Free unlimited users on Spark plan
- Battle-tested token system (JWT-based ID tokens)
- Simple to verify server-side with Firebase Admin SDK
- Decoupled from database — auth and data layers are independent

**Trade-offs accepted:**
- Two separate services to configure (Firebase + MongoDB) instead of one (Supabase)
- Firebase Admin SDK adds ~2MB to server bundle
- Extra env variables to manage

---

### Decision 3: No Mock Data — Real Database from Day 1

**Decision:** Backend connects to real MongoDB Atlas from Day 1. `scripts/seed.ts` inserts real test data. No hardcoded mock responses anywhere in the codebase.

**Reasoning:**
- Mock data passes tests but hides real bugs — connection errors, index issues, query performance problems, and deployment failures only appear when hitting a real database
- Testing against real Atlas catches environment-specific issues early (DNS, network, auth) rather than at deployment time
- The seed script takes 30 minutes to write once and saves hours of debugging later

**Trade-offs accepted:**
- Slightly slower Day 1 setup compared to just hardcoding responses
- Tests require internet connection to reach Atlas (acceptable for this project)
- Both developers need Atlas credentials configured on Day 1

---

### Decision 4: Monorepo — Frontend and Backend in Same Next.js Project

**Decision:** One Next.js 14 project contains both the frontend (`app/(pages)/`) and backend (`app/api/`). No separate Express server.

**Reasoning:**
- Simpler deployment — one Vercel project, one domain
- Shared `types/index.ts` enforces consistent data shapes across both layers
- Shared `lib/gst.ts` used by both frontend (live calc) and backend (server validation)
- No CORS configuration needed
- Free Vercel tier covers both frontend and API routes

**Trade-offs accepted:**
- Frontend and backend cannot be scaled independently
- API routes run as serverless functions — cold start possible on first request
- Large codebase in one repo requires clear folder ownership rules (documented in AI_MEMORY.md)

---

### Decision 5: Atomic Component Structure for Frontend

**Decision:** Every UI component lives in its own folder. Sub-components of a parent are separate files inside that folder. No component imports from another component's internals.

**Reasoning:**
- Prevents merge conflicts when both developers happen to touch UI files
- Makes components independently testable and reusable
- Easy to locate, debug, and replace individual pieces without side effects
- Scales well as the project grows

**Trade-offs accepted:**
- More folders to navigate compared to a flat `components/` structure
- Slightly more boilerplate (`index.tsx` in each folder)

---

### Decision 6: Single Theme File for All Colors

**Decision:** All colors and design tokens live in `styles/theme.ts`. No hardcoded hex values anywhere else in the codebase. Tailwind config references this file.

**Reasoning:**
- Changing the entire app's color scheme requires editing one file
- Prevents inconsistent colors across components (e.g. two slightly different shades of the same blue)
- Makes a future rebrand or white-label version trivial

**Trade-offs accepted:**
- Tailwind's JIT compiler needs to be configured to scan `theme.ts` for class names
- Developers must remember to always reference the theme file — requires discipline

---

### Decision 7: Console Logs at Every Endpoint (MVP Phase)

**Decision:** Every API route logs request arrival and response using `console.log`. No external logging service for MVP.

**Reasoning:**
- Vercel dashboard shows `console.log` output in real time — sufficient for debugging during MVP
- Zero configuration, zero cost
- Frontend developer can trace exactly which endpoint was called and what came back during integration

**Trade-offs accepted:**
- Not suitable for high-volume production — logs are ephemeral on Vercel
- No log aggregation or alerting
- Plan: upgrade to Winston or Pino in Phase 2 when real users arrive

---

### Decision 8: `@react-pdf/renderer` for PDF Generation

**Decision:** Use `@react-pdf/renderer` to generate invoices as PDFs server-side in an API route.

**Reasoning:**
- React component-based API — natural fit for a Next.js project
- Generates real PDF binary — not a screenshot or HTML print
- Works in Node.js API routes (server-side) without a headless browser
- Free, no external service needed

**Trade-offs accepted:**
- PDF generation is synchronous and can be slow for complex layouts (~500ms–2s)
- No support for web fonts that require external loading at render time — use embedded fonts
- Plan: move to background job (Inngest) in Phase 3 if PDF generation becomes a bottleneck

---

## 🚨 Risk Register

---

### Risk 1: FBR GST Rate Change

**Likelihood:** Medium — happens with annual federal budget (June each year)
**Impact:** High — all invoices would show wrong GST rate

**Mitigation:**
- GST rate is stored per-business in MongoDB, not hardcoded
- User can update their default GST rate in Settings at any time
- Existing invoices are not retroactively changed — only new invoices use the updated rate
- Monitor FBR announcements around budget season

---

### Risk 2: MongoDB Atlas Connection Failures on Vercel

**Likelihood:** Low — Atlas is reliable, but serverless cold starts can cause connection timeouts
**Impact:** High — API routes return 500 errors, app becomes unusable

**Mitigation:**
- `lib/db.ts` uses a singleton pattern — reuses connection across warm invocations
- Add `serverSelectionTimeoutMS=5000` to MongoDB URI to fail fast rather than hanging
- Vercel function timeout is 10s by default — sufficient for Atlas queries
- If DNS issues occur (known ISP-level problem in Pakistan): add `dns.setServers(['8.8.8.8', '8.8.4.4'])` in `lib/db.ts` before connecting (this was a confirmed fix in the MovieVerse project)

```typescript
// lib/db.ts — add this before mongoose.connect() if DNS issues occur
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
```

---

### Risk 3: Firebase Private Key Misconfiguration

**Likelihood:** Medium — the `\n` characters in the private key are a common setup mistake
**Impact:** High — all auth verification fails, all protected routes return 401

**Mitigation:**
- ENV_VARIABLES.md documents the exact format required
- `lib/firebase-admin.ts` uses `.replace(/\\n/g, '\n')` when reading the key
- If auth breaks on Vercel after working locally: first check the private key format in Vercel env vars
- Test with a simple `GET /api/health` route that calls `admin.auth().listUsers(1)` to verify Admin SDK is working

---

### Risk 4: Invoice Number Race Condition

**Likelihood:** Low — unlikely at MVP scale with one business per user
**Impact:** Medium — duplicate invoice numbers for same business

**Mitigation:**
- Compound unique index on `{ businessId, invoiceNumber }` in MongoDB
- Duplicate will throw a MongoDB error (code 11000) — catch it in the API route and retry with the next number
- At MVP scale (single user per session) this is extremely unlikely to occur

```typescript
// In POST /api/invoices — wrap create in try/catch for duplicate key
try {
  const invoice = await Invoice.create({ ...data, invoiceNumber });
} catch (err: any) {
  if (err.code === 11000) {
    // Retry with next number
    invoiceNumber = await getNextInvoiceNumber(businessId);
    // retry create...
  }
}
```

---

### Risk 5: PDF Generation Timeout on Vercel

**Likelihood:** Low for simple invoices, Medium for invoices with many line items
**Impact:** Medium — user gets a timeout error instead of a PDF

**Mitigation:**
- Keep `InvoicePDFTemplate` lightweight — no external font loading, no complex graphics
- Vercel function timeout can be increased to 60s in `vercel.json` for the PDF route:

```json
{
  "functions": {
    "app/api/invoices/[id]/pdf/route.ts": {
      "maxDuration": 60
    }
  }
}
```
- If still timing out: switch to pre-generating and saving to Cloudinary on invoice creation

---

### Risk 6: Cloudinary Free Tier Storage Limit

**Likelihood:** Low for MVP — 25GB storage and 25GB bandwidth per month on free tier
**Impact:** Low — logos and PDFs simply fail to upload

**Mitigation:**
- At MVP scale (small number of users), Cloudinary free tier is more than sufficient
- Compress logos before upload: max 2MB enforced in the API route
- PDFs are generated on demand — only save to Cloudinary if user explicitly requests it

---

### Risk 7: API Shape Mismatch Between Frontend and Backend

**Likelihood:** Medium — if either developer changes a route without updating API_REFERENCE.md
**Impact:** High — frontend crashes or shows wrong data after merge

**Mitigation:**
- `API_REFERENCE.md` is the contract — documented rule that neither dev changes it alone
- `types/index.ts` is shared — TypeScript will catch shape mismatches at compile time
- `npx tsc --noEmit` is part of the Definition of Done checklist for every feature
- Daily sync catches any planned API changes before they become conflicts

---

### Risk 8: Merge Conflicts on Shared Files

**Likelihood:** Low — clear folder ownership is documented
**Impact:** Medium — wasted time resolving conflicts, risk of overwriting the other dev's work

**Mitigation:**
- Clear ownership documented in AI_MEMORY.md and GITHUB_SETUP.md
- Backend dev never touches `components/`, `app/(pages)/`, `styles/theme.ts`
- Frontend dev never touches `app/api/`, `models/`, `lib/db.ts`, `lib/firebase-admin.ts`
- `types/index.ts` and `lib/gst.ts` are shared — discuss before changing, small PRs only
- Feature branches prevent working on the same file simultaneously

---

### Risk 9: Dashboard Revenue Stats Mix PKR and USD Without Conversion

**Likelihood:** Medium — any business that bills both local and export clients hits this
**Impact:** Low for MVP — the number is misleading but not user-blocking; no incorrect
invoice or payment data results from it, only an incorrect summary stat

**Mitigation:**
- `GET /api/dashboard/stats` (see `BACKEND_PATTERNS.md`'s Dashboard Stats Aggregation
  Pattern) sums `netPayable` across all invoices regardless of currency, but
  `revenueCurrency` is hardcoded to `'PKR'` for MVP
- This is an accepted MVP limitation, not a bug to fix before launch — most freelancer
  users bill primarily in one currency
- Phase 2 fix options: store a PKR-equivalent field per invoice computed at creation
  time using a live exchange rate, or show currency-grouped totals separately
  (e.g. "PKR 350,000 + USD 2,000") instead of one blended number
- Do not attempt a live currency conversion fix mid-MVP — this was deliberately
  deferred during the backend documentation audit to avoid scope creep this close to
  the Day 14 deadline

---

## ✅ Decisions NOT to Re-Debate

These were considered and rejected:

| Option Rejected | Reason |
|---|---|
| Supabase (DB + Auth) | Paid tier needed beyond MVP scale; team prefers MongoDB experience |
| Separate Express backend | Unnecessary complexity for a monorepo; Next.js API routes are sufficient |
| Prisma ORM | SQL-only; team has Mongoose experience; MongoDB is the DB choice |
| Hardcoded mock data in API routes | Hides real bugs; real Atlas DB from Day 1 is the decision |
| Flat `components/` folder structure | Causes merge conflicts; atomic folder structure is the decision |
| Inline colors / hardcoded hex values | Prevents easy theming; `styles/theme.ts` is the decision |
| `console.log` skipping on some routes | All routes must log — consistency is required for debugging |

---

*Last updated: June 2026 | Decisions are final for MVP — revisit in Phase 2 retrospective*
