# 🏛️ ARCHITECTURE.md — InvoicePK System Architecture

---

## Overview

InvoicePK is a **full-stack SaaS application** built on Next.js 14 App Router. It follows a serverless-first, monorepo architecture — frontend and backend live in the same codebase. The backend is the `app/api/` folder; the frontend is everything else.

**This is not a separate frontend + backend server setup. It is one Next.js project.**

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│               Next.js 14 (App Router + RSC)                  │
│         Tailwind CSS   │   React Client Components           │
│         styles/theme.ts (all colors live here)               │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼───────────────────────────────┐
│                         VERCEL EDGE                          │
│            Next.js API Routes (app/api/)                     │
│           Middleware — Firebase token verification           │
└────────┬──────────────────────────┬──────────────────────────┘
         │                          │                    │
┌────────▼──────────┐   ┌───────────▼──────────┐  ┌─────▼──────────────┐
│   FIREBASE AUTH   │   │    MONGODB ATLAS      │  │    CLOUDINARY      │
│  Token issuance   │   │  Mongoose ODM         │  │  Logo uploads      │
│  (client-side)    │   │  Free tier 512MB      │  │  PDF storage       │
│  Token verify     │   │  Collections:         │  │  Free tier         │
│  (server-side)    │   │  businesses           │  └────────────────────┘
└───────────────────┘   │  clients              │
                        │  invoices             │
                        └───────────────────────┘
```

---

## Layer Breakdown

### 1. Frontend — Next.js 14 App Router

- **Server Components (RSC)** — used for data-fetching pages (dashboard, invoice list)
- **Client Components** — used for interactive forms (invoice form, client form)
- **Route groups**: `(auth)` for login/register, rest protected via middleware
- **Middleware** (`middleware.ts`): Validates Firebase token on every request to protected routes
- **Theme**: All colors and design tokens come from `styles/theme.ts` — one file to change the entire app's look

**Component Structure — Atomic Design:**
Every component lives in its own folder. Sub-components of a parent component get their own files inside that folder. No component should depend on another component's internals.

```
components/
├── Navbar/
│   ├── index.tsx          ← assembles the navbar
│   ├── Logo/
│   │   └── index.tsx
│   ├── SearchBar/
│   │   └── index.tsx
│   └── DropdownMenu/
│       └── index.tsx
├── InvoiceForm/
│   ├── index.tsx
│   ├── LineItems/
│   │   └── index.tsx
│   ├── GSTSection/
│   │   └── index.tsx
│   └── TotalsSidebar/
│       └── index.tsx
└── InvoicePDF/
    └── InvoicePDFTemplate.tsx
```

**Key Pages:**

| Route | Type | Description |
|---|---|---|
| `/` | Static | Landing page |
| `/login`, `/register` | Client | Auth forms (Firebase client SDK) |
| `/dashboard` | Server | Stats + recent invoices |
| `/invoices` | Server | Invoice list with filters |
| `/invoices/new` | Client | Invoice creation form |
| `/invoices/[id]` | Server | Invoice detail + PDF preview |
| `/clients` | Server | Client list |
| `/settings` | Client | Business profile + GST settings |

---

### 2. API Layer — Next.js API Routes

Located in `app/api/`. Owned entirely by the **backend developer**.

Every route:
- Validates the Firebase token via `withAuth()` middleware
- Validates request body with a **Zod schema**
- Queries MongoDB via **Mongoose**
- Returns a response matching the shape defined in `API_REFERENCE.md`
- Logs request arrival and response via **console.log**

```typescript
// Pattern every route follows
export async function POST(req: NextRequest) {
  console.log('[POST /api/invoices] Request received');

  return withAuth(req, async (req, uid) => {
    // 1. Parse + validate body with Zod
    // 2. Query MongoDB via Mongoose
    // 3. Return response matching API_REFERENCE.md shape
    console.log(`[POST /api/invoices] Success | status: 201`);
    return NextResponse.json(result, { status: 201 });
  });
}
```

**API Routes Overview:**

| Route | Methods | Description |
|---|---|---|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login existing user |
| `/api/business` | GET, PUT | Get/update business profile |
| `/api/business/logo` | POST | Upload logo to Cloudinary |
| `/api/clients` | GET, POST | List/create clients |
| `/api/clients/[id]` | PUT, DELETE | Update/delete client |
| `/api/invoices` | GET, POST | List/create invoices |
| `/api/invoices/[id]` | GET, PUT, DELETE | Single invoice CRUD |
| `/api/invoices/[id]/status` | PATCH | Status transition |
| `/api/invoices/[id]/pdf` | GET | Stream PDF to browser |
| `/api/invoices/[id]/pdf/save` | POST | Save PDF to Cloudinary |
| `/api/dashboard/stats` | GET | Dashboard summary stats |

---

### 3. Database Layer — MongoDB Atlas + Mongoose

**Database:** MongoDB Atlas free tier (512MB)
**ODM:** Mongoose (type-safe models, schema validation, middleware hooks)

Three main collections:

```
businesses    ← one per user (userId = Firebase UID)
    │
    ├──→ clients      (businessId reference)
    │
    └──→ invoices     (businessId reference)
              │
              └──→ items   (embedded array inside invoice document)
