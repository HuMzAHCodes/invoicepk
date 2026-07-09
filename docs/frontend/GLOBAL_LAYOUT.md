# 📐 GLOBAL_LAYOUT.md — InvoicePK Global Layout & Page Shell

> This document defines the shared page structure every authenticated page uses, so
> pages built independently still feel like one consistent app. Read this before
> building your first page layout.

---

## Why This Document Exists

When two developers build different pages in parallel without a shared layout
contract, the usual result is: one page has 24px side padding, another has 32px;
one page's content max-width is 1200px, another is full-bleed; the navbar height
shifts page to page because each page reinvented its own wrapper. This document
locks those decisions down once so every page is consistent without either dev
needing to ask the other.

---

## App Shell Structure

Every authenticated page (everything except `/`, `/login`, `/register`) uses this
shell. It lives in `app/(dashboard)/layout.tsx` — a Next.js layout file that wraps
all authenticated routes automatically.

```
┌────────────────────────────────────────────────────────────┐
│                          Navbar                             │  ← 64px height, fixed
├──────────┬─────────────────────────────────────────────────┤
│          │                                                 │
│ Sidebar  │              Page Content                       │
│ (240px)  │         (max-width: 1200px, centered)            │
│          │              padding: 32px                       │
│          │                                                 │
│          │                                                 │
└──────────┴─────────────────────────────────────────────────┘
```

On mobile (< 768px), the sidebar collapses into the Navbar's hamburger menu and the
content area becomes full width with 16px padding.

---

## Route Group Structure

```
app/
├── (auth)/                  ← No shell — full-screen centered forms
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/              ← Shared shell wraps everything inside
│   ├── layout.tsx           ← THE SHELL — Navbar + Sidebar + content wrapper
│   ├── dashboard/page.tsx
│   ├── invoices/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── clients/page.tsx
│   └── settings/page.tsx
└── page.tsx                  ← Landing page — its own full-width layout
```

> Note: `(auth)` and `(dashboard)` are Next.js route groups — the parentheses mean
> they don't appear in the URL. `/login` is still `/login`, not `/auth/login`.

---

## The Shell Implementation

```tsx
// app/(dashboard)/layout.tsx
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 max-w-[1200px] mx-auto px-4 md:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

Every page inside `(dashboard)/` only needs to return its own content — the Navbar,
Sidebar, and content wrapping (max-width, padding, centering) are already handled.

```tsx
// app/(dashboard)/clients/page.tsx — example of what a page itself looks like
export default function ClientsPage() {
  return (
    <div>
      <PageHeader title="Clients" actionLabel="Add Client" onAction={...} />
      {/* client list content */}
    </div>
  );
}
```

---

## Sidebar Navigation

```tsx
// components/Sidebar/index.tsx
import { LayoutDashboard, FileText, Users, Settings } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Invoices',  href: '/invoices',  icon: FileText },
  { label: 'Clients',   href: '/clients',   icon: Users },
  { label: 'Settings',  href: '/settings',  icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden md:block w-[240px] border-r border-border min-h-[calc(100vh-64px)] p-4">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <SidebarLink key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  );
}
```

> `Sidebar` is a new component, not listed in `COMPONENT_LIBRARY.md` yet — add it
> there once built, following the same entry format as the other components.

---

## Page-Level Conventions

### Every List/Detail Page Starts With a `PageHeader`

```tsx
// components/PageHeader/index.tsx — another component to add to COMPONENT_LIBRARY.md
interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

```tsx
<PageHeader
  title="Invoices"
  description="Manage and track all your invoices"
  actionLabel="New Invoice"
  onAction={() => router.push('/invoices/new')}
/>
```

This keeps every page's top section visually identical — title, optional description,
and a single primary action button, right-aligned.

---

## Spacing Rules (From `theme.ts`)

| Context | Value | Tailwind Class |
|---|---|---|
| Page content padding (desktop) | 32px | `px-8 py-8` |
| Page content padding (mobile) | 16px | `px-4` |
| Space between page sections | 24px | `space-y-6` |
| Space between form fields | 16px | `space-y-4` |
| Card internal padding | 16px | `p-4` |
| Card-to-card gap (grid) | 16px | `gap-4` |
| Navbar height | 64px | `h-16` |
| Sidebar width | 240px | `w-[240px]` |

Never invent a new spacing value — always pick from `theme.spacing` or the table above.
This is what keeps every page feeling like it came from the same hand even though two
different people are building different pages.

---

## Responsive Breakpoints

Match Tailwind's defaults — do not configure custom breakpoints.

| Breakpoint | Width | Behavior |
|---|---|---|
| Default (no prefix) | < 640px | Mobile — sidebar hidden, full-width content, 16px padding |
| `sm:` | ≥ 640px | Small tablet adjustments where needed |
| `md:` | ≥ 768px | Sidebar appears, content gets max-width treatment |
| `lg:` | ≥ 1024px | Desktop — full layout, side-by-side form + totals sidebar |
| `xl:` | ≥ 1280px | Large desktop — no further layout changes needed for this app |

**Test every page at:** 375px (mobile), 768px (tablet), 1280px (desktop). This is also
listed in `FRONTEND_DEV.md`'s testing checklist — this document just defines what the
breakpoints actually mean.

---

## Auth Pages Layout (No Shell)

`/login` and `/register` do not use the dashboard shell — they're centered, full-screen
forms with no navbar or sidebar.

```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-[400px]">
        {children}
      </div>
    </div>
  );
}
```

---

## Landing Page Layout (Its Own Layout)

The `/` landing page does not use the dashboard shell or the auth shell — it has its
own full-width layout defined directly in `app/page.tsx`, since it includes a custom
header (with "Login" / "Get Started" buttons instead of the authenticated Navbar) and
full-bleed sections (hero, pricing). See `LAUNCH_STRATEGY.md` for the section order.

---

## Quick Checklist Before Building Any New Page

- [ ] Does it belong inside `(dashboard)/` (needs Navbar + Sidebar) or `(auth)/`
      (centered form, no nav) or is it the landing page (its own layout)?
- [ ] Does it start with `PageHeader` if it's a list or detail page?
- [ ] Does spacing match the table above — no invented padding/margin values?
- [ ] Has it been tested at 375px, 768px, and 1280px?

---

*Last updated: June 2026 | This shell applies to every page under app/(dashboard)/*
