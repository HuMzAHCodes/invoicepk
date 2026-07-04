// components/InvoicePDF/InvoicePDFTemplate.tsx
// React PDF template for invoice generation — server-side only.
// Used by GET /api/invoices/:id/pdf and POST /api/invoices/:id/pdf/save
// @react-pdf/renderer cannot use Tailwind or theme.ts — uses inline styles only.
// All colors are hardcoded from Theme A — Ledger palette.

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface PDFInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  sortOrder: number;
}

export interface PDFBusiness {
  name: string;
  ntn?: string | null;
  strn?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  currency: string;
}

export interface PDFClient {
  name: string;
  email?: string | null;
  address?: string | null;
  ntn?: string | null;
}

export interface PDFInvoiceProps {
  invoice: {
    invoiceNumber: string;
    status: string;
    issueDate: Date | string;
    dueDate?: Date | string | null;
    currency: string;
    gstType: "standard" | "zero_rated" | "exempt";
    gstRate: number;
    subtotal: number;
    gstAmount: number;
    total: number;
    whtApplicable: boolean;
    whtRate: number;
    whtAmount: number;
    netPayable: number;
    notes?: string | null;
    items: PDFInvoiceItem[];
  };
  business: PDFBusiness;
  client?: PDFClient | null;
}

// ─── Colors (Theme A — Ledger, hardcoded for @react-pdf/renderer) ──────────

const colors = {
  primary: "#1F5C3F",
  primaryLight: "#4B8867",
  accent: "#CBA05A",
  success: "#2F8F4E",
  warning: "#B87A1E",
  neutral50: "#F7F5EF",
  neutral200: "#DEDACB",
  neutral400: "#A8A395",
  neutral600: "#6E6A5D",
  neutral900: "#2B2924",
  white: "#FFFFFF",
  danger: "#D66565",
};

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.neutral900,
    backgroundColor: colors.white,
    padding: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottom: `2px solid ${colors.primary}`,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: "contain",
  },
  businessInfo: {
    flex: 1,
    marginLeft: 16,
  },
  businessName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 4,
  },
  businessDetail: {
    fontSize: 9,
    color: colors.neutral600,
    marginBottom: 2,
  },
  invoiceBadge: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.neutral900,
    marginBottom: 4,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    textTransform: "uppercase",
  },

  // Meta section (dates + client)
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metaBlock: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 8,
    color: colors.neutral400,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
    fontFamily: "Helvetica-Bold",
  },
  metaValue: {
    fontSize: 10,
    color: colors.neutral900,
    marginBottom: 2,
  },
  metaValueBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.neutral900,
    marginBottom: 2,
  },

  // Line items table
  table: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 2,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottom: `1px solid ${colors.neutral200}`,
  },
  tableRowAlt: {
    backgroundColor: colors.neutral50,
  },
  colDescription: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colUnitPrice: { flex: 2, textAlign: "right" },
  colAmount: { flex: 2, textAlign: "right" },
  tableCellText: {
    fontSize: 9,
    color: colors.neutral900,
  },
  tableCellMono: {
    fontSize: 9,
    color: colors.neutral900,
    fontFamily: "Courier",
  },

  // Totals
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 24,
  },
  totalsBox: {
    width: 240,
    borderTop: `2px solid ${colors.neutral200}`,
    paddingTop: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 9,
    color: colors.neutral600,
  },
  totalValue: {
    fontSize: 9,
    fontFamily: "Courier",
    color: colors.neutral900,
  },
  totalRowHighlight: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 4,
  },
  totalLabelHighlight: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },
  totalValueHighlight: {
    fontSize: 10,
    fontFamily: "Courier-Bold",
    color: colors.white,
  },
  whtRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: colors.neutral50,
    borderRadius: 2,
  },
  whtLabel: {
    fontSize: 9,
    color: colors.warning,
    fontFamily: "Helvetica-Bold",
  },
  whtValue: {
    fontSize: 9,
    fontFamily: "Courier",
    color: colors.warning,
  },

  // Notes
  notesSection: {
    marginBottom: 24,
    padding: 12,
    backgroundColor: colors.neutral50,
    borderLeft: `3px solid ${colors.accent}`,
    borderRadius: 2,
  },
  notesLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.neutral400,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: colors.neutral600,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: `1px solid ${colors.neutral200}`,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: colors.neutral400,
  },
});

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case "paid":
      return colors.success;
    case "sent":
      return colors.warning;
    case "draft":
      return colors.neutral400;
    default:
      return colors.neutral400;
  }
}

