import theme from "@/styles/theme";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      style={{
        padding: `${theme.spacing[12]} ${theme.spacing[4]}`,
        textAlign: "center",
        backgroundColor: theme.colors.white,
        border: `1px solid ${theme.colors.neutral[200]}`,
        borderRadius: theme.radius.lg,
      }}
    >
      <p
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSizes.lg,
          fontWeight: theme.fontWeights.medium,
          color: theme.colors.neutral[900],
          margin: "0 0 4px",
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSizes.sm,
          color: theme.colors.neutral[400],
          margin: "0 0 16px",
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
            backgroundColor: theme.colors.white,
            color: theme.colors.primary[600],
            border: `1px solid ${theme.colors.primary[600]}`,
            borderRadius: theme.radius.md,
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes.sm,
            fontWeight: theme.fontWeights.medium,
            cursor: "pointer",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Provides a reusable empty state component for displaying meaningful
//   feedback when no data or content is available.
// • Displays a clear title and descriptive message to help users understand
//   why content is currently unavailable.
// • Optionally renders an action button to guide users toward the next
//   appropriate action, such as creating, adding, or refreshing data.
// • Executes a parent-provided callback when the action button is clicked,
//   enabling customizable behavior across different pages.
// • Uses a centered card-style layout to draw attention to the empty state
//   while maintaining a clean and professional appearance.
// • Encourages consistent empty-state handling throughout the application by
//   centralizing layout and styling into a single reusable component.
// • Leverages the shared theme configuration for consistent spacing,
//   typography, colors, borders, and border-radius values.
// ─────────────────────────────────────────────────────────────────────────────
