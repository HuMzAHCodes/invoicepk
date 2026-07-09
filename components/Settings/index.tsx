"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api-client";
import theme from "@/styles/theme";
import { BusinessData } from "./types";
import LogoUpload from "./LogoUpload";
import ProfileForm from "./ProfileForm";

// ─── Styles ───

// Page wrapper with max width and padding
const page: React.CSSProperties = {
  maxWidth: "800px",
  margin: "0 auto",
  padding: `${theme.spacing[6]} ${theme.spacing[4]}`,
};

// Page heading
const header: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: theme.fontSizes["2xl"],
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.neutral[900],
  marginBottom: theme.spacing[6],
};

// Card wrapper for logo upload section
const logoCard: React.CSSProperties = {
  padding: theme.spacing[5],
  backgroundColor: theme.colors.white,
  borderRadius: theme.radius.lg,
  border: `1px solid ${theme.colors.neutral[200]}`,
  boxShadow: theme.shadows.sm,
  marginBottom: theme.spacing[4],
};

// Section heading inside logo card
const logoHeading: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: theme.fontSizes.lg,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[900],
  marginBottom: theme.spacing[4],
};

// Loading state centering
const loadingWrap: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "400px",
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.lg,
  color: theme.colors.neutral[400],
};

// ─── Component ───
export default function Settings() {
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const data = await apiGet<{ data: BusinessData }>("/business");
        setBusiness(data.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, []);

  function handleLogoUploaded(url: string) {
    setBusiness((prev) => (prev ? { ...prev, logoUrl: url || null } : prev));
  }

  function handleSaved(updated: BusinessData) {
    setBusiness(updated);
  }

  // ─── Render ───
  if (loading) return <div style={loadingWrap}>Loading settings...</div>;
  if (error) return <div style={loadingWrap}>{error}</div>;
  if (!business) return <div style={loadingWrap}>Business not found</div>;

  return (
    <div style={page}>
      <h1 style={header}>Settings</h1>

      <div style={logoCard}>
        <div style={logoHeading}>Business Logo</div>
        <LogoUpload
          currentLogoUrl={business.logoUrl}
          onLogoUploaded={handleLogoUploaded}
        />
      </div>

      <ProfileForm business={business} onSaved={handleSaved} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Serves as the main business settings page for managing company profile
//   information and branding.
// • Retrieves the authenticated user's business profile from the backend when
//   the page is loaded and manages loading and error states.
// • Displays the current business logo and profile information using dedicated
//   reusable components.
// • Coordinates logo upload functionality and immediately updates the displayed
//   business logo after a successful upload.
// • Coordinates business profile updates by synchronizing changes returned from
//   the backend with the local application state.
// • Provides graceful handling for loading, failed requests, and missing
//   business profile scenarios.
// • Keeps data fetching and state management centralized while delegating logo
//   management and profile editing responsibilities to specialized child
//   components.
// • Uses the centralized theme configuration to maintain consistent layout,
//   typography, spacing, colors, borders, shadows, and overall visual styling
//   throughout the business settings experience.
// ─────────────────────────────────────────────────────────────────────────────
