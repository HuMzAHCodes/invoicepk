// app/api/auth/register/route.ts
// POST /api/auth/register
// Creates a new Firebase user and an empty Business document in MongoDB.
// This is one of only two routes that does NOT use withAuth() middleware.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import admin from '@/lib/firebase-admin';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';

const registerSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: NextRequest) {
  console.log('[POST /api/auth/register] Request received');

  try {
    // 1. Parse and validate body
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      console.log(`[POST /api/auth/register] Validation failed: ${parsed.error.issues[0].message}`);
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message, status: 422 } },
        { status: 422 }
      );
    }

    const { email, password } = parsed.data;

    // 2. Create Firebase user
    const userRecord = await admin.auth().createUser({ email, password });
    console.log(`[POST /api/auth/register] Firebase user created | uid: ${userRecord.uid}`);

    // 3. Connect to DB and create empty Business document
    await connectDB();

    await Business.create({
      userId:         userRecord.uid,
      name:           email.split('@')[0],
      defaultGstRate: 17,
      currency:       'PKR',
    });

    console.log(`[POST /api/auth/register] Business document created | uid: ${userRecord.uid} | status: 201`);

    return NextResponse.json(
      {
        data: {
          user:    { id: userRecord.uid, email: userRecord.email },
          message: 'Account created. Please verify your email.',
        },
      },
      { status: 201 }
    );

  } catch (err: any) {
    if (err.code === 'auth/email-already-exists') {
      console.log(`[POST /api/auth/register] Email already exists`);
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'An account with this email already exists.', status: 422 } },
        { status: 422 }
      );
    }

    console.error('[POST /api/auth/register] ERROR:', err);
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
| - Provides the API endpoint for registering new users.
| - Creates a Firebase Authentication account and initializes the user's
|   business profile within the application.
|
| Responsibilities:
| - Validates incoming registration requests.
| - Creates a new user account using Firebase Authentication.
| - Establishes a connection to the database.
| - Creates a default Business profile linked to the newly registered user.
| - Returns the registered user's information along with a success message.
| - Handles validation errors, duplicate email registrations, and unexpected
|   server errors using standardized API responses.
| - Serves as a public authentication endpoint and does not require prior
|   user authentication.
|
*/