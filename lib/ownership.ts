// lib/ownership.ts
// Shared helper — checks that a fetched resource exists and belongs to the
// authenticated user's business. Used in every route that fetches a single
// resource by ID (clients/:id, invoices/:id, etc.)
// Returns a NextResponse error if the check fails, null if it passes.

import { NextResponse } from 'next/server';

export function checkOwnership(resource: any, businessId: string): NextResponse | null {
  if (!resource) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Resource not found.', status: 404 } },
      { status: 404 }
    );
  }

  if (resource.businessId.toString() !== businessId.toString()) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'You do not have access to this resource.', status: 403 } },
      { status: 403 }
    );
  }

  return null; // null = ownership check passed, proceed
}







/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Provides a shared authorization helper for verifying resource ownership.
| - Ensures users can only access resources belonging to their own business.
|
| Responsibilities:
| - Verifies that the requested resource exists.
| - Confirms the resource belongs to the authenticated user's business.
| - Returns standardized HTTP error responses for missing or unauthorized
|   resources.
| - Returns null when ownership validation succeeds, allowing request
|   processing to continue.
| - Exports a reusable helper to enforce consistent access control across
|   protected API routes.
|
*/