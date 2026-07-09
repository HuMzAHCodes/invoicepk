"use client";

import theme from "@/styles/theme";

// ─── Types ───
interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface LineItemsTableProps {
  items: LineItem[];
  currency: "PKR" | "USD";
}

// ─── Helpers ───
const fmt = (n: number, currency: "PKR" | "USD") => {
  const sym = currency === "PKR" ? "Rs." : "$";
  return `${sym} ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const thBase: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.xs,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[400],
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  borderBottom: `1px solid ${theme.colors.neutral[200]}`,
  textAlign: "left",
};

const thRight: React.CSSProperties = {
  ...thBase,
  textAlign: "right",
};

const tdBase: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[900],
  padding: `${theme.spacing[3]} ${theme.spacing[3]}`,
  borderBottom: `1px solid ${theme.colors.neutral[50]}`,
};

const tdRight: React.CSSProperties = {
  ...tdBase,
  fontFamily: theme.fonts.mono,
  textAlign: "right",
};

const tdDesc: React.CSSProperties = {
  ...tdBase,
  fontWeight: theme.fontWeights.medium,
};

// ─── Component ───
export default function LineItemsTable({
  items,
  currency,
}: LineItemsTableProps) {
  return (
    <div style={card}>
      <div style={heading}>Line Items</div>
      <table style={table}>
        <thead>
          <tr>
            <th style={thBase}>Description</th>
            <th style={thRight}>Qty</th>
            <th style={thRight}>Unit Price</th>
            <th style={thRight}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td style={tdDesc}>{item.description}</td>
              <td style={tdRight}>{item.quantity}</td>
              <td style={tdRight}>{fmt(item.unitPrice, currency)}</td>
              <td style={tdRight}>{fmt(item.amount, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Renders a reusable table displaying all invoice line items in a structured
//   and easy-to-read format.
// • Presents each item's description, quantity, unit price, and calculated
//   amount using a consistent tabular layout.
// • Formats monetary values according to the selected invoice currency,
//   supporting both PKR and USD with localized number formatting.
// • Uses monospaced typography for numeric values to improve alignment and
//   readability of financial information.
// • Separates table headings, descriptions, and numeric data through reusable
//   style definitions, ensuring a clean and maintainable component structure.
// • Displays invoice line items dynamically from the provided dataset without
//   imposing limits on the number of rows rendered.
// • Uses the centralized theme configuration to maintain consistent typography,
//   spacing, borders, colors, shadows, and overall visual styling throughout
//   the invoice details interface.
// ─────────────────────────────────────────────────────────────────────────────
