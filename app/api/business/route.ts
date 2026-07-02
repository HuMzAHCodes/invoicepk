// app/api/business/route.ts
// GET /api/business  — get the authenticated user's business profile
// PUT /api/business  — update the business profile (partial updates supported)

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { getBusinessForUser } from '@/lib/get-business';
import { serializeBusiness } from '@/lib/serialize';

const updateBusinessSchema = z.object({
  name:           z.string().min(1).optional(),
  ntn:            z.string().optional(),
  strn:           z.string().optional(),
  address:        z.string().optional(),
  defaultGstRate: z.number().min(0).max(100).optional(),
  currency:       z.enum(['PKR', 'USD']).optional(),
});

// ─── GET /api/business ─────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  console.log('[GET /api/business] Request received');

  return withAuth(req, async (req, uid) => {
    try {
      await connectDB();

      const business = await getBusinessForUser(uid);

      if (!business) {
        console.log(`[GET /api/business] Business not found | uid: ${uid}`);
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Business profile not found.', status: 404 } },
          { status: 404 }
        );
      }

      console.log(`[GET /api/business] Success | businessId: ${business._id} | status: 200`);
      return NextResponse.json({ data: serializeBusiness(business) });

    } catch (err) {
      console.error('[GET /api/business] ERROR:', err);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Something went wrong.', status: 500 } },
        { status: 500 }
      );
    }
  });
}

// ─── PUT /api/business ─────────────────────────────────────────────────────

export async function PUT(req: NextRequest) {
  console.log('[PUT /api/business] Request received');

  return withAuth(req, async (req, uid) => {
    try {
      await connectDB();

      const body = await req.json();
      const parsed = updateBusinessSchema.safeParse(body);

      if (!parsed.success) {
        console.log(`[PUT /api/business] Validation failed: ${parsed.error.issues[0].message}`);
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message, status: 422 } },
          { status: 422 }
        );
      }

      const business = await getBusinessForUser(uid);

      if (!business) {
        console.log(`[PUT /api/business] Business not found | uid: ${uid}`);
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Business profile not found.', status: 404 } },
          { status: 404 }
        );
      }

      // Apply partial update
      Object.assign(business, parsed.data);
      await business.save();

      console.log(`[PUT /api/business] Updated | businessId: ${business._id} | status: 200`);
      return NextResponse.json({ data: serializeBusiness(business) });

    } catch (err) {
      console.error('[PUT /api/business] ERROR:', err);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Something went wrong.', status: 500 } },
        { status: 500 }
      );
    }
  });
}





/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Provides API endpoints for retrieving and updating the authenticated
|   user's business profile.
|
| Responsibilities:
| - Retrieves the authenticated user's business information.
| - Supports partial updates to the business profile.
| - Validates incoming update requests before applying changes.
| - Authenticates requests to ensure only authorized users can access or
|   modify their business profile.
| - Establishes a database connection and retrieves the user's business
|   record.
| - Returns serialized business data using standardized API response
|   formats.
| - Handles validation, authorization, resource-not-found, and server
|   errors consistently.
|
*/