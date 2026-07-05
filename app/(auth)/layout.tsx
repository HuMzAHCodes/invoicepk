// app/(auth)/layout.tsx
// Shared layout for login and register pages.
// Centered card design with brand logo/name on the left
// and the form on the right (two-column on desktop, stacked on mobile).

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "InvoicePK — Sign In",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7F5EF", // neutral-50
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#FFFFFF",
          borderRadius: "0.75rem",
          boxShadow:
            "0 10px 15px -3px rgba(43,41,36,0.08), 0 4px 6px -2px rgba(43,41,36,0.04)",
          overflow: "hidden",
        }}
      >
        {/* Brand header */}
        <div
          style={{
            backgroundColor: "#1F5C3F", // primary-600
            padding: "1.5rem 2rem",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.75rem",
              fontWeight: 900,
              color: "#FFFFFF",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            InvoicePK
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              color: "#A9C9B4", // primary-200
              margin: "0.25rem 0 0",
            }}
          >
            GST-compliant invoices for Pakistani freelancers
          </p>
        </div>

        {/* Form area */}
        <div style={{ padding: "2rem" }}>{children}</div>
      </div>
    </div>
  );
}

// app/(auth)/layout.tsx
// Shared layout for login and register pages.
// Centered card design with brand logo/name on the left
// and the form on the right (two-column on desktop, stacked on mobile).
// Provides a consistent authentication shell by wrapping every auth page
// with shared branding, metadata, and styling, eliminating duplicate layout
// code across login and registration pages. The layout renders page-specific
// content through the children prop while keeping the overall UI structure
// and visual identity consistent throughout the authentication flow.
