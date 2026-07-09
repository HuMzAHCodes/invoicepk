// lib/firebase-admin.ts
// Firebase Admin SDK initialization — server-side only.
// Used by withAuth.ts to verify Firebase ID tokens on every protected route.
// Never import this in a Client Component or any frontend file.

import admin from 'firebase-admin';

function getAdmin() {
  if (!admin.apps.length) {
    // Support both full JSON service account and individual env vars
    const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_B64
      ? Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf-8')
      : process.env.FIREBASE_SERVICE_ACCOUNT;

    if (serviceAccountRaw) {
      try {
        const parsed = JSON.parse(serviceAccountRaw);
        console.log('[Firebase Admin] Using service account JSON | projectId:', parsed.project_id, '| clientEmail:', parsed.client_email);
        admin.initializeApp({
          credential: admin.credential.cert(parsed),
        });
        console.log('[Firebase Admin] Initialized successfully with service account JSON');
      } catch (err) {
        console.error('[Firebase Admin] Failed to parse service account JSON:', err);
        throw err;
      }
    } else {
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
        throw err;
      }
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