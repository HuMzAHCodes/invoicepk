"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiGet, apiPatch, apiDelete, apiDownloadPDF } from "@/lib/api-client";
import theme from "@/styles/theme";
import { useToast } from "@/components/Toast";
import InvoiceInfo from "./InvoiceInfo";
import LineItemsTable from "./LineItemsTable";
import GSTSummary from "./GSTSummary";
import StatusActions from "./StatusActions";
import DeleteButton from "./DeleteButton";
import SendEmailButton from "./SendEmailButton";
import { InvoiceData } from "./types";

// ─── Styles ───
const page: React.CSSProperties = {
  maxWidth: "900px",
  margin: "0 auto",
  padding: `${theme.spacing[6]} ${theme.spacing[4]}`,
};

const header: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: theme.fontSizes["2xl"],
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.neutral[900],
  marginBottom: theme.spacing[6],
};

const actionsRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing[4],
};

const errorBox: React.CSSProperties = {
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  backgroundColor: theme.colors.danger[50],
  border: `1px solid ${theme.colors.danger[200]}`,
  borderRadius: theme.radius.md,
  color: theme.colors.danger[600],
  fontSize: theme.fontSizes.sm,
  marginBottom: theme.spacing[4],
};

const successBox: React.CSSProperties = {
  ...errorBox,
  backgroundColor: theme.colors.success[50],
  border: `1px solid ${theme.colors.success[200]}`,
  color: theme.colors.success[600],
};

const loadingWrap: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "400px",
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.lg,
  color: theme.colors.neutral[400],
};

const noteCard: React.CSSProperties = {
  padding: theme.spacing[5],
  backgroundColor: theme.colors.white,
  borderRadius: theme.radius.lg,
  border: `1px solid ${theme.colors.neutral[200]}`,
  boxShadow: theme.shadows.sm,
};

const noteLabel: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[400],
  marginBottom: theme.spacing[2],
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const noteText: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[900],
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
};

// Actions right side button group
const actionsRight: React.CSSProperties = {
  display: "flex",
  gap: theme.spacing[3],
};

// Download PDF button base
const pdfBtn: React.CSSProperties = {
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

// Download PDF button when loading
const pdfBtnDisabled: React.CSSProperties = {
  ...pdfBtn,
  cursor: "not-allowed",
  opacity: 0.5,
};

// Section spacing wrapper
const section: React.CSSProperties = {
  marginTop: theme.spacing[4],
};

// ─── Component ───
export default function InvoiceDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { showToast } = useToast();

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    async function fetchInvoice() {
      try {
        const data = await apiGet<InvoiceData>(`/invoices/${id}`);
        setInvoice(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [id]);

  async function handleTransition(newStatus: string) {
    setStatusLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await apiPatch<{
        data: { id: string; invoiceNumber: string; status: string };
      }>(`/invoices/${id}/status`, { status: newStatus });
      setInvoice((prev) =>
        prev
          ? { ...prev, status: data.data.status as InvoiceData["status"] }
          : prev,
      );
      setMessage(`Invoice marked as ${newStatus}`);
      showToast(`Invoice marked as ${newStatus}`, "success");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update status";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    setDeleteLoading(true);
    setError("");
    try {
      await apiDelete(`/invoices/${id}`);
      showToast("Invoice deleted", "success");
      router.push("/invoices");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete invoice";
      setError(msg);
      showToast(msg, "error");
      setDeleteLoading(false);
    }
  }

  async function handleDownloadPDF() {
    if (!invoice) return;
    setPdfLoading(true);
    setError("");
    try {
      await apiDownloadPDF(id, `${invoice.invoiceNumber}.pdf`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to download PDF";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setPdfLoading(false);
    }
  }

  if (loading) return <div style={loadingWrap}>Loading invoice...</div>;
  if (!invoice && !error)
    return <div style={loadingWrap}>Invoice not found</div>;

  return (
    <div style={page}>
      <h1 style={header}>Invoice Details</h1>

      {error && <div style={errorBox}>{error}</div>}
      {message && <div style={successBox}>{message}</div>}

      <div style={actionsRow}>
        <StatusActions
          status={invoice?.status ?? "draft"}
          onTransition={handleTransition}
          loading={statusLoading}
        />
        <div style={actionsRight}>
          <button
            style={pdfLoading ? pdfBtnDisabled : pdfBtn}
            disabled={pdfLoading}
            onClick={handleDownloadPDF}
            onMouseEnter={(e) => {
              if (!pdfLoading)
                e.currentTarget.style.backgroundColor =
                  theme.colors.primary[50];
            }}
            onMouseLeave={(e) => {
              if (!pdfLoading)
                e.currentTarget.style.backgroundColor = theme.colors.white;
            }}
          >
            {pdfLoading ? "Downloading..." : "Download PDF"}
          </button>
          {invoice?.client?.email && (
            <SendEmailButton
              invoiceId={id}
              invoiceNumber={invoice.invoiceNumber}
              clientEmail={invoice.client.email}
            />
          )}
          {invoice?.status === "draft" && (
            <DeleteButton onDelete={handleDelete} loading={deleteLoading} />
          )}
        </div>
      </div>

      {invoice && (
        <>
          <InvoiceInfo invoice={invoice} />
          <div style={section}>
            <LineItemsTable items={invoice.items} currency={invoice.currency} />
          </div>
          <div style={section}>
            <GSTSummary
              gstType={invoice.gstType}
              gstRate={invoice.gstRate}
              subtotal={invoice.subtotal}
              gstAmount={invoice.gstAmount}
              total={invoice.total}
              whtApplicable={invoice.whtApplicable}
              whtRate={invoice.whtRate}
              whtAmount={invoice.whtAmount}
              netPayable={invoice.netPayable}
              currency={invoice.currency}
            />
          </div>
          {invoice.notes && (
            <div style={section}>
              <div style={noteCard}>
                <div style={noteLabel}>Notes</div>
                <div style={noteText}>{invoice.notes}</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Serves as the main invoice details page responsible for displaying a
//   complete invoice after it has been created.
// • Retrieves invoice data from the backend using the invoice identifier from
//   the route and manages loading, success, and error states.
// • Displays invoice metadata, client information, line items, GST breakdown,
//   and optional notes using dedicated reusable presentation components.
// • Supports invoice lifecycle management by allowing status transitions from
//   Draft → Sent → Paid through backend API requests.
// • Restricts invoice deletion to draft invoices and prompts for confirmation
//   before permanently removing the invoice.
// • Provides PDF export functionality by downloading a professionally generated
//   invoice document from the backend.
// • Displays contextual success and error notifications via toast for status
//   updates, deletion, and PDF download operations.
// • Coordinates multiple reusable UI components to keep presentation logic
//   modular while centralizing business interactions within a single container.
// • Applies the centralized theme system to maintain consistent layout,
//   typography, spacing, colors, borders, shadows, and interactive styling
//   throughout the invoice details experience.
// ─────────────────────────────────────────────────────────────────────────────
