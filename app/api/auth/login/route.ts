// app/api/auth/login/route.ts
// POST /api/auth/login
// Verifies credentials via Firebase Auth REST API and returns a Firebase ID token.
// This is one of only two routes that does NOT use withAuth() middleware.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  console.log('[POST /api/auth/login] Request received');

  try {
    // 1. Parse and validate body
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      console.log(`[POST /api/auth/login] Validation failed: ${parsed.error.issues[0].message}`);
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message, status: 422 } },
        { status: 422 }
      );
    }

    const { email, password } = parsed.data;

    // 2. Sign in via Firebase Auth REST API
    // Firebase Admin SDK does not support password sign-in server-side —
    // we use the Firebase Auth REST API with the API key instead.
    const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    const firebaseData = await firebaseRes.json();

    if (!firebaseRes.ok) {
      const errorCode = firebaseData.error?.message ?? 'UNKNOWN';
      console.log(`[POST /api/auth/login] Firebase sign-in failed | error: ${errorCode}`);

      // Map Firebase error codes to friendly messages
      const message =
        errorCode === 'INVALID_PASSWORD' || errorCode === 'EMAIL_NOT_FOUND' || errorCode.includes('INVALID_LOGIN_CREDENTIALS')
          ? 'Invalid email or password.'
          : 'Login failed. Please try again.';

      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message, status: 401 } },
        { status: 401 }
      );
    }

    const { idToken, localId: uid, email: userEmail } = firebaseData;

    console.log(`[POST /api/auth/login] Login successful | uid: ${uid} | status: 200`);

    return NextResponse.json({
      data: {
        user:  { id: uid, email: userEmail },
        token: idToken,
      },
    });

  } catch (err) {
    console.error('[POST /api/auth/login] ERROR:', err);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Something went wrong.', status: 500 } },
      { status: 500 }
    );
  }
}






/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Provides the API endpoint for authenticating existing users.
| - Verifies user credentials and issues a Firebase ID token for accessing
|   protected application resources.
|
| Responsibilities:
| - Validates incoming login requests.
| - Authenticates users using the Firebase Authentication REST API.
| - Returns the authenticated user's information and Firebase ID token upon
|   successful login.
| - Maps Firebase authentication errors to user-friendly API responses.
| - Handles validation, authentication, and unexpected server errors using
|   standardized response formats.
| - Serves as a public authentication endpoint and does not require prior
|   user authentication.
|
*/