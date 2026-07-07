"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import theme from "@/styles/theme";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: { id: string; name: string } | null;
  status: "draft" | "sent" | "paid";
  total: number;
  netPayable: number;
  currency: string;
  issueDate: string;
  dueDate: string | null;
}

interface RecentInvoicesTableProps {
  invoices: Invoice[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: theme.colors.warning[50], text: theme.colors.warning[600] },
  sent: { bg: theme.colors.primary[50], text: theme.colors.primary[600] },
  paid: { bg: theme.colors.success[50], text: theme.colors.success[600] },
};

function formatAmount(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function RecentInvoicesTable({
  invoices,
}: RecentInvoicesTableProps) {
  // ─── Styles ────────────────────────────────────────────────────────────

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing[4],
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.neutral[900],
    margin: 0,
  };

  const viewAllStyle: React.CSSProperties = {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.primary[600],
    textDecoration: "none",
    transition: theme.transitions.fast,
  };

  const wrapperStyle: React.CSSProperties = {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.neutral[200]}`,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
  };

  const thStyle: React.CSSProperties = {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    textAlign: "left",
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.neutral[600],
    borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    backgroundColor: theme.colors.neutral[50],
  };

  const tdStyle: React.CSSProperties = {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    color: theme.colors.neutral[900],
    borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    verticalAlign: "middle",
  };

  const amountStyle: React.CSSProperties = {
    fontFamily: theme.fonts.mono,
    fontVariantNumeric: "tabular-nums",
  };

  const emptyStyle: React.CSSProperties = {
    padding: `${theme.spacing[12]} ${theme.spacing[4]}`,
    textAlign: "center",
    color: theme.colors.neutral[400],
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
  };

  const emptyBtnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
    backgroundColor: theme.colors.primary[600],
    color: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    borderRadius: theme.radius.md,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    transition: theme.transitions.fast,
    marginTop: theme.spacing[4],
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Recent Invoices</h2>
        <Link
          href="/invoices"
          style={viewAllStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = "none";
          }}
        >
          View all
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div style={{ ...wrapperStyle, ...emptyStyle }}>
          <p>No invoices yet. Create your first invoice.</p>
          <Link
            href="/invoices/new"
            style={emptyBtnStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary[400];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary[600];
            }}
          >
            Create Invoice
          </Link>
        </div>
      ) : (
        <div style={wrapperStyle}>
          <div className="dashboard-table-scroll">
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Invoice #</th>
                  <th style={thStyle}>Client</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => {
                  const colors =
                    STATUS_COLORS[inv.status] ?? STATUS_COLORS.draft;

                  return (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.3 + i * 0.05 }}
                    >
                      <td style={tdStyle}>
                        <Link
                          href={`/invoices/${inv.id}`}
                          style={{
                            color: theme.colors.primary[600],
                            textDecoration: "none",
                            fontWeight: theme.fontWeights.medium,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.textDecoration = "underline";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.textDecoration = "none";
                          }}
                        >
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td style={tdStyle}>{inv.client?.name ?? "—"}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
                            borderRadius: theme.radius.full,
                            fontFamily: theme.fonts.body,
                            fontSize: theme.fontSizes.xs,
                            fontWeight: theme.fontWeights.medium,
                            backgroundColor: colors.bg,
                            color: colors.text,
                            textTransform: "capitalize",
                          }}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <span style={amountStyle}>
                          {formatAmount(inv.netPayable, inv.currency)}
                        </span>
                      </td>
                      <td style={tdStyle}>{formatDate(inv.issueDate)}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Displays a dashboard table containing the user's most recent invoices for
//   quick financial and billing overview.
// • Provides direct navigation to the full invoices listing through the
//   "View all" action link.
// • Handles empty states gracefully by showing a friendly message and a
//   prominent call-to-action for creating the first invoice.
// • Formats invoice amounts using localized Pakistani number formatting and
//   currency display conventions.
// • Formats invoice issue dates into a readable, user-friendly format.
// • Applies visually distinct status badges for draft, sent, and paid invoices
//   using semantic color coding for faster recognition.
// • Links individual invoice numbers to their respective invoice detail pages
//   for quick access and management.
// • Uses Framer Motion to animate table rows as they appear, creating a smooth
//   and polished dashboard experience.
// • Supports horizontal scrolling through the table wrapper to improve
//   usability on smaller screens and constrained layouts.
// • Leverages the centralized theme system for consistent typography, spacing,
//   colors, borders, hover states, and overall visual design.
// ─────────────────────────────────────────────────────────────────────────────
