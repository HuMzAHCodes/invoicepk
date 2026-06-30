// lib/invoice-number.ts
// Invoice numbers are generated in the application layer (not DB auto-increment)
// to allow custom prefixes in Phase 2.
// Race condition note: if two invoices are created simultaneously, the compound
// unique index on { businessId, invoiceNumber } will reject the duplicate.
// Catch error code 11000 in the API route and retry with the next number.

import Invoice from '@/models/Invoice';

export async function getNextInvoiceNumber(businessId: string): Promise<string> {
  console.log(`[invoice-number] Generating next number for businessId: ${businessId}`);

  const lastInvoice = await Invoice.findOne(
    { businessId },
    { invoiceNumber: 1 },
    { sort: { createdAt: -1 } }
  );

  if (!lastInvoice) {
    console.log('[invoice-number] No previous invoices — starting at INV-001');
    return 'INV-001';
  }

  const lastNum = parseInt(lastInvoice.invoiceNumber.split('-')[1], 10);
  const next = `INV-${String(lastNum + 1).padStart(3, '0')}`;
  console.log(`[invoice-number] Next number: ${next}`);
  return next;
}





/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Generates the next available invoice number for a business.
| - Ensures invoice numbers follow a consistent sequential format.
|
| Responsibilities:
| - Retrieves the most recently created invoice for a business.
| - Determines the next sequential invoice number.
| - Starts numbering from "INV-001" when no previous invoices exist.
| - Supports custom invoice numbering strategies in future application phases.
| - Relies on the database's unique constraint to prevent duplicate invoice
|   numbers during concurrent invoice creation.
| - Exports a reusable utility for invoice number generation across the
|   application.
|
*/