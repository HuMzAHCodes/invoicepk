import theme from "@/styles/theme";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  clientName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmDialog({
  isOpen,
  clientName,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing[4],
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: theme.radius.lg,
          padding: theme.spacing[6],
          maxWidth: "400px",
          width: "100%",
          boxShadow: theme.shadows.xl,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes.lg,
            fontWeight: theme.fontWeights.semibold,
            color: theme.colors.neutral[900],
            margin: "0 0 8px",
          }}
        >
          Delete Client
        </h3>
        <p
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.neutral[600],
            margin: "0 0 24px",
          }}
        >
          Are you sure you want to delete <strong>{clientName}</strong>? This
          action cannot be undone.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: theme.spacing[3],
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
              backgroundColor: theme.colors.white,
              color: theme.colors.neutral[600],
              border: `1px solid ${theme.colors.neutral[200]}`,
              borderRadius: theme.radius.md,
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes.sm,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
              backgroundColor: theme.colors.danger[600],
              color: theme.colors.white,
              border: "none",
              borderRadius: theme.radius.md,
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes.sm,
              fontWeight: theme.fontWeights.medium,
              cursor: "pointer",
              opacity: isDeleting ? 0.6 : 1,
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Provides a reusable confirmation dialog for deleting client records.
// • Conditionally renders as a modal overlay only when the dialog is open.
// • Displays the selected client's name within the confirmation message to
//   help prevent accidental deletions.
// • Prevents accidental dismissal by isolating dialog interactions while still
//   allowing users to close the modal by clicking outside the dialog content.
// • Exposes configurable confirm and cancel callbacks, allowing parent
//   components to control deletion and dialog state.
// • Disables the delete button while a deletion request is in progress to
//   prevent duplicate operations and provides visual loading feedback.
// • Uses a centered modal layout with an overlay to focus user attention on
//   the confirmation action.
// • Leverages the centralized theme configuration for consistent typography,
//   colors, spacing, borders, shadows, and button styling across the
//   application.
// ─────────────────────────────────────────────────────────────────────────────
