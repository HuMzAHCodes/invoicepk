import { ReactNode } from "react";
import theme from "@/styles/theme";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
}: ModalProps) {
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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: theme.radius.lg,
          padding: theme.spacing[6],
          maxWidth: "520px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: theme.shadows.xl,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: theme.spacing[5],
          }}
        >
          <h2
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes.lg,
              fontWeight: theme.fontWeights.semibold,
              color: theme.colors.neutral[900],
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: theme.colors.neutral[400],
              fontSize: theme.fontSizes.xl,
              lineHeight: 1,
              padding: "4px",
            }}
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Provides a reusable modal dialog component for displaying forms and other
//   interactive content throughout the application.
// • Conditionally renders the modal only when the open state is enabled,
//   preventing unnecessary DOM rendering.
// • Displays a configurable modal title along with custom child content,
//   making the component flexible for multiple use cases.
// • Closes the modal when users click outside the dialog or use the dedicated
//   close button, providing intuitive dismissal behavior.
// • Prevents clicks inside the modal content from closing the dialog by
//   stopping event propagation.
// • Supports scrollable content with a maximum viewport height, ensuring large
//   forms and content remain accessible on smaller screens.
// • Uses a centered overlay with a semi-transparent backdrop to focus user
//   attention on the active dialog.
// • Leverages the centralized theme configuration for consistent typography,
//   spacing, colors, border radius, shadows, and overall visual styling.
// ─────────────────────────────────────────────────────────────────────────────
