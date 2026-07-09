# 🔧 BACKEND_PATTERNS.md — InvoicePK Backend Code Patterns

> This document defines the standard shape every API route follows — error handling,
> validation, response structure, and file organization. Read this before writing your
> first route. The goal is that any route, written on any day, looks like it was written
> by the same person in the same sitting.

---

## Why This Document Exists

`API_REFERENCE.md` defines what each route returns. `DATABASE_SCHEMA.md` defines the
data shape. This document defines the **internal structure** every route follows —
the boring, repetitive parts (try/catch, validation, auth check, logging) that should
be identical across all 13 routes so a bug fix or pattern change only has to be learned
once, not rediscovered route by route.

---

## Standard Route File Structure

Every route file follows this exact order:

```typescript
// app/api/<resource>/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { z } from 'zod';
import Model from '@/models/Model';

// 1. Zod schema(s) — defined at the top, used for validation
const createSchema = z.object({
  // fields...
});

// 2. Route handler(s) — GET, POST, PUT, DELETE, PATCH as needed
export async function POST(req: NextRequest) {
  console.log('[POST /api/<resource>] Request received');

  return withAuth(req, async (req, uid) => {
    try {
      // 3. Connect to DB
      await connectDB();

      // 4. Parse and validate input
      const body = await req.json();
      const parsed = createSchema.safeParse(body);

      if (!parsed.success) {
        console.log(`[POST /api/<resource>] Validation failed: ${parsed.error.message}`);
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message, status: 422 } },
          { status: 422 }
        );
      }

      // 5. Resolve businessId from the authenticated user — never from request body
      const business = await getBusinessForUser(uid);
      if (!business) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Business profile not found.', status: 404 } },
          { status: 404 }
        );
      }

      // 6. Core logic
      const result = await Model.create({ ...parsed.data, businessId: business._id });

      // 7. Success response
      console.log(`[POST /api/<resource>] Success | id: ${result._id} | status: 201`);
      return NextResponse.json({ data: serialize(result) }, { status: 201 });

    } catch (err) {
      // 8. Error response — always the last block
      console.error('[POST /api/<resource>] ERROR:', err);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Something went wrong.', status: 500 } },
        { status: 500 }
      );
    }
  });
}
```

This 8-step shape is the same for every route. Copy this file as a starting template
for every new route you write.

---

## Step-by-Step Explanation

### 1. Zod Schema at the Top

Every route that accepts a body defines its schema before the handler function, not
inline inside it. This makes the expected shape obvious to anyone scanning the file,
and lets the same schema be reused by both POST and PUT if the shapes overlap.

```typescript
const createInvoiceSchema = z.object({
  clientId:      z.string().optional(),
  issueDate:     z.string(),                    // ISO date string
  dueDate:       z.string().optional(),
  currency:      z.enum(['PKR', 'USD']).default('PKR'),
  gstType:       z.enum(['standard', 'zero_rated', 'exempt']),
  gstRate:       z.number().min(0).max(100).default(17),
  whtApplicable: z.boolean().default(false),
  whtRate:       z.number().min(0).max(100).default(0),
  notes:         z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity:    z.number().positive(),
    unitPrice:   z.number().nonnegative(),
    sortOrder:   z.number().default(0),
  })).min(1, 'At least one line item is required'),
});

// For PUT routes — same shape but every field optional (partial update)
const updateInvoiceSchema = createInvoiceSchema.partial();
```

### 2. Always `withAuth` Except Two Routes

Every route except `POST /api/auth/register` and `POST /api/auth/login` is wrapped in
`withAuth()`. This is non-negotiable — see `BACKEND_DEV.md`/`AI_MEMORY.md` for the
implementation of `withAuth`.

### 3. Always `connectDB()` First Inside the Handler

Call this before any Mongoose query, every single time, even though the singleton
pattern makes repeated calls cheap. Consistency here means nobody has to remember
"did I already connect in this route?"

### 4. Validate With Zod Before Touching the Database

Never query the database with unvalidated input. `safeParse` (not `parse`) is used
so a validation failure returns a clean `422` instead of throwing an uncaught error.

### 5. `businessId` Always From the Token, Never From the Request

This is the single most important security rule in the codebase. See the helper
function below — every route uses it instead of repeating the lookup logic.

```typescript
// lib/get-business.ts — shared helper, avoids repeating this lookup in every route
import Business from '@/models/Business';

export async function getBusinessForUser(uid: string) {
  return Business.findOne({ userId: uid });
}
```

### 6. Core Logic

The actual Mongoose query or calculation. Keep this part as short as possible — if
a route's core logic is getting long (e.g. invoice creation with GST calculation),
pull it into a separate function in `lib/` rather than inlining everything in the
route handler.

### 7. Success Response — Always `{ data: ... }`

