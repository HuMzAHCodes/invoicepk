"use client";

import theme from "@/styles/theme";

type GSTType = "standard" | "zero_rated" | "exempt";

interface GSTSectionProps {
  gstType: GSTType;
  gstRate: number;
  whtApplicable: boolean;
  whtRate: number;
  isClientCorporate: boolean;
  onChange: (
    updates: Partial<{
      gstType: GSTType;
      gstRate: number;
      whtApplicable: boolean;
      whtRate: number;
    }>,
  ) => void;
}

export default function GSTSection({
  gstType,
  gstRate,
  whtApplicable,
  whtRate,
  isClientCorporate,
  onChange,
}: GSTSectionProps) {
  const radioOptionStyle = (isActive: boolean): React.CSSProperties => ({
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    border: `1px solid ${isActive ? theme.colors.primary[600] : theme.colors.neutral[200]}`,
    borderRadius: theme.radius.md,
    backgroundColor: isActive ? theme.colors.primary[50] : theme.colors.white,
    cursor: "pointer",
    transition: theme.transitions.fast,
    flex: 1,
    textAlign: "center",
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${theme.colors.neutral[200]}`,
    borderRadius: theme.radius.md,
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[900],
    backgroundColor: theme.colors.white,
    outline: "none",
    transition: theme.transitions.fast,
    boxSizing: "border-box",
  };

  const gstTypes: { value: GSTType; label: string; desc: string }[] = [
    { value: "standard", label: "Standard", desc: "17% GST" },
    { value: "zero_rated", label: "Zero-Rated", desc: "IT Export" },
    { value: "exempt", label: "Exempt", desc: "No GST" },
  ];

  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSizes.sm,
          fontWeight: theme.fontWeights.medium,
          color: theme.colors.neutral[900],
          marginBottom: "8px",
        }}
      >
        GST Type
      </label>

      <div
        style={{ display: "flex", gap: "8px", marginBottom: theme.spacing[4] }}
      >
        {gstTypes.map((type) => (
          <div
            key={type.value}
            style={radioOptionStyle(gstType === type.value)}
            onClick={() =>
              onChange({
                gstType: type.value,
                gstRate: type.value === "zero_rated" ? 0 : gstRate,
              })
            }
            onMouseEnter={(e) => {
              if (gstType !== type.value)
                e.currentTarget.style.borderColor = theme.colors.primary[400];
            }}
            onMouseLeave={(e) => {
              if (gstType !== type.value)
                e.currentTarget.style.borderColor = theme.colors.neutral[200];
            }}
          >
            <div
              style={{
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSizes.sm,
                fontWeight: theme.fontWeights.semibold,
                color:
                  gstType === type.value
                    ? theme.colors.primary[600]
                    : theme.colors.neutral[900],
              }}
            >
              {type.label}
            </div>
            <div
              style={{
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSizes.xs,
                color: theme.colors.neutral[400],
                marginTop: "2px",
              }}
            >
              {type.desc}
            </div>
          </div>
        ))}
      </div>

      {gstType === "standard" && (
        <div style={{ marginBottom: theme.spacing[4] }}>
          <label
            style={{
              display: "block",
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes.sm,
              fontWeight: theme.fontWeights.medium,
              color: theme.colors.neutral[900],
              marginBottom: "4px",
            }}
          >
            GST Rate (%)
          </label>
          <input
            type="number"
            value={gstRate}
            onChange={(e) =>
              onChange({ gstRate: parseFloat(e.target.value) || 0 })
            }
            min="0"
            max="100"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary[600];
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.colors.neutral[200];
            }}
          />
        </div>
      )}

      {isClientCorporate && (
        <div
          style={{
            padding: theme.spacing[4],
            backgroundColor: theme.colors.neutral[50],
            borderRadius: theme.radius.md,
            border: `1px solid ${theme.colors.neutral[200]}`,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes.sm,
              color: theme.colors.neutral[900],
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={whtApplicable}
              onChange={(e) => onChange({ whtApplicable: e.target.checked })}
              style={{
                width: "16px",
                height: "16px",
                accentColor: theme.colors.primary[600],
              }}
            />
            Withholding Tax (WHT) — Corporate Client
          </label>

          {whtApplicable && (
            <div style={{ marginTop: theme.spacing[3] }}>
              <label
                style={{
                  display: "block",
                  fontFamily: theme.fonts.body,
                  fontSize: theme.fontSizes.xs,
                  fontWeight: theme.fontWeights.medium,
                  color: theme.colors.neutral[600],
                  marginBottom: "4px",
                }}
              >
                WHT Rate (%)
              </label>
              <input
                type="number"
                value={whtRate}
                onChange={(e) =>
                  onChange({ whtRate: parseFloat(e.target.value) || 0 })
                }
                min="0"
                max="100"
                style={{ ...inputStyle, maxWidth: "120px" }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary[600];
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.neutral[200];
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Provides a reusable GST and Withholding Tax (WHT) configuration section for
//   invoice creation and editing forms.
// • Allows users to select between Standard, Zero-Rated, and Exempt GST types,
//   updating invoice tax settings through a centralized change callback.
// • Automatically adjusts the GST rate for applicable tax types while allowing
//   custom GST percentage input for standard-rated invoices.
// • Displays WHT configuration options only for corporate clients, ensuring
//   withholding tax settings are shown only when applicable.
// • Enables users to toggle WHT applicability and configure a custom WHT rate
//   when withholding tax is enabled.
// • Propagates all GST and WHT changes to the parent component using partial
//   updates, simplifying form state management.
// • Applies conditional rendering to present only the relevant tax controls,
//   creating a clean and intuitive user experience.
// • Provides interactive hover and focus states for selectable options and
//   numeric inputs to improve usability and visual feedback.
// • Uses the centralized theme configuration to maintain consistent spacing,
//   typography, colors, borders, and transitions across the invoice module.
// ─────────────────────────────────────────────────────────────────────────────
