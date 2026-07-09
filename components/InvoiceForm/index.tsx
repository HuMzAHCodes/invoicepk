"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";
import { calculateInvoice } from "@/lib/gst";
import ClientSelect from "./ClientSelect";
import LineItems from "./LineItems";
import GSTSection from "./GSTSection";
import TotalsSidebar from "./TotalsSidebar";
import FormField from "@/components/FormField";
import { useToast } from "@/components/Toast";
import theme from "@/styles/theme";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  sortOrder: number;
}

interface InvoiceFormData {
  clientId: string;
  issueDate: string;
  dueDate: string;
  currency: "PKR" | "USD";
  gstType: "standard" | "zero_rated" | "exempt";
  gstRate: number;
  whtApplicable: boolean;
  whtRate: number;
  notes: string;
  items: LineItem[];
}

export default function InvoiceForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCorporateClient, setIsCorporateClient] = useState(false);

  const [form, setForm] = useState<InvoiceFormData>({
    clientId: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    currency: "PKR",
    gstType: "standard",
    gstRate: 17,
    whtApplicable: false,
    whtRate: 3,
    notes: "",
    items: [{ description: "", quantity: 1, unitPrice: 0, sortOrder: 0 }],
  });

  const totals = useMemo(
    () =>
      calculateInvoice({
        items: form.items,
        gstType: form.gstType,
        gstRate: form.gstRate,
        whtApplicable: form.whtApplicable,
        whtRate: form.whtRate,
      }),
    [form.items, form.gstType, form.gstRate, form.whtApplicable, form.whtRate],
  );

  function updateField(updates: Partial<InvoiceFormData>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  function handleClientChange(clientId: string, isCorporate: boolean) {
    setIsCorporateClient(isCorporate);
    setForm((prev) => ({
      ...prev,
      clientId,
      whtApplicable: isCorporate ? prev.whtApplicable : false,
    }));
  }

  function handleItemsChange(items: LineItem[]) {
    setForm((prev) => ({ ...prev, items }));
  }

  function handleGSTChange(
    updates: Partial<{
      gstType: InvoiceFormData["gstType"];
      gstRate: number;
      whtApplicable: boolean;
      whtRate: number;
    }>,
  ) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.issueDate) {
      showToast("Issue date is required", "error");
      return;
    }
    if (
      form.items.length === 0 ||
      !form.items.some((item) => item.description.trim())
    ) {
      showToast("Add at least one line item with a description", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        clientId: form.clientId || undefined,
        issueDate: form.issueDate,
        dueDate: form.dueDate || undefined,
        currency: form.currency,
        gstType: form.gstType,
        gstRate: form.gstRate,
        whtApplicable: form.whtApplicable,
        whtRate: form.whtRate,
        notes: form.notes || undefined,
        items: form.items.map((item, i) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          sortOrder: i,
        })),
      };

      const invoice = await apiPost<{ id: string; invoiceNumber: string }>(
        "/invoices",
        payload,
      );
      showToast(`Invoice ${invoice.invoiceNumber} created`);
      router.push(`/invoices/${invoice.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create invoice";
      if (message.includes("LIMIT_EXCEEDED")) {
        showToast(
          "Free tier limit reached (5 invoices/month). Upgrade to Pro.",
          "error",
        );
      } else {
        showToast(message, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${theme.colors.neutral[200]}`,
    borderRadius: theme.radius.md,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[900],
    backgroundColor: theme.colors.white,
    outline: "none",
    transition: theme.transitions.fast,
    boxSizing: "border-box",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
  };

  const btnPrimary: React.CSSProperties = {
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    backgroundColor: theme.colors.primary[600],
    color: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    borderRadius: theme.radius.md,
    border: "none",
    cursor: "pointer",
    transition: theme.transitions.fast,
  };

  const btnSecondary: React.CSSProperties = {
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    backgroundColor: theme.colors.white,
    color: theme.colors.neutral[600],
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.neutral[200]}`,
    cursor: "pointer",
    transition: theme.transitions.fast,
  };

  const responsiveCSS = `
    @media (max-width: 1024px) {
      .invoice-form-layout { flex-direction: column !important; }
      .invoice-form-main, .invoice-form-sidebar { width: 100% !important; }
      .invoice-form-sidebar { position: static !important; }
    }
    @media (max-width: 768px) {
      .line-items-grid { grid-template-columns: 1fr !important; }
      .line-items-header { display: none !important; }
    }
  `;

  return (
    <>
      <style>{responsiveCSS}</style>
      <form onSubmit={handleSubmit}>
        <div
          className="invoice-form-layout"
          style={{ display: "flex", gap: theme.spacing[6] }}
        >
          {/* Main form */}
          <div className="invoice-form-main" style={{ flex: 1, minWidth: 0 }}>
            {/* Client */}
            <div
              style={{
                backgroundColor: theme.colors.white,
                border: `1px solid ${theme.colors.neutral[200]}`,
                borderRadius: theme.radius.lg,
                padding: theme.spacing[5],
                marginBottom: theme.spacing[5],
              }}
            >
              <h3
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: theme.fontSizes.base,
                  fontWeight: theme.fontWeights.semibold,
                  color: theme.colors.neutral[900],
                  margin: "0 0 16px",
                }}
              >
                Client
              </h3>
              <ClientSelect
                value={form.clientId}
                onChange={handleClientChange}
              />
            </div>

            {/* Invoice Details */}
            <div
              style={{
                backgroundColor: theme.colors.white,
                border: `1px solid ${theme.colors.neutral[200]}`,
                borderRadius: theme.radius.lg,
                padding: theme.spacing[5],
                marginBottom: theme.spacing[5],
              }}
            >
              <h3
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: theme.fontSizes.base,
                  fontWeight: theme.fontWeights.semibold,
                  color: theme.colors.neutral[900],
                  margin: "0 0 16px",
                }}
              >
                Invoice Details
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: theme.spacing[4],
                }}
              >
                <FormField label="Issue Date" required>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => updateField({ issueDate: e.target.value })}
                    style={inputStyle}
                  />
                </FormField>
                <FormField label="Due Date">
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => updateField({ dueDate: e.target.value })}
                    style={inputStyle}
                  />
                </FormField>
                <FormField label="Currency">
                  <select
                    value={form.currency}
                    onChange={(e) =>
                      updateField({ currency: e.target.value as "PKR" | "USD" })
                    }
                    style={selectStyle}
                  >
                    <option value="PKR">PKR (Pakistani Rupee)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </FormField>
              </div>
            </div>

            {/* Line Items */}
            <div
              style={{
                backgroundColor: theme.colors.white,
                border: `1px solid ${theme.colors.neutral[200]}`,
                borderRadius: theme.radius.lg,
                padding: theme.spacing[5],
                marginBottom: theme.spacing[5],
              }}
            >
              <h3
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: theme.fontSizes.base,
                  fontWeight: theme.fontWeights.semibold,
                  color: theme.colors.neutral[900],
                  margin: "0 0 16px",
                }}
              >
                Line Items
              </h3>
              <LineItems items={form.items} onChange={handleItemsChange} />
            </div>

            {/* GST */}
            <div
              style={{
                backgroundColor: theme.colors.white,
                border: `1px solid ${theme.colors.neutral[200]}`,
                borderRadius: theme.radius.lg,
                padding: theme.spacing[5],
                marginBottom: theme.spacing[5],
              }}
            >
              <h3
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: theme.fontSizes.base,
                  fontWeight: theme.fontWeights.semibold,
                  color: theme.colors.neutral[900],
                  margin: "0 0 16px",
                }}
              >
                Tax Configuration
              </h3>
              <GSTSection
                gstType={form.gstType}
                gstRate={form.gstRate}
                whtApplicable={form.whtApplicable}
                whtRate={form.whtRate}
                isClientCorporate={isCorporateClient}
                onChange={handleGSTChange}
              />
            </div>

            {/* Notes */}
            <div
              style={{
                backgroundColor: theme.colors.white,
                border: `1px solid ${theme.colors.neutral[200]}`,
                borderRadius: theme.radius.lg,
                padding: theme.spacing[5],
                marginBottom: theme.spacing[5],
              }}
            >
              <h3
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: theme.fontSizes.base,
                  fontWeight: theme.fontWeights.semibold,
                  color: theme.colors.neutral[900],
                  margin: "0 0 16px",
                }}
              >
                Notes
              </h3>
              <textarea
                value={form.notes}
                onChange={(e) => updateField({ notes: e.target.value })}
                placeholder="Payment terms, additional notes..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary[600];
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.neutral[200];
                }}
              />
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: theme.spacing[3],
                marginBottom: theme.spacing[8],
              }}
            >
              <button
                type="button"
                onClick={() => router.back()}
                style={btnSecondary}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ ...btnPrimary, opacity: isSubmitting ? 0.6 : 1 }}
              >
                {isSubmitting ? "Creating..." : "Create Invoice"}
              </button>
            </div>
          </div>

          {/* Totals sidebar */}
          <div
            className="invoice-form-sidebar"
            style={{ width: "320px", flexShrink: 0 }}
          >
            <TotalsSidebar
              totals={totals}
              currency={form.currency}
              gstType={form.gstType}
              whtApplicable={form.whtApplicable}
            />
          </div>
        </div>
      </form>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Implements the complete invoice creation workflow, allowing users to build
//   and submit GST-compliant invoices through a single interactive form.
// • Manages invoice state including client selection, invoice dates, currency,
//   tax configuration, notes, and dynamic line items.
// • Integrates the reusable client selector to optionally associate invoices
//   with existing clients while automatically detecting corporate clients for
//   WHT eligibility.
// • Calculates invoice totals in real time using the shared GST calculation
//   utility, ensuring subtotal, GST, WHT deductions, total, and net payable
//   remain synchronized with user input.
// • Supports configurable GST modes (Standard, Zero-Rated, and Exempt) together
//   with adjustable GST and WHT rates where applicable.
// • Validates required invoice information before submission, preventing invoice
//   creation without mandatory fields or valid line items.
// • Submits invoice data to the backend API, handles loading states, displays
//   success and error notifications, and redirects users to the generated
//   invoice after successful creation.
// • Detects backend free-tier usage limits and presents a dedicated upgrade
//   message when the monthly invoice quota has been exceeded.
// • Provides a responsive multi-section layout with reusable components for
//   client selection, line items, tax configuration, invoice notes, and a live
//   totals summary sidebar.
// • Uses the centralized theme configuration to ensure consistent spacing,
//   typography, colors, borders, transitions, and responsive styling across
//   the invoice creation experience.
// ─────────────────────────────────────────────────────────────────────────────
