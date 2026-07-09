// app/api/clients/route.ts
// GET /api/clients  — list all clients for the authenticated business (paginated)
// POST /api/clients — create a new client

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { getBusinessForUser } from '@/lib/get-business';
import { serializeClient } from '@/lib/serialize';
import Client from '@/models/Client';

const createClientSchema = z.object({
  name:        z.string().min(1, 'Client name is required'),
  email:       z.string().email('Invalid email address').optional(),
  phone:       z.string().optional(),
  address:     z.string().optional(),
  ntn:         z.string().optional(),
  isCorporate: z.boolean().default(false),
});

// ─── GET /api/clients ──────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  console.log('[GET /api/clients] Request received');

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

      // Pagination + search
      const url    = new URL(req.url);
      const page   = parseInt(url.searchParams.get('page')  ?? '1',  10);
      const limit  = parseInt(url.searchParams.get('limit') ?? '20', 10);
      const search = url.searchParams.get('search') ?? '';
      const skip   = (page - 1) * limit;

      // Build filter
      const filter: any = { businessId: business._id };
      if (search) {
        filter.$or = [
          { name:  { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const [clients, total] = await Promise.all([
        Client.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Client.countDocuments(filter),
      ]);

      console.log(`[GET /api/clients] Success | count: ${clients.length} | total: ${total} | status: 200`);

      return NextResponse.json({
        data: {
          clients: clients.map(serializeClient),
          total,
          page,
          limit,
        },
      });

    } catch (err) {
      console.error('[GET /api/clients] ERROR:', err);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Something went wrong.', status: 500 } },
        { status: 500 }
      );
    }
  });
}

// ─── POST /api/clients ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  console.log('[POST /api/clients] Request received');

  return withAuth(req, async (req, uid) => {
    try {
      await connectDB();

      const body   = await req.json();
      const parsed = createClientSchema.safeParse(body);

      if (!parsed.success) {
        console.log(`[POST /api/clients] Validation failed: ${parsed.error.issues[0].message}`);
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

      const client = await Client.create({
        ...parsed.data,
        businessId: business._id,
      });

      console.log(`[POST /api/clients] Client created | clientId: ${client._id} | status: 201`);

      return NextResponse.json(
        { data: serializeClient(client) },
        { status: 201 }
      );

    } catch (err) {
      console.error('[POST /api/clients] ERROR:', err);
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

   feat(api): create authenticated clients API endpoints

   - Added GET /api/clients endpoint
   - Added POST /api/clients endpoint
   - Protected both endpoints using withAuth middleware
   - Connected API to MongoDB before every request

   ---------------------------------------------------------------------------

   feat(clients): implement client listing with pagination

   - Added page and limit query parameters
   - Implemented skip/limit pagination
   - Sorted clients by newest first
   - Returned total record count for frontend pagination
   - Scoped all results to the authenticated business

   ---------------------------------------------------------------------------

   feat(clients): add client search functionality

   - Added search query parameter
   - Implemented case-insensitive search by:
       • Client Name
       • Client Email
   - Built dynamic MongoDB filter using regex

   ---------------------------------------------------------------------------

   feat(validation): validate client creation requests

   - Added Zod schema for client payload
   - Validated:
       • name (required)
       • email format
       • optional phone
       • optional address
       • optional NTN
       • corporate flag
   - Returned HTTP 422 on validation failures

   ---------------------------------------------------------------------------

   feat(business): enforce business ownership

   - Retrieved authenticated user's business
   - Prevented access when business profile does not exist
   - Scoped all created and fetched clients to businessId

   ---------------------------------------------------------------------------

   feat(clients): implement client creation

   - Created new client documents
   - Automatically linked clients with businessId
   - Returned serialized client response
   - Returned HTTP 201 after successful creation

   ---------------------------------------------------------------------------

   feat(serialization): standardize API responses

   - Serialized client objects before returning
   - Prevented leaking internal MongoDB document fields
   - Maintained consistent API response structure

   ---------------------------------------------------------------------------

   feat(logging): improve API observability

   - Logged incoming requests
   - Logged validation failures
   - Logged successful fetch operations
   - Logged successful client creation
   - Logged server errors with context

   ---------------------------------------------------------------------------

   feat(errors): implement standardized error handling

   - Returned structured NOT_FOUND responses
   - Returned VALIDATION_ERROR responses
   - Returned SERVER_ERROR responses
   - Used appropriate HTTP status codes
   - Wrapped all operations in try/catch blocks

============================================================================ */