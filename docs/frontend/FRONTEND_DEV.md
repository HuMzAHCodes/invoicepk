# 🎨 FRONTEND_DEV.md — InvoicePK Frontend Developer Guide

> This is your master context document. Read this before writing a single line of code.
> You own everything the user sees and interacts with. The backend developer owns the API
> you call. Code against API_REFERENCE.md exactly — it is the contract between you two.

---

## 1. Your Role & Responsibilities

As the frontend developer on InvoicePK, you own every page, every component, the visual
theme, and the client-side GST calculation that gives users live feedback as they fill
out an invoice. You never touch the database or write API logic — you call the API routes
the backend developer builds, exactly as documented in `API_REFERENCE.md`.

### What You Own

| Area | Your Responsibility |
|---|---|
| Pages | Every route under `app/(pages)/` — login, dashboard, invoices, clients, settings |
| Components | All UI components under `components/` — atomic, independent, reusable |
| Theme | `styles/theme.ts` — every color and design token in the app |
| Client Auth | Firebase JS SDK setup, login/register flow, token storage |
| Live GST Calc | Using `lib/gst.ts` to show real-time totals as the user fills the invoice form |
| PDF Template | `components/InvoicePDF/InvoicePDFTemplate.tsx` — the visual design of the PDF |
| Responsiveness | Every page must work correctly on mobile (375px) up to desktop |
| Landing Page | The public `/` page — hero, pricing, FAQ |

### What You Do NOT Own

- Anything inside `app/api/` — backend developer's territory
- `models/` — Mongoose schemas, not your concern
- `lib/db.ts`, `lib/firebase-admin.ts`, `lib/withAuth.ts`, `lib/cloudinary.ts` — server-only
- `scripts/seed.ts` — backend's test data setup
- `__tests__/` — backend's Jest test suite

> **GOLDEN RULE:** Never assume an API response shape — always check `API_REFERENCE.md`.
> If you need a field that isn't there, talk to the backend developer before building
> around a guess.

---

## 2. Tech Stack (Frontend)

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server Components for data pages, Client Components for forms |
| Styling | Tailwind CSS | Utility-first, fast to build, easy to keep consistent via theme tokens |
| Theme | `styles/theme.ts` | Single source of truth — change one file, change the whole app |
| Auth (client) | Firebase JS SDK | Same Firebase project as backend, free unlimited users |
| PDF | `@react-pdf/renderer` | You build the template; backend renders it server-side |
| State | React `useState` / `useReducer` + Context | No Redux needed for this scope |
| Data fetching | Server Components + `fetch` for client-side calls | Built into Next.js, no extra library needed |
| Icons | `lucide-react` | Clean, consistent icon set |
| Toasts | `react-hot-toast` or similar lightweight library | Success/error notifications |

### Install Commands — Day 1

```bash
npm install firebase
npm install @react-pdf/renderer
npm install lucide-react
npm install react-hot-toast
```

---

## 3. Folder Structure — Frontend Parts You Own

Both developers work in the same Next.js repository (see `GITHUB_SETUP.md` for how the
shared structure was scaffolded). You own the folders marked below. Do not touch folders
marked BACKEND — they exist on your machine as empty placeholder files, leave them alone.

