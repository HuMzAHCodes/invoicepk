'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import theme from '@/styles/theme';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: { id: string; name: string } | null;
  status: 'draft' | 'sent' | 'paid';
  subtotal: number;
  gstAmount: number;
  total: number;
  netPayable: number;
  currency: string;
  issueDate: string;
  dueDate: string | null;
}

interface InvoiceTableProps {
  invoices: Invoice[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: theme.colors.warning[50], text: theme.colors.warning[600] },
  sent:  { bg: theme.colors.primary[50], text: theme.colors.primary[600] },
  paid:  { bg: theme.colors.success[50], text: theme.colors.success[600] },
};

function formatAmount(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function InvoiceTable({ invoices }: InvoiceTableProps) {
  // ─── Styles ────────────────────────────────────────────────────────────

  const wrapperStyle: React.CSSProperties = {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.neutral[200]}`,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
  };

  const thStyle: React.CSSProperties = {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    textAlign: 'left',
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.neutral[600],
    borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    backgroundColor: theme.colors.neutral[50],
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    color: theme.colors.neutral[900],
    borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    verticalAlign: 'middle',
  };

  const amountStyle: React.CSSProperties = {
    fontFamily: theme.fonts.mono,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
  };

  const viewBtnStyle: React.CSSProperties = {
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.neutral[200]}`,
    backgroundColor: theme.colors.white,
    color: theme.colors.neutral[900],
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    cursor: 'pointer',
    transition: theme.transitions.fast,
    textDecoration: 'none',
    display: 'inline-block',
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div style={wrapperStyle}>
      <div className="invoices-table-scroll" style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Invoice #</th>
              <th style={thStyle}>Client</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
              <th style={thStyle}>Issue Date</th>
              <th style={thStyle}>Due Date</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => {
              const colors = STATUS_COLORS[inv.status] ?? STATUS_COLORS.draft;

              return (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                >
                  <td style={tdStyle}>
                    <Link
                      href={`/invoices/${inv.id}`}
                      style={{
                        color: theme.colors.primary[600],
                        textDecoration: 'none',
                        fontWeight: theme.fontWeights.medium,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td style={tdStyle}>{inv.client?.name ?? '—'}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
                        borderRadius: theme.radius.full,
                        fontFamily: theme.fonts.body,
                        fontSize: theme.fontSizes.xs,
                        fontWeight: theme.fontWeights.medium,
                        backgroundColor: colors.bg,
                        color: colors.text,
                        textTransform: 'capitalize',
                      }}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, ...amountStyle }}>
                    {formatAmount(inv.netPayable, inv.currency)}
                  </td>
                  <td style={tdStyle}>{formatDate(inv.issueDate)}</td>
                  <td style={tdStyle}>
                    {inv.dueDate ? formatDate(inv.dueDate) : '—'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <Link
                      href={`/invoices/${inv.id}`}
                      style={viewBtnStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          theme.colors.neutral[50];
                        e.currentTarget.style.borderColor =
                          theme.colors.primary[600];
                        e.currentTarget.style.color =
                          theme.colors.primary[600];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          theme.colors.white;
                        e.currentTarget.style.borderColor =
                          theme.colors.neutral[200];
                        e.currentTarget.style.color =
                          theme.colors.neutral[900];
                      }}
                    >
                      View
                    </Link>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}