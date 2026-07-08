'use client';

import theme from '@/styles/theme';

// ─── Types ─────────────────────────────────────────────────────────────────

interface InvoicePaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function InvoicePagination({
  page,
  limit,
  total,
  onPageChange,
}: InvoicePaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  // ─── Styles ────────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing[4],
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
  };

  const infoStyle: React.CSSProperties = {
    color: theme.colors.neutral[600],
  };

  const buttonsStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing[2],
  };

  function btnStyle(disabled: boolean): React.CSSProperties {
    return {
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      borderRadius: theme.radius.md,
      border: `1px solid ${disabled ? theme.colors.neutral[200] : theme.colors.primary[600]}`,
      backgroundColor: disabled ? theme.colors.neutral[50] : theme.colors.white,
      color: disabled ? theme.colors.neutral[400] : theme.colors.primary[600],
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: theme.transitions.fast,
    };
  }

  // ─── Render ────────────────────────────────────────────────────────────

  if (total === 0) return null;

  return (
    <div style={containerStyle}>
      <span style={infoStyle}>
        Showing {from}–{to} of {total} invoices
      </span>

      <div style={buttonsStyle}>
        <button
          type="button"
          style={btnStyle(isFirst)}
          disabled={isFirst}
          onClick={() => onPageChange(page - 1)}
          onMouseEnter={(e) => {
            if (!isFirst) {
              e.currentTarget.style.backgroundColor = theme.colors.primary[50];
            }
          }}
          onMouseLeave={(e) => {
            if (!isFirst) {
              e.currentTarget.style.backgroundColor = theme.colors.white;
            }
          }}
        >
          Previous
        </button>
        <button
          type="button"
          style={btnStyle(isLast)}
          disabled={isLast}
          onClick={() => onPageChange(page + 1)}
          onMouseEnter={(e) => {
            if (!isLast) {
              e.currentTarget.style.backgroundColor = theme.colors.primary[50];
            }
          }}
          onMouseLeave={(e) => {
            if (!isLast) {
              e.currentTarget.style.backgroundColor = theme.colors.white;
            }
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}