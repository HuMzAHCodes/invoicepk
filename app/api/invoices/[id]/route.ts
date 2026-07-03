// app/api/invoices/[id]/route.ts
// GET    /api/invoices/:id — get a single invoice with client info
// PUT    /api/invoices/:id — update a draft invoice (totals recalculated server-side)
// DELETE /api/invoices/:id — delete a draft invoice

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { getBusinessForUser } from '@/lib/get-business';
import { checkOwnership } from '@/lib/ownership';
import { serializeInvoice } from '@/lib/serialize';
import { calculateInvoice, validateGSTRate } from '@/lib/gst';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';

const updateInvoiceSchema = z.object({
  clientId:      z.string().optional(),
  issueDate:     z.string().optional(),
  dueDate:       z.string().optional(),
  currency:      z.enum(['PKR', 'USD']).optional(),
  gstType:       z.enum(['standard', 'zero_rated', 'exempt']).optional(),
  gstRate:       z.number().min(0).max(100).optional(),
  whtApplicable: z.boolean().optional(),
  whtRate:       z.number().min(0).max(100).optional(),
  notes:         z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity:    z.number().positive(),
    unitPrice:   z.number().nonnegative(),
    sortOrder:   z.number().default(0),
  })).min(1).optional(),
});

// ─── GET /api/invoices/:id ─────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[GET /api/invoices/${id}] Request received`);

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

      const invoice = await Invoice.findById(id).populate('clientId', 'name email address ntn');

      const ownershipError = checkOwnership(invoice, business._id.toString());
      if (ownershipError) return ownershipError;

      // Build full response with client info
      const inv = invoice as any;
      const response = {
        ...serializeInvoice(inv),
        client: inv.clientId
          ? {
              id:      inv.clientId._id.toString(),
              name:    inv.clientId.name,
              email:   inv.clientId.email ?? null,
              address: inv.clientId.address ?? null,
              ntn:     inv.clientId.ntn ?? null,
            }
          : null,
      };

      console.log(`[GET /api/invoices/${id}] Success | status: 200`);
      return NextResponse.json({ data: response });

    } catch (err) {
      console.error(`[GET /api/invoices/${id}] ERROR:`, err);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Something went wrong.', status: 500 } },
        { status: 500 }
      );
    }
  });
}

