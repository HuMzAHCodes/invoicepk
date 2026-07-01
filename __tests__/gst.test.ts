// __tests__/gst.test.ts
// Tests for the shared GST calculation logic in lib/gst.ts
// Run with: npm test

import { calculateInvoice, validateGSTRate } from '@/lib/gst';

describe('calculateInvoice', () => {

  it('calculates standard GST correctly', () => {
    const result = calculateInvoice({
      items:         [{ quantity: 1, unitPrice: 100000 }],
      gstType:       'standard',
      gstRate:       17,
      whtApplicable: false,
      whtRate:       0,
    });
    expect(result.subtotal).toBe(100000);
    expect(result.gstAmount).toBe(17000);
    expect(result.total).toBe(117000);
    expect(result.netPayable).toBe(117000);
  });

  it('calculates zero-rated GST correctly', () => {
    const result = calculateInvoice({
      items:         [{ quantity: 80, unitPrice: 25 }],
      gstType:       'zero_rated',
      gstRate:       0,
      whtApplicable: false,
      whtRate:       0,
    });
    expect(result.gstAmount).toBe(0);
    expect(result.total).toBe(2000);
  });

  it('applies WHT on subtotal not total', () => {
    const result = calculateInvoice({
      items:         [{ quantity: 1, unitPrice: 100000 }],
      gstType:       'standard',
      gstRate:       17,
      whtApplicable: true,
      whtRate:       3,
    });
    expect(result.whtAmount).toBe(3000);    // 3% of 100,000 (subtotal)
    expect(result.netPayable).toBe(114000); // 117,000 - 3,000
  });

  it('handles multiple line items', () => {
    const result = calculateInvoice({
      items: [
        { quantity: 1, unitPrice: 100000 },
        { quantity: 2, unitPrice: 25000 },
      ],
      gstType:       'standard',
      gstRate:       17,
      whtApplicable: true,
      whtRate:       3,
    });
    expect(result.subtotal).toBe(150000);
    expect(result.gstAmount).toBe(25500);
    expect(result.total).toBe(175500);
    expect(result.whtAmount).toBe(4500);
    expect(result.netPayable).toBe(171000);
  });

  it('returns zero gstAmount for exempt type', () => {
    const result = calculateInvoice({
      items:         [{ quantity: 1, unitPrice: 50000 }],
      gstType:       'exempt',
      gstRate:       17,
      whtApplicable: false,
      whtRate:       0,
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
















/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Verifies the correctness of the shared GST calculation utilities.
| - Ensures invoice financial calculations remain accurate as the application
|   evolves.
|
| Responsibilities:
| - Tests invoice subtotal, GST, total, WHT, and net payable calculations.
| - Validates different GST scenarios, including standard, zero-rated, and
|   exempt invoices.
| - Confirms withholding tax (WHT) is calculated according to business rules.
| - Verifies calculations involving multiple invoice line items.
| - Tests GST rate validation for both valid and invalid inputs.
| - Helps prevent regressions by automatically validating calculation logic.
|
*/