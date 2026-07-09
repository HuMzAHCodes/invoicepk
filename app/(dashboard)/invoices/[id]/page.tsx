import InvoiceDetail from "@/components/InvoiceDetail";

export const metadata = {
  title: "Invoice Detail | InvoicePK",
};

export default function InvoiceDetailPage() {
  return <InvoiceDetail />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Defines the invoice detail page for the application using the App Router.
// • Configures page metadata to provide a descriptive browser title for the
//   invoice details view.
// • Serves as a lightweight route wrapper that renders the reusable
//   InvoiceDetail component.
// • Delegates all invoice retrieval, display, status management, PDF download,
//   and deletion functionality to the dedicated InvoiceDetail component.
// • Keeps page-level routing separate from business and presentation logic,
//   improving maintainability and component reusability.
// ─────────────────────────────────────────────────────────────────────────────
