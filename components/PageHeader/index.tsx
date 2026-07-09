import theme from "@/styles/theme";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
}: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: theme.spacing[6],
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: theme.fonts.display,
            fontSize: theme.fontSizes["3xl"],
            fontWeight: theme.fontWeights.semibold,
            color: theme.colors.neutral[900],
            margin: 0,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes.sm,
              color: theme.colors.neutral[400],
              margin: "4px 0 0",
            }}
          >
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
            backgroundColor: theme.colors.primary[600],
            color: theme.colors.white,
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes.sm,
            fontWeight: theme.fontWeights.semibold,
            borderRadius: theme.radius.md,
            border: "none",
            cursor: "pointer",
            transition: theme.transitions.fast,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.primary[400];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.primary[600];
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
// • Provides a reusable page header component for maintaining a consistent
//   layout across application pages.
// • Displays a primary page title with an optional descriptive subtitle to
//   provide additional context.
// • Optionally renders a primary action button when both an action label and
//   callback function are supplied.
// • Executes the provided callback when the action button is clicked, allowing
//   parent components to define custom behavior.
// • Includes interactive hover effects that provide visual feedback for the
//   action button.
// • Uses a flexible layout to align page information and actions while adapting
//   gracefully to different content sizes.
// • Leverages the centralized theme configuration to ensure consistent
//   typography, spacing, colors, border radius, and transitions throughout the
//   application.
// ─────────────────────────────────────────────────────────────────────────────