```
invoicepk/
├── app/
│   ├── (auth)/                      ← YOU OWN — no shared shell, see GLOBAL_LAYOUT.md
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/                 ← YOU OWN — shared Navbar+Sidebar shell
│   │   ├── layout.tsx               (the shell — see GLOBAL_LAYOUT.md)
│   │   ├── dashboard/page.tsx
│   │   ├── invoices/
│   │   │   ├── page.tsx             (list)
│   │   │   ├── new/page.tsx         (create form)
│   │   │   └── [id]/page.tsx        (detail view)
│   │   ├── clients/page.tsx
│   │   └── settings/page.tsx
│   ├── page.tsx                     ← YOU OWN (landing page, own layout)
│   └── api/                         ← BACKEND — DO NOT TOUCH
├── components/                      ← YOU OWN THIS ENTIRE FOLDER
│   ├── Navbar/
│   │   ├── index.tsx
│   │   ├── Logo/index.tsx
│   │   ├── SearchBar/index.tsx
│   │   └── DropdownMenu/index.tsx
│   ├── Sidebar/
│   │   └── index.tsx
│   ├── PageHeader/
│   │   └── index.tsx
│   ├── InvoiceForm/
│   │   ├── index.tsx
│   │   ├── LineItems/index.tsx
│   │   ├── GSTSection/index.tsx
│   │   └── TotalsSidebar/index.tsx
│   ├── InvoicePDF/
│   │   ├── InvoicePDFTemplate.tsx
│   │   └── DownloadButton.tsx
│   ├── ClientCard/
│   │   └── index.tsx
│   └── Dashboard/
│       └── index.tsx
├── styles/                          ← YOU OWN
│   └── theme.ts
├── lib/
│   ├── firebase-client.ts           ← YOU OWN (Firebase client SDK init)
│   ├── api-client.ts                ← YOU OWN (fetch wrapper for calling backend)
│   ├── gst.ts                       ← SHARED (you use it for live UI calc)
│   ├── db.ts                        ← BACKEND — DO NOT TOUCH
│   ├── firebase-admin.ts            ← BACKEND — DO NOT TOUCH
│   └── withAuth.ts                  ← BACKEND — DO NOT TOUCH
├── models/                          ← BACKEND — DO NOT TOUCH
├── types/
│   └── index.ts                     ← SHARED — discuss changes with backend dev
├── middleware.ts                    ← SHARED — discuss changes with backend dev
└── __tests__/                       ← BACKEND — DO NOT TOUCH
```

---

## 4. Theme System — `styles/theme.ts`

Every color in the app comes from this one file. No component should ever contain a
hardcoded hex value. This is what makes a future rebrand or dark mode trivial — change
one file, the whole app updates.

```typescript
// styles/theme.ts
// SINGLE SOURCE OF TRUTH for all colors and design tokens.
// Never hardcode a hex value anywhere else in the codebase.

export const theme = {
  colors: {
    // Brand
    primary:       '#1e3a5f',   // Navy — headers, primary buttons, nav
    primaryLight:  '#2c5482',   // Hover state for primary
    primaryDark:   '#142940',   // Active/pressed state

    // Accent
    accent:        '#198754',   // Green — success, paid status, net payable
    accentLight:   '#d1f0dd',   // Light green backgrounds

    // Status colors (invoice status badges)
    statusDraft:   '#6c757d',   // Gray
    statusSent:    '#e65100',   // Amber/orange
    statusPaid:    '#198754',   // Green

    // Semantic
    danger:        '#c62828',   // Errors, delete actions
    dangerLight:   '#fde8e8',
    warning:       '#e65100',
    warningLight:  '#fff3e0',
    info:          '#1e3a5f',
    infoLight:     '#e8f0fa',

    // Neutrals
    background:    '#ffffff',
    surface:       '#f9fafb',
    border:        '#e5e7eb',
    textPrimary:   '#1a1a1a',
    textSecondary: '#6b7280',
    textMuted:     '#9ca3af',
  },

  fonts: {
    sans:  "'Inter', system-ui, sans-serif",
    mono:  "'JetBrains Mono', monospace",
  },

  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
} as const;

export type Theme = typeof theme;
```

