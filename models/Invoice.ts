// models/Invoice.ts
// Core invoice document. Line items are embedded as a subdocument array —
// no separate collection needed.

import mongoose, { Schema, Document, Model } from 'mongoose';

// --- Embedded sub-schema: Invoice Line Item ---
export interface IInvoiceItem {
  description: string;
  quantity:    number;
  unitPrice:   number;
  amount:      number;   // Always: quantity × unitPrice (calculated server-side)
  sortOrder:   number;   // For display ordering in PDF
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true, trim: true },
    quantity:    { type: Number, required: true, min: 0 },
    unitPrice:   { type: Number, required: true, min: 0 },
    amount:      { type: Number, required: true, min: 0 },
    sortOrder:   { type: Number, default: 0 },
  },
  { _id: true }
);

// --- Main Invoice Schema ---
export interface IInvoice extends Document {
  businessId:    mongoose.Types.ObjectId;
  clientId?:     mongoose.Types.ObjectId;
  invoiceNumber: string;              // e.g. "INV-001"
  status:        'draft' | 'sent' | 'paid';
  issueDate:     Date;
  dueDate?:      Date;
  currency:      'PKR' | 'USD';
  gstType:       'standard' | 'zero_rated' | 'exempt';
  gstRate:       number;              // e.g. 17 (percent)
  subtotal:      number;              // Sum of all item.amount values
  gstAmount:     number;              // Calculated server-side
  total:         number;              // subtotal + gstAmount
  whtApplicable: boolean;
  whtRate:       number;              // e.g. 3 (percent)
  whtAmount:     number;              // Calculated server-side
  netPayable:    number;              // total - whtAmount
  notes?:        string;
  pdfUrl?:       string;              // Cloudinary URL — set after PDF saved
  items:         IInvoiceItem[];
  lastReminderSentAt?: Date;          // Set when an overdue payment reminder was last emailed
  reminderCount: number;              // Count of reminders sent so far (drives cadence in lib/reminders.ts)
  createdAt:     Date;
  updatedAt:     Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    businessId:    { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    clientId:      { type: Schema.Types.ObjectId, ref: 'Client', default: null },
    invoiceNumber: { type: String, required: true, trim: true },
    status:        { type: String, enum: ['draft', 'sent', 'paid'], default: 'draft' },
    issueDate:     { type: Date, required: true },
    dueDate:       { type: Date, default: null },
    currency:      { type: String, enum: ['PKR', 'USD'], default: 'PKR' },
    gstType:       { type: String, enum: ['standard', 'zero_rated', 'exempt'], default: 'standard' },
    gstRate:       { type: Number, default: 17, min: 0, max: 100 },
    subtotal:      { type: Number, default: 0, min: 0 },
    gstAmount:     { type: Number, default: 0, min: 0 },
    total:         { type: Number, default: 0, min: 0 },
    whtApplicable: { type: Boolean, default: false },
    whtRate:       { type: Number, default: 0, min: 0, max: 100 },
    whtAmount:     { type: Number, default: 0, min: 0 },
    netPayable:    { type: Number, default: 0, min: 0 },
    notes:         { type: String, trim: true, default: null },
    pdfUrl:        { type: String, default: null },
    items:         { type: [InvoiceItemSchema], default: [] },
    lastReminderSentAt: { type: Date, default: null },
    reminderCount:      { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Compound unique index: invoice numbers are unique per business, not globally
InvoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });

// Additional indexes for common query patterns
InvoiceSchema.index({ businessId: 1, status: 1 });
InvoiceSchema.index({ businessId: 1, createdAt: -1 });

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);







export default Invoice;

/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Defines the Invoice model for the application.
| - Represents invoices created by a business, including embedded line items.
|
| Responsibilities:
| - Stores complete invoice details, including client information, invoice
|   status, dates, currency, taxation, totals, notes, and PDF reference.
| - Embeds invoice line items within the invoice document for efficient
|   storage and retrieval.
| - Supports server-calculated financial values such as subtotal, GST,
|   withholding tax (WHT), total amount, and net payable.
| - Ensures invoice numbers are unique within each business.
| - Creates indexes to optimize common invoice queries by business, status,
|   and creation date.
| - Automatically maintains createdAt and updatedAt timestamps.
| - Exports the Invoice model for use throughout the application in invoice
|   creation, retrieval, updating, deletion, and PDF generation workflows.
|
*/