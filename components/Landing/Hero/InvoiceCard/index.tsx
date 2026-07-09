"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import theme from "@/styles/theme";

// ─── Styles ───

// Ghost card behind main card for depth effect
const ghostCard: React.CSSProperties = {
  position: "absolute",
  top: "12px",
  left: "-8px",
  width: "100%",
  height: "100%",
  backgroundColor: theme.colors.neutral[50],
  borderRadius: "16px",
  border: `1px solid ${theme.colors.neutral[200]}`,
  transform: "rotate(-2deg)",
  zIndex: 0,
};

// Main card wrapper with rotation and premium shadow
const card: React.CSSProperties = {
  position: "relative",
  minWidth: "380px",
  maxWidth: "440px",
  width: "100%",
  backgroundColor: theme.colors.white,
  borderRadius: "16px",
  border: "1px solid rgba(31, 92, 63, 0.12)",
  boxShadow: "0 32px 64px rgba(15, 46, 31, 0.18), 0 8px 16px rgba(15, 46, 31, 0.08)",
  overflow: "hidden",
  transform: "rotate(3deg)",
  zIndex: 1,
};

// Card header bar
const header: React.CSSProperties = {
  backgroundColor: theme.colors.primary[600],
  padding: `${theme.spacing[4]} ${theme.spacing[5]}`,
};

// Header top row — invoice number and badge
const headerTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing[1],
};

// Invoice number text
const invoiceNum: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.white,
};

// PAID badge with checkmark
const badge: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  fontFamily: theme.fonts.body,
  fontSize: "10px",
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.white,
  backgroundColor: theme.colors.success[400],
  padding: "4px 10px",
  borderRadius: theme.radius.full,
  textTransform: "uppercase" as const,
};

// Business name below invoice number
const businessName: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.xs,
  color: theme.colors.primary[200],
};

// Card body
const body: React.CSSProperties = {
  padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
};

// Line item row with green left border
const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 16px",
  borderLeft: `3px solid ${theme.colors.primary[200]}`,
  marginBottom: "2px",
  backgroundColor: theme.colors.white,
};

// Item description text
const desc: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[900],
};

// Item amount text
const itemAmount: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[600],
};

// Totals section background
const totals: React.CSSProperties = {
  padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
  backgroundColor: theme.colors.neutral[50],
  borderTop: `1px solid ${theme.colors.neutral[200]}`,
};

// Individual total row
const totalRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "4px 0",
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.xs,
  color: theme.colors.neutral[600],
};

// Total row with mono font
const totalRowMono: React.CSSProperties = {
  ...totalRow,
  fontFamily: theme.fonts.mono,
};

// Divider line between GST and Net Payable
const divider: React.CSSProperties = {
  borderTop: `1px solid ${theme.colors.neutral[200]}`,
  margin: `${theme.spacing[2]} 0`,
};

// Net payable row with highlighted background
const netRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  marginTop: theme.spacing[2],
  backgroundColor: theme.colors.primary[50],
  borderRadius: theme.radius.md,
};

// Net payable label
const netLabel: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.primary[900],
};

// Net payable amount
const netAmount: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: "1.1rem",
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.primary[600],
};

// Card footer
const footer: React.CSSProperties = {
  padding: `${theme.spacing[2]} ${theme.spacing[5]}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  borderTop: `1px solid ${theme.colors.neutral[50]}`,
};

// Green dot before footer text
const dot: React.CSSProperties = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  backgroundColor: theme.colors.primary[400],
  flexShrink: 0,
};

// Footer text
const footerText: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: "0.7rem",
  color: theme.colors.neutral[400],
};

// ─── Data ───
const items = [
  { desc: "Website Development", amount: "Rs. 100,000" },
  { desc: "UI/UX Design", amount: "Rs. 50,000" },
  { desc: "SEO Optimization", amount: "Rs. 25,000" },
];

// ─── Component ───
export default function InvoiceCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60, rotate: 6 }}
      animate={{ opacity: 1, x: 0, rotate: 3 }}
      transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
      style={{ position: "relative" }}
    >
      {/* Ghost card */}
      <motion.div
        style={ghostCard}
        initial={{ opacity: 0, x: 40, rotate: -4 }}
        animate={{ opacity: 1, x: 0, rotate: -2 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
      />

      {/* Main card with float */}
      <motion.div
        style={card}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Header */}
        <div style={header}>
          <div style={headerTop}>
            <span style={invoiceNum}>INV-001</span>
            <span style={badge}>
              <Check size={10} strokeWidth={3} />
              PAID
            </span>
          </div>
          <div style={businessName}>Ali Raza Consulting</div>
        </div>

        {/* Line Items */}
        <div style={body}>
          {items.map((item, i) => (
            <div key={i} style={row}>
              <span style={desc}>{item.desc}</span>
              <span style={itemAmount}>{item.amount}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={totals}>
          <div style={totalRow}>
            <span>Subtotal</span>
            <span style={totalRowMono}>Rs. 175,000</span>
          </div>
          <div style={totalRow}>
            <span>GST (17%)</span>
            <span style={totalRowMono}>Rs. 29,750</span>
          </div>
          <div style={divider} />
          <div style={netRow}>
            <span style={netLabel}>Net Payable</span>
            <span style={netAmount}>Rs. 2,04,750</span>
          </div>
        </div>

        {/* Footer */}
        <div style={footer}>
          <div style={dot} />
          <span style={footerText}>Generated by InvoicePK</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
