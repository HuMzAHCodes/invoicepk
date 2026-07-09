// app/api/invoices/[id]/status/route.ts
// PATCH /api/invoices/:id/status
// Transitions invoice status — only valid forward transitions allowed:
// draft → sent → paid
// Backward transitions (paid → sent, sent → draft) are not allowed.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { getBusinessForUser } from '@/lib/get-business';
import { checkOwnership } from '@/lib/ownership';
import { isValidTransition } from '@/lib/invoice-status';
import Invoice from '@/models/Invoice';

const statusSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[PATCH /api/invoices/${id}/status] Request received`);

  return withAuth(req, async (req, uid) => {
    try {
      await connectDB();

      const body   = await req.json();
      const parsed = statusSchema.safeParse(body);

      if (!parsed.success) {
        console.log(`[PATCH /api/invoices/${id}/status] Validation failed: ${parsed.error.issues[0].message}`);
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

      const { status: newStatus } = parsed.data;

      // Validate state machine transition
      if (!isValidTransition(invoice!.status, newStatus)) {
        console.log(`[PATCH /api/invoices/${id}/status] Invalid transition: ${invoice!.status} → ${newStatus}`);
        return NextResponse.json(
          {
            error: {
              code:    'INVOICE_LOCKED',
              message: `Cannot transition from ${invoice!.status} to ${newStatus}.`,
              status:  409,
            },
          },
          { status: 409 }
        );
      }

      invoice!.status = newStatus;
      await invoice!.save();

      console.log(`[PATCH /api/invoices/${id}/status] Transition success | ${invoice!.status} | status: 200`);

      return NextResponse.json({
        data: {
          id:            invoice!._id.toString(),
          invoiceNumber: invoice!.invoiceNumber,
          status:        invoice!.status,
        },
      });

    } catch (err) {
      console.error(`[PATCH /api/invoices/${id}/status] ERROR:`, err);
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

   feat(api): implement invoice status transition endpoint

   - Added PATCH /api/invoices/:id/status endpoint
   - Protected endpoint using withAuth middleware
   - Connected request handling to MongoDB

   ---------------------------------------------------------------------------

   feat(validation): validate status update requests

   - Added Zod schema for status payload
   - Restricted status values to:
       • draft
       • sent
       • paid
   - Returned HTTP 422 for invalid request payloads

   ---------------------------------------------------------------------------

   feat(security): enforce business ownership

   - Verified authenticated business exists
   - Restricted status updates to owned invoices only
   - Centralized ownership verification using checkOwnership()

   ---------------------------------------------------------------------------

   feat(workflow): implement invoice status state machine

   - Enforced valid forward-only status transitions
   - Allowed:
       • draft → sent
       • sent → paid
   - Prevented backward transitions
   - Prevented invalid workflow states
   - Centralized transition validation using isValidTransition()

   ---------------------------------------------------------------------------

   feat(invoices): implement status update workflow

   - Updated invoice status after validation
   - Persisted status changes to the database
   - Returned updated invoice status summary
   - Preserved invoice integrity during workflow progression

   ---------------------------------------------------------------------------

   feat(logging): improve endpoint observability

   - Logged incoming requests
   - Logged validation failures
   - Logged invalid status transitions
   - Logged successful status updates
   - Logged unexpected server errors

   ---------------------------------------------------------------------------

   feat(errors): implement standardized error handling

   - Returned structured NOT_FOUND responses
   - Returned VALIDATION_ERROR responses
   - Returned INVOICE_LOCKED responses for invalid transitions
   - Returned SERVER_ERROR responses
   - Wrapped database operations in try/catch blocks

============================================================================ */