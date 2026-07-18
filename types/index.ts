// types/index.ts
// Shared TypeScript types — used by both frontend and backend developers.
// IMPORTANT: Do not change this file without discussing with both developers.
// These types mirror the API response shapes defined in API_REFERENCE.md exactly.

// ─── Business ──────────────────────────────────────────────────────────────

export interface Business {
  id:             string;
  name:           string;
  ntn:            string | null;
  strn:           string | null;
  address:        string | null;
  logoUrl:        string | null;
  defaultGstRate: number;
  currency:       'PKR' | 'USD';
}

// ─── Client ────────────────────────────────────────────────────────────────

export interface Client {
  id:          string;
  name:        string;
  email:       string | null;
  phone:       string | null;
  address:     string | null;
  ntn:         string | null;
  isCorporate: boolean;
}

// ─── Invoice ───────────────────────────────────────────────────────────────

export interface InvoiceItem {
  description: string;
  quantity:    number;
  unitPrice:   number;
  amount:      number;
  sortOrder:   number;
}

export interface Invoice {
  id:            string;
  invoiceNumber: string;
  status:        'draft' | 'sent' | 'paid';
  issueDate:     Date | string;
  dueDate:       Date | string | null;
  currency:      'PKR' | 'USD';
  gstType:       'standard' | 'zero_rated' | 'exempt';
  gstRate:       number;
  subtotal:      number;
  gstAmount:     number;
  total:         number;
  whtApplicable: boolean;
  whtRate:       number;
  whtAmount:     number;
  netPayable:    number;
  notes:         string | null;
  pdfUrl:        string | null;
  items:         InvoiceItem[];
  client?:       ClientSummary | null;
}

// Lightweight client shape used inside invoice list responses
export interface ClientSummary {
  id:      string;
  name:    string;
  email?:  string | null;
  address?: string | null;
  ntn?:    string | null;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalInvoices:       number;
  byStatus: {
    draft: number;
    sent:  number;
    paid:  number;
  };
  revenueThisMonth:    number;
  revenueCurrency:     string;
  outstandingAmount:   number;
  monthlyInvoiceCount: number;
  freeTierLimit:       number;
  overdueCount:        number;
  overdueAmount:       number;
}

// ─── API Response Wrappers ─────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: {
    code:    string;
    message: string;
    status:  number;
  };
}

// ─── GST ───────────────────────────────────────────────────────────────────

export type GSTType = 'standard' | 'zero_rated' | 'exempt';
export type Currency = 'PKR' | 'USD';
export type InvoiceStatus = 'draft' | 'sent' | 'paid';





/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Defines shared TypeScript types used across the frontend and backend.
| - Provides a single source of truth for application data structures.
|
| Responsibilities:
| - Defines common interfaces for businesses, clients, invoices, dashboard
|   statistics, and API responses.
| - Ensures consistent data contracts between the frontend and backend.
| - Standardizes request and response object shapes throughout the application.
| - Provides shared type aliases for GST, currency, and invoice status values.
| - Improves type safety, maintainability, and developer experience by
|   centralizing reusable type definitions.
|
*/