Matches the shape defined in `API_REFERENCE.md`. Never return a bare object or array —
always wrap it in `{ data: ... }`.

### 8. Error Handling — Always Last, Always Logs

The `catch` block is always the last thing in the handler. It always logs the full
error with `console.error` (not `console.log` — errors get their own log level) and
always returns the standard error shape.

---

## Standard Error Responses — Copy-Paste Snippets

Keep these consistent across every route. Don't write a new error message format —
use these exact patterns.

```typescript
// 401 — missing or invalid token (handled inside withAuth, rarely written manually)
return NextResponse.json(
  { error: { code: 'UNAUTHORIZED', message: 'Authentication required.', status: 401 } },
  { status: 401 }
);

// 403 — resource belongs to another business
return NextResponse.json(
  { error: { code: 'FORBIDDEN', message: 'You do not have access to this resource.', status: 403 } },
  { status: 403 }
);

// 404 — resource not found
return NextResponse.json(
  { error: { code: 'NOT_FOUND', message: 'Invoice not found.', status: 404 } },
  { status: 404 }
);

// 422 — validation error (use parsed.error.errors[0].message for the specific reason)
return NextResponse.json(
  { error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message, status: 422 } },
  { status: 422 }
);

// 409 — conflict (e.g. editing a locked invoice)
return NextResponse.json(
  { error: { code: 'INVOICE_LOCKED', message: 'Cannot edit an invoice that has been sent or paid.', status: 409 } },
  { status: 409 }
);

// 429 — rate/tier limit reached
return NextResponse.json(
  { error: { code: 'LIMIT_EXCEEDED', message: 'Free tier limit of 5 invoices per month reached.', status: 429 } },
  { status: 429 }
);

// 500 — unexpected error (always in the catch block)
return NextResponse.json(
  { error: { code: 'SERVER_ERROR', message: 'Something went wrong.', status: 500 } },
  { status: 500 }
);
```

---

## Ownership Check Pattern — Used Constantly

Almost every route that fetches a single resource by ID needs to check that resource
belongs to the authenticated user's business. This pattern repeats across `clients/:id`,
`invoices/:id`, and others — write it once as a helper.

```typescript
// lib/ownership.ts
import { NextResponse } from 'next/server';

export function checkOwnership(resource: any, businessId: string) {
  if (!resource) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Resource not found.', status: 404 } },
      { status: 404 }
    );
  }
  if (resource.businessId.toString() !== businessId.toString()) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'You do not have access to this resource.', status: 403 } },
      { status: 403 }
    );
  }
  return null; // null means ownership check passed
}
```

```typescript
// Usage in a route
const invoice = await Invoice.findById(params.id);
const ownershipError = checkOwnership(invoice, business._id);
if (ownershipError) return ownershipError;

// proceed knowing invoice exists and belongs to this business
```

---

## Serialization — Mongoose Document to API Response

MongoDB documents have `_id` (ObjectId), but API responses use `id` (string) per
`API_REFERENCE.md`. Never return a raw Mongoose document — always serialize it.

```typescript
// lib/serialize.ts
export function serializeInvoice(doc: any) {
  return {
    id:            doc._id.toString(),
    invoiceNumber: doc.invoiceNumber,
    status:        doc.status,
    issueDate:     doc.issueDate,
    dueDate:       doc.dueDate,
    currency:      doc.currency,
    gstType:       doc.gstType,
    gstRate:       doc.gstRate,
    subtotal:      doc.subtotal,
    gstAmount:     doc.gstAmount,
    total:         doc.total,
    whtApplicable: doc.whtApplicable,
    whtRate:       doc.whtRate,
    whtAmount:     doc.whtAmount,
    netPayable:    doc.netPayable,
    notes:         doc.notes,
    pdfUrl:        doc.pdfUrl,
    items: doc.items.map((item: any) => ({
      description: item.description,
      quantity:    item.quantity,
      unitPrice:   item.unitPrice,
      amount:      item.amount,
      sortOrder:   item.sortOrder,
    })),
  };
}

export function serializeClient(doc: any) {
  return {
    id:          doc._id.toString(),
    name:        doc.name,
    email:       doc.email,
    phone:       doc.phone,
    address:     doc.address,
    ntn:         doc.ntn,
    isCorporate: doc.isCorporate,
  };
}

export function serializeBusiness(doc: any) {
  return {
    id:             doc._id.toString(),
    name:           doc.name,
    ntn:            doc.ntn,
    strn:           doc.strn,
    address:        doc.address,
    logoUrl:        doc.logoUrl,
    defaultGstRate: doc.defaultGstRate,
    currency:       doc.currency,
    plan:           doc.plan,
  };
}
```

