// lib/api-client.ts
// Fetch wrapper — automatically attaches Firebase ID token to every API request.
// Use this for ALL API calls from the frontend instead of raw fetch().
// Handles token refresh automatically via Firebase's getIdToken(true).

import { auth } from '@/lib/firebase-client';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;

  if (!user) {
    return { 'Content-Type': 'application/json' };
  }

  // forceRefresh=true ensures we always have a fresh token
  const token = await user.getIdToken(true);

  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// ─── GET ──────────────────────────────────────────────────────────────────

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method:  'GET',
    headers,
    cache:   'no-store',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Request failed');
  }

  return data.data as T;
}

// ─── POST ─────────────────────────────────────────────────────────────────

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method:  'POST',
    headers,
    body:    body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Request failed');
  }

  return data.data as T;
}

// ─── PUT ──────────────────────────────────────────────────────────────────

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method:  'PUT',
    headers,
    body:    body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Request failed');
  }

  return data.data as T;
}

// ─── PATCH ────────────────────────────────────────────────────────────────

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method:  'PATCH',
    headers,
    body:    body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Request failed');
  }

  return data.data as T;
}

// ─── DELETE ───────────────────────────────────────────────────────────────

export async function apiDelete<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method:  'DELETE',
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Request failed');
  }

  return data.data as T;
}

// ─── PDF Download (special case — returns blob not JSON) ──────────────────

export async function apiDownloadPDF(invoiceId: string, filename: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const token = await user.getIdToken(true);

  const res = await fetch(`${BASE_URL}/api/invoices/${invoiceId}/pdf`, {
    method:  'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Failed to download PDF');
  }

  // Trigger browser download
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}




// lib/api-client.ts
// Centralized frontend API client for authenticated requests.
// Automatically attaches the current Firebase ID token to every request,
// refreshes expired tokens when needed, standardizes JSON request/response
// handling, and throws consistent errors for failed API calls.
// Also provides a dedicated helper for downloading invoice PDFs as files.