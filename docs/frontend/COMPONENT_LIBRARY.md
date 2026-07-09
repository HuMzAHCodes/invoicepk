# 🧩 COMPONENT_LIBRARY.md — InvoicePK Component Catalog

> A single reference for every component in the app — its purpose, props interface,
> and which pages use it. Update this file whenever you add a new component.
> This prevents building the same thing twice and keeps props consistent everywhere
> the component is reused.

---

## How to Use This Document

Before building a new component, check here first — it may already exist or a similar
one exists that just needs a new prop. After building a new component, add an entry
here so the next page that needs it doesn't get rebuilt from scratch.

---

## Navbar

### `Navbar` — `components/Navbar/index.tsx`

Top navigation bar shown on every authenticated page.

```typescript
interface NavbarProps {
  userName: string;
  userEmail: string;
}
```

**Used on:** Dashboard, Invoices, Clients, Settings (all authenticated pages)

---

### `Navbar/Logo` — `components/Navbar/Logo/index.tsx`

The InvoicePK wordmark/logo. No props — static.

```typescript
// No props
export function Logo(): JSX.Element
```

**Used on:** Inside `Navbar`, and the landing page header

---

### `Navbar/SearchBar` — `components/Navbar/SearchBar/index.tsx`

Generic search input with debounced search callback.

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;     // default: "Search..."
  debounceMs?: number;      // default: 300
}
```

**Used on:** Inside `Navbar`, also reused standalone on Clients page and Invoices page

---

### `Navbar/DropdownMenu` — `components/Navbar/DropdownMenu/index.tsx`

User account dropdown — shows email, link to Settings, Logout button.

```typescript
interface DropdownMenuProps {
  userEmail: string;
  onLogout: () => void;
}
```

**Used on:** Inside `Navbar`

---

## Layout Components

### `Sidebar` — `components/Sidebar/index.tsx`

Left-side navigation for all authenticated pages — Dashboard, Invoices, Clients,
Settings links. Hidden below 768px (Navbar's hamburger menu takes over on mobile).
Full implementation and layout context in `GLOBAL_LAYOUT.md`.

```typescript
// No props — nav items are defined internally
export function Sidebar(): JSX.Element
```

**Used on:** Inside `app/(dashboard)/layout.tsx` — the shared shell for every
authenticated page

---

### `PageHeader` — `components/PageHeader/index.tsx`

Standard top section for every list/detail page — title, optional description, and
a single right-aligned primary action button. Keeps every page's header visually
consistent. Full usage pattern in `GLOBAL_LAYOUT.md`.

```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**Used on:** `/invoices`, `/clients`, and any other list or detail page

---

## Invoice Form

### `InvoiceForm` — `components/InvoiceForm/index.tsx`

Full invoice creation/edit form. Assembles `LineItems`, `GSTSection`, `TotalsSidebar`.

```typescript
interface InvoiceFormProps {
  mode: 'create' | 'edit';
  initialData?: Invoice;            // only passed in edit mode
  clients: Client[];                // for the client dropdown
  defaultGstRate: number;           // from business settings
  onSubmit: (data: InvoiceFormData) => Promise<void>;
  isSubmitting: boolean;
}

interface InvoiceFormData {
  clientId?: string;
  issueDate: string;
  dueDate?: string;
  currency: 'PKR' | 'USD';
  gstType: 'standard' | 'zero_rated' | 'exempt';
  gstRate: number;
  whtApplicable: boolean;
  whtRate: number;
  notes?: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; sortOrder: number }>;
}
```

**Used on:** `/invoices/new`, `/invoices/[id]` (when editing a draft)

---

### `InvoiceForm/LineItems` — `components/InvoiceForm/LineItems/index.tsx`

Editable list of invoice line items — add, remove, reorder.

```typescript
interface LineItemsProps {
  items: InvoiceFormData['items'];
  onChange: (items: InvoiceFormData['items']) => void;
}
```

**Used on:** Inside `InvoiceForm`

---

### `InvoiceForm/GSTSection` — `components/InvoiceForm/GSTSection/index.tsx`

GST type selector, GST rate input, WHT toggle and rate input.

```typescript
interface GSTSectionProps {
  gstType: 'standard' | 'zero_rated' | 'exempt';
  gstRate: number;
  whtApplicable: boolean;
  whtRate: number;
  isClientCorporate: boolean;     // controls whether WHT toggle is shown
  onChange: (updates: Partial<{
    gstType: string; gstRate: number; whtApplicable: boolean; whtRate: number;
  }>) => void;
}
```

**Used on:** Inside `InvoiceForm`

---

### `InvoiceForm/TotalsSidebar` — `components/InvoiceForm/TotalsSidebar/index.tsx`

Read-only live totals display — subtotal, GST, total, WHT, net payable. Updates
automatically as the form changes (see `GST_LOGIC.md` for the calculation source).

