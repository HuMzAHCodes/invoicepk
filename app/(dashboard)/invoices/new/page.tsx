"use client";

import PageHeader from "@/components/PageHeader";
import InvoiceForm from "@/components/InvoiceForm";

export default function NewInvoicePage() {
  return (
    <div>
      <PageHeader
        title="New Invoice"
        description="Create a new invoice for your client"
      />
      <InvoiceForm />
    </div>
  );
}
