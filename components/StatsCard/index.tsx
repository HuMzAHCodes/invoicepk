"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import theme from "@/styles/theme";

// ─── Types ─────────────────────────────────────────────────────────────────

interface StatsCardProps {
  label: string;
  value: number;
  formattedPrefix?: string;
  currency?: string;
  sub: string;
  valueColor?: string;
  delay?: number;
  href?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function StatsCard({
  label,
  value,
  formattedPrefix = "",
  currency = "PKR",
  sub,
  valueColor = theme.colors.neutral[900],
  delay = 0,
  href,
}: StatsCardProps) {
  const animatedValue = useCountUp(value, 800);

  const formatted = currency
    ? `${currency} ${animatedValue.toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : animatedValue.toLocaleString("en-PK");

  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.neutral[200]}`,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[6],
    transition: theme.transitions.fast,
    cursor: href ? "pointer" : "default",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing[2],
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes["2xl"],
    fontWeight: theme.fontWeights.medium,
    fontVariantNumeric: "tabular-nums",
    lineHeight: 1.2,
    marginBottom: theme.spacing[1],
    color: valueColor,
  };

  const subStyle: React.CSSProperties = {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.neutral[400],
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: "easeOut" }}
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = theme.shadows.md;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>
        {formattedPrefix}
        {formatted}
      </div>
      <div style={subStyle}>{sub}</div>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "block" }}>
        {content}
      </Link>
    );
  }

  return content;
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Renders a reusable dashboard statistics card displaying a label, animated
//   numeric value, and supporting subtitle.
// • Uses the custom useCountUp hook to smoothly animate value changes for an
//   engaging user experience.
// • Formats values according to the Pakistani locale, with optional currency
//   formatting and configurable value prefixes.
// • Supports customizable value colors to visually distinguish different
//   statistic categories (e.g., revenue, expenses, profit).
// • Animates the card into view using Framer Motion with configurable entrance
//   delays for staggered dashboard layouts.
// • Applies hover effects including subtle elevation, shadow, and lift
//   animations to improve interactivity.
// • Optionally wraps the card in a Next.js Link, allowing it to function as a
//   clickable navigation element while remaining reusable for static displays.
// • Uses the centralized theme configuration to ensure consistent styling,
//   spacing, typography, colors, borders, and transitions across the dashboard.
// ─────────────────────────────────────────────────────────────────────────────
