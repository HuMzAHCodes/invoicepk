// lib/withAuth.ts
// Auth middleware wrapper — verifies Firebase ID token on every protected route.
// Usage: return withAuth(req, async (req, uid) => { ... your route logic ... });
// Every route except POST /api/auth/register and POST /api/auth/login uses this.

import { NextRequest, NextResponse } from 'next/server';
import getAdmin from '@/lib/firebase-admin';

type AuthenticatedHandler = (
  req: NextRequest,
  uid: string
) => Promise<NextResponse>;

export async function withAuth(
  req: NextRequest,
  handler: AuthenticatedHandler
): Promise<NextResponse> {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[withAuth] Missing or malformed Authorization header');
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required.', status: 401 } },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];

    const decoded = await getAdmin().auth().verifyIdToken(token);
    const uid = decoded.uid;

    console.log(`[withAuth] Token verified | uid: ${uid}`);

    return handler(req, uid);

  } catch (err) {
    console.error('[withAuth] Token verification failed:', err);
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token.', status: 401 } },
      { status: 401 }
    );
  }
}







/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Provides a reusable authentication wrapper for protected API routes.
| - Verifies Firebase ID tokens before allowing access to route logic.
|
| Responsibilities:
| - Extracts the Authorization header from incoming requests.
| - Validates the Firebase ID token using the Firebase Admin SDK.
| - Retrieves the authenticated user's UID upon successful verification.
| - Blocks unauthorized or invalid requests with standardized HTTP error
|   responses.
| - Passes authenticated requests to the supplied route handler.
| - Exports a reusable middleware-style helper for consistent authentication
|   across protected backend routes.
|
*/