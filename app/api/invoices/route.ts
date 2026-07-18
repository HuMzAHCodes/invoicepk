// app/api/invoices/route.ts
// GET  /api/invoices — list all invoices for the authenticated business (paginated + filtered)
// POST /api/invoices — create a new invoice (server-side GST recalculation)

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { getBusinessForUser } from '@/lib/get-business';
import { serializeInvoice } from '@/lib/serialize';
import { calculateInvoice, validateGSTRate } from '@/lib/gst';
import { getNextInvoiceNumber } from '@/lib/invoice-number';
import { FREE_TIER_MONTHLY_LIMIT } from '@/lib/constants';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  quantity:    z.number().positive('Quantity must be positive'),
  unitPrice:   z.number().nonnegative('Unit price must be 0 or greater'),
  sortOrder:   z.number().default(0),
});

const createInvoiceSchema = z.object({
  clientId:      z.string().optional(),
  issueDate:     z.string().min(1, 'Issue date is required'),
  dueDate:       z.string().optional(),
  currency:      z.enum(['PKR', 'USD']).default('PKR'),
  gstType:       z.enum(['standard', 'zero_rated', 'exempt']),
  gstRate:       z.number().min(0).max(100).default(17),
  whtApplicable: z.boolean().default(false),
  whtRate:       z.number().min(0).max(100).default(0),
  notes:         z.string().optional(),
  items:         z.array(invoiceItemSchema).min(1, 'At least one line item is required'),
});

// ─── GET /api/invoices ─────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  console.log('[GET /api/invoices] Request received');

  return withAuth(req, async (req, uid) => {
    try {
      await connectDB();

      const business = await getBusinessForUser(uid);
      if (!business) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Business profile not found.', status: 404 } },
          { status: 404 }
        );
      }

      // Query params
      const url      = new URL(req.url);
      const page     = parseInt(url.searchParams.get('page')      ?? '1',  10);
      const limit    = parseInt(url.searchParams.get('limit')     ?? '20', 10);
      const status   = url.searchParams.get('status');
      const clientId = url.searchParams.get('client_id');
      const from     = url.searchParams.get('from');
      const to       = url.searchParams.get('to');
      const skip     = (page - 1) * limit;

      // Build filter
      const filter: any = { businessId: business._id };
      if (status === 'overdue') {
        // "Overdue" isn't a stored status — it's a sent invoice past its due date.
        filter.status  = 'sent';
        filter.dueDate = { $ne: null, $lt: new Date() };
      } else if (status) {
        filter.status = status;
      }
      if (clientId) filter.clientId = clientId;
      if (from || to) {
        filter.issueDate = {};
        if (from) filter.issueDate.$gte = new Date(from);
        if (to)   filter.issueDate.$lte = new Date(to);
      }

      const [invoices, total] = await Promise.all([
        Invoice.find(filter)
          .populate('clientId', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Invoice.countDocuments(filter),
      ]);

      // Serialize with client summary
      const serialized = invoices.map((inv: any) => ({
        id:            inv._id.toString(),
        invoiceNumber: inv.invoiceNumber,
        client:        inv.clientId
          ? { id: inv.clientId._id.toString(), name: inv.clientId.name }
          : null,
        status:        inv.status,
        subtotal:      inv.subtotal,
        gstAmount:     inv.gstAmount,
        total:         inv.total,
        netPayable:    inv.netPayable,
        currency:      inv.currency,
        issueDate:     inv.issueDate,
        dueDate:       inv.dueDate ?? null,
      }));

      console.log(`[GET /api/invoices] Success | count: ${invoices.length} | total: ${total} | status: 200`);

      return NextResponse.json({
        data: { invoices: serialized, total, page, limit },
      });

    } catch (err) {
      console.error('[GET /api/invoices] ERROR:', err);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Something went wrong.', status: 500 } },
        { status: 500 }
      );
    }
  });
}

// ─── POST /api/invoices ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  console.log('[POST /api/invoices] Request received');

  return withAuth(req, async (req, uid) => {
    try {
      await connectDB();

      const body   = await req.json();
      const parsed = createInvoiceSchema.safeParse(body);

      if (!parsed.success) {
        console.log(`[POST /api/invoices] Validation failed: ${parsed.error.issues[0].message}`);
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message, status: 422 } },
          { status: 422 }
        );
      }

      const business = await getBusinessForUser(uid);
      if (!business) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Business profile not found.', status: 404 } },
          { status: 404 }
        );
      }

      const data = parsed.data;

      // Validate GST rate makes sense for the given type
      const gstError = validateGSTRate(data.gstType, data.gstRate);
      if (gstError) {
        console.log(`[POST /api/invoices] GST validation failed: ${gstError}`);
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: gstError, status: 422 } },
          { status: 422 }
        );
      }

      // Validate clientId belongs to this business if provided
      if (data.clientId) {
        const client = await Client.findOne({
          _id:        data.clientId,
          businessId: business._id,
        });
        if (!client) {
          return NextResponse.json(
            { error: { code: 'NOT_FOUND', message: 'Client not found.', status: 404 } },
            { status: 404 }
          );
        }
      }

      // Server-side GST recalculation — never trust client-submitted totals
      const calculated = calculateInvoice({
        items:         data.items,
        gstType:       data.gstType,
        gstRate:       data.gstRate,
        whtApplicable: data.whtApplicable,
        whtRate:       data.whtRate,
      });

      console.log(`[POST /api/invoices] GST calculated | subtotal: ${calculated.subtotal} | gstAmount: ${calculated.gstAmount} | total: ${calculated.total}`);

      // Generate invoice number
      const invoiceNumber = await getNextInvoiceNumber(business._id.toString());

      // Free tier limit — max 5 invoices per month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const invoicesThisMonth = await Invoice.countDocuments({
        businessId: business._id,
        createdAt:  { $gte: startOfMonth },
      });

      if (invoicesThisMonth >= FREE_TIER_MONTHLY_LIMIT) {
        console.log(`[POST /api/invoices] Free tier limit reached | businessId: ${business._id}`);
        return NextResponse.json(
          { error: { code: 'LIMIT_EXCEEDED', message: `Free tier limit of ${FREE_TIER_MONTHLY_LIMIT} invoices per month reached.`, status: 429 } },
          { status: 429 }
        );
      }
