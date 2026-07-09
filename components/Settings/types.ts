export interface BusinessData {
  id: string;
  name: string;
  ntn: string | null;
  strn: string | null;
  address: string | null;
  logoUrl: string | null;
  defaultGstRate: number;
  currency: string;
}



// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Defines the shared BusinessData interface used throughout the application
//   to represent a business profile.
// • Provides strong typing for business identity, tax registration details,
//   address information, branding assets, and default invoice settings.
// • Standardizes the data contract between frontend components and backend
//   business profile APIs, improving consistency and type safety.
// • Supports reusable business information across invoice generation,
//   business profile management, and related financial workflows.
// ─────────────────────────────────────────────────────────────────────────────