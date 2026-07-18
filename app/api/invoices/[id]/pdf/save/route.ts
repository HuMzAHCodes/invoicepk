// app/api/invoices/[id]/pdf/save/route.ts
// POST /api/invoices/:id/pdf/save
// Generates a PDF for the given invoice, saves it to Cloudinary,
// and stores the Cloudinary URL in the invoice document (pdfUrl field).

import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { getBusinessForUser } from '@/lib/get-business';
import { checkOwnership } from '@/lib/ownership';
import cloudinary from '@/lib/cloudinary';
import Invoice from '@/models/Invoice';
// Registering this schema is required even though it's not referenced directly below:
// this route is bundled in isolation on Vercel, so nothing else registers it before
// Invoice.findById(...).populate('clientId', ...) runs, causing a MissingSchemaError
// on every invocation without this import.
import '@/models/Client';
import InvoicePDFTemplate from '@/components/InvoicePDF/InvoicePDFTemplate';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[POST /api/invoices/${id}/pdf/save] Request received`);

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

      // Build PDF props
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
          ntn:      business.ntn     ?? null,
          strn:     business.strn    ?? null,
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

      // Render PDF to buffer
      console.log(`[POST /api/invoices/${id}/pdf/save] Rendering PDF | invoiceNumber: ${inv.invoiceNumber}`);
      const pdfBuffer = await renderToBuffer(
        InvoicePDFTemplate(pdfProps) as any
      );

      // Build Cloudinary public_id
      const clientSlug = inv.clientId?.name
        ? `_${inv.clientId.name.replace(/\s+/g, '_')}`
        : '';
      const publicId = `invoicepk/pdfs/${inv.invoiceNumber}${clientSlug}`;

      // Upload to Cloudinary as raw file
      console.log(`[POST /api/invoices/${id}/pdf/save] Uploading to Cloudinary | publicId: ${publicId}`);

      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            public_id:     publicId,
            format:        'pdf',
            overwrite:     true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(pdfBuffer);
      });

      const pdfUrl = uploadResult.secure_url;
      console.log(`[POST /api/invoices/${id}/pdf/save] Cloudinary upload success | url: ${pdfUrl}`);

      // Save URL to invoice document
      inv.pdfUrl = pdfUrl;
      await inv.save();

      console.log(`[POST /api/invoices/${id}/pdf/save] pdfUrl saved to invoice | status: 200`);

      return NextResponse.json({ data: { pdfUrl } });

    } catch (err) {
      console.error(`[POST /api/invoices/${id}/pdf/save] ERROR:`, err);
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

   feat(api): implement invoice PDF persistence endpoint

   - Added POST /api/invoices/:id/pdf/save endpoint
   - Protected endpoint using withAuth middleware
   - Connected request handling to MongoDB

   ---------------------------------------------------------------------------

   feat(security): enforce business ownership

   - Verified authenticated business exists
   - Restricted PDF generation to owned invoices only
   - Centralized ownership verification using checkOwnership()

   ---------------------------------------------------------------------------

   feat(invoices): prepare invoice data for PDF generation

   - Retrieved invoice by ID
   - Populated associated client information
   - Loaded business branding details
   - Prepared invoice data for PDF template rendering

   ---------------------------------------------------------------------------

   feat(pdf): generate invoice PDF server-side

   - Rendered invoices using @react-pdf/renderer
   - Reused shared InvoicePDFTemplate component
   - Generated PDF documents entirely on the server
   - Converted rendered document into binary buffer

   ---------------------------------------------------------------------------

   feat(storage): upload invoice PDFs to Cloudinary

   - Uploaded generated PDFs as raw Cloudinary assets
   - Generated predictable Cloudinary public IDs
   - Supported overwriting previously generated PDFs
   - Stored uploaded documents securely in Cloudinary

   ---------------------------------------------------------------------------

   feat(invoices): persist generated PDF references

   - Saved Cloudinary PDF URL to the invoice document
   - Linked uploaded PDF with its originating invoice
   - Returned stored PDF URL in API response

   ---------------------------------------------------------------------------

   feat(naming): generate consistent PDF asset names

   - Generated asset identifiers using invoice numbers
   - Appended client name when available
   - Sanitized generated identifiers for safe storage

   ---------------------------------------------------------------------------

   feat(logging): improve PDF persistence observability

   - Logged incoming requests
   - Logged PDF rendering process
   - Logged Cloudinary upload operations
   - Logged successful uploads
   - Logged invoice update operations
   - Logged unexpected server errors

   ---------------------------------------------------------------------------

   feat(errors): implement standardized error handling

   - Returned structured NOT_FOUND responses
   - Returned standardized SERVER_ERROR responses
   - Wrapped PDF generation and upload workflow in try/catch blocks

============================================================================ */