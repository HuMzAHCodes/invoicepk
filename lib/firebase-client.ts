// lib/firebase-client.ts
// Firebase client SDK setup — browser-side only.
// Used by auth pages (login, register) and any client component
// that needs to get the current user's ID token.
// Never import firebase-admin or withAuth here — those are server-side only.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:    process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};

// Prevent multiple Firebase app initializations in Next.js
const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };


