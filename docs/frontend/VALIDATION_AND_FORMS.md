# ✅ VALIDATION_AND_FORMS.md — InvoicePK Form Validation Strategy

> This document defines client-side validation rules and how every form handles
> loading, error, and success states. The validation schemas here mirror the backend's
> Zod schemas exactly (see `BACKEND_PATTERNS.md`) — the goal is that a user sees a
> validation error instantly, in the same wording, without ever needing to round-trip
> to the API to find out a field is wrong.

---

## Why Client-Side Validation Mirrors Backend Validation

The backend is the final authority — it always re-validates with its own Zod schema
and never trusts the frontend (see `BACKEND_PATTERNS.md`, `RISKS_AND_DECISIONS.md`).
But making the user wait for a network round-trip just to learn a required field is
empty is a bad experience. So the frontend runs the **same rules** locally first,
shows the error immediately, and only calls the API once the form is locally valid.

**The rule:** if the backend's Zod schema changes, the matching frontend schema must
change too. These two schemas should never drift apart. Whoever changes one notifies
the other developer immediately (same rule as `types/index.ts` in `GITHUB_SETUP.md`).

---

## Install

```bash
npm install zod
npm install react-hook-form @hookform/resolvers
```

`react-hook-form` handles form state and re-renders efficiently; `@hookform/resolvers`
lets it use a Zod schema directly for validation — no manual `if` checks needed.

---

## Shared Validation Schemas — `lib/validation.ts`

This file lives in the frontend codebase and mirrors the backend's schemas field for
field. Keep the two side by side when reviewing changes.

```typescript
// lib/validation.ts
import { z } from 'zod';

// ── Invoice — mirrors backend's createInvoiceSchema in BACKEND_PATTERNS.md ──
export const invoiceFormSchema = z.object({
  clientId:      z.string().optional(),
  issueDate:     z.string().min(1, 'Issue date is required'),
  dueDate:       z.string().optional(),
  currency:      z.enum(['PKR', 'USD']),
  gstType:       z.enum(['standard', 'zero_rated', 'exempt'], {
    errorMap: () => ({ message: 'Select a GST type' }),
  }),
  gstRate:       z.number().min(0, 'GST rate cannot be negative').max(100, 'GST rate cannot exceed 100%'),
  whtApplicable: z.boolean(),
  whtRate:       z.number().min(0).max(100),
  notes:         z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity:    z.number().positive('Quantity must be greater than 0'),
    unitPrice:   z.number().nonnegative('Unit price cannot be negative'),
    sortOrder:   z.number(),
  })).min(1, 'Add at least one line item'),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

// ── Client — mirrors backend's client creation schema ──────────────────────
export const clientFormSchema = z.object({
  name:        z.string().min(1, 'Client name is required'),
  email:       z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone:       z.string().optional(),
  address:     z.string().optional(),
  ntn:         z.string().optional(),
  isCorporate: z.boolean(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

// ── Business Settings — mirrors backend's business update schema ───────────
export const businessFormSchema = z.object({
  name:           z.string().min(1, 'Business name is required'),
  ntn:            z.string().regex(/^\d{7}-\d$/, 'NTN format: 1234567-8').optional().or(z.literal('')),
  strn:           z.string().optional(),
  address:        z.string().optional(),
  defaultGstRate: z.number().min(0).max(100),
  currency:       z.enum(['PKR', 'USD']),
});

export type BusinessFormValues = z.infer<typeof businessFormSchema>;

// ── Auth — Login / Register ─────────────────────────────────────────────────
export const loginFormSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerFormSchema = z.object({
  email:        z.string().email('Enter a valid email'),
  password:     z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().min(1, 'Business name is required'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
```

> Note: `loginFormSchema` and `registerFormSchema` have no backend Zod equivalent
> since Firebase handles auth validation itself. These exist purely for instant
> client-side feedback before calling Firebase.

---

## Using `react-hook-form` with Zod — Standard Pattern

Every form in the app follows this exact shape. Copy this as your starting template.

```tsx
// components/InvoiceForm/index.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceFormSchema, InvoiceFormValues } from '@/lib/validation';
import { useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export function InvoiceForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      currency: 'PKR',
      gstType: 'standard',
      gstRate: 17,
      whtApplicable: false,
      whtRate: 0,
      items: [{ description: '', quantity: 1, unitPrice: 0, sortOrder: 0 }],
    },
  });

  async function onSubmit(data: InvoiceFormValues) {
    setIsSubmitting(true);
    try {
      const invoice = await apiFetch('/invoices', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      toast.success(`Invoice ${invoice.invoiceNumber} created`);
      router.push(`/invoices/${invoice.id}`);
    } catch (err) {
      // This catches errors the BACKEND found that the frontend schema missed
      // (e.g. duplicate invoice number) — see "When Backend Catches What Frontend Missed" below
      toast.error(err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Issue Date" error={errors.issueDate?.message} required>
        <input type="date" {...register('issueDate')} className="border rounded-md px-3 py-2 w-full" />
      </FormField>

      {/* GSTSection, LineItems, TotalsSidebar components go here, all reading from `watch()` */}

      <button type="submit" disabled={isSubmitting} className="bg-primary text-white px-6 py-2 rounded-md disabled:opacity-50">
        {isSubmitting ? 'Saving...' : 'Save Invoice'}
      </button>
    </form>
  );
}
```

