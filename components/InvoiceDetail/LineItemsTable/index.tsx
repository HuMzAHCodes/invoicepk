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

// Table styles (desktop)
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

// Card styles (mobile)
const cardWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[3],
};

const itemCardStyle: React.CSSProperties = {
  backgroundColor: theme.colors.neutral[50],
  border: `1px solid ${theme.colors.neutral[200]}`,
  borderRadius: theme.radius.md,
  padding: theme.spacing[3],
};

const itemHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: theme.spacing[2],
  gap: theme.spacing[2],
  flexWrap: "wrap",
};

const itemDescStyle: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.medium,
  color: theme.colors.neutral[900],
};

const itemMetaStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing[3],
  fontSize: theme.fontSizes.xs,
  color: theme.colors.neutral[600],
  fontFamily: theme.fonts.body,
};

const itemAmountStyle: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontWeight: theme.fontWeights.bold,
  fontSize: theme.fontSizes.lg,
  color: theme.colors.primary[600],
};

// ─── Component ───
export default function LineItemsTable({
  items,
  currency,
}: LineItemsTableProps) {
  return (
    <div style={card}>
      <div style={heading}>Line Items</div>

      {/* Desktop Table */}
      <div className="line-items-table-desktop" style={{ display: "none" }}>
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

      {/* Mobile Cards */}
      <div className="line-items-table-mobile" style={cardWrapperStyle}>
        {items.map((item, i) => (
          <div key={i} style={itemCardStyle}>
            <div style={itemHeaderStyle}>
              <div style={itemDescStyle}>{item.description}</div>
              <div style={itemAmountStyle}>{fmt(item.amount, currency)}</div>
            </div>
            <div style={itemMetaStyle}>
              <span>
                Qty: <strong>{item.quantity}</strong>
              </span>
              <span>
                Unit Price: <strong>{fmt(item.unitPrice, currency)}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @media (min-width: ${theme.breakpoints.md}) {
          .line-items-table-desktop {
            display: block;
          }
          .line-items-table-mobile {
            display: none;
          }
        }
        @media (max-width: ${parseInt(theme.breakpoints.md) - 1}px) {
          .line-items-table-desktop {
            display: none;
          }
          .line-items-table-mobile {
            display: flex;
          }
        }
      `}</style>
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
