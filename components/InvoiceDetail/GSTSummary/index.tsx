"use client";

import theme from "@/styles/theme";

// ─── Props ───
interface GSTSummaryProps {
  gstType: string;
  gstRate: number;
  subtotal: number;
  gstAmount: number;
  total: number;
  whtApplicable: boolean;
  whtRate: number;
  whtAmount: number;
  netPayable: number;
  currency: "PKR" | "USD";
}

// ─── Helpers ───
const fmt = (n: number, currency: "PKR" | "USD") => {
  const sym = currency === "PKR" ? "Rs." : "$";
  return `${sym} ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const gstLabel: Record<string, string> = {
  standard: "Standard",
  zero_rated: "Zero-Rated",
  exempt: "Exempt",
};

// ─── Styles ───
const card: React.CSSProperties = {
  padding: theme.spacing[5],
  backgroundColor: theme.colors.white,
  borderRadius: theme.radius.lg,
  border: `1px solid ${theme.colors.neutral[200]}`,
  boxShadow: theme.shadows.sm,
};

const heading: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: theme.fontSizes.lg,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[900],
  marginBottom: theme.spacing[4],
};

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `${theme.spacing[2]} 0`,
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
};

const labelStyle: React.CSSProperties = {
  color: theme.colors.neutral[600],
};

const amountStyle: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontWeight: theme.fontWeights.medium,
  color: theme.colors.neutral[900],
};

const divider: React.CSSProperties = {
  borderTop: `1px solid ${theme.colors.neutral[200]}`,
  margin: `${theme.spacing[2]} 0`,
};

const totalRow: React.CSSProperties = {
  ...row,
  paddingTop: theme.spacing[3],
  marginTop: theme.spacing[2],
  borderTop: `1px solid ${theme.colors.neutral[200]}`,
  fontWeight: theme.fontWeights.semibold,
  fontSize: theme.fontSizes.base,
};

const whtRow: React.CSSProperties = {
  ...row,
  color: theme.colors.danger[600],
};

const netRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `${theme.spacing[4]} 0 ${theme.spacing[2]}`,
  borderTop: `2px solid ${theme.colors.primary[600]}`,
  marginTop: theme.spacing[3],
};

const netLabel: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.lg,
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.primary[900],
};

const netAmount: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: theme.fontSizes.xl,
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.primary[600],
};

const note: React.CSSProperties = {
  marginTop: theme.spacing[4],
  padding: theme.spacing[3],
  backgroundColor: theme.colors.neutral[50],
  borderRadius: theme.radius.md,
  fontSize: theme.fontSizes.xs,
  color: theme.colors.neutral[400],
  lineHeight: 1.5,
};

// ─── Component ───
export default function GSTSummary({
  gstType,
  gstRate,
  subtotal,
  gstAmount,
  total,
  whtApplicable,
  whtRate,
  whtAmount,
  netPayable,
  currency,
}: GSTSummaryProps) {
  return (
    <div style={card}>
      <div style={heading}>GST Breakdown</div>

      <div style={row}>
        <span style={labelStyle}>Subtotal</span>
        <span style={amountStyle}>{fmt(subtotal, currency)}</span>
      </div>

      <div style={row}>
        <span style={labelStyle}>
          GST ({gstLabel[gstType] ?? gstType}{" "}
          {gstType === "standard" ? `${gstRate}%` : ""})
        </span>
        <span style={amountStyle}>
          {gstAmount > 0 ? fmt(gstAmount, currency) : "—"}
        </span>
      </div>

      <div style={{ ...totalRow, borderTop: divider.borderTop }}>
        <span
          style={{
            ...labelStyle,
            fontWeight: theme.fontWeights.semibold,
            color: theme.colors.neutral[900],
          }}
        >
          Total
        </span>
        <span
          style={{ ...amountStyle, fontWeight: theme.fontWeights.semibold }}
        >
          {fmt(total, currency)}
        </span>
      </div>

      {whtApplicable && (
        <div style={whtRow}>
          <span>WHT ({whtRate}%)</span>
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontWeight: theme.fontWeights.medium,
            }}
          >
            -{fmt(whtAmount, currency)}
          </span>
        </div>
      )}

      <div style={netRow}>
        <span style={netLabel}>Net Payable</span>
        <span style={netAmount}>
          {fmt(whtApplicable ? netPayable : total, currency)}
        </span>
      </div>

      <div style={note}>
        Calculations are performed server-side. GST is applied on subtotal only.
        WHT is deducted from subtotal, not total.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Displays a comprehensive financial summary of invoice tax calculations in
//   a reusable GST breakdown card.
// • Presents subtotal, GST, invoice total, optional WHT deduction, and the
//   final net payable amount in a structured financial summary.
// • Supports all GST modes (Standard, Zero-Rated, and Exempt), displaying the
//   appropriate tax label and GST rate where applicable.
// • Conditionally displays WHT calculations only when withholding tax has been
//   applied, ensuring the summary reflects the invoice's tax configuration.
// • Formats all monetary values according to the selected invoice currency,
//   providing consistent PKR and USD presentation throughout the interface.
// • Highlights the final payable amount using prominent typography and visual
//   styling to emphasize the invoice's most important financial figure.
// • Includes an informational note explaining how GST and WHT calculations are
//   applied, improving transparency and user understanding of tax totals.
// • Uses reusable styling definitions together with the centralized theme
//   configuration to maintain consistent typography, spacing, colors, borders,
//   shadows, and financial data presentation across the invoice details pages.
// ─────────────────────────────────────────────────────────────────────────────