### Wire It Into Tailwind — `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';
import { theme } from './styles/theme';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:        theme.colors.primary,
        'primary-light': theme.colors.primaryLight,
        'primary-dark':  theme.colors.primaryDark,
        accent:         theme.colors.accent,
        'accent-light':  theme.colors.accentLight,
        'status-draft':  theme.colors.statusDraft,
        'status-sent':   theme.colors.statusSent,
        'status-paid':   theme.colors.statusPaid,
        danger:         theme.colors.danger,
        'danger-light':  theme.colors.dangerLight,
        warning:        theme.colors.warning,
        'warning-light': theme.colors.warningLight,
      },
      fontFamily: {
        sans: theme.fonts.sans.split(',').map(f => f.trim().replace(/'/g, '')),
      },
    },
  },
  plugins: [],
} satisfies Config;
```

Now every component uses Tailwind classes that map back to the theme:

```tsx
// ✅ CORRECT — uses theme via Tailwind class
<button className="bg-primary text-white hover:bg-primary-light">Save</button>

// ❌ WRONG — hardcoded hex value
<button style={{ backgroundColor: '#1e3a5f' }}>Save</button>
```

**To change the entire app's color scheme:** edit `styles/theme.ts` only. Every component
picks it up automatically through the Tailwind class mapping.

---

## 5. Atomic Component Structure — The Rule

Every component lives in its own folder. If a component has sub-parts, each sub-part gets
its own folder/file inside the parent's folder. No component reaches into another
component's internals — each one is self-contained and works standalone.

### Example: Building the Navbar

```
components/Navbar/
├── index.tsx              ← assembles Logo + SearchBar + DropdownMenu
├── Logo/
│   └── index.tsx          ← just the logo, nothing else
├── SearchBar/
│   └── index.tsx          ← just the search input + icon
└── DropdownMenu/
    └── index.tsx          ← just the user menu dropdown
```

```tsx
// components/Navbar/Logo/index.tsx
export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xl font-bold text-primary">InvoicePK</span>
    </div>
  );
}
```

```tsx
// components/Navbar/SearchBar/index.tsx
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
        className="pl-9 pr-4 py-2 rounded-md border border-border w-full"
      />
    </div>
  );
}
```

```tsx
// components/Navbar/index.tsx — assembles the parts
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { DropdownMenu } from './DropdownMenu';

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
      <Logo />
      <SearchBar onSearch={(q) => console.log(q)} />
      <DropdownMenu />
    </nav>
  );
}
```

### Why This Matters

- **No merge conflicts** — if both devs somehow touch UI, each component is isolated
- **Easy debugging** — a bug in the dropdown menu means you open exactly one file
- **Reusability** — `SearchBar` can be dropped into the Clients page without dragging
  in Navbar-specific code
- **Independent testing** — each piece can be checked in isolation

### Rule Checklist for Every New Component

- [ ] Does it live in its own folder under `components/`?
- [ ] If it has sub-parts, does each sub-part have its own file/folder?
- [ ] Does it accept props instead of reaching into global state directly where possible?
- [ ] Does it use only `theme.ts` colors via Tailwind classes — zero hardcoded hex?
- [ ] Can you delete any other component and this one would still render without crashing?

---

## 6. Firebase Auth — Client-Side Setup

```typescript
// lib/firebase-client.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:     process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Login Flow

> Token storage detail: the Firebase token is stored in a cookie, not just in-memory
> state — Server Components (used for dashboard, invoice list, client list — see
> `DATA_FETCHING.md`) can only read cookies, not React state or `localStorage`. Full
> explanation and the token refresh setup is in `DATA_FETCHING.md`.

```typescript
// In app/(auth)/login/page.tsx
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

async function handleLogin(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    // Store token in a cookie — Server Components read it via cookies().get()
    document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict`;

    router.push('/dashboard');
  } catch (err) {
    toast.error('Invalid email or password');
  }
}
```

### Calling the Backend API with the Token

For Client Components calling the API directly (forms, actions), `apiFetch` pulls the
token straight from the Firebase SDK rather than the cookie — it's always current
without needing a refresh check. Server Components instead read the cookie directly,
as shown in `DATA_FETCHING.md`.

```typescript
// lib/api-client.ts
import { auth } from './firebase-client';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();

  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    const error = new Error(json.error?.message ?? 'Something went wrong');
    // Attach the error code so callers can branch on specific cases
    // (e.g. err.code === 'LIMIT_EXCEEDED') instead of string-matching the message.
    // See VALIDATION_AND_FORMS.md for the pattern this enables.
    (error as Error & { code?: string }).code = json.error?.code;
    throw error;
  }

  return json.data;
}
```

```typescript
// Usage anywhere in the app
import { apiFetch } from '@/lib/api-client';

