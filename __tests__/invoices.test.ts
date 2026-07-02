// __tests__/invoices.test.ts
// Integration tests for Invoice model — runs against real Atlas test database.
// Make sure MONGODB_TEST_URI is set in .env.local before running.
// Run with: npm test

import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Invoice from '@/models/Invoice';
import Business from '@/models/Business';
import Client from '@/models/Client';
import { calculateInvoice } from '@/lib/gst';

let businessId: mongoose.Types.ObjectId;
let clientId: mongoose.Types.ObjectId;
let invoiceId: string;

beforeAll(async () => {
  await connectDB();

  // Clean up
  await Business.deleteMany({ userId: 'test-invoice-uid' });

  // Create test business
  const business = await Business.create({
    userId:         'test-invoice-uid',
    name:           'Test Business for Invoices',
    defaultGstRate: 17,
    currency:       'PKR',
  });
  businessId = business._id as mongoose.Types.ObjectId;

  // Create test client
  const client = await Client.create({
    businessId,
    name:        'Test Client for Invoices',
    isCorporate: true,
  });
  clientId = client._id as mongoose.Types.ObjectId;
});

afterAll(async () => {
  await Invoice.deleteMany({ businessId });
  await Client.deleteMany({ businessId });
  await Business.deleteMany({ userId: 'test-invoice-uid' });
  await mongoose.disconnect();
});

describe('Invoice Model', () => {

  it('creates a standard GST invoice correctly', async () => {
    const calculated = calculateInvoice({
      items:         [{ quantity: 1, unitPrice: 100000 }],
      gstType:       'standard',
      gstRate:       17,
      whtApplicable: true,
      whtRate:       3,
    });

    const invoice = await Invoice.create({
      businessId,
      clientId,
      invoiceNumber: 'INV-TEST-001',
      status:        'draft',
      issueDate:     new Date('2026-07-01'),
      currency:      'PKR',
      gstType:       'standard',
      gstRate:       17,
      subtotal:      calculated.subtotal,
      gstAmount:     calculated.gstAmount,
      total:         calculated.total,
      whtApplicable: true,
      whtRate:       3,
      whtAmount:     calculated.whtAmount,
      netPayable:    calculated.netPayable,
      items: [
        {
          description: 'Web Development',
          quantity:    1,
          unitPrice:   100000,
          amount:      100000,
          sortOrder:   0,
        },
      ],
    });

    invoiceId = invoice._id.toString();

    expect(invoice.invoiceNumber).toBe('INV-TEST-001');
    expect(invoice.subtotal).toBe(100000);
    expect(invoice.gstAmount).toBe(17000);
    expect(invoice.total).toBe(117000);
    expect(invoice.whtAmount).toBe(3000);
    expect(invoice.netPayable).toBe(114000);
    expect(invoice.status).toBe('draft');
  });

  it('creates a zero-rated GST invoice correctly', async () => {
    const calculated = calculateInvoice({
      items:         [{ quantity: 80, unitPrice: 25 }],
      gstType:       'zero_rated',
      gstRate:       0,
      whtApplicable: false,
      whtRate:       0,
    });

    const invoice = await Invoice.create({
      businessId,
      invoiceNumber: 'INV-TEST-002',
      status:        'draft',
      issueDate:     new Date('2026-07-01'),
      currency:      'USD',
      gstType:       'zero_rated',
      gstRate:       0,
      subtotal:      calculated.subtotal,
      gstAmount:     calculated.gstAmount,
      total:         calculated.total,
      whtApplicable: false,
      whtRate:       0,
      whtAmount:     calculated.whtAmount,
      netPayable:    calculated.netPayable,
      items: [
        {
          description: 'React Development',
          quantity:    80,
          unitPrice:   25,
          amount:      2000,
          sortOrder:   0,
        },
      ],
    });

    expect(invoice.gstAmount).toBe(0);
    expect(invoice.total).toBe(2000);
    expect(invoice.currency).toBe('USD');
  });

  it('fails to create invoice without required fields', async () => {
    await expect(
      Invoice.create({ businessId })
    ).rejects.toThrow();
  });

  it('enforces unique invoice number per business', async () => {
    await expect(
      Invoice.create({
        businessId,
        invoiceNumber: 'INV-TEST-001', // duplicate
        status:        'draft',
        issueDate:     new Date(),
        gstType:       'standard',
        items:         [],
      })
    ).rejects.toThrow();
  });

  it('fetches invoices by businessId', async () => {
    const invoices = await Invoice.find({ businessId });
    expect(invoices.length).toBeGreaterThanOrEqual(2);
  });

  it('updates invoice status from draft to sent', async () => {
    const updated = await Invoice.findByIdAndUpdate(
      invoiceId,
      { status: 'sent' },
      { new: true }
    );
    expect(updated?.status).toBe('sent');
  });

  it('deletes an invoice successfully', async () => {
    await Invoice.findByIdAndDelete(invoiceId);
    const deleted = await Invoice.findById(invoiceId);
    expect(deleted).toBeNull();
  });

});






/* ============================================================================
   COMMIT HISTORY
   ============================================================================

   test(invoices): add integration test suite for Invoice model

   - Created integration tests using the MongoDB Atlas test database
   - Configured isolated test environment
   - Verified complete invoice lifecycle operations

   ---------------------------------------------------------------------------

   test(setup): initialize invoice testing environment

   - Connected to MongoDB before test execution
   - Removed existing test records
   - Created dedicated business fixture
   - Created associated client fixture
   - Reused generated IDs across test cases

   ---------------------------------------------------------------------------

   test(cleanup): remove invoice test data

   - Deleted invoice test records
   - Removed associated client records
   - Removed test business
   - Closed MongoDB connection after test execution

   ---------------------------------------------------------------------------

   test(invoices): verify standard GST invoice creation

   - Generated invoice using GST calculation utility
   - Verified subtotal calculation
   - Verified GST amount
   - Verified total amount
   - Verified withholding tax calculation
   - Verified net payable amount
   - Verified draft status assignment

   ---------------------------------------------------------------------------

   test(invoices): verify zero-rated invoice calculations

   - Tested zero-rated GST invoices
   - Confirmed zero GST amount
   - Verified total calculation
   - Verified multi-currency invoice support

   ---------------------------------------------------------------------------

   test(validation): verify required model constraints

   - Confirmed invoice creation fails with missing required fields
   - Verified Mongoose schema validation

   ---------------------------------------------------------------------------

   test(database): verify invoice number uniqueness

   - Confirmed duplicate invoice numbers are rejected
   - Verified business-level unique constraint enforcement

   ---------------------------------------------------------------------------

   test(database): verify invoice retrieval

   - Queried invoices by businessId
   - Confirmed associated invoices are returned correctly

   ---------------------------------------------------------------------------

   test(invoices): verify invoice updates

   - Updated invoice status
   - Confirmed modified values persisted
   - Verified draft-to-sent workflow

   ---------------------------------------------------------------------------

   test(invoices): verify invoice deletion

   - Deleted invoice by ID
   - Confirmed document removal
   - Verified lookup returns null after deletion

   ---------------------------------------------------------------------------

   test(coverage): validate invoice model behavior

   - Covered Create operation
   - Covered Read operation
   - Covered Update operation
   - Covered Delete operation
   - Verified GST calculations
   - Verified unique invoice numbering
   - Verified business associations
   - Verified model validation rules

============================================================================ */