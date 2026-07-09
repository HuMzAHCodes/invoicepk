# 🔄 DATA_FETCHING.md — InvoicePK Data Fetching Strategy

> This document explains when to use a Server Component vs a Client Component, and
> exactly how data flows from the backend API into each page. Read this before
> building your first page — getting this wrong is the most common Next.js 14
> App Router mistake.

---

## The Core Rule

Next.js 14 App Router components are **Server Components by default**. They run on
the server, can fetch data directly, and send zero JavaScript to the browser for
that part of the page. A component only becomes a **Client Component** when you add
`'use client'` at the top — and you only do that when the component needs interactivity
(state, event handlers, browser APIs) or uses a hook like `useState` or `useEffect`.

**The decision test:** Does this component need to respond to a click, hold form state,
or update without a full page reload? If no — keep it a Server Component. If yes — make
it a Client Component.

---

## Two Different Data-Fetching Paths

InvoicePK uses both Server Components and `apiFetch()` (the client-side wrapper from
`FRONTEND_DEV.md`) — they are not interchangeable, and using the wrong one in the wrong
place is the most common bug source.

### Path 1 — Server Component Fetch (Read-Only Pages)

Used for: dashboard, invoice list, client list, invoice detail (view mode).

These pages load once with real data already baked into the HTML — no loading
spinner needed, no client-side fetch on first paint.

```tsx
// app/(dashboard)/invoices/page.tsx — a Server Component (no 'use client')
import { cookies } from 'next/headers';

async function getInvoices(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/invoices`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store', // always fresh — invoice data changes often
  });
  const json = await res.json();
  return json.data;
}

export default async function InvoicesPage() {
  const token = cookies().get('firebase-token')?.value ?? '';
  const { invoices, total } = await getInvoices(token);

  return (
    <div>
      <PageHeader title="Invoices" actionLabel="New Invoice" />
      <InvoiceTable invoices={invoices} />
    </div>
  );
}
```

> Note: this requires storing the Firebase token in a cookie (not just in-memory
> client state) so Server Components can read it. See "Token Storage" section below.

---

### Path 2 — Client-Side Fetch (Interactive Pages)

Used for: invoice creation form, client creation form, settings form, any page where
the user submits data or the page needs to update without a full reload.

```tsx
// components/InvoiceForm/index.tsx — a Client Component
'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function InvoiceForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: InvoiceFormData) {
    setIsSubmitting(true);
    try {
      const invoice = await apiFetch('/invoices', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      toast.success(`Invoice ${invoice.invoiceNumber} created`);
      router.push(`/invoices/${invoice.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); /* gather data, call handleSubmit */ }}>
      {/* form fields */}
    </form>
  );
}
```

---

## Decision Table — Which Path for Which Page

| Page | Component Type | Data Path | Why |
|---|---|---|---|
| `/dashboard` | Server Component | Path 1 (server fetch) | Read-only stats, no interactivity needed on load |
| `/invoices` (list) | Server Component | Path 1 (server fetch) | Read-only list, filters can be client-side query params |
| `/invoices/new` | Client Component | Path 2 (apiFetch) | Form with state, live GST calc, submit action |
| `/invoices/[id]` (view) | Server Component | Path 1 (server fetch) | Read-only detail view |
| `/invoices/[id]` (edit mode toggle) | Mixed — Server shell, Client form inside | Path 1 for initial load, Path 2 for the edit form | Page loads fast with real data; editing needs interactivity |
| `/clients` (list) | Server Component | Path 1 (server fetch) | Read-only list |
| `/clients` (create form) | Client Component | Path 2 (apiFetch) | Form submission |
| `/settings` | Client Component | Path 2 (apiFetch) for save, Server Component wrapper for initial load | Form needs state; initial values can load server-side |
| `/login`, `/register` | Client Component | Firebase SDK directly (not `apiFetch`) | Auth happens client-side via Firebase, not through your API |

---

## Mixed Pattern — Server Shell + Client Form

Most "edit" pages use both: the page itself is a Server Component that fetches the
initial data, then passes it as props into a Client Component that handles the
actual editing.

```tsx
// app/(dashboard)/invoices/[id]/page.tsx — Server Component
async function getInvoice(id: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/invoices/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const json = await res.json();
  return json.data;
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const token = cookies().get('firebase-token')?.value ?? '';
  const invoice = await getInvoice(params.id, token);

  return <InvoiceDetailView invoice={invoice} />;  // Client Component, receives real data as props
}
```

```tsx
// components/InvoiceDetailView/index.tsx — Client Component
'use client';

export function InvoiceDetailView({ invoice }: { invoice: Invoice }) {
  // Has useState for things like "is the edit form open"
  // Has onClick handlers for status transitions, delete, download PDF
  // Receives invoice as a prop — does NOT fetch it again on mount
}
```

**The rule:** fetch once on the server, pass down as props, don't re-fetch the same
data again client-side on mount. If the Client Component needs fresh data after an
action (e.g. after changing status), use `router.refresh()` to re-run the Server
Component fetch rather than managing duplicate client-side state.

```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();

async function handleMarkAsSent() {
  await apiFetch(`/invoices/${invoice.id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'sent' }),
  });
  router.refresh(); // re-runs the Server Component, gets fresh data, no full page reload
}
```

---

## Token Storage — Cookie vs Memory

This is the part that trips people up: Server Components run on the server and can't
read `localStorage` or in-memory React state. They can only read **cookies**. So the
Firebase token needs to live in a cookie, not just wherever Firebase's client SDK
keeps it by default.

```typescript
// lib/firebase-client.ts — after successful login
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase-client';