function getGSTLabel(gstType: string, gstRate: number): string {
  if (gstType === "zero_rated") return "GST (Zero-Rated — IT Export)";
  if (gstType === "exempt") return "GST (Exempt)";
  return `GST (${gstRate}%)`;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function InvoicePDFTemplate({
  invoice,
  business,
  client,
}: PDFInvoiceProps) {
  const sortedItems = [...invoice.items].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View
            style={{ flexDirection: "row", alignItems: "flex-start", flex: 1 }}
          >
            {business.logoUrl && (
              <Image style={styles.logo} src={business.logoUrl} />
            )}
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{business.name}</Text>
              {business.address && (
                <Text style={styles.businessDetail}>{business.address}</Text>
              )}
              {business.ntn && (
                <Text style={styles.businessDetail}>NTN: {business.ntn}</Text>
              )}
              {business.strn && invoice.gstType === "standard" && (
                <Text style={styles.businessDetail}>STRN: {business.strn}</Text>
              )}
            </View>
          </View>

          <View style={styles.invoiceBadge}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(invoice.status) },
              ]}
            >
              {invoice.status}
            </Text>
          </View>
        </View>

        {/* ── Meta (dates + client) ── */}
        <View style={styles.metaSection}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Issue Date</Text>
            <Text style={styles.metaValue}>
              {formatDate(invoice.issueDate)}
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>{formatDate(invoice.dueDate)}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Currency</Text>
            <Text style={styles.metaValue}>{invoice.currency}</Text>
          </View>
          {client && (
            <View style={[styles.metaBlock, { flex: 2 }]}>
              <Text style={styles.metaLabel}>Billed To</Text>
              <Text style={styles.metaValueBold}>{client.name}</Text>
              {client.email && (
                <Text style={styles.metaValue}>{client.email}</Text>
              )}
              {client.address && (
                <Text style={styles.metaValue}>{client.address}</Text>
              )}
              {client.ntn && (
                <Text style={styles.metaValue}>NTN: {client.ntn}</Text>
              )}
            </View>
          )}
        </View>

        {/* ── Line Items Table ── */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colUnitPrice]}>
              Unit Price
            </Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>
              Amount
            </Text>
          </View>

          {sortedItems.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlt : {},
              ]}
            >
              <Text style={[styles.tableCellText, styles.colDescription]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCellMono, styles.colQty]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCellMono, styles.colUnitPrice]}>
                {formatCurrency(item.unitPrice, invoice.currency)}
              </Text>
              <Text style={[styles.tableCellMono, styles.colAmount]}>
                {formatCurrency(item.amount, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Totals ── */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.subtotal, invoice.currency)}
              </Text>
            </View>

            {/* GST row — hide if exempt */}
            {invoice.gstType !== "exempt" && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  {getGSTLabel(invoice.gstType, invoice.gstRate)}
                </Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(invoice.gstAmount, invoice.currency)}
                </Text>
              </View>
            )}

            <View style={styles.totalRowHighlight}>
              <Text style={styles.totalLabelHighlight}>Total</Text>
              <Text style={styles.totalValueHighlight}>
                {formatCurrency(invoice.total, invoice.currency)}
              </Text>
            </View>

            {/* WHT row — only if applicable */}
            {invoice.whtApplicable && (
              <View style={styles.whtRow}>
                <Text style={styles.whtLabel}>
                  WHT Deduction ({invoice.whtRate}%)
                </Text>
                <Text style={styles.whtValue}>
                  - {formatCurrency(invoice.whtAmount, invoice.currency)}
                </Text>
              </View>
            )}

            {/* Net Payable — always show */}
            <View style={[styles.totalRow, { marginTop: 4 }]}>
              <Text
                style={[
                  styles.totalLabel,
                  { fontFamily: "Helvetica-Bold", color: colors.neutral900 },
                ]}
              >
                Net Payable
              </Text>
              <Text
                style={[
                  styles.totalValue,
                  { fontFamily: "Courier-Bold", color: colors.primary },
                ]}
              >
                {formatCurrency(invoice.netPayable, invoice.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Notes ── */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by InvoicePK — invoicepk.vercel.app
          </Text>
          <Text style={styles.footerText}>
            {invoice.invoiceNumber} | {formatDate(invoice.issueDate)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/* ============================================================================
   COMMIT HISTORY
   ============================================================================

   feat(api): implement invoice status transition endpoint

   - Added PATCH /api/invoices/:id/status endpoint
   - Protected endpoint using withAuth middleware
   - Connected request handling to MongoDB

   ---------------------------------------------------------------------------

   feat(validation): validate status update requests

   - Added Zod schema for status payload
   - Restricted status values to:
       • draft
       • sent
       • paid
   - Returned HTTP 422 for invalid request payloads

   ---------------------------------------------------------------------------

   feat(security): enforce business ownership

   - Verified authenticated business exists
   - Restricted status updates to owned invoices only
   - Centralized ownership verification using checkOwnership()

   ---------------------------------------------------------------------------

   feat(workflow): implement invoice status state machine

   - Enforced valid forward-only status transitions
   - Allowed:
       • draft → sent
       • sent → paid
   - Prevented backward transitions
   - Prevented invalid workflow states
   - Centralized transition validation using isValidTransition()

   ---------------------------------------------------------------------------

   feat(invoices): implement status update workflow

   - Updated invoice status after validation
   - Persisted status changes to the database
   - Returned updated invoice status summary
   - Preserved invoice integrity during workflow progression

   ---------------------------------------------------------------------------

   feat(logging): improve endpoint observability

   - Logged incoming requests
   - Logged validation failures
   - Logged invalid status transitions
   - Logged successful status updates
   - Logged unexpected server errors

   ---------------------------------------------------------------------------

   feat(errors): implement standardized error handling

   - Returned structured NOT_FOUND responses
   - Returned VALIDATION_ERROR responses
   - Returned INVOICE_LOCKED responses for invalid transitions
   - Returned SERVER_ERROR responses
   - Wrapped database operations in try/catch blocks

============================================================================ */
