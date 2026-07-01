// lib/db.ts
import mongoose from 'mongoose';
import dns from 'dns';

// Fix for ISP-level DNS issues common in Pakistan (blocks MongoDB SRV lookups)
dns.setServers(['8.8.8.8', '8.8.4.4']);

let isConnected = false;

export async function connectDB(): Promise<void> {
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











/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Establishes and manages the application's MongoDB database connection.
| - Provides a shared database connection utility for backend modules.
|
| Responsibilities:
| - Configures DNS servers to improve MongoDB Atlas connectivity in
|   environments with SRV lookup issues.
| - Connects to the MongoDB database using the configured environment
|   variables.
| - Reuses an existing database connection to avoid creating duplicate
|   connections.
| - Validates the presence of required database configuration.
| - Logs connection status and propagates connection errors when necessary.
| - Exports a reusable database connection helper for use throughout the
|   application.
|
*/





















// Problem:
// npx ts-node scripts/seed.ts threw ECONNREFUSED on querySrv for
// _mongodb._tcp.cluster0.va87p1m.mongodb.net — Pakistan ISPs block
// MongoDB's SRV DNS lookups by default.

// Fix:
// - lib/db.ts — added dns.setServers(['8.8.8.8', '8.8.4.4']) before
//   mongoose.connect() to force Google DNS, bypassing ISP-level block
// - scripts/seed.ts — added same dns.setServers() fix at the top of
//   the script so the seed command connects successfully too

// This fix was pre-documented in RISKS_AND_DECISIONS.md (Risk 2) as a
// known issue from a previous project.