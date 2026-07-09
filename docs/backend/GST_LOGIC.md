# 🧮 GST_LOGIC.md — Pakistani GST Calculation Logic

> This document explains Pakistan's GST rules and the exact calculation logic used in InvoicePK.
> The `lib/gst.ts` file is **shared** — both developers use it.
> Frontend uses it for live UI calculation as the user types.
> Backend uses it to recalculate and validate server-side before saving to MongoDB.

---

## Pakistani Tax Concepts

### GST — General Sales Tax
- Standard rate: **17%** (set by FBR)
- Applied on the subtotal of goods and services
- Registered businesses must have an **STRN** to charge GST
- GST is collected from the client and deposited to FBR

### GST Types Supported

| Type | Rate | When to Use |
|---|---|---|
| `standard` | 17% (configurable) | Default — most local services |
| `zero_rated` | 0% | IT/software export services (STZA exemption) |
| `exempt` | N/A | Goods/services legally exempt from GST |

### WHT — Withholding Tax
- Applied when billing **corporate clients**
- The client deducts WHT before paying — they deposit it to FBR on your behalf
- Common WHT rate for IT services: **3%**
- Applied on the **subtotal** (before GST), not on the total
- WHT reduces the amount you actually receive (netPayable)

### NTN — National Tax Number
- Required for all registered businesses filing tax returns
- Format: `1234567-8`

### STRN — Sales Tax Registration Number
- Required to charge GST on invoices
- Format: `12-00-1234-567-89`
- Only show STRN on invoice PDF if business has one configured

---

## Calculation Formula

```
subtotal    = sum of (item.quantity × item.unitPrice) for all items

gstAmount   = subtotal × (gstRate / 100)   if gstType === 'standard'
            = 0                              if gstType === 'zero_rated'
            = 0                              if gstType === 'exempt'

total       = subtotal + gstAmount

whtAmount   = subtotal × (whtRate / 100)   if whtApplicable === true
            = 0                              if whtApplicable === false

netPayable  = total - whtAmount
```

### Worked Example (Standard GST + WHT)

```
Item 1: Website Development   qty=1   unitPrice=100,000   amount=100,000
Item 2: UI/UX Design          qty=2   unitPrice=25,000    amount=50,000

subtotal   = 100,000 + 50,000         = 150,000
gstAmount  = 150,000 × (17/100)       = 25,500
total      = 150,000 + 25,500         = 175,500
whtAmount  = 150,000 × (3/100)        = 4,500
netPayable = 175,500 - 4,500          = 171,000
```

### Worked Example (Zero-Rated GST — IT Export)

```
Item 1: React.js Development   qty=80   unitPrice=25   amount=2,000

subtotal   = 2,000
gstAmount  = 0        (zero_rated)
total      = 2,000
whtAmount  = 0        (whtApplicable = false)
netPayable = 2,000
```

---

## Implementation — lib/gst.ts

This is the complete shared file. Copy it exactly into your project.

```typescript
// lib/gst.ts
// Shared GST calculation logic — used by both frontend (live UI) and backend (server validation)
// Do NOT change calculation logic without notifying both developers

export type GSTType = 'standard' | 'zero_rated' | 'exempt';

export interface GSTInputItem {
  quantity:  number;
  unitPrice: number;
}

export interface GSTInput {
  items:         GSTInputItem[];
  gstType:       GSTType;
  gstRate:       number;   // percentage e.g. 17
  whtApplicable: boolean;
  whtRate:       number;   // percentage e.g. 3
}

export interface GSTResult {
  itemAmounts:  number[];  // per-item calculated amounts
  subtotal:     number;
  gstAmount:    number;
  total:        number;
  whtAmount:    number;
  netPayable:   number;
}

export function calculateInvoice(input: GSTInput): GSTResult {
  const { items, gstType, gstRate, whtApplicable, whtRate } = input;

  // Step 1: Calculate each line item amount
  const itemAmounts = items.map(item =>
    roundPKR(item.quantity * item.unitPrice)
  );

  // Step 2: Subtotal = sum of all item amounts
  const subtotal = roundPKR(itemAmounts.reduce((acc, amt) => acc + amt, 0));

  // Step 3: GST amount
  let gstAmount = 0;
  if (gstType === 'standard') {
    gstAmount = roundPKR(subtotal * (gstRate / 100));
  }
  // zero_rated and exempt both result in gstAmount = 0

  // Step 4: Total
  const total = roundPKR(subtotal + gstAmount);

  // Step 5: WHT amount (applied on subtotal, not total)
  const whtAmount = whtApplicable
    ? roundPKR(subtotal * (whtRate / 100))
    : 0;

  // Step 6: Net payable
  const netPayable = roundPKR(total - whtAmount);

  return {
    itemAmounts,
    subtotal,
    gstAmount,
    total,
    whtAmount,
    netPayable,
  };
}

// Round to 2 decimal places — avoids floating point issues in PKR amounts
function roundPKR(amount: number): number {
  return Math.round(amount * 100) / 100;
}

// Validate that a GST rate makes sense for the given type
export function validateGSTRate(gstType: GSTType, gstRate: number): string | null {
  if (gstType === 'zero_rated' && gstRate !== 0) {
    return 'GST rate must be 0 for zero-rated invoices.';
  }
  if (gstType === 'standard' && (gstRate < 0 || gstRate > 100)) {
    return 'GST rate must be between 0 and 100.';
  }
  return null; // null = valid
}

// Format PKR amount for display — e.g. 117000 → "PKR 1,17,000"
export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style:    'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format USD amount for display
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
}
```

