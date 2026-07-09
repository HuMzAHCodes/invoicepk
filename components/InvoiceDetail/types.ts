export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  status: "draft" | "sent" | "paid";
  currency: "PKR" | "USD";
  issueDate: string;
  dueDate?: string | null;
  gstType: string;
  gstRate: number;
  subtotal: number;
  gstAmount: number;
  total: number;
  whtApplicable: boolean;
  whtRate: number;
  whtAmount: number;
  netPayable: number;
  notes?: string | null;
  client?: { id: string; name: string; email?: string; address?: string; ntn?: string } | null;
  items: { description: string; quantity: number; unitPrice: number; amount: number }[];
}



// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Defines the shared invoice data contract used throughout the invoice
//   details and related UI components.
// • Models complete invoice information including identifiers, lifecycle
//   status, issue and due dates, currency, tax configuration, calculated
//   financial totals, client details, notes, and line items.
// • Supports optional client and due date information, allowing invoices to
//   exist independently of an associated client while preserving type safety.
// • Includes all GST and WHT fields required for displaying tax calculations
//   and net payable amounts across the application.
// • Provides strongly typed line item definitions containing descriptions,
//   quantities, unit prices, and calculated amounts.
// • Enables consistent TypeScript validation and reliable data sharing between
//   API responses, page components, and reusable invoice-related modules.
// ─────────────────────────────────────────────────────────────────────────────