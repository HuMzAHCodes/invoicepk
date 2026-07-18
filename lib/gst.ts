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
  const itemAmounts = items.map((item) =>
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

// Next FBR sales tax return deadline — the 15th of the month following the
// current one. If today is on/before the 15th, the deadline is this month's 15th.
export function getNextGstDeadline(now: Date = new Date()): Date {
  const deadline = new Date(now.getFullYear(), now.getMonth(), 15);
  if (now.getDate() > 15) {
    deadline.setMonth(deadline.getMonth() + 1);
  }
  deadline.setHours(0, 0, 0, 0);
  return deadline;
}




/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Provides shared utility functions for invoice financial calculations.
| - Ensures both frontend and backend use identical business logic for
|   invoice totals and tax computations.
|
| Responsibilities:
| - Calculates invoice item amounts, subtotal, GST, WHT, total amount,
|   and net payable.
| - Applies GST rules based on the selected GST type.
| - Calculates withholding tax (WHT) when applicable.
| - Rounds monetary values to maintain financial accuracy.
| - Validates GST rates according to business rules.
| - Formats PKR and USD amounts for display in the user interface and PDFs.
| - Exports reusable calculation and formatting utilities for use across
|   the application.
|
*/