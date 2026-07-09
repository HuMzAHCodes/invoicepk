"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import theme from "@/styles/theme";

// ─── Styles ───

// Section wrapper — bold primary-600 background
const section: React.CSSProperties = {
  backgroundColor: theme.colors.primary[600],
  padding: `${theme.spacing[16]} ${theme.spacing[4]}`,
  textAlign: "center",
};

// Main heading
const heading: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: "2.25rem",
  fontWeight: theme.fontWeights.black,
  color: theme.colors.white,
  lineHeight: 1.2,
  marginBottom: theme.spacing[4],
};

// Subheading
const subheading: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.lg,
  color: theme.colors.primary[200],
  marginBottom: theme.spacing[8],
};

// CTA button
const btn: React.CSSProperties = {
  display: "inline-block",
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.base,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.primary[600],
  backgroundColor: theme.colors.white,
  padding: `${theme.spacing[3]} ${theme.spacing[8]}`,
  borderRadius: theme.radius.md,
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
};

// ─── Component ───
export default function CTABanner() {
  return (
    <section style={section}>
      <motion.h2
        style={heading}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        Start invoicing for free today.
      </motion.h2>

      <motion.p
        style={subheading}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Join Pakistani freelancers who invoice the smart way.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Link href="/login" style={btn}>
          Get started — it&apos;s free
        </Link>
      </motion.div>
    </section>
  );
}