---

## How Frontend Uses It (Live Calculation)

The frontend calls `calculateInvoice()` every time the user changes a quantity, unit price, GST type, or WHT toggle. The result updates the totals sidebar in real time — no API call needed for this.

```typescript
// In InvoiceForm component — runs on every relevant input change
import { calculateInvoice } from '@/lib/gst';

const result = calculateInvoice({
  items:         formItems,       // from form state
  gstType:       selectedGstType,
  gstRate:       gstRate,
  whtApplicable: whtToggle,
  whtRate:       whtRate,
});

// Update UI display
setSubtotal(result.subtotal);
setGstAmount(result.gstAmount);
setTotal(result.total);
setNetPayable(result.netPayable);
```

---

## How Backend Uses It (Server-Side Validation)

The backend **never trusts** the totals sent by the frontend. It always recalculates using the same `calculateInvoice()` function and saves only the server-calculated values.

```typescript
// In POST /api/invoices and PUT /api/invoices/:id
import { calculateInvoice, validateGSTRate } from '@/lib/gst';

// Validate GST rate makes sense
const gstError = validateGSTRate(body.gstType, body.gstRate ?? 17);
if (gstError) {
  console.log(`[POST /api/invoices] GST validation failed: ${gstError}`);
  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message: gstError, status: 422 } },
    { status: 422 }
  );
}

// Recalculate server-side — ignore any totals from the request body
const calculated = calculateInvoice({
  items:         body.items,
  gstType:       body.gstType,
  gstRate:       body.gstRate ?? 17,
  whtApplicable: body.whtApplicable ?? false,
  whtRate:       body.whtRate ?? 0,
});

console.log(`[POST /api/invoices] Calculated | subtotal: ${calculated.subtotal} | gstAmount: ${calculated.gstAmount} | total: ${calculated.total}`);

// Save the server-calculated values into MongoDB
const invoice = await Invoice.create({
  ...body,
  subtotal:   calculated.subtotal,
  gstAmount:  calculated.gstAmount,
  total:      calculated.total,
  whtAmount:  calculated.whtAmount,
  netPayable: calculated.netPayable,
  // also save per-item amounts
  items: body.items.map((item, i) => ({
    ...item,
    amount: calculated.itemAmounts[i],
  })),
});
```

---

## Jest Tests — `__tests__/gst.test.ts`

```typescript
import { calculateInvoice, validateGSTRate } from '@/lib/gst';

describe('calculateInvoice', () => {

  it('calculates standard GST correctly', () => {
    const result = calculateInvoice({
      items: [{ quantity: 1, unitPrice: 100000 }],
      gstType: 'standard',
      gstRate: 17,
      whtApplicable: false,
      whtRate: 0,
    });
    expect(result.subtotal).toBe(100000);
    expect(result.gstAmount).toBe(17000);
    expect(result.total).toBe(117000);
    expect(result.netPayable).toBe(117000);
  });

  it('calculates zero-rated GST correctly', () => {
    const result = calculateInvoice({
      items: [{ quantity: 80, unitPrice: 25 }],
      gstType: 'zero_rated',
      gstRate: 0,
      whtApplicable: false,
      whtRate: 0,
    });
    expect(result.gstAmount).toBe(0);
    expect(result.total).toBe(2000);
  });

  it('applies WHT on subtotal not total', () => {
    const result = calculateInvoice({
      items: [{ quantity: 1, unitPrice: 100000 }],
      gstType: 'standard',
      gstRate: 17,
      whtApplicable: true,
      whtRate: 3,
    });
    expect(result.whtAmount).toBe(3000);       // 3% of 100,000 (subtotal)
    expect(result.netPayable).toBe(114000);    // 117,000 - 3,000
  });

  it('handles multiple line items', () => {
    const result = calculateInvoice({
      items: [
        { quantity: 1, unitPrice: 100000 },
        { quantity: 2, unitPrice: 25000 },
      ],
      gstType: 'standard',
      gstRate: 17,
      whtApplicable: true,
      whtRate: 3,
    });
    expect(result.subtotal).toBe(150000);
    expect(result.gstAmount).toBe(25500);
    expect(result.total).toBe(175500);
    expect(result.whtAmount).toBe(4500);
    expect(result.netPayable).toBe(171000);
  });

  it('returns zero gstAmount for exempt type', () => {
    const result = calculateInvoice({
      items: [{ quantity: 1, unitPrice: 50000 }],
      gstType: 'exempt',
      gstRate: 17,
      whtApplicable: false,
      whtRate: 0,
    });
    expect(result.gstAmount).toBe(0);
    expect(result.total).toBe(50000);
  });

});

describe('validateGSTRate', () => {

  it('returns error if zero_rated type has non-zero rate', () => {
    expect(validateGSTRate('zero_rated', 17)).not.toBeNull();
  });

  it('returns null for valid standard rate', () => {
    expect(validateGSTRate('standard', 17)).toBeNull();
  });

});
```

---

## FBR Reference Rates (as of 2026)

| Category | GST Rate |
|---|---|
| Standard goods and services | 17% |
| IT and software export services | 0% (zero-rated) |
| Essential food items | Exempt |
| Pharmaceuticals | Exempt |
| WHT on IT services (corporate clients) | 3% |
| WHT on other services | 6-10% (varies) |

> Always confirm current rates at [fbr.gov.pk](https://www.fbr.gov.pk) — rates can change with the annual federal budget.

---

*Last updated: June 2026 | lib/gst.ts is a shared file — discuss changes with both developers*