const invoices = await apiFetch('/invoices');
const newInvoice = await apiFetch('/invoices', {
  method: 'POST',
  body: JSON.stringify(invoiceData),
});
```

---

## 7. Live GST Calculation — Using the Shared `lib/gst.ts`

This file is shared with the backend (see `GST_LOGIC.md` for the full implementation).
You use it for instant feedback as the user fills out the invoice form — no API call
needed for this part.

```tsx
// components/InvoiceForm/index.tsx (simplified)
import { useState, useMemo } from 'react';
import { calculateInvoice } from '@/lib/gst';

export function InvoiceForm() {
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [gstType, setGstType] = useState<'standard' | 'zero_rated' | 'exempt'>('standard');
  const [gstRate, setGstRate] = useState(17);
  const [whtApplicable, setWhtApplicable] = useState(false);
  const [whtRate, setWhtRate] = useState(3);

  // Recalculates automatically whenever any input changes
  const totals = useMemo(() => calculateInvoice({
    items, gstType, gstRate, whtApplicable, whtRate,
  }), [items, gstType, gstRate, whtApplicable, whtRate]);

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        {/* LineItems, GSTSection components go here */}
      </div>
      <TotalsSidebar totals={totals} />
    </div>
  );
}
```

> Remember: this live calculation is for UI feedback only. When the form submits, the
> backend recalculates everything server-side and saves its own numbers — never the
> numbers the frontend sent.

---

## 8. PDF Template & Preview

You own `InvoicePDFTemplate.tsx` — the full implementation is in `PDF_TEMPLATE_SPEC.md`.
Key things to remember:

- `@react-pdf/renderer` only runs server-side — never import it in a Client Component
- For PDF preview in the browser, use an `<iframe>` pointing at the backend's PDF route,
  not a live render in the browser
- Agree on the props interface (`PDFInvoiceProps`) with the backend dev before either
  of you builds against it

```tsx
// components/InvoicePDF/DownloadButton.tsx
export function DownloadButton({ invoiceId }: { invoiceId: string }) {
  return (
    <a href={`/api/invoices/${invoiceId}/pdf`} target="_blank" rel="noopener noreferrer">
      <button className="bg-primary text-white px-4 py-2 rounded-md">
        Download PDF
      </button>
    </a>
  );
}
```

---

## 9. Mobile Responsiveness Rules

Most Pakistani freelancers browse on phones first. Every page must work down to 375px.

- [ ] Test every page at 375px, 768px, and 1280px widths
- [ ] Navbar collapses to a hamburger menu below 768px
- [ ] Invoice form line items stack vertically on mobile instead of side-by-side
- [ ] Tables (invoice list, client list) become scrollable horizontally on small screens
  or switch to a card layout below 640px
- [ ] Touch targets (buttons, links) are at least 44px tall on mobile
- [ ] No fixed-width elements that overflow on small screens

---

## 10. Testing Your Own Work (Manual — No Jest Required for Frontend)

The backend developer runs Jest tests. As the frontend developer, do these manual checks
before opening a PR. The full version of this checklist — including empty/loading/error
states, edge-case data, and how to verify against the real backend without ever using
mock data — is in `FRONTEND_TESTING.md`. Read that document before your first page is
ready for a PR; the list below is the quick version.

- [ ] Does the page load with real data from the backend (not placeholder text)?
- [ ] Does every form show a loading state while submitting?
- [ ] Does every form show a clear error message on failure (use the error from the API
      response, not a generic message)?
- [ ] Does every successful action show a toast confirmation?
- [ ] Does the page work correctly on a 375px mobile viewport?
- [ ] Are there zero hardcoded hex colors — check with `grep -r "#[0-9a-fA-F]\{6\}" components/`?
- [ ] Does `npx tsc --noEmit` show zero TypeScript errors?

---

## 11. Console Logging (Lighter Than Backend)

You don't need verbose logging like the backend, but log API errors so debugging
integration issues is fast:

```typescript
try {
  const data = await apiFetch('/invoices', { method: 'POST', body: JSON.stringify(payload) });
  console.log('[InvoiceForm] Created invoice:', data.invoiceNumber);
} catch (err) {
  console.error('[InvoiceForm] Failed to create invoice:', err);
  toast.error('Could not create invoice. Please try again.');
}
```

---

## 12. Your GitHub Workflow

See `GITHUB_SETUP.md` for the full setup. Your branch naming:

| What You're Building | Branch Name |
|---|---|
| Theme + scaffolding | `frontend/day-1-setup` |
| Login/Register pages | `frontend/auth-pages` |
| Dashboard layout | `frontend/dashboard-layout` |
| Client list + form | `frontend/clients-ui` |
| Invoice list page | `frontend/invoice-list` |
| Invoice creation form | `frontend/invoice-form` |
| Invoice detail page | `frontend/invoice-detail` |
| PDF template | `frontend/pdf-template` |
| Settings page | `frontend/settings-ui` |
| Dashboard stats | `frontend/dashboard-stats` |
| Mobile polish | `frontend/mobile-polish` |
| Landing page | `frontend/landing-page` |

### Before Opening a PR — Checklist

- [ ] Page works with real API data from the backend
- [ ] Mobile responsive (tested at 375px)
- [ ] No hardcoded colors — all from `theme.ts`
- [ ] Every component follows the atomic folder structure
- [ ] Loading and error states handled on every form/data fetch
- [ ] `npx tsc --noEmit` shows zero errors
- [ ] No `.env.local` or secrets committed

---

## 13. Documents You Must Read

| Document | Why You Need It | Priority |
|---|---|---|
| API_REFERENCE.md | The contract — call every route exactly as specified | CRITICAL |
| AI_MEMORY.md | Updated tech stack and project overview | HIGH |
| CONCEPTS_MAP.md | Pakistani tax concepts and exact UI copy/labels to use | HIGH |
| GST_LOGIC.md | The `lib/gst.ts` shared file — you use it for live calc | HIGH |
| PDF_TEMPLATE_SPEC.md | Full PDF design spec — you own the template | HIGH |
| DEVELOPMENT_PLAN.md | Day-by-day schedule — know when each page is due | MEDIUM |
| LAUNCH_STRATEGY.md | Landing page sections and pricing copy | MEDIUM |
| GITHUB_SETUP.md | Repo setup and daily git workflow | MEDIUM |
| GLOBAL_LAYOUT.md | Shared page shell, spacing rules, breakpoints — read before building any page | HIGH |
| DATA_FETCHING.md | Server vs Client Component strategy, token storage — read before building any page | HIGH |
| VALIDATION_AND_FORMS.md | Form validation schemas mirroring backend Zod — read before building any form | HIGH |
| FRONTEND_TESTING.md | How to manually verify pages against real backend data, no mocks | HIGH |
| LANDING_PAGE_SPEC.md | Full landing page component breakdown and code — read on Day 13 | LOW (until Day 13) |
| BACKEND_DEV.md | Read once — know what the backend dev is building | LOW |
| DATABASE_SCHEMA.md | Read the field names only — you don't write queries | LOW |

---

*Last updated: June 2026 | Stack: Next.js 14 + Tailwind + Firebase Auth (client) + react-pdf*
