"use client";

import Link from "next/link";
import theme from "@/styles/theme";

// ─── Styles ───

// Center nav links container
const container: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[8],
};

// Individual nav link
const link: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.medium,
  color: theme.colors.neutral[600],
  textDecoration: "none",
  transition: theme.transitions.fast,
  cursor: "pointer",
  paddingBottom: "2px",
  borderBottom: "2px solid transparent",
};

// ─── Data ───
const links = [
  { label: "About Us", href: "#faq", isAnchor: true },
  { label: "How it Works", href: "#how-it-works", isAnchor: true },
  { label: "Invoices", href: "/dashboard", isAnchor: false },
];

// ─── Component ───
export default function CenterLinks() {
  return (
    <div style={container}>
      {links.map((l) =>
        l.isAnchor ? (
          <a
            key={l.label}
            href={l.href}
            style={link}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.primary[600];
              e.currentTarget.style.borderBottomColor = theme.colors.primary[600];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.neutral[600];
              e.currentTarget.style.borderBottomColor = "transparent";
            }}
          >
            {l.label}
          </a>
        ) : (
          <Link
            key={l.label}
            href={l.href}
            style={link}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.primary[600];
              e.currentTarget.style.borderBottomColor = theme.colors.primary[600];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.neutral[600];
              e.currentTarget.style.borderBottomColor = "transparent";
            }}
          >
            {l.label}
          </Link>
        )
      )}
    </div>
  );
}
