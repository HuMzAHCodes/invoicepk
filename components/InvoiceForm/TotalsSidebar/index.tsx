import theme from "@/styles/theme";

interface Totals {
  subtotal: number;
  gstAmount: number;
  total: number;
  whtAmount: number;
  netPayable: number;
}

interface TotalsSidebarProps {
  totals: Totals;
  currency: "PKR" | "USD";
  gstType: "standard" | "zero_rated" | "exempt";
  whtApplicable: boolean;
}

function formatCurrency(amount: number, currency: "PKR" | "USD"): string {
  if (currency === "PKR") {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function TotalsSidebar({
  totals,
  currency,
  gstType,
  whtApplicable,
}: TotalsSidebarProps) {
  const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${theme.spacing[2]} 0`,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[600],
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.neutral[900],
  };

  return (
    <div
      style={{
        backgroundColor: theme.colors.white,
        border: `1px solid ${theme.colors.neutral[200]}`,
        borderRadius: theme.radius.lg,
        padding: theme.spacing[5],
        position: "sticky",
        top: "88px",
      }}
    >
      <h3
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSizes.base,
          fontWeight: theme.fontWeights.semibold,
          color: theme.colors.neutral[900],
          margin: "0 0 16px",
        }}
      >
        Invoice Summary
      </h3>

      <div style={rowStyle}>
        <span style={labelStyle}>Subtotal</span>
        <span style={valueStyle}>
          {formatCurrency(totals.subtotal, currency)}
        </span>
      </div>

      {gstType === "standard" && (
        <div style={rowStyle}>
          <span style={labelStyle}>GST</span>
          <span style={valueStyle}>
            {formatCurrency(totals.gstAmount, currency)}
          </span>
        </div>
      )}

      {gstType === "zero_rated" && (
        <div style={rowStyle}>
          <span style={labelStyle}>GST (Zero-Rated)</span>
          <span style={{ ...valueStyle, color: theme.colors.neutral[400] }}>
            {formatCurrency(0, currency)}
          </span>
        </div>
      )}

      <div
        style={{
          borderTop: `1px solid ${theme.colors.neutral[200]}`,
          margin: `${theme.spacing[2]} 0`,
        }}
      />

      <div style={rowStyle}>
        <span
          style={{
            ...labelStyle,
            fontWeight: theme.fontWeights.semibold,
            color: theme.colors.neutral[900],
          }}
        >
          Total
        </span>
        <span style={{ ...valueStyle, fontWeight: theme.fontWeights.semibold }}>
          {formatCurrency(totals.total, currency)}
        </span>
      </div>

      {whtApplicable && (
        <div style={rowStyle}>
          <span style={{ ...labelStyle, color: theme.colors.danger[600] }}>
            WHT Deduction
          </span>
          <span style={{ ...valueStyle, color: theme.colors.danger[600] }}>
            - {formatCurrency(totals.whtAmount, currency)}
          </span>
        </div>
      )}

      <div
        style={{
          marginTop: theme.spacing[3],
          padding: theme.spacing[4],
          backgroundColor: theme.colors.success[50],
          border: `2px solid ${theme.colors.success[600]}`,
          borderRadius: theme.radius.md,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes.sm,
            fontWeight: theme.fontWeights.semibold,
            color: theme.colors.success[600],
          }}
        >
          NET PAYABLE
        </span>
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSizes.lg,
            fontWeight: theme.fontWeights.bold,
            color: theme.colors.success[600],
          }}
        >
          {formatCurrency(totals.netPayable, currency)}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Provides a reusable invoice totals sidebar that summarizes calculated
//   invoice amounts during invoice creation and editing.
// • Formats monetary values according to the selected invoice currency,
//   supporting both PKR and USD using locale-aware currency formatting.
// • Displays subtotal, GST, total, WHT deduction, and net payable amounts
//   supplied by the parent component.
// • Conditionally renders GST information based on the selected GST type,
//   including support for standard, zero-rated, and exempt invoices.
// • Displays withholding tax deductions only when WHT is applicable,
//   clearly highlighting the deducted amount.
// • Emphasizes the final net payable amount using a dedicated summary section
//   to improve readability and help users verify invoice totals.
// • Uses a sticky sidebar layout so invoice totals remain visible while users
//   scroll through longer invoice forms.
// • Applies centralized theme styling to ensure consistent spacing,
//   typography, colors, borders, and visual hierarchy throughout the
//   invoice module.
// ─────────────────────────────────────────────────────────────────────────────
