import { ReactNode } from "react";
import theme from "@/styles/theme";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export default function FormField({
  label,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
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
        {label}
        {required && (
          <span style={{ color: theme.colors.danger[600], marginLeft: "4px" }}>
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes.xs,
            color: theme.colors.danger[600],
            marginTop: "4px",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Provides a reusable wrapper component for form inputs, ensuring consistent
//   labeling and validation feedback throughout the application.
// • Displays a descriptive label above the wrapped form control for improved
//   usability and accessibility.
// • Optionally indicates required fields by rendering a styled asterisk next to
//   the field label.
// • Displays validation error messages beneath the form control when an error
//   is provided, helping users identify and resolve input issues.
// • Accepts any React form element as children, making the component flexible
//   and reusable for various input types.
// • Maintains consistent spacing, typography, and visual hierarchy across all
//   application forms.
// • Uses the centralized theme configuration to ensure consistent colors,
//   fonts, spacing, and validation styling throughout the user interface.
// ─────────────────────────────────────────────────────────────────────────────
