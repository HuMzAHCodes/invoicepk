"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import theme from "@/styles/theme";
import { apiSendInvoiceEmail } from "@/lib/api-client";

// ─── Props ───
interface SendEmailButtonProps {
  invoiceId: string;
  invoiceNumber: string;
  clientEmail?: string | null;
  onSend?: () => void;
}

// ─── Styles ───
const emailBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
  backgroundColor: theme.colors.white,
  color: theme.colors.primary[600],
  border: `1px solid ${theme.colors.primary[200]}`,
  borderRadius: theme.radius.md,
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.medium,
  cursor: "pointer",
  transition: theme.transitions.fast,
};

const emailBtnDisabled: React.CSSProperties = {
  ...emailBtn,
  cursor: "not-allowed",
  opacity: 0.5,
};

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modal: React.CSSProperties = {
  backgroundColor: theme.colors.white,
  borderRadius: theme.radius.lg,
  padding: theme.spacing[6],
  width: "100%",
  maxWidth: "400px",
  boxShadow: theme.shadows.lg,
};

const modalHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing[4],
};

const modalTitle: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: theme.fontSizes.lg,
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.neutral[900],
};

const closeBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: theme.colors.neutral[400],
  padding: theme.spacing[1],
};

const formGroup: React.CSSProperties = {
  marginBottom: theme.spacing[4],
};

const label: React.CSSProperties = {
  display: "block",
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.medium,
  color: theme.colors.neutral[600],
  marginBottom: theme.spacing[2],
};

const input: React.CSSProperties = {
  width: "100%",
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  border: `1px solid ${theme.colors.neutral[200]}`,
  borderRadius: theme.radius.md,
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  outline: "none",
  transition: theme.transitions.fast,
};

const textarea: React.CSSProperties = {
  ...input,
  minHeight: "100px",
  resize: "vertical",
};

const buttonGroup: React.CSSProperties = {
  display: "flex",
  gap: theme.spacing[3],
  justifyContent: "flex-end",
  marginTop: theme.spacing[5],
};

const cancelBtn: React.CSSProperties = {
  padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
  backgroundColor: theme.colors.white,
  color: theme.colors.neutral[600],
  border: `1px solid ${theme.colors.neutral[200]}`,
  borderRadius: theme.radius.md,
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.medium,
  cursor: "pointer",
  transition: theme.transitions.fast,
};

const sendBtn: React.CSSProperties = {
  ...cancelBtn,
  backgroundColor: theme.colors.primary[600],
  color: theme.colors.white,
  border: "none",
};

const sendBtnDisabled: React.CSSProperties = {
  ...sendBtn,
  cursor: "not-allowed",
  opacity: 0.5,
};

// ─── Component ───
export default function SendEmailButton({
  invoiceId,
  invoiceNumber,
  clientEmail,
  onSend,
}: SendEmailButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(clientEmail || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiSendInvoiceEmail(invoiceId, email, message || undefined);
      setIsOpen(false);
      setEmail("");
      setMessage("");
      onSend?.();
    } catch (err) {
      console.error("[SendEmailButton] Failed to send invoice email:", err);
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        style={loading ? emailBtnDisabled : emailBtn}
        disabled={loading}
        onClick={() => setIsOpen(true)}
        onMouseEnter={(e) => {
          if (!loading)
            e.currentTarget.style.backgroundColor = theme.colors.primary[50];
        }}
        onMouseLeave={(e) => {
          if (!loading)
            e.currentTarget.style.backgroundColor = theme.colors.white;
        }}
      >
        <Mail size={16} />
        Send Email
      </button>

      {isOpen && (
        <div style={modalOverlay} onClick={() => setIsOpen(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h2 style={modalTitle}>Send Invoice {invoiceNumber}</h2>
              <button style={closeBtn} onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={formGroup}>
                <label style={label}>Recipient Email</label>
                <input
                  type="email"
                  style={input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  required
                />
              </div>

              <div style={formGroup}>
                <label style={label}>Message (Optional)</label>
                <textarea
                  style={textarea}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal message to the email..."
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: theme.spacing[3],
                    backgroundColor: theme.colors.danger[50],
                    border: `1px solid ${theme.colors.danger[200]}`,
                    borderRadius: theme.radius.md,
                    color: theme.colors.danger[600],
                    fontSize: theme.fontSizes.sm,
                    marginBottom: theme.spacing[4],
                  }}
                >
                  {error}
                </div>
              )}

              <div style={buttonGroup}>
                <button
                  type="button"
                  style={cancelBtn}
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={loading ? sendBtnDisabled : sendBtn}
                  disabled={loading || !email}
                >
                  {loading ? "Sending..." : "Send Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
