# 🗺️ CONCEPTS_MAP.md — InvoicePK Domain Concepts & Pakistani Tax Glossary

> Read this before writing any code that touches invoice calculations, PDF generation, or tax fields.
> Understanding these concepts is what separates a correct invoice from a legally wrong one.
> Both developers must read this — the frontend dev needs it for form labels and UI copy, the backend dev needs it for calculation logic.

---

## Who Uses InvoicePK?

**Primary user:** Pakistani freelancer or small agency owner who:
- Sells services (software development, design, consulting) locally or internationally
- Is registered with FBR and has an NTN
- May or may not be GST-registered (has an STRN)
- Bills corporate clients who deduct WHT before paying

**Common scenarios:**
1. Local client, standard 17% GST, WHT applicable (corporate client)
2. Export client (US/UK), zero-rated GST, no WHT
3. Small individual client, GST exempt, no WHT

---

## Tax Authority

### FBR — Federal Board of Revenue
The government body that:
- Sets GST rates and rules in Pakistan
- Assigns NTNs and STRNs to registered businesses
- Collects taxes via taxpayer filings
- Website: [fbr.gov.pk](https://www.fbr.gov.pk)

### STZA — Special Technology Zones Authority
- Governs IT export zones in Pakistan
- Companies exporting IT services are zero-rated for GST under STZA rules
- Freelancers exporting services also qualify for zero-rated GST

---

## Core Tax Concepts

---

### NTN — National Tax Number

- **What it is:** A unique 8-digit identifier assigned by FBR to every registered taxpayer
- **Format:** `1234567-8` (7 digits + check digit, separated by a hyphen)
- **Who has it:** Any individual or business registered for income tax in Pakistan
- **On the invoice:** Shown in the business/seller section of the invoice PDF
- **In the app:** Stored in the `Business` document, optional field in settings

```
Example: NTN 1234567-8
```

---

### STRN — Sales Tax Registration Number

- **What it is:** A unique number assigned by FBR to businesses registered to collect GST
- **Format:** `12-00-1234-567-89` (varies by registration type)
- **Who has it:** Only businesses registered for Sales Tax — not all NTN holders have an STRN
- **On the invoice:** Required on invoices where GST is charged — proves the seller is legally allowed to collect GST
- **In the app:** Stored in the `Business` document; shown on PDF only if present; frontend should hide/show the STRN field based on whether it is filled in settings

```
Example: STRN 12-00-1234-567-89
```

> ⚠️ If a business charges GST but has no STRN, the invoice is not legally valid under FBR rules. The app should warn the user if they try to create a standard GST invoice without an STRN configured.

---

### GST — General Sales Tax

- **What it is:** Tax charged on the sale of goods and services
- **Standard rate:** 17% (as of 2026 — may change with annual budget)
- **Who pays it:** The client (buyer) pays it; the seller collects it and deposits to FBR
- **Applied on:** The subtotal (sum of line items before any tax)
- **Three modes in InvoicePK:**

| Mode | Code | Rate | Use Case |
|---|---|---|---|
| Standard | `standard` | 17% (configurable) | Most local services |
| Zero-Rated | `zero_rated` | 0% | IT/software export services |
| Exempt | `exempt` | 0% (no GST line shown) | Legally exempt goods/services |

**Difference between Zero-Rated and Exempt:**
- `zero_rated` — GST applies at 0%; the GST line appears on the invoice showing PKR 0. Used for IT exports.
- `exempt` — GST does not apply at all; no GST line appears on the invoice. Used for exempt categories.

---

### WHT — Withholding Tax

- **What it is:** A tax mechanism where the client deducts tax from the payment and deposits it to FBR on behalf of the seller
- **Who it applies to:** Corporate clients (companies) billing other companies — not individual clients
- **Applied on:** The **subtotal** (not the GST-inclusive total)
- **Common rate for IT services:** 3%
- **Effect on the seller:** You invoice PKR 117,000 but only receive PKR 114,000. The client keeps PKR 3,000 and pays it to FBR. You get a WHT certificate you can use to offset your annual tax.

**Example:**
```
Subtotal     = 100,000
GST (17%)    =  17,000
Total        = 117,000
WHT (3%)     =   3,000   ← deducted from subtotal, not total
Net Payable  = 114,000   ← what you actually receive
```

- **In the app:** WHT toggle visible when `client.isCorporate === true`; backend enforces calculation even if frontend toggle is bypassed

---

### Invoice Status Flow

```
DRAFT ──→ SENT ──→ PAID
```

| Status | Meaning | Editable? | Deletable? |
|---|---|---|---|
| `draft` | Created but not sent to client | Yes | Yes |
| `sent` | Sent to client, awaiting payment | No | No |
| `paid` | Payment received | No | No |

- Backward transitions are not allowed (`paid → sent`, `sent → draft`)
- Only `draft` invoices can be edited or deleted
- Status displayed with color badges in the UI: Draft (gray), Sent (amber), Paid (green)

---

### Invoice Number

- **Format:** `INV-001`, `INV-002`, etc. — padded to minimum 3 digits
- **Scope:** Unique per business — two different businesses can both have `INV-001`
- **Generation:** Sequential, based on the last invoice created for that business
- **In the app:** Auto-generated by `lib/invoice-number.ts` on the backend — user cannot manually set it (MVP)

---

### Currency

- **Primary:** PKR (Pakistani Rupee) — used for local clients
- **Secondary:** USD — used for international/export clients
- **Per invoice:** Each invoice has its own currency — a business can issue both PKR and USD invoices
- **Formatting:** PKR amounts use South Asian number format (lakhs, crores) — `formatPKR()` in `lib/gst.ts` handles this

```
PKR 1,17,000   (not 117,000 — South Asian format)
USD 2,000.00
```

---

### Net Payable

- The actual amount the freelancer receives after WHT deduction
- This is the number to highlight most prominently on the invoice — it is what the client actually transfers
- **Formula:** `netPayable = total - whtAmount`
- If WHT is not applicable: `netPayable === total`

---

## Invoice PDF — Required Fields

These fields must appear on every generated PDF to be FBR-compliant:

| Field | Source | Required? |
|---|---|---|
| Business name | `business.name` | Always |
| Business NTN | `business.ntn` | Always |
| Business STRN | `business.strn` | Only if GST is charged |
| Business address | `business.address` | Always |
| Business logo | `business.logoUrl` | If uploaded |
| Invoice number | `invoice.invoiceNumber` | Always |
| Issue date | `invoice.issueDate` | Always |
| Due date | `invoice.dueDate` | If set |
| Client name | `client.name` | Always |
| Client address | `client.address` | If available |
| Client NTN | `client.ntn` | If corporate + WHT |
| Line items table | `invoice.items` | Always |
| Subtotal | `invoice.subtotal` | Always |
| GST rate + amount | `invoice.gstRate`, `invoice.gstAmount` | If standard GST |
| Total | `invoice.total` | Always |
| WHT rate + amount | `invoice.whtRate`, `invoice.whtAmount` | If WHT applicable |
| Net Payable | `invoice.netPayable` | Always |
| Currency | `invoice.currency` | Always |

---

## UI Copy Guide

Use these exact labels in the frontend UI — consistent with Pakistani business terminology:

| Field | UI Label | Tooltip / Helper Text |
|---|---|---|
| `ntn` | NTN | National Tax Number (e.g. 1234567-8) |
| `strn` | STRN | Sales Tax Reg. Number — required to charge GST |
| `gstType` | GST Type | Standard (17%), Zero-Rated (IT export), Exempt |
| `gstRate` | GST Rate (%) | Default 17% — update in settings |
| `whtApplicable` | Withholding Tax | Applies to corporate clients only |
| `whtRate` | WHT Rate (%) | Typically 3% for IT services |
| `subtotal` | Subtotal | Sum of all line items |
| `gstAmount` | GST Amount | Calculated automatically |
| `total` | Total | Subtotal + GST |
| `whtAmount` | WHT Deduction | Deducted by client before payment |
| `netPayable` | Net Payable | Amount you will receive |
| `isCorporate` | Corporate Client | Enable to show WHT options |

---

## Common Mistakes to Avoid

| Mistake | Correct Approach |
|---|---|
| Applying WHT on `total` | WHT is always on `subtotal` — see GST_LOGIC.md |
| Showing STRN when not configured | Hide STRN field on PDF if `business.strn` is null/empty |
| Allowing backward status transitions | Only `draft→sent→paid` is valid — enforce in API |
| Calling zero_rated and exempt the same | They are different — zero_rated shows GST line at 0%, exempt shows no GST line |
| Hardcoding 17% GST rate | Always pull from `business.defaultGstRate` — user can change this |
| Trusting client-submitted totals | Backend always recalculates — never save what the frontend sends for totals |

---

*Last updated: June 2026 | FBR rates may change with annual federal budget — verify at fbr.gov.pk*
