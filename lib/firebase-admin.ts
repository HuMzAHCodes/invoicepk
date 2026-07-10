// lib/firebase-admin.ts
// Firebase Admin SDK initialization — server-side only.

import admin from 'firebase-admin';

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  const formattedKey = privateKey?.includes('\\n') 
    ? privateKey.replace(/\\n/g, '\n')
    : privateKey;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  formattedKey,
    }),
  });
}

export default admin;
