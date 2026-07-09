"use client";

import theme from "@/styles/theme";
import { InvoiceData } from "../types";

// ─── Props ───
interface InvoiceInfoProps {
  invoice: InvoiceData;
}

// ─── Helpers ───
const fmtDate = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

// ─── Styles ───
const card: React.CSSProperties = {
  padding: theme.spacing[5],
  backgroundColor: theme.colors.white,
  borderRadius: theme.radius.lg,
  border: `1px solid ${theme.colors.neutral[200]}`,
  boxShadow: theme.shadows.sm,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: theme.spacing[4],
};

const label: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.xs,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[400],
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  marginBottom: theme.spacing[1],
};

const value: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.medium,
  color: theme.colors.neutral[900],
};

const monoValue: React.CSSProperties = {
  ...value,
  fontFamily: theme.fonts.mono,
};

// ─── Component ───
export default function InvoiceInfo({ invoice }: InvoiceInfoProps) {
  const clientName = invoice.client?.name ?? "No client";
  const clientEmail = invoice.client?.email ?? "";
  const clientNtn = invoice.client?.ntn ?? "";

  return (
    <div style={card}>
      <div style={grid}>
        <div>
          <div style={label}>Invoice Number</div>
          <div
            style={{
              ...value,
              fontFamily: theme.fonts.mono,
              fontWeight: theme.fontWeights.bold,
            }}
          >
            {invoice.invoiceNumber}
          </div>
        </div>
        <div>
          <div style={label}>Status</div>
          <div style={value}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </div>
        </div>
        <div>
          <div style={label}>Client</div>
          <div style={value}>{clientName}</div>
          {clientEmail && (
            <div
              style={{
                ...value,
                fontSize: theme.fontSizes.xs,
                color: theme.colors.neutral[400],
              }}
            >
              {clientEmail}
            </div>
          )}
          {clientNtn && (
            <div
              style={{
                ...monoValue,
                fontSize: theme.fontSizes.xs,
                color: theme.colors.neutral[400],
              }}
            >
              NTN: {clientNtn}
            </div>
          )}
        </div>
        <div>
          <div style={label}>Currency</div>
          <div style={value}>{invoice.currency}</div>
        </div>
        <div>
          <div style={label}>Issue Date</div>
          <div style={value}>{fmtDate(invoice.issueDate)}</div>
        </div>
        <div>
          <div style={label}>Due Date</div>
          <div style={value}>{fmtDate(invoice.dueDate)}</div>
        </div>
      </div>
    </div>
  );
}
