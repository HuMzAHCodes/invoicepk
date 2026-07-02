// lib/db.ts
import mongoose from 'mongoose';
import dns from 'dns';

let isConnected = false;

export async function connectDB(): Promise<void> {
  // Always set DNS servers before any connection attempt
  // Fixes ISP-level SRV lookup blocking in Pakistan
  dns.setServers(['8.8.8.8', '8.8.4.4']);

  if (isConnected) {
    console.log('[DB] Already connected — reusing connection');
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[DB] MONGODB_URI is not set in environment variables');
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log('[DB] Connected to MongoDB Atlas');
  } catch (err) {
    console.error('[DB] Connection failed:', err);
    throw err;
  }
}

















/* ============================================================================
   COMMIT HISTORY
   ============================================================================

   fix(database): resolve MongoDB Atlas SRV lookup failures

   - Moved DNS server configuration inside connectDB()
   - Ensured DNS servers are configured before every connection attempt
   - Fixed intermittent MongoDB Atlas connection failures caused by ISP DNS
   - Improved compatibility for environments with restricted SRV resolution

   ---------------------------------------------------------------------------

   refactor(database): improve connection initialization flow

   - Applied DNS configuration immediately before establishing connections
   - Preserved existing connection reuse optimization
   - Kept connection initialization centralized in connectDB()

   ---------------------------------------------------------------------------

   chore(logging): retain database connection diagnostics

   - Continued logging successful database connections
   - Preserved connection reuse logging
   - Preserved configuration error logging
   - Preserved connection failure logging for debugging

============================================================================ */
















// that commit related Description

// Previously used mongodb+srv:// SRV format which relies on DNS SRV
// lookup. This worked for the seed script and Jest tests (main Node.js
// process where dns.setServers() applies) but failed in Next.js 16
// Turbopack API route workers which run in isolated processes and don't
// inherit the DNS override. Switched to standard mongodb:// format with
// hardcoded shard hostnames and port 27017 — bypasses DNS entirely.