// ─── PUT /api/invoices/:id ─────────────────────────────────────────────────

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[PUT /api/invoices/${id}] Request received`);

  return withAuth(req, async (req, uid) => {
    try {
      await connectDB();

      const body   = await req.json();
      const parsed = updateInvoiceSchema.safeParse(body);

      if (!parsed.success) {
        console.log(`[PUT /api/invoices/${id}] Validation failed: ${parsed.error.issues[0].message}`);
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

      const invoice = await Invoice.findById(id);

      const ownershipError = checkOwnership(invoice, business._id.toString());
      if (ownershipError) return ownershipError;

      // Only draft invoices can be edited
      if (invoice!.status !== 'draft') {
        console.log(`[PUT /api/invoices/${id}] Invoice locked | status: ${invoice!.status}`);
        return NextResponse.json(
          { error: { code: 'INVOICE_LOCKED', message: 'Cannot edit an invoice that has been sent or paid.', status: 409 } },
          { status: 409 }
        );
      }

      const data = parsed.data;

      // Validate clientId if provided
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

      // Recalculate totals if items or GST fields changed
      const gstType       = data.gstType       ?? invoice!.gstType;
      const gstRate       = data.gstRate       ?? invoice!.gstRate;
      const whtApplicable = data.whtApplicable ?? invoice!.whtApplicable;
      const whtRate       = data.whtRate       ?? invoice!.whtRate;
      const items         = data.items         ?? invoice!.items.map(i => ({
        description: i.description,
        quantity:    i.quantity,
        unitPrice:   i.unitPrice,
        sortOrder:   i.sortOrder,
      }));

      // Validate GST rate
      const gstError = validateGSTRate(gstType, gstRate);
      if (gstError) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: gstError, status: 422 } },
          { status: 422 }
        );
      }

      const calculated = calculateInvoice({
        items, gstType, gstRate, whtApplicable, whtRate,
      });

      // Apply updates
      Object.assign(invoice!, {
        ...data,
        clientId:   data.clientId   ?? invoice!.clientId,
        issueDate:  data.issueDate  ? new Date(data.issueDate) : invoice!.issueDate,
        dueDate:    data.dueDate    ? new Date(data.dueDate)   : invoice!.dueDate,
        gstType,
        gstRate,
        whtApplicable,
        whtRate,
        subtotal:   calculated.subtotal,
        gstAmount:  calculated.gstAmount,
        total:      calculated.total,
        whtAmount:  calculated.whtAmount,
        netPayable: calculated.netPayable,
        items:      items.map((item: any, i: number) => ({
          description: item.description,
          quantity:    item.quantity,
          unitPrice:   item.unitPrice,
          amount:      calculated.itemAmounts[i],
          sortOrder:   item.sortOrder,
        })),
      });

      await invoice!.save();

      console.log(`[PUT /api/invoices/${id}] Updated | status: 200`);
      return NextResponse.json({ data: serializeInvoice(invoice!) });

    } catch (err) {
      console.error(`[PUT /api/invoices/${id}] ERROR:`, err);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Something went wrong.', status: 500 } },
        { status: 500 }
      );
    }
  });
}

// ─── DELETE /api/invoices/:id ──────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[DELETE /api/invoices/${id}] Request received`);

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

      const invoice = await Invoice.findById(id);

      const ownershipError = checkOwnership(invoice, business._id.toString());
      if (ownershipError) return ownershipError;

      // Only draft invoices can be deleted
      if (invoice!.status !== 'draft') {
        console.log(`[DELETE /api/invoices/${id}] Invoice locked | status: ${invoice!.status}`);
        return NextResponse.json(
          { error: { code: 'INVOICE_LOCKED', message: 'Cannot delete an invoice that has been sent or paid.', status: 409 } },
          { status: 409 }
        );
      }

      await invoice!.deleteOne();

      console.log(`[DELETE /api/invoices/${id}] Deleted | status: 200`);
      return NextResponse.json({
        data: { message: 'Invoice deleted successfully.' },
      });

    } catch (err) {
      console.error(`[DELETE /api/invoices/${id}] ERROR:`, err);
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

   feat(api): implement authenticated invoice resource endpoints

   - Added GET /api/invoices/:id endpoint
   - Added PUT /api/invoices/:id endpoint
   - Added DELETE /api/invoices/:id endpoint
   - Protected all endpoints using withAuth middleware
   - Connected all operations to MongoDB

   ---------------------------------------------------------------------------

   feat(invoices): implement invoice retrieval

   - Retrieved individual invoices by ID
   - Populated associated client information
   - Returned complete invoice details
   - Included client summary in API response

   ---------------------------------------------------------------------------

   feat(validation): validate invoice update requests

   - Added Zod schema for partial invoice updates
   - Validated invoice metadata
   - Validated invoice line items
   - Supported partial updates while preserving existing values
   - Returned HTTP 422 for invalid request payloads

   ---------------------------------------------------------------------------

   feat(security): enforce business ownership

   - Verified authenticated business exists
   - Restricted access to owned invoices only
   - Prevented unauthorized retrieval, updates and deletions
   - Centralized ownership verification using checkOwnership()

   ---------------------------------------------------------------------------

   feat(invoices): protect finalized invoices

   - Restricted editing to draft invoices only
   - Restricted deletion to draft invoices only
   - Prevented modification of sent and paid invoices
   - Returned HTTP 409 when invoice is locked

   ---------------------------------------------------------------------------

   feat(clients): validate invoice client ownership

   - Verified updated client belongs to authenticated business
   - Prevented linking invoices to unauthorized clients
   - Returned HTTP 404 for invalid client references

   ---------------------------------------------------------------------------

   feat(gst): recalculate invoice totals on updates

   - Recalculated invoice totals server-side
   - Ignored client-calculated financial values
   - Recomputed subtotal, GST, withholding tax and net payable
   - Recalculated individual line item amounts
   - Validated GST configuration before saving updates

   ---------------------------------------------------------------------------

   feat(invoices): implement invoice update workflow

   - Applied partial invoice updates
   - Updated invoice dates and currency
   - Persisted recalculated financial values
   - Returned serialized invoice response

   ---------------------------------------------------------------------------

   feat(invoices): implement draft invoice deletion

   - Deleted invoices after ownership verification
   - Restricted deletion to editable invoices
   - Returned standardized success response

   ---------------------------------------------------------------------------

   feat(logging): improve endpoint observability

   - Logged incoming requests
   - Logged validation failures
   - Logged locked invoice operations
   - Logged successful retrievals
   - Logged successful updates
   - Logged successful deletions
   - Logged unexpected server errors

   ---------------------------------------------------------------------------

   feat(errors): implement standardized error handling

   - Returned structured NOT_FOUND responses
   - Returned VALIDATION_ERROR responses
   - Returned INVOICE_LOCKED responses
   - Returned SERVER_ERROR responses
   - Wrapped all database operations in try/catch blocks

============================================================================ */