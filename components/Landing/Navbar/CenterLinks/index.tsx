"use client";

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
};

// ─── Data ───
const links = [
  { label: "About Us", href: "#about" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Invoices", href: "#pricing" },
];

// ─── Component ───
export default function CenterLinks() {
  return (
    <div style={container}>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          style={link}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.colors.primary[600];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.colors.neutral[600];
          }}
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
