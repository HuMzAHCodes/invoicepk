// lib/firebase-admin.ts
// Firebase Admin SDK initialization — server-side only.
// Used by withAuth.ts to verify Firebase ID tokens on every protected route.
// Never import this in a Client Component or any frontend file.

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
      // The private key comes from .env.local as a single line with literal \n
      // .replace() converts those literal \n back into real newlines
      privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default admin;


/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Initializes and exports the Firebase Admin SDK for server-side use.
| - Provides a single shared Firebase Admin instance across the application.
|
| Responsibilities:
| - Initializes the Firebase Admin SDK using environment variables.
| - Prevents multiple Firebase app instances from being created.
| - Loads and formats service account credentials securely.
| - Supplies Firebase Admin services for server-side authentication and
|   other administrative operations.
| - Exports the initialized Firebase Admin instance for reuse throughout
|   protected backend modules.
|
*/