---

## Using `FormField` for Consistent Error Display

`FormField` (from `COMPONENT_LIBRARY.md`) wraps every input so error styling and
messages look identical across every form in the app.

```tsx
// components/FormField/index.tsx
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-text-primary mb-1">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-danger mt-1">{error}</p>}
    </div>
  );
}
```

```tsx
// Usage anywhere
<FormField label="Client Name" error={errors.name?.message} required>
  <input {...register('name')} className="border rounded-md px-3 py-2 w-full" />
</FormField>
```

---

## When Backend Catches What Frontend Missed

Some validation can only happen on the server — these are NOT duplicated in the
frontend schema, and the form must handle the resulting API error gracefully.

| Validation | Where It Happens | Frontend Handling |
|---|---|---|
| Duplicate invoice number | Backend only (race condition check) | Catch the `VALIDATION_ERROR` or retry response, show toast |
| Client belongs to another business | Backend only (ownership check) | Catch `403 FORBIDDEN`, show toast, redirect to clients list |
| Free tier limit (5 invoices/month) | Backend only (count check) | Catch `429 LIMIT_EXCEEDED`, show upgrade prompt instead of generic toast |
| Editing a sent/paid invoice | Backend only (status check), though frontend should also disable the form in this state | Catch `409 INVOICE_LOCKED`, show toast |
| STRN required for standard GST | Backend warns, doesn't block (business decision) | Frontend can show a soft warning banner if `gstType === 'standard'` and business has no STRN, but does not block submission |

```tsx
// Example: handling the 429 limit specifically, not just a generic error
async function onSubmit(data: InvoiceFormValues) {
  try {
    const invoice = await apiFetch('/invoices', { method: 'POST', body: JSON.stringify(data) });
    router.push(`/invoices/${invoice.id}`);
  } catch (err) {
    const code = (err as Error & { code?: string }).code;
    if (code === 'LIMIT_EXCEEDED') {
      // Show the upgrade prompt UI instead of a plain toast
      setShowUpgradePrompt(true);
    } else {
      toast.error(err instanceof Error ? err.message : 'Failed to create invoice');
    }
  }
}
```

> This works because `apiFetch` (see `FRONTEND_DEV.md`) attaches `error.code` from
> the API's `{ error: { code, message, status } }` response before throwing — so
> handlers can branch on `err.code` instead of string-matching the message text.

---

## Required vs Optional Fields — Quick Reference

Matches exactly what the backend Zod schemas in `BACKEND_PATTERNS.md` enforce.

### Invoice Form

| Field | Required? | Notes |
|---|---|---|
| `issueDate` | Yes | |
| `items` | Yes | At least 1 item |
| `items[].description` | Yes | |
| `items[].quantity` | Yes | Must be > 0 |
| `items[].unitPrice` | Yes | Can be 0, not negative |
| `gstType` | Yes | |
| `clientId` | No | Invoice can exist without a linked client (rare, but allowed) |
| `dueDate` | No | |
| `notes` | No | |

### Client Form

| Field | Required? | Notes |
|---|---|---|
| `name` | Yes | |
| `email` | No | Validated as email format if provided |
| `phone`, `address`, `ntn` | No | |
| `isCorporate` | Yes (has a default: `false`) | |

### Business Settings Form

| Field | Required? | Notes |
|---|---|---|
| `name` | Yes | |
| `ntn` | No | Format-validated if provided: `1234567-8` |
| `strn` | No | |
| `defaultGstRate` | Yes (has a default: `17`) | |

---

## Form State Checklist (Run Through for Every Form)

- [ ] Uses `react-hook-form` + `zodResolver` with a schema from `lib/validation.ts`
- [ ] Every input wrapped in `FormField` with `error={errors.field?.message}`
- [ ] Submit button shows `isSubmitting` state and is disabled while submitting
- [ ] `try/catch` around the `apiFetch` call — backend errors caught and shown
- [ ] Special API error codes (`LIMIT_EXCEEDED`, `INVOICE_LOCKED`) handled distinctly,
      not just shown as a generic toast
- [ ] Success path shows a toast and navigates or resets appropriately
- [ ] Schema field names match exactly what `API_REFERENCE.md` expects in the request body

---

*Last updated: June 2026 | Frontend schemas mirror backend Zod schemas — keep them in sync*
