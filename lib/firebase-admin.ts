// lib/firebase-admin.ts
// Firebase Admin SDK initialization — server-side only.
// Used by withAuth.ts to verify Firebase ID tokens on every protected route.
// Never import this in a Client Component or any frontend file.

import admin from 'firebase-admin';

function getAdmin() {
  if (!admin.apps.length) {
    const projectId   = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY_B64
      ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_B64, 'base64').toString('utf-8')
      : process.env.FIREBASE_PRIVATE_KEY ?? '';
    const privateKey = privateKeyRaw.includes('\\n')
      ? privateKeyRaw.replace(/\\n/g, '\n')
      : privateKeyRaw;

    if (!projectId || !clientEmail || !privateKey) {
      console.error('[Firebase Admin] Missing env vars:', {
        projectId: !!projectId,
        clientEmail: !!clientEmail,
        privateKeyLength: privateKey.length,
      });
      throw new Error('Firebase Admin env vars missing. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.');
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
    } catch (err) {
      console.error('[Firebase Admin] Init failed:', err);
      console.error('[Firebase Admin] Private key starts with:', privateKey.substring(0, 30));
      console.error('[Firebase Admin] Private key ends with:', privateKey.substring(privateKey.length - 30));
      throw err;
    }
  }
  return admin;
}

export default getAdmin;


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