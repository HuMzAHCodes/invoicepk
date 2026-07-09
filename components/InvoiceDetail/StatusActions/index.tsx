"use client";

import { Send, CheckCircle } from "lucide-react";
import theme from "@/styles/theme";

// ─── Props ───
interface StatusActionsProps {
  status: string;
  onTransition: (status: string) => void;
  loading: boolean;
}

// ─── Styles ───
const container: React.CSSProperties = {
  display: "flex",
  gap: theme.spacing[3],
};

const btnSent: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
  backgroundColor: theme.colors.warning[600],
  color: theme.colors.white,
  border: "none",
  borderRadius: theme.radius.md,
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.semibold,
  cursor: "pointer",
  transition: theme.transitions.fast,
};

const btnPaid: React.CSSProperties = {
  ...btnSent,
  backgroundColor: theme.colors.success[600],
};

const btnDisabled: React.CSSProperties = {
  ...btnSent,
  opacity: 0.5,
  cursor: "not-allowed",
};

// ─── Component ───
export default function StatusActions({
  status,
  onTransition,
  loading,
}: StatusActionsProps) {
  if (status === "paid") return null;

  const nextStatus = status === "draft" ? "sent" : "paid";
  const isNextSent = nextStatus === "sent";

  const btnStyle = loading ? btnDisabled : isNextSent ? btnSent : btnPaid;

  return (
    <div style={container}>
      <button
        style={btnStyle}
        disabled={loading}
        onClick={() => onTransition(nextStatus)}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.opacity = "0.9";
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.opacity = "1";
        }}
      >
        {isNextSent ? <Send size={16} /> : <CheckCircle size={16} />}
        {loading ? "Updating..." : isNextSent ? "Mark as Sent" : "Mark as Paid"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Provides contextual invoice status actions based on the current invoice
//   lifecycle, allowing users to progress invoices through supported states.
// • Displays a single transition action that advances invoices from Draft to
//   Sent and from Sent to Paid, preventing invalid status changes.
// • Automatically hides all action controls once an invoice reaches the final
//   Paid status, reflecting the completed workflow.
// • Invokes the supplied status transition callback, enabling parent components
//   to perform backend updates while keeping business logic centralized.
// • Displays loading and disabled states during status updates to prevent
//   duplicate submissions and provide clear user feedback.
// • Uses context-specific icons, button labels, and color schemes to visually
//   distinguish each invoice status transition.
// • Applies interactive hover effects and centralized theme styling to maintain
//   consistent typography, spacing, colors, borders, and transitions across
//   invoice management actions.
// ─────────────────────────────────────────────────────────────────────────────
