// lib/db.ts
// MongoDB connection singleton — prevents multiple connections in
// Next.js serverless environment where the module may be re-evaluated
// between requests. Call connectDB() at the top of every API route
// before any Mongoose query.

import mongoose from 'mongoose';

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