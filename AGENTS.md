# InvoicePK — Agent Guide

## Commands

```bash
npm run dev          # Next.js dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint (next core-web-vitals + typescript)
npm run test         # Jest --runInBand (requires MongoDB Atlas connection)
```

Seed test data (run once):
```bash
npx ts-node --project tsconfig.json scripts/seed.ts
```

No separate typecheck command — TypeScript errors surface during `npm run build`.

## Architecture

- **Next.js 16 App Router** with route groups: `(auth)/` for login, `(dashboard)/` for main app
- **Mongoose** models in `models/` — Business, Client, Invoice
- **Firebase Auth** — client SDK in `lib/firebase-client.ts`, Admin SDK in `lib/firebase-admin.ts`
- **API routes** in `app/api/` — all protected routes use `withAuth()` wrapper from `lib/withAuth.ts`
- **Shared GST logic** in `lib/gst.ts` — used by both frontend and backend; do not change without updating both sides
- **API client** in `lib/api-client.ts` — wraps fetch with auto token attachment; use this for all frontend API calls

## Critical Gotchas

### MongoDB Connection String
**Must use standard format** (`mongodb://`), NOT SRV (`mongodb+srv://`). SRV fails in Next.js 16 Turbopack workers because `dns.setServers()` doesn't carry over to isolated processes, and Pakistani ISPs block SRV DNS lookups. See `docs/MONGODB_CONNECTION_LESSONS.md` for full details.

### Firebase Admin vs Client Separation
- `lib/firebase-admin.ts` — server-side only (API routes, `withAuth.ts`). Never import in client components.
- `lib/firebase-client.ts` — browser-side only (login, register, auth context). Never import `firebase-admin` here.

### Ownership Checks
Every route fetching a resource by ID must call `checkOwnership(resource, businessId)` from `lib/ownership.ts`. Returns an error response if the resource doesn't belong to the user's business.

### Free Tier Limit
Hard cap of 5 invoices per month per business. Enforced server-side in `POST /api/invoices`.

## Testing

- Tests live in `__tests__/*.test.ts`
- Jest uses `ts-jest` preset with `node` test environment
- `jest.setup.ts` loads `.env.local`, overrides DNS, and swaps `MONGODB_URI` → `MONGODB_TEST_URI`
- Tests hit a real MongoDB Atlas instance (not mocked)
- `tsconfig.seed.json` is a separate tsconfig for `scripts/` and `models/` (CommonJS module format)

## Path Aliases

`@/*` maps to project root (e.g., `@/lib/db`, `@/models/Invoice`). Configured in both `tsconfig.json` and `jest.config.ts`.

## Conventions

- Zod schemas validate all API request bodies
- API responses follow `{ data: T }` (success) or `{ error: { code, message, status } }` (error)
- Invoice numbers are sequential per-business (`INV-001`, `INV-002`...) — generated server-side
- GST/WHT calculations always happen server-side — never trust client-submitted totals
- Firebase ID token passed as `Authorization: Bearer <token>` header on API calls
- Middleware (`middleware.ts`) checks `firebaseToken` cookie for page-level route protection

## Next.js 16 Note

This version has breaking changes from earlier Next.js. Read guides in `node_modules/next/dist/docs/` before writing Next.js-specific code. Heed deprecation notices.
