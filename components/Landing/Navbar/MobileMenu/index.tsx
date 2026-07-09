"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import theme from "@/styles/theme";

// ─── Props ───
interface MobileMenuProps {
  onClose: () => void;
}

// ─── Styles ───

// Mobile overlay backdrop
const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(43, 41, 36, 0.5)",
  zIndex: 200,
};

// Mobile menu panel
const panel: React.CSSProperties = {
  position: "fixed",
  top: 0,
  right: 0,
  width: "280px",
  height: "100%",
  backgroundColor: theme.colors.white,
  zIndex: 201,
  padding: theme.spacing[6],
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[4],
  boxShadow: theme.shadows.xl,
};

// Close button
const closeBtn: React.CSSProperties = {
  position: "absolute",
  top: theme.spacing[4],
  right: theme.spacing[4],
  background: "none",
  border: "none",
  cursor: "pointer",
  color: theme.colors.neutral[600],
};

// Nav link
const link: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.lg,
  fontWeight: theme.fontWeights.medium,
  color: theme.colors.neutral[900],
  textDecoration: "none",
  padding: `${theme.spacing[3]} 0`,
  borderBottom: `1px solid ${theme.colors.neutral[50]}`,
  cursor: "pointer",
  transition: theme.transitions.fast,
};

// CTA button
const ctaBtn: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.white,
  backgroundColor: theme.colors.primary[600],
  padding: theme.spacing[3],
  borderRadius: theme.radius.md,
  border: "none",
  cursor: "pointer",
  transition: theme.transitions.fast,
  textDecoration: "none",
  textAlign: "center",
  marginTop: theme.spacing[4],
};

// ─── Component ───
export default function MobileMenu({ onClose }: MobileMenuProps) {
  return (
    <>
      <motion.div
        style={overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        style={panel}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <button style={closeBtn} onClick={onClose}>
          <X size={24} />
        </button>

        <Link href="/login" style={link} onClick={onClose}>
          Sign In
        </Link>
        <Link href="/login" style={ctaBtn} onClick={onClose}>
          Get Started Free
        </Link>
      </motion.div>
    </>
  );
}