Write one serializer per model and reuse it across every route that returns that
model — list routes, detail routes, create routes. This guarantees the shape is
identical everywhere `Invoice`, `Client`, or `Business` is returned, which is exactly
what `API_REFERENCE.md` promises the frontend.

---

## Status Transition Validation Pattern

Used specifically in `PATCH /api/invoices/:id/status` — but the pattern of validating
a state machine transition is useful to document once.

```typescript
// lib/invoice-status.ts
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent'],
  sent:  ['paid'],
  paid:  [], // no transitions out of paid
};

export function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
```

```typescript
// Usage in PATCH /api/invoices/:id/status
if (!isValidTransition(invoice.status, body.status)) {
  console.log(`[PATCH /api/invoices/:id/status] Invalid transition: ${invoice.status} → ${body.status}`);
  return NextResponse.json(
    { error: { code: 'INVOICE_LOCKED', message: `Cannot transition from ${invoice.status} to ${body.status}.`, status: 409 } },
    { status: 409 }
  );
}
```

---

## File Organization Inside `lib/` (Backend Helpers)

```
lib/
├── db.ts                  Connection singleton
├── firebase-admin.ts      Firebase Admin SDK init
├── withAuth.ts            Auth middleware wrapper
├── cloudinary.ts          Cloudinary config
├── invoice-number.ts      Sequential invoice number generator
├── get-business.ts        getBusinessForUser() helper
├── ownership.ts           checkOwnership() helper
├── serialize.ts           serializeInvoice(), serializeClient(), serializeBusiness()
├── invoice-status.ts      isValidTransition() state machine
├── check-invoice-limit.ts checkInvoiceLimit() free tier enforcement
├── dashboard-stats.ts     getDashboardStats() aggregation pipeline
└── gst.ts                 SHARED — calculateInvoice(), validateGSTRate()
```

Each helper file does exactly one job. If a route's logic needs something that isn't
a one-off, it probably belongs in one of these files rather than being copy-pasted
across routes.

---

## Pagination Pattern — Used in List Routes

`GET /api/clients` and `GET /api/invoices` both paginate. Use this exact pattern for
both so query param handling is identical.

```typescript
const url = new URL(req.url);
const page  = parseInt(url.searchParams.get('page') ?? '1', 10);
const limit = parseInt(url.searchParams.get('limit') ?? '20', 10);
const skip  = (page - 1) * limit;

const [items, total] = await Promise.all([
  Model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
  Model.countDocuments(filter),
]);

return NextResponse.json({
  data: {
    [resourceKey]: items.map(serializeFn),
    total,
    page,
    limit,
  },
});
```

---

## Free Tier Enforcement Pattern — Used in `POST /api/invoices`

This was a gap in earlier docs: `API_REFERENCE.md` and `LAUNCH_STRATEGY.md` define the
`429 LIMIT_EXCEEDED` error and the 5-invoices/month Free tier limit, but the actual
counting logic lives here. The `Business` model has a `plan: 'free' | 'pro'` field
(see `DATABASE_SCHEMA.md`) — `pro` businesses skip this check entirely.

```typescript
// lib/check-invoice-limit.ts
import Invoice from '@/models/Invoice';

const FREE_TIER_MONTHLY_LIMIT = 5;

export async function checkInvoiceLimit(businessId: string, plan: 'free' | 'pro'): Promise<boolean> {
  if (plan === 'pro') {
    return true; // Pro has no limit — always allowed
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const countThisMonth = await Invoice.countDocuments({
    businessId,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  console.log(`[check-invoice-limit] businessId: ${businessId} | count this month: ${countThisMonth}/${FREE_TIER_MONTHLY_LIMIT}`);

  return countThisMonth < FREE_TIER_MONTHLY_LIMIT;
}
```

```typescript
// Usage in POST /api/invoices — runs BEFORE creating the invoice
const canCreate = await checkInvoiceLimit(business._id.toString(), business.plan);

if (!canCreate) {
  console.log(`[POST /api/invoices] Free tier limit reached for businessId: ${business._id}`);
  return NextResponse.json(
    { error: { code: 'LIMIT_EXCEEDED', message: 'Free tier limit of 5 invoices per month reached.', status: 429 } },
    { status: 429 }
  );
}

// proceed with invoice creation only if the check passed
```

> Note: counting is based on `createdAt` (when the invoice was created), not
> `issueDate` (which the user can backdate). This prevents a user from bypassing the
> limit by setting `issueDate` to a previous month while still creating the document
> right now.

> Upgrading `plan` from `'free'` to `'pro'` is a manual database update for MVP — see
> `LAUNCH_STRATEGY.md`'s Phase 2 roadmap, payment integration is not part of MVP scope.
> For now, set a test business's `plan` to `'pro'` directly in MongoDB Atlas to test
> the unlimited path.

---

## Dashboard Stats Aggregation Pattern — Used in `GET /api/dashboard/stats`

Another gap closed here: `API_REFERENCE.md` defines the exact response shape and
`DEVELOPMENT_PLAN.md` says to use "a MongoDB aggregation pipeline, not multiple
separate queries" — but no actual pipeline existed anywhere until now. Running 4-5
separate `find()`/`countDocuments()` calls for this route would work but is slower
and harder to keep consistent than one aggregation.

```typescript
// lib/dashboard-stats.ts
import Invoice from '@/models/Invoice';
import mongoose from 'mongoose';

export async function getDashboardStats(businessId: string) {
  const businessObjectId = new mongoose.Types.ObjectId(businessId);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [statusCounts, revenueAndOutstanding] = await Promise.all([
    // Pipeline 1: count invoices grouped by status
    Invoice.aggregate([
      { $match: { businessId: businessObjectId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Pipeline 2: revenue this month (paid invoices only) + outstanding (sent, not paid)
    Invoice.aggregate([
      { $match: { businessId: businessObjectId } },
      {
        $facet: {
          revenueThisMonth: [
            { $match: { status: 'paid', updatedAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$netPayable' } } },
          ],
          outstanding: [
            { $match: { status: 'sent' } },
            { $group: { _id: null, total: { $sum: '$netPayable' } } },
          ],
        },
      },
    ]),
  ]);

  // Reshape aggregation output into the API_REFERENCE.md response shape
  const byStatus = { draft: 0, sent: 0, paid: 0 };
  let totalInvoices = 0;
  for (const row of statusCounts) {
    byStatus[row._id as 'draft' | 'sent' | 'paid'] = row.count;
    totalInvoices += row.count;
  }

  const revenueThisMonth = revenueAndOutstanding[0]?.revenueThisMonth[0]?.total ?? 0;
  const outstandingAmount = revenueAndOutstanding[0]?.outstanding[0]?.total ?? 0;

  console.log(`[dashboard-stats] businessId: ${businessId} | total: ${totalInvoices} | revenue: ${revenueThisMonth}`);

  return {
    totalInvoices,
    byStatus,
    revenueThisMonth,
    revenueCurrency: 'PKR', // MVP assumption — see note below
    outstandingAmount,
  };
}
```

```typescript
// Usage in GET /api/dashboard/stats
const stats = await getDashboardStats(business._id.toString());
return NextResponse.json({ data: stats }, { status: 200 });
```

> **MVP limitation worth knowing:** `revenueThisMonth` sums `netPayable` across all
> invoices regardless of currency (PKR and USD invoices both contribute to one
> number). This is acceptable for MVP since `revenueCurrency` is hardcoded to `'PKR'`
> per `API_REFERENCE.md`'s example response, but it is not technically correct if a
> business has both PKR and USD invoices — a USD 2,000 invoice would be added as if
> it were PKR 2,000. This is not a blocking issue for MVP (most businesses bill
> primarily in one currency), but flag it for a Phase 2 fix — proper multi-currency
> dashboard stats need either a stored PKR-equivalent field per invoice or
> currency-grouped totals shown separately.

---

## What NOT to Do

| Anti-pattern | Why it's wrong | Do instead |
|---|---|---|
| `Model.find({ businessId: req.body.businessId })` | Trusts client input for data isolation | Always derive `businessId` from `getBusinessForUser(uid)` |
| Returning a raw Mongoose document | Leaks `_id`, `__v`, internal fields | Always run it through a `serialize*()` function |
| `try { ... } catch (err) { throw err }` | Crashes the route, no clean error response | Always return the standard `SERVER_ERROR` shape |
| Inline validation with manual `if` checks | Inconsistent error messages across routes | Always use a Zod schema with `safeParse` |
| Copy-pasting the ownership check logic | Drifts out of sync over time, bugs creep in | Always use the shared `checkOwnership()` helper |
| Skipping `console.log` on a "simple" route | Breaks the debugging trail for the frontend dev | Every route logs request + response, no exceptions |

---

## Pre-Route Checklist (Run Through Before Writing Any New Route)

- [ ] Zod schema defined for the request body, if any
- [ ] Wrapped in `withAuth()` unless it's register/login
- [ ] `connectDB()` called before any query
- [ ] `businessId` resolved via `getBusinessForUser(uid)`, never from `req.body`
- [ ] Ownership checked via `checkOwnership()` if fetching a single resource by ID
- [ ] Response uses the matching `serialize*()` function
- [ ] Success response wrapped in `{ data: ... }`
- [ ] Error response wrapped in `{ error: { code, message, status } }`
- [ ] `console.log` at request start and response end
- [ ] `console.error` in the catch block
- [ ] Matches the exact shape documented in `API_REFERENCE.md`

---

*Last updated: June 2026 | Every route should look like it was written by the same person*