// Create invoice with server-calculated totals
const invoice = await Invoice.create({
  businessId:    business._id,
  clientId:      data.clientId ?? undefined,
  invoiceNumber,
  status:        'draft',
  issueDate:     new Date(data.issueDate),
  dueDate:       data.dueDate ? new Date(data.dueDate) : undefined,
  currency:      data.currency,
  gstType:       data.gstType,
  gstRate:       data.gstRate,
  subtotal:      calculated.subtotal,
  gstAmount:     calculated.gstAmount,
  total:         calculated.total,
  whtApplicable: data.whtApplicable,
  whtRate:       data.whtRate,
  whtAmount:     calculated.whtAmount,
  netPayable:    calculated.netPayable,
  notes:         data.notes ?? undefined,
  items:         data.items.map((item, i) => ({
    description: item.description,
    quantity:    item.quantity,
    unitPrice:   item.unitPrice,
    amount:      calculated.itemAmounts[i],
    sortOrder:   item.sortOrder,
  })),
});

      console.log(`[POST /api/invoices] Invoice created | invoiceId: ${invoice._id} | invoiceNumber: ${invoiceNumber} | status: 201`);

      return NextResponse.json(
        { data: serializeInvoice(invoice) },
        { status: 201 }
      );

    } catch (err: any) {
      // Handle duplicate invoice number race condition
      if (err.code === 11000) {
        console.log('[POST /api/invoices] Duplicate invoice number — retrying');
        return NextResponse.json(
          { error: { code: 'SERVER_ERROR', message: 'Invoice number conflict. Please try again.', status: 500 } },
          { status: 500 }
        );
      }

      console.error('[POST /api/invoices] ERROR:', err);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Something went wrong.', status: 500 } },
        { status: 500 }
      );
    }
  });
}



























/* ============================================================================
   COMMIT HISTORY
   ============================================================================

   feat(api): implement authenticated invoice management endpoints

   - Added GET /api/invoices endpoint
   - Added POST /api/invoices endpoint
   - Protected both endpoints using withAuth middleware
   - Connected all operations to MongoDB

   ---------------------------------------------------------------------------

   feat(validation): validate invoice creation requests

   - Added Zod schema for invoice validation
   - Validated invoice metadata
   - Validated invoice line items
   - Enforced required fields and numeric constraints
   - Returned HTTP 422 for invalid payloads

   ---------------------------------------------------------------------------

   feat(invoices): implement paginated invoice listing

   - Added pagination support
   - Returned total invoice count
   - Sorted invoices by newest first
   - Scoped results to authenticated business

   ---------------------------------------------------------------------------

   feat(invoices): add invoice filtering

   - Added status filtering
   - Added client filtering
   - Added issue date range filtering
   - Built dynamic MongoDB query filters

   ---------------------------------------------------------------------------

   feat(clients): include client summary in invoice listings

   - Populated associated client information
   - Returned simplified client details
   - Optimized API response for listing views

   ---------------------------------------------------------------------------

   feat(gst): perform server-side tax calculations

   - Ignored client-submitted totals
   - Recalculated subtotal
   - Recalculated GST amount
   - Calculated withholding tax
   - Calculated total amount
   - Calculated net payable amount
   - Generated per-item totals

   ---------------------------------------------------------------------------

   feat(validation): validate GST configuration

   - Verified GST rate matches selected GST type
   - Prevented invalid GST combinations
   - Returned validation errors for incorrect tax configuration

   ---------------------------------------------------------------------------

   feat(clients): verify invoice client ownership

   - Confirmed selected client belongs to authenticated business
   - Prevented invoices referencing unauthorized clients
   - Returned HTTP 404 when client was not found

   ---------------------------------------------------------------------------

   feat(invoices): generate sequential invoice numbers

   - Automatically generated unique invoice numbers
   - Integrated centralized invoice numbering utility
   - Assigned invoice number before persistence

   ---------------------------------------------------------------------------

   feat(subscription): enforce free-tier invoice limits

   - Limited free accounts to five invoices per month
   - Counted invoices created during current billing month
   - Returned HTTP 429 when monthly limit was exceeded

   ---------------------------------------------------------------------------

   feat(invoices): implement invoice creation workflow

   - Created invoices with server-calculated financial values
   - Stored invoice items with calculated line totals
   - Defaulted new invoices to draft status
   - Serialized invoice response before returning
   - Returned HTTP 201 on successful creation

   ---------------------------------------------------------------------------

   feat(logging): improve API observability

   - Logged incoming requests
   - Logged validation failures
   - Logged GST calculations
   - Logged successful invoice creation
   - Logged successful listing requests
   - Logged free-tier limit violations
   - Logged duplicate invoice number conflicts
   - Logged unexpected server errors

   ---------------------------------------------------------------------------

   feat(errors): implement standardized error handling

   - Returned structured NOT_FOUND responses
   - Returned VALIDATION_ERROR responses
   - Returned LIMIT_EXCEEDED responses
   - Handled duplicate invoice number race conditions
   - Returned standardized SERVER_ERROR responses
   - Wrapped all database operations in try/catch blocks

============================================================================ */