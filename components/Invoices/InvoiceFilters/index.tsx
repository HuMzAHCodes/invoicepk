"use client";

import theme from "@/styles/theme";

// ─── Types ─────────────────────────────────────────────────────────────────

interface InvoiceFiltersProps {
  status: string;
  from: string;
  to: string;
  onStatusChange: (status: string) => void;
  onFromChange: (from: string) => void;
  onToChange: (to: string) => void;
  onClear: () => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["All", "Draft", "Sent", "Paid"];

// ─── Component ─────────────────────────────────────────────────────────────

export default function InvoiceFilters({
  status,
  from,
  to,
  onStatusChange,
  onFromChange,
  onToChange,
  onClear,
}: InvoiceFiltersProps) {
  const hasFilters = status !== "All" || from !== "" || to !== "";

  // ─── Styles ────────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6],
  };

  const pillsStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing[1],
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.radius.lg,
    padding: theme.spacing[1],
  };

  function pillStyle(active: boolean): React.CSSProperties {
    return {
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      borderRadius: theme.radius.md,
      border: "none",
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium,
      cursor: "pointer",
      transition: theme.transitions.fast,
      backgroundColor: active ? theme.colors.primary[600] : "transparent",
      color: active ? theme.colors.white : theme.colors.neutral[600],
      whiteSpace: "nowrap",
    };
  }

  const dateGroupStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2],
  };

  const dateLabelStyle: React.CSSProperties = {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.neutral[600],
    whiteSpace: "nowrap",
  };

  const dateInputStyle: React.CSSProperties = {
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.neutral[200]}`,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[900],
    backgroundColor: theme.colors.white,
    outline: "none",
    transition: theme.transitions.fast,
    minWidth: "150px",
    maxWidth: "100%",
    flex: "1 1 150px",
  };

  const clearStyle: React.CSSProperties = {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.primary[600],
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    transition: theme.transitions.fast,
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div style={containerStyle}>
      {/* Status pills */}
      <div style={pillsStyle}>
        {STATUS_OPTIONS.map((opt) => {
          const active =
            opt === "All" ? status === "All" : status === opt.toLowerCase();

          return (
            <button
              key={opt}
              type="button"
              style={pillStyle(active)}
              onClick={() =>
                onStatusChange(opt === "All" ? "All" : opt.toLowerCase())
              }
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.primary[50];
                  e.currentTarget.style.color = theme.colors.neutral[900];
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = theme.colors.neutral[600];
                }
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Date range */}
      <div style={dateGroupStyle}>
        <span style={dateLabelStyle}>From</span>
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          style={dateInputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.colors.primary[600];
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.colors.neutral[200];
          }}
        />
      </div>

      <div style={dateGroupStyle}>
        <span style={dateLabelStyle}>To</span>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          style={dateInputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.colors.primary[600];
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.colors.neutral[200];
          }}
        />
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          type="button"
          style={clearStyle}
          onClick={onClear}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = "none";
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
