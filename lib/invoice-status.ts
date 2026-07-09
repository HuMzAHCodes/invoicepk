// lib/invoice-status.ts
// Invoice status state machine — defines valid transitions and validates them.
// Used in PATCH /api/invoices/:id/status.
// Only forward transitions are allowed: draft → sent → paid.

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent'],
  sent:  ['paid'],
  paid:  [], // terminal state — no transitions out of paid
};

export function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}




/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Defines the valid lifecycle transitions for invoice statuses.
| - Prevents invalid or unsupported invoice status changes.
|
| Responsibilities:
| - Maintains the allowed invoice status transition rules.
| - Validates whether a requested status change is permitted.
| - Enforces a forward-only workflow from draft to sent to paid.
| - Prevents transitions from terminal invoice states.
| - Exports a reusable validation helper for consistent status management
|   across the application.
|
*/