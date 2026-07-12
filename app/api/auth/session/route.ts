// app/api/auth/session/route.ts
// POST /api/auth/session
// Server-side session creation — sets httpOnly cookie and returns redirect URL.

import { NextRequest, NextResponse } from 'next/server';
import getAdmin from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: { code: 'MISSING_TOKEN', message: 'ID token required.', status: 400 } },
        { status: 400 }
      );
    }

    // Verify token with Firebase Admin
    const admin = getAdmin();
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    // Create response with httpOnly cookie
    const res = NextResponse.json(
      { success: true, redirect: '/dashboard' },
      { status: 200 }
    );

    res.cookies.set('firebaseToken', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    console.log(`[POST /api/auth/session] Session created | uid: ${uid}`);
    return res;

  } catch (err) {
    console.error('[POST /api/auth/session] ERROR:', err);
    return NextResponse.json(
      { error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token.', status: 401 } },
      { status: 401 }
    );
  }
}












// ─────────────────────────────────────────────────────────────────────────────
// FILE FUNCTIONALITY SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
//
// Purpose:
// This API route creates a secure server-side authenticated session after the
// user successfully signs in with Firebase Authentication on the client.
//
// Route:
// POST /api/auth/session
//
// Primary Responsibility:
// - Accept a Firebase ID token from the frontend.
// - Verify the token using Firebase Admin SDK.
// - Create a secure httpOnly authentication cookie.
// - Return a success response with the dashboard redirect path.
//
// Detailed Flow:
//
// 1. Receive Request
//    • Expects a POST request.
//    • Reads the JSON request body.
//    • Extracts the Firebase `idToken`.
//
// 2. Validate Input
//    • Checks whether an ID token was provided.
//    • If missing:
//        - Returns HTTP 400 (Bad Request).
//        - Sends a structured error response.
//        - Does not attempt authentication.
//
// 3. Verify Firebase Token
//    • Initializes Firebase Admin SDK.
//    • Calls:
//          admin.auth().verifyIdToken(idToken)
//    • Firebase validates:
//        - Token signature
//        - Expiration time
//        - Firebase project
//        - Issuer
//        - Audience
//        - Token integrity
//    • If verification fails, execution jumps to the catch block.
//
// 4. Extract User Information
//    • After successful verification, the decoded token contains:
//        - uid
//        - email (if available)
//        - auth provider
//        - issued time
//        - expiration time
//        - custom claims (if any)
//    • This route currently uses only the user's UID for logging.
//
// 5. Create Authenticated Session
//    • Generates a successful JSON response.
//    • Includes:
//          {
//              success: true,
//              redirect: "/dashboard"
//          }
//
// 6. Create Secure Authentication Cookie
//    • Stores the Firebase ID token inside an httpOnly cookie.
//    • Cookie name:
//          firebaseToken
//
//    Cookie Configuration:
//        httpOnly
//          → Prevents JavaScript from reading the cookie.
//          → Protects against XSS attacks.
//
//        secure
//          → Enabled only in production.
//          → Cookie is transmitted only over HTTPS.
//
//        sameSite: "lax"
//          → Helps reduce CSRF attacks while allowing normal navigation.
//
//        maxAge: 3600 seconds
//          → Cookie expires after one hour.
//
//        path: "/"
//          → Cookie is available across the entire application.
//
// 7. Logging
//    • Logs successful session creation.
//    • Includes the authenticated user's Firebase UID.
//    • Useful for authentication auditing and debugging.
//
// 8. Error Handling
//    • Any authentication failure is caught.
//    • Common causes include:
//        - Expired token
//        - Invalid signature
//        - Malformed token
//        - Wrong Firebase project
//        - Missing credentials
//    • Returns:
//          HTTP 401 Unauthorized
//    • Sends a consistent structured error response.
//
// Security Features:
//
// ✓ Firebase Admin verifies every incoming token.
// ✓ Session cookie is inaccessible from client-side JavaScript.
// ✓ Cookie is automatically encrypted over HTTPS in production.
// ✓ Invalid tokens never create sessions.
// ✓ Authentication is entirely server-side after verification.
// ✓ Structured error responses improve frontend error handling.
//
// Request Example:
//
// POST /api/auth/session
// {
//     "idToken": "<firebase-id-token>"
// }
//
// Successful Response:
//
// HTTP 200
// {
//     "success": true,
//     "redirect": "/dashboard"
// }
//
// Cookie Set:
//
// firebaseToken=<firebase-id-token>
// HttpOnly
// SameSite=Lax
// Path=/
// Max-Age=3600
//
// Error Response:
//
// HTTP 400
// {
//     "error": {
//         "code": "MISSING_TOKEN",
//         "message": "ID token required.",
//         "status": 400
//     }
// }
//
// HTTP 401
// {
//     "error": {
//         "code": "INVALID_TOKEN",
//         "message": "Invalid or expired token.",
//         "status": 401
//     }
// }
//
// Dependencies:
//
// • NextRequest
//      Parses incoming HTTP requests.
//
// • NextResponse
//      Creates HTTP responses and manages cookies.
//
// • Firebase Admin SDK
//      Performs secure server-side token verification.
//
// • getAdmin()
//      Returns the initialized Firebase Admin instance.
//
// Used By:
//
// • Login page after successful Firebase Authentication.
// • Client-side authentication flow.
// • Dashboard access flow.
// • Any feature requiring a secure authenticated session.
//
// End Result:
//
// This endpoint acts as the bridge between Firebase Authentication and your
// application's server-side session management. It verifies the user's identity,
// establishes a secure authenticated session using an httpOnly cookie, and
// prepares the client for accessing protected dashboard routes.
// ─────────────────────────────────────────────────────────────────────────────