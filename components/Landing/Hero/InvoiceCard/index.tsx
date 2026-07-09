"use client";

import { motion } from "framer-motion";
import theme from "@/styles/theme";

// ─── Styles ───

// Card wrapper with shadow
const card: React.CSSProperties = {
  width: "340px",
  backgroundColor: theme.colors.white,
  borderRadius: theme.radius.xl,
  border: `1px solid ${theme.colors.neutral[200]}`,
  boxShadow: theme.shadows.xl,
  overflow: "hidden",
};

// Card header bar
const header: React.CSSProperties = {
  backgroundColor: theme.colors.primary[600],
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

// Invoice number text
const invoiceNum: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.white,
};

// Status badge
const badge: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: "10px",
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.white,
  backgroundColor: "rgba(255,255,255,0.2)",
  padding: "2px 8px",
  borderRadius: theme.radius.full,
  textTransform: "uppercase" as const,
};

// Card body padding
const body: React.CSSProperties = {
  padding: theme.spacing[4],
};

// Line item row
const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: `${theme.spacing[2]} 0`,
  borderBottom: `1px solid ${theme.colors.neutral[50]}`,
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
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  backgroundColor: theme.colors.neutral[50],
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

// Net payable row with top border
const netRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  paddingTop: theme.spacing[2],
  marginTop: theme.spacing[2],
  borderTop: `2px solid ${theme.colors.primary[600]}`,
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
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.primary[600],
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
      style={card}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div style={header}>
          <span style={invoiceNum}>INV-001</span>
          <span style={badge}>Paid</span>
        </div>

        <div style={body}>
          {items.map((item, i) => (
            <div key={i} style={row}>
              <span style={desc}>{item.desc}</span>
              <span style={itemAmount}>{item.amount}</span>
            </div>
          ))}
        </div>

        <div style={totals}>
          <div style={totalRow}>
            <span>Subtotal</span>
            <span style={totalRowMono}>Rs. 175,000</span>
          </div>
          <div style={totalRow}>
            <span>GST (17%)</span>
            <span style={totalRowMono}>Rs. 29,750</span>
          </div>
          <div style={netRow}>
            <span style={netLabel}>Net Payable</span>
            <span style={netAmount}>Rs. 204,750</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
