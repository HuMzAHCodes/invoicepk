"use client";

import Link from "next/link";
import theme from "@/styles/theme";

// ─── Types ─────────────────────────────────────────────────────────────────

interface DashboardHeaderProps {
  firstName: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function DashboardHeader({ firstName }: DashboardHeaderProps) {
  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing[4],
    marginBottom: theme.spacing[8],
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSizes["3xl"],
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.neutral[900],
    margin: 0,
    lineHeight: 1.2,
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.regular,
    color: theme.colors.neutral[600],
    marginTop: theme.spacing[1],
  };

  const btnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
    backgroundColor: theme.colors.primary[600],
    color: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    borderRadius: theme.radius.md,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    transition: theme.transitions.fast,
    whiteSpace: "nowrap",
    flexShrink: 0,
  };

  return (
    <div style={rowStyle}>
      <div>
        <h1 style={titleStyle}>Dashboard</h1>
        <p style={subtitleStyle}>Welcome back, {firstName}</p>
      </div>
      <Link
        href="/invoices/new"
        style={btnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.primary[400];
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.primary[600];
        }}
      >
        + New Invoice
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Renders the dashboard header with a personalized welcome message using the
//   authenticated user's first name.
// • Displays the primary Dashboard page title and supporting subtitle for
//   improved user orientation.
// • Provides a prominent "New Invoice" call-to-action button for quickly
//   creating a new invoice.
// • Navigates users to the invoice creation page using Next.js client-side
//   routing for a seamless experience.
// • Applies interactive hover effects to the action button to improve visual
//   feedback and user engagement.
// • Uses responsive flexbox layout to keep the heading and action button
//   properly aligned while wrapping gracefully on smaller screens.
// • Leverages the centralized theme configuration for consistent typography,
//   colors, spacing, border radius, and transition effects across the
//   application.
// ─────────────────────────────────────────────────────────────────────────────