export async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const token = await userCredential.user.getIdToken();

  // Set the token in a cookie so Server Components can read it
  document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict`;

  return userCredential.user;
}
```

Firebase ID tokens expire after 1 hour. Set up a refresh on the client side so the
cookie stays current during a session:

```typescript
// In a top-level Client Component (e.g. inside the (dashboard) layout)
'use client';
import { useEffect } from 'react';
import { auth } from '@/lib/firebase-client';

export function TokenRefresher() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = await auth.currentUser?.getIdToken(true); // force refresh
      if (token) {
        document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict`;
      }
    }, 50 * 60 * 1000); // refresh every 50 minutes

    return () => clearInterval(interval);
  }, []);

  return null;
}
```

> This `TokenRefresher` component is a new addition — add it to `COMPONENT_LIBRARY.md`
> once built, and mount it once inside `app/(dashboard)/layout.tsx`.

---

## Why `cache: 'no-store'` Everywhere

Next.js Server Component `fetch()` calls are cached by default. For InvoicePK, almost
every fetch should opt out of this with `cache: 'no-store'` — invoice and client data
changes frequently, and showing stale cached data (e.g. an old invoice status) would
be a real bug, not just a minor staleness issue.

The only exception is the landing page, which has no user-specific data and can use
default caching or static generation.

---

## Loading States

### Server Components — Use `loading.tsx`

Next.js automatically shows this while a Server Component's data fetch is in flight.
No manual loading state needed.

```tsx
// app/(dashboard)/invoices/loading.tsx
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Loading() {
  return (
    <div className="flex justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>
  );
}
```

Create one `loading.tsx` per route folder that does a server fetch (`invoices/`,
`clients/`, `dashboard/`, `invoices/[id]/`).

### Client Components — Manual `isSubmitting` State

For forms and actions, manage loading state explicitly as shown in the `InvoiceForm`
example above — disable the submit button and show a spinner inside it while
`isSubmitting` is true.

---

## Error Handling

### Server Components — Use `error.tsx`

```tsx
// app/(dashboard)/invoices/error.tsx
'use client'; // error.tsx must be a Client Component

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="text-center py-20">
      <p className="text-danger mb-4">Something went wrong loading invoices.</p>
      <button onClick={reset} className="bg-primary text-white px-4 py-2 rounded-md">
        Try again
      </button>
    </div>
  );
}
```

### Client Components — try/catch + Toast

As shown in the `InvoiceForm` example — wrap `apiFetch` calls in try/catch, show a
toast with the error message from the API response (`err.message`, which `apiFetch`
already extracts from the `{ error: { message } }` shape).

---

## Quick Reference

| Need | Use |
|---|---|
| Display a list or detail view on page load | Server Component + Path 1 fetch |
| Submit a form | Client Component + Path 2 (`apiFetch`) |
| Refresh data after a client action | `router.refresh()` |
| Show loading while a Server Component fetches | `loading.tsx` in that route folder |
| Show loading while a Client Component submits | `isSubmitting` state + disabled button |
| Handle a Server Component fetch failure | `error.tsx` in that route folder |
| Handle a Client Component fetch failure | try/catch + toast |
| Read the auth token in a Server Component | Cookie (`cookies().get('firebase-token')`) |
| Read the auth token in a Client Component | `auth.currentUser?.getIdToken()` from Firebase SDK |

---

*Last updated: June 2026 | Server Components for reading, Client Components for doing*
