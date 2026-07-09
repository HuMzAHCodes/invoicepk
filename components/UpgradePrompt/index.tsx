"use client";

import { AlertTriangle } from "lucide-react";
import theme from "@/styles/theme";

// ─── Props ───
interface UpgradePromptProps {
  onDismiss: () => void;
}

// ─── Styles ───

// Overlay covering the entire viewport
const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(43, 41, 36, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9998,
};

// Modal card
const card: React.CSSProperties = {
  backgroundColor: theme.colors.white,
  borderRadius: theme.radius.xl,
  padding: theme.spacing[8],
  maxWidth: "420px",
  width: "90%",
  boxShadow: theme.shadows.xl,
  textAlign: "center",
};

// Warning icon circle
const iconWrap: React.CSSProperties = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  backgroundColor: theme.colors.warning[50],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: `0 auto ${theme.spacing[4]}`,
};

// Modal heading
const heading: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: theme.fontSizes.xl,
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.neutral[900],
  marginBottom: theme.spacing[2],
};

// Modal description
const description: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[600],
  lineHeight: 1.6,
  marginBottom: theme.spacing[5],
};

// Dismiss button
const dismissBtn: React.CSSProperties = {
  padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
  backgroundColor: theme.colors.primary[600],
  color: theme.colors.white,
  border: "none",
  borderRadius: theme.radius.md,
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.semibold,
  cursor: "pointer",
  transition: theme.transitions.fast,
};

// ─── Component ───
export default function UpgradePrompt({ onDismiss }: UpgradePromptProps) {
  return (
    <div style={overlay} onClick={onDismiss}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={iconWrap}>
          <AlertTriangle size={28} color={theme.colors.warning[600]} />
        </div>
        <div style={heading}>Free Tier Limit Reached</div>
        <div style={description}>
          You&apos;ve created 5 invoices this month. Upgrade to Pro for
          unlimited invoices, custom branding, and priority support.
        </div>
        <button
          style={dismissBtn}
          onClick={onDismiss}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Provides a reusable modal dialog that informs users when the free-tier
//   monthly invoice creation limit has been reached.
// • Presents a clear upgrade message highlighting the benefits of the Pro plan,
//   including unlimited invoices, custom branding, and priority support.
// • Displays a prominent warning icon and styled modal to draw attention to the
//   subscription limitation.
// • Allows users to dismiss the modal either by clicking the backdrop or the
//   confirmation button.
// • Prevents accidental dismissal when interacting directly with the modal
//   content by stopping click event propagation.
// • Applies hover feedback to interactive controls for a smoother user
//   experience.
// • Uses the centralized theme configuration to maintain consistent typography,
//   spacing, colors, borders, shadows, and modal styling across the application.
// ─────────────────────────────────────────────────────────────────────────────
