// app/api/clients/[id]/route.ts
// PUT    /api/clients/:id — update an existing client (partial updates supported)
// DELETE /api/clients/:id — delete a client

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { getBusinessForUser } from '@/lib/get-business';
import { checkOwnership } from '@/lib/ownership';
import { serializeClient } from '@/lib/serialize';
import Client from '@/models/Client';

const updateClientSchema = z.object({
  name:        z.string().min(1).optional(),
  email:       z.string().email('Invalid email address').optional(),
  phone:       z.string().optional(),
  address:     z.string().optional(),
  ntn:         z.string().optional(),
  isCorporate: z.boolean().optional(),
});

// ─── PUT /api/clients/:id ──────────────────────────────────────────────────

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[PUT /api/clients/${id}] Request received`);

  return withAuth(req, async (req, uid) => {
    try {
      await connectDB();

      const body   = await req.json();
      const parsed = updateClientSchema.safeParse(body);

      if (!parsed.success) {
        console.log(`[PUT /api/clients/${id}] Validation failed: ${parsed.error.issues[0].message}`);
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

      const client = await Client.findById(id);

      // Ownership check
      const ownershipError = checkOwnership(client, business._id.toString());
      if (ownershipError) return ownershipError;

      // Apply partial update
      Object.assign(client!, parsed.data);
      await client!.save();

      console.log(`[PUT /api/clients/${id}] Updated | status: 200`);
      return NextResponse.json({ data: serializeClient(client) });

    } catch (err) {
      console.error(`[PUT /api/clients/${id}] ERROR:`, err);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Something went wrong.', status: 500 } },
        { status: 500 }
      );
    }
  });
}

// ─── DELETE /api/clients/:id ───────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[DELETE /api/clients/${id}] Request received`);

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

      const client = await Client.findById(id);

      // Ownership check
      const ownershipError = checkOwnership(client, business._id.toString());
      if (ownershipError) return ownershipError;

      await client!.deleteOne();

      console.log(`[DELETE /api/clients/${id}] Deleted | status: 200`);
      return NextResponse.json({
        data: { message: 'Client deleted successfully.' },
      });

    } catch (err) {
      console.error(`[DELETE /api/clients/${id}] ERROR:`, err);
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

   feat(api): add authenticated client management endpoints

   - Added PUT /api/clients/:id endpoint
   - Added DELETE /api/clients/:id endpoint
   - Protected both endpoints using withAuth middleware
   - Connected API to MongoDB before every operation

   ---------------------------------------------------------------------------

   feat(validation): validate client update payload

   - Added Zod schema for partial client updates
   - Supported optional updates for:
       • name
       • email
       • phone
       • address
       • NTN
       • corporate status
   - Returned HTTP 422 for invalid request data

   ---------------------------------------------------------------------------

   feat(business): enforce business authentication

   - Retrieved authenticated user's business profile
   - Prevented operations when business profile does not exist
   - Returned standardized HTTP 404 responses

   ---------------------------------------------------------------------------

   feat(security): implement resource ownership verification

   - Retrieved target client by ID
   - Verified client belongs to authenticated business
   - Prevented unauthorized updates and deletions
   - Centralized authorization using checkOwnership()

   ---------------------------------------------------------------------------

   feat(clients): implement partial client updates

   - Supported PATCH-style updates through PUT
   - Updated only supplied fields
   - Preserved existing values for omitted fields
   - Saved modified client document
   - Returned serialized updated client

   ---------------------------------------------------------------------------

   feat(clients): implement client deletion

   - Deleted client document after ownership verification
   - Returned success confirmation message
   - Prevented deletion of unauthorized resources

   ---------------------------------------------------------------------------

   feat(serialization): standardize API responses

   - Serialized updated client before returning
   - Used consistent success response structure
   - Standardized delete confirmation response

   ---------------------------------------------------------------------------

   feat(logging): improve endpoint observability

   - Logged incoming update requests
   - Logged incoming delete requests
   - Logged validation failures
   - Logged successful updates
   - Logged successful deletions
   - Logged server errors with endpoint context

   ---------------------------------------------------------------------------

   feat(errors): implement consistent error handling

   - Returned structured NOT_FOUND responses
   - Returned VALIDATION_ERROR responses
   - Returned ownership authorization errors
   - Returned SERVER_ERROR responses
   - Used appropriate HTTP status codes
   - Wrapped all database operations in try/catch blocks

============================================================================ */



