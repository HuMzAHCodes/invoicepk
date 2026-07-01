// lib/get-business.ts
// Shared helper — resolves the Business document from a Firebase UID.
// Used by every protected route to get businessId instead of repeating
// the lookup logic in each handler.

import Business, { IBusiness } from '@/models/Business';

export async function getBusinessForUser(uid: string): Promise<IBusiness | null> {
  return Business.findOne({ userId: uid });
}






/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Provides a shared helper for retrieving a user's business profile.
| - Maps a Firebase user ID to its corresponding Business document.
|
| Responsibilities:
| - Finds the business associated with a given Firebase UID.
| - Eliminates duplicate business lookup logic across protected API routes.
| - Returns the business document when found, or null if no business exists.
| - Exports a reusable helper for consistent business resolution throughout
|   the application.
|
*/