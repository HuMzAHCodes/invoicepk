// app/api/auth/register/route.ts
// POST /api/auth/register
// Called after Google Sign-In to ensure a Business document exists for the user.
// If Business already exists (returning user) — returns existing profile.
// If Business doesn't exist (new user) — creates one and returns it.
// This route IS protected by withAuth() unlike the old email/password version.

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { getBusinessForUser } from '@/lib/get-business';
import { serializeBusiness } from '@/lib/serialize';
import Business from '@/models/Business';

export async function POST(req: NextRequest) {
  console.log('[POST /api/auth/register] Request received');

  return withAuth(req, async (req, uid) => {
    try {
      await connectDB();

      // Check if Business already exists for this user
      let business = await getBusinessForUser(uid);

      if (business) {
        console.log(`[POST /api/auth/register] Business already exists | uid: ${uid}`);
        return NextResponse.json({
          data: {
            user:     { id: uid },
            business: serializeBusiness(business),
            isNew:    false,
          },
        });
      }

      // Parse optional name from body
      const body = await req.json().catch(() => ({}));
      const displayName = body.displayName ?? uid;

      // Create new Business document
      business = await Business.create({
        userId:         uid,
        name:           displayName,
        defaultGstRate: 17,
        currency:       'PKR',
      });

      console.log(`[POST /api/auth/register] Business created | uid: ${uid} | businessId: ${business._id} | status: 201`);

      return NextResponse.json(
        {
          data: {
            user:     { id: uid },
            business: serializeBusiness(business),
            isNew:    true,
          },
        },
        { status: 201 }
      );

    } catch (err) {
      console.error('[POST /api/auth/register] ERROR:', err);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Something went wrong.', status: 500 } },
        { status: 500 }
      );
    }
  });
}






/*
|--------------------------------------------------------------------------
| Functionality Summary
|--------------------------------------------------------------------------
|
| Endpoint:
|   POST /api/auth/register
|
| Purpose:
|   Completes user registration after successful Google authentication by
|   ensuring the authenticated user has an associated Business profile.
|
| Authentication:
|   - Protected via withAuth().
|   - Firebase ID token is validated before executing any business logic.
|
| Workflow:
|   1. Receives an authenticated POST request.
|   2. Connects to MongoDB.
|   3. Searches for an existing Business document using the authenticated UID.
|   4. If a Business already exists:
|        • Returns the existing serialized business profile.
|        • Marks the user as an existing user (isNew = false).
|   5. If no Business exists:
|        • Reads an optional displayName from the request body.
|        • Falls back to the UID if no display name is provided.
|        • Creates a new Business document with default values:
|            - GST Rate: 17%
|            - Currency: PKR
|        • Returns the newly created business profile.
|        • Marks the user as a new user (isNew = true).
|
| Response:
|   Existing User (200):
|     {
|       data: {
|         user,
|         business,
|         isNew: false
|       }
|     }
|
|   New User (201):
|     {
|       data: {
|         user,
|         business,
|         isNew: true
|       }
|     }
|
| Error Handling:
|   - Handles invalid/missing request body safely.
|   - Catches unexpected server/database errors.
|   - Returns a standardized SERVER_ERROR response (HTTP 500).
|
| Logging:
|   - Logs incoming registration requests.
|   - Logs whether an existing business was found.
|   - Logs successful business creation with UID and Business ID.
|   - Logs unexpected server errors for debugging.
|
| Dependencies:
|   - connectDB()
|   - withAuth()
|   - getBusinessForUser()
|   - serializeBusiness()
|   - Business Model
|
|--------------------------------------------------------------------------
| Git Commit
|--------------------------------------------------------------------------
| feat(auth): implement Google registration endpoint with automatic
| business profile creation and existing user detection
|--------------------------------------------------------------------------
*/