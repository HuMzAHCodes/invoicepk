"use client";

import { Trash2 } from "lucide-react";
import theme from "@/styles/theme";

// ─── Props ───
interface DeleteButtonProps {
  onDelete: () => void;
  loading: boolean;
}

// ─── Styles ───
const btn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
  backgroundColor: theme.colors.white,
  color: theme.colors.danger[600],
  border: `1px solid ${theme.colors.danger[200]}`,
  borderRadius: theme.radius.md,
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.medium,
  cursor: "pointer",
  transition: theme.transitions.fast,
};

const btnDisabled: React.CSSProperties = {
  ...btn,
  opacity: 0.5,
  cursor: "not-allowed",
};

// ─── Component ───
export default function DeleteButton({ onDelete, loading }: DeleteButtonProps) {
  const btnStyle = loading ? btnDisabled : btn;

  return (
    <button
      style={btnStyle}
      disabled={loading}
      onClick={onDelete}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = theme.colors.danger[50];
          e.currentTarget.style.borderColor = theme.colors.danger[400];
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = theme.colors.white;
          e.currentTarget.style.borderColor = theme.colors.danger[200];
        }
      }}
    >
      <Trash2 size={16} />
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Provides a reusable delete action button for invoice-related workflows and
//   other destructive operations.
// • Invokes the supplied delete callback, allowing parent components to handle
//   confirmation dialogs, API requests, and deletion logic externally.
// • Displays loading and disabled states while deletion is in progress to
//   prevent duplicate requests and provide immediate user feedback.
// • Updates the button label dynamically to reflect the current operation,
//   clearly indicating when a deletion is underway.
// • Uses danger-themed colors and a delete icon to visually communicate the
//   destructive nature of the action.
// • Applies hover effects only when the button is enabled, improving usability
//   while maintaining consistent interaction behavior.
// • Uses the centralized theme configuration to ensure consistent typography,
//   spacing, colors, borders, and transitions across destructive action
//   controls throughout the application.
// ─────────────────────────────────────────────────────────────────────────────