```

MongoDB connection is managed in `lib/db.ts` as a singleton to avoid multiple connections in serverless environments:

```typescript
// lib/db.ts
import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI!);
  isConnected = true;
  console.log('[DB] Connected to MongoDB Atlas');
}
```

Call `await connectDB()` at the top of every API route before any query.

---

### 4. Auth Layer — Firebase Auth

**How it works:**

```
CLIENT                          SERVER
  │                               │
  │── Firebase signInWithEmail ──→│ (Firebase handles this)
  │←── Firebase ID Token ─────────│
  │                               │
  │── API Request                 │
  │   Authorization: Bearer <token>
  │                               │
  │                        withAuth() middleware
  │                        admin.auth().verifyIdToken(token)
  │                               │
  │←── API Response ──────────────│
```

- **Client side**: Firebase JS SDK (`firebase/auth`) handles login/register and provides the ID token
- **Server side**: Firebase Admin SDK (`firebase-admin`) verifies the token on every protected route
- Frontend developer owns the client-side Firebase setup
- Backend developer owns `lib/firebase-admin.ts` and `lib/withAuth.ts`

---

### 5. PDF Generation — `@react-pdf/renderer`

PDF generation runs **server-side** in an API route. The frontend developer owns the visual template (`InvoicePDFTemplate.tsx`). The backend developer owns the API route that triggers it.

```
Client clicks "Download PDF"
       ↓
GET /api/invoices/:id/pdf
       ↓
connectDB() → fetch invoice from MongoDB
       ↓
Render <InvoicePDFTemplate /> server-side
       ↓
Stream PDF binary to client as application/pdf
  (or save to Cloudinary via /pdf/save route)
```

---

### 6. File Storage — Cloudinary

Two upload types:
- **Logos** — uploaded via `POST /api/business/logo`, stored in Cloudinary `invoicepk/logos/` folder
- **PDFs** — generated on demand, optionally saved via `POST /api/invoices/:id/pdf/save` to `invoicepk/pdfs/`

Cloudinary config lives in `lib/cloudinary.ts`:

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

---

## Data Flow: Creating an Invoice

```
1. User fills InvoiceForm (Client Component)
   ↓
2. Real-time GST calc in lib/gst.ts — updates totals as user types
   ↓
3. User clicks "Save as Draft"
   ↓
4. Frontend sends POST /api/invoices with Authorization header
   ↓
5. withAuth() verifies Firebase token → extracts uid
   ↓
6. Zod validates request body
   ↓
7. Backend recalculates GST server-side (never trusts client totals)
   ↓
8. Mongoose creates invoice document in MongoDB
   ↓
9. Response: invoice object with generated INV-XXX number
   ↓
10. User clicks "Download PDF" → GET /api/invoices/:id/pdf
    ↓
11. Server fetches invoice from MongoDB, renders PDF, streams to browser
```

---

## Security Architecture

| Concern | Solution |
|---|---|
| Auth | Firebase ID tokens verified server-side on every request |
| Data isolation | Every Mongoose query filters by `businessId` derived from Firebase UID |
| File access | Cloudinary URLs are public for logos; PDFs use signed URLs |
| Rate limiting | Vercel Edge middleware (free tier invoice limits enforced in API layer) |
| Input validation | Zod schemas on all API route inputs |
| Secrets | All keys in `.env.local` — never committed to Git |

---

## Deployment Architecture

```
GitHub (main branch)
       ↓ push
Vercel CI/CD Pipeline
       ↓
Build: next build
       ↓
Deploy: Vercel Edge Network (global CDN)
       ↓
Runtime connections:
  - MongoDB Atlas (DB) via MONGODB_URI
  - Firebase Admin (Auth) via FIREBASE_* env vars
  - Cloudinary (Storage) via CLOUDINARY_* env vars
```

---

## Scalability Considerations (Post-MVP)

- **Stateless API routes**: Each request is independent — scales horizontally on Vercel
- **MongoDB connection pooling**: Mongoose singleton in `lib/db.ts` handles this
- **PDF generation**: Move to background job (Inngest/QStash) in Phase 3 for large volumes
- **CDN**: Static assets and landing page served from Vercel Edge (global)
- **Logging**: Upgrade from `console.log` to Winston/Pino in Phase 2

---

*Last updated: June 2026 | Stack: MongoDB Atlas + Firebase Auth + Cloudinary + Next.js 14*