```typescript
interface TotalsSidebarProps {
  totals: {
    subtotal: number;
    gstAmount: number;
    total: number;
    whtAmount: number;
    netPayable: number;
  };
  currency: 'PKR' | 'USD';
  gstType: 'standard' | 'zero_rated' | 'exempt';
  whtApplicable: boolean;
}
```

**Used on:** Inside `InvoiceForm`

---

## Invoice PDF

### `InvoicePDF/InvoicePDFTemplate` — `components/InvoicePDF/InvoicePDFTemplate.tsx`

The full PDF document layout, rendered server-side by the backend. Full implementation
in `PDF_TEMPLATE_SPEC.md`.

```typescript
interface PDFInvoiceProps {
  invoice: { /* see PDF_TEMPLATE_SPEC.md for full shape */ };
  business: { name: string; ntn?: string; strn?: string; address?: string; logoUrl?: string };
  client?: { name: string; email?: string; address?: string; ntn?: string };
}
```

**Used by:** Backend's `GET /api/invoices/:id/pdf` route — never imported in a Client Component

---

### `InvoicePDF/DownloadButton` — `components/InvoicePDF/DownloadButton.tsx`

Button that links to the PDF download route.

```typescript
interface DownloadButtonProps {
  invoiceId: string;
  label?: string;       // default: "Download PDF"
}
```

**Used on:** `/invoices/[id]` (invoice detail page)

---

## Client Components

### `ClientCard` — `components/ClientCard/index.tsx`

Card display for a single client — used in grid/list views.

```typescript
interface ClientCardProps {
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    isCorporate: boolean;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Used on:** `/clients` page

---

## Dashboard Components

### `Dashboard` — `components/Dashboard/index.tsx`

Assembles the stats cards and recent invoices list for the dashboard page.

```typescript
interface DashboardProps {
  stats: {
    totalInvoices: number;
    byStatus: { draft: number; sent: number; paid: number };
    revenueThisMonth: number;
    revenueCurrency: string;
    outstandingAmount: number;
  };
  recentInvoices: Invoice[];
}
```

**Used on:** `/dashboard` page

---

## Shared / Common Components (Predicted — Pre-Scaffolded for Consistency)

These are not required by any page yet — no current page calls them. They are a
prediction of what you will likely need once you start building the invoice list,
client list, and forms. They have been created as empty placeholder files in
`GITHUB_SETUP.md`'s scaffold script purely for folder-structure consistency with
everything else in `components/` — not because they're confirmed requirements.

Fill in the actual implementation the first time a real page needs one, using the
starter code below as the pattern to follow, then update the "Suggested usage" note
to "Used on" once it's actually wired into a page.

### `StatusBadge` — `components/StatusBadge/index.tsx`

Colored badge for invoice status (Draft/Sent/Paid). Colors come from `theme.ts`.

```typescript
interface StatusBadgeProps {
  status: 'draft' | 'sent' | 'paid';
}
```

**Suggested usage:** Invoice list rows, invoice detail page header

```tsx
const colorMap = {
  draft: 'bg-status-draft text-white',
  sent:  'bg-status-sent text-white',
  paid:  'bg-status-paid text-white',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorMap[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}
```

---

### `EmptyState` — `components/EmptyState/index.tsx`

Shown when a list has zero items (no invoices yet, no clients yet).

```typescript
interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**Suggested usage:** Invoice list, client list, dashboard recent invoices when empty

---

### `LoadingSpinner` — `components/LoadingSpinner/index.tsx`

Generic loading indicator for async states.

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';   // default: 'md'
}
```

**Suggested usage:** Any page or form waiting on an API call

---

### `ConfirmDialog` — `components/ConfirmDialog/index.tsx`

Confirmation modal before destructive actions (delete client, delete invoice).

```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;    // default: "Confirm"
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Suggested usage:** Delete client button, delete draft invoice button

---

### `FormField` — `components/FormField/index.tsx`

Wrapper for a labeled input with error message display — reduces repetition across forms.

```typescript
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;   // the actual input element
}
```

**Suggested usage:** Login, Register, Client form, Settings form — anywhere with labeled inputs

---

## Component Build Checklist (Use Every Time)

Before marking a component "done" and adding it here:

- [ ] Lives in its own folder under `components/`
- [ ] Props interface is typed and exported if reused elsewhere
- [ ] Zero hardcoded hex colors — uses Tailwind classes mapped to `theme.ts`
- [ ] Works with real data passed as props (not internal mock data)
- [ ] Handles its own loading/error/empty state if it fetches data, or accepts these as props if it doesn't
- [ ] Responsive — checked at 375px width
- [ ] Entry added to this document with props interface and usage location

---

*Last updated: June 2026 | Add a new entry every time you build a new shared component*
