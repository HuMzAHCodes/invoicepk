"use client";

import Link from "next/link";
import theme from "@/styles/theme";

// ─── Styles ───

// Logo wordmark
const logo: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: theme.fontSizes.xl,
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.primary[600],
  textDecoration: "none",
  cursor: "pointer",
};

// ─── Component ───
export default function Logo() {
  return (
    <Link href="/" style={logo}>
      InvoicePK
    </Link>
  );
}
