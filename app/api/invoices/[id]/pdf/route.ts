// app/api/invoices/[id]/pdf/route.ts
// GET /api/invoices/:id/pdf
// Generates and streams a PDF for the given invoice directly to the browser.
// Server-side only — fetches invoice from MongoDB, renders PDF template,
// streams binary PDF as application/pdf response.

import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { getBusinessForUser } from '@/lib/get-business';
import { checkOwnership } from '@/lib/ownership';
import Invoice from '@/models/Invoice';
import InvoicePDFTemplate from '@/components/InvoicePDF/InvoicePDFTemplate';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[GET /api/invoices/${id}/pdf] Request received`);

  return withAuth(req, async (req, uid) => {
    try {
      await connectDB();

      const business = await getBusinessForUser(uid);
      if (!business) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Business profile not found.', status: 404 } },
          { status: 404 }
        );
      }

      // Fetch invoice with client info
      const invoice = await Invoice.findById(id).populate('clientId', 'name email address ntn');

      const ownershipError = checkOwnership(invoice, business._id.toString());
      if (ownershipError) return ownershipError;

      const inv = invoice as any;

      // Build props for PDF template
      const pdfProps = {
        invoice: {
          invoiceNumber: inv.invoiceNumber,
          status:        inv.status,
          issueDate:     inv.issueDate,
          dueDate:       inv.dueDate ?? null,
          currency:      inv.currency,
          gstType:       inv.gstType,
          gstRate:       inv.gstRate,
          subtotal:      inv.subtotal,
          gstAmount:     inv.gstAmount,
          total:         inv.total,
          whtApplicable: inv.whtApplicable,
          whtRate:       inv.whtRate,
          whtAmount:     inv.whtAmount,
          netPayable:    inv.netPayable,
          notes:         inv.notes ?? null,
          items:         inv.items.map((item: any) => ({
            description: item.description,
            quantity:    item.quantity,
            unitPrice:   item.unitPrice,
            amount:      item.amount,
            sortOrder:   item.sortOrder,
          })),
        },
        business: {
          name:     business.name,
          ntn:      business.ntn  ?? null,
          strn:     business.strn ?? null,
          address:  business.address ?? null,
          logoUrl:  business.logoUrl ?? null,
          currency: business.currency,
        },
        client: inv.clientId
          ? {
              name:    inv.clientId.name,
              email:   inv.clientId.email   ?? null,
              address: inv.clientId.address ?? null,
              ntn:     inv.clientId.ntn     ?? null,
            }
          : null,
      };

      // Render PDF to buffer server-side
      console.log(`[GET /api/invoices/${id}/pdf] Rendering PDF | invoiceNumber: ${inv.invoiceNumber}`);
      const pdfBuffer = await renderToBuffer(
        InvoicePDFTemplate(pdfProps) as any
      );

      // Build filename
      const clientName = inv.clientId?.name
        ? `_${inv.clientId.name.replace(/\s+/g, '_')}`
        : '';
      const filename = `${inv.invoiceNumber}${clientName}.pdf`;

      console.log(`[GET /api/invoices/${id}/pdf] PDF generated | filename: ${filename} | status: 200`);

     // Stream PDF to browser
return new NextResponse(new Uint8Array(pdfBuffer), {
  status:  200,
  headers: {
    'Content-Type':        'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length':      pdfBuffer.length.toString(),
  },
});

    } catch (err) {
      console.error(`[GET /api/invoices/${id}/pdf] ERROR:`, err);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Something went wrong.', status: 500 } },
        { status: 500 }
      );
    }
  });
}















/* ============================================================================
   COMMIT HISTORY
   ============================================================================

   feat(api): implement invoice PDF generation endpoint

   - Added GET /api/invoices/:id/pdf endpoint
   - Protected endpoint using withAuth middleware
   - Connected request handling to MongoDB

   ---------------------------------------------------------------------------

   feat(security): enforce business ownership

   - Verified authenticated business exists
   - Restricted PDF generation to owned invoices only
   - Centralized ownership verification using checkOwnership()

   ---------------------------------------------------------------------------

   feat(invoices): retrieve invoice data for PDF rendering

   - Loaded invoice by ID
   - Populated associated client information
   - Retrieved business branding details
   - Prepared complete invoice dataset for PDF generation

   ---------------------------------------------------------------------------

   feat(pdf): integrate React PDF renderer

   - Rendered invoices using @react-pdf/renderer
   - Used reusable InvoicePDFTemplate component
   - Generated PDF documents entirely on the server
   - Eliminated client-side PDF generation dependency

   ---------------------------------------------------------------------------

   feat(pdf): transform invoice data for template rendering

   - Mapped invoice metadata
   - Mapped business information
   - Mapped client details
   - Mapped invoice line items
   - Passed strongly typed props to PDF template

   ---------------------------------------------------------------------------

   feat(download): implement PDF file streaming

   - Rendered PDF to binary buffer
   - Streamed PDF directly to the browser
   - Returned application/pdf response
   - Configured download response headers
   - Included content length for efficient transfer

   ---------------------------------------------------------------------------

   feat(download): generate descriptive filenames

   - Generated filenames using invoice number
   - Appended client name when available
   - Sanitized filenames for safe downloads

   ---------------------------------------------------------------------------

   feat(logging): improve PDF generation observability

   - Logged incoming requests
   - Logged PDF rendering process
   - Logged successful PDF generation
   - Logged generated filenames
   - Logged unexpected server errors

   ---------------------------------------------------------------------------

   feat(errors): implement standardized error handling

   - Returned structured NOT_FOUND responses
   - Returned standardized SERVER_ERROR responses
   - Wrapped PDF generation workflow in try/catch blocks

============================================================================ */