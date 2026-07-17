"use client";

import Link from "next/link";
import theme from "@/styles/theme";
import ThemeToggle from "@/components/ThemeToggle";

// ─── Styles ───

// Desktop nav links container
const container: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[5],
};

// Sign in link
const signInLink: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.medium,
  color: theme.colors.neutral[600],
  textDecoration: "none",
  transition: theme.transitions.fast,
  cursor: "pointer",
};

// Get Started button
const ctaBtn: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.white,
  backgroundColor: theme.colors.primary[600],
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  borderRadius: theme.radius.md,
  border: "none",
  cursor: "pointer",
  transition: theme.transitions.fast,
  textDecoration: "none",
};

// ─── Component ───
export default function DesktopLinks() {
  return (
    <div style={container}>
      <ThemeToggle />
      <Link
        href="/login"
        style={signInLink}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = theme.colors.primary[600];
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = theme.colors.neutral[600];
        }}
      >
        Sign In
      </Link>
      <Link href="/login" style={ctaBtn}>
        Get Started Free
      </Link>
    </div>
  );
}
