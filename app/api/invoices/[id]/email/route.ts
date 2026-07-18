// app/api/invoices/[id]/email/route.ts
// POST /api/invoices/:id/email
// Sends invoice via email with PDF attachment using Resend.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { renderToBuffer } from '@react-pdf/renderer';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { getBusinessForUser } from '@/lib/get-business';
import { checkOwnership } from '@/lib/ownership';
import Invoice from '@/models/Invoice';
// Registering this schema is required even though it's not referenced directly below:
// this route is bundled in isolation on Vercel, so nothing else registers it before
// Invoice.findById(...).populate('clientId', ...) runs, causing a MissingSchemaError
// on every invocation without this import.
import '@/models/Client';
import InvoicePDFTemplate from '@/components/InvoicePDF/InvoicePDFTemplate';
import { sendInvoiceEmail } from '@/lib/email';

const emailSchema = z.object({
  recipientEmail: z.string().email('Invalid email address'),
  message: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[POST /api/invoices/${id}/email] Request received`);

  return withAuth(req, async (req, uid) => {
    try {
      await connectDB();

      const body = await req.json();
      const parsed = emailSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message, status: 422 } },
          { status: 422 }
        );
      }

      const business = await getBusinessForUser(uid);
      if (!business) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Business profile not found.', status: 404 } },
          { status: 404 }
        );
      }

      const invoice = await Invoice.findById(id).populate('clientId', 'name email address ntn');

      const ownershipError = checkOwnership(invoice, business._id.toString());
      if (ownershipError) return ownershipError;

      const inv = invoice as any;

      if (!inv.clientId?.email) {
        return NextResponse.json(
          { error: { code: 'NO_EMAIL', message: 'Client has no email address.', status: 400 } },
          { status: 400 }
        );
      }

      // Build PDF template props
      const pdfProps = {
        invoice: {
          invoiceNumber: inv.invoiceNumber,
          status: inv.status,
          issueDate: inv.issueDate,
          dueDate: inv.dueDate ?? null,
          currency: inv.currency,
          gstType: inv.gstType,
          gstRate: inv.gstRate,
          subtotal: inv.subtotal,
          gstAmount: inv.gstAmount,
          total: inv.total,
          whtApplicable: inv.whtApplicable,
          whtRate: inv.whtRate,
          whtAmount: inv.whtAmount,
          netPayable: inv.netPayable,
          notes: inv.notes ?? null,
          items: inv.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            sortOrder: item.sortOrder,
          })),
        },
        business: {
          name: business.name,
          ntn: business.ntn ?? null,
          strn: business.strn ?? null,
          address: business.address ?? null,
          logoUrl: business.logoUrl ?? null,
          currency: business.currency,
        },
        client: inv.clientId
          ? {
              name: inv.clientId.name,
              email: inv.clientId.email ?? null,
              address: inv.clientId.address ?? null,
              ntn: inv.clientId.ntn ?? null,
            }
          : null,
      };

      // Generate PDF buffer
      const pdfBuffer = await renderToBuffer(InvoicePDFTemplate(pdfProps) as any);

      // Build filename
      const clientName = inv.clientId?.name
        ? `_${inv.clientId.name.replace(/\s+/g, '_')}`
        : '';
      const filename = `${inv.invoiceNumber}${clientName}.pdf`;

      // Build email HTML
      const { recipientEmail, message } = parsed.data;
      const customMessage = message || `Please find attached invoice ${inv.invoiceNumber}.`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .invoice-number { font-size: 24px; font-weight: bold; color: #2563eb; }
            .details { margin-bottom: 20px; }
            .details p { margin: 5px 0; }
            .amount { font-size: 18px; font-weight: bold; color: #059669; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="invoice-number">Invoice ${inv.invoiceNumber}</div>
            <p>From: ${business.name}</p>
            <p>To: ${inv.clientId.name}</p>
          </div>
          
          <div class="details">
            <p>${customMessage}</p>
            <p class="amount">Amount Due: ${inv.currency} ${inv.netPayable.toLocaleString()}</p>
            <p>Issue Date: ${new Date(inv.issueDate).toLocaleDateString()}</p>
            ${inv.dueDate ? `<p>Due Date: ${new Date(inv.dueDate).toLocaleDateString()}</p>` : ''}
          </div>
          
          <p>Please find the detailed invoice attached as a PDF.</p>
          
          <div class="footer">
            <p>This email was sent by ${business.name} using InvoicePK.</p>
          </div>
        </body>
        </html>
      `;

      // Send email with PDF attachment
      await sendInvoiceEmail({
        to: recipientEmail,
        subject: `Invoice ${inv.invoiceNumber} from ${business.name}`,
        html,
        attachments: [
          {
            filename,
            content: pdfBuffer,
          },
        ],
      });

      console.log(`[POST /api/invoices/${id}/email] Email sent | to: ${recipientEmail} | invoice: ${inv.invoiceNumber}`);

      return NextResponse.json({
        data: {
          success: true,
          message: `Invoice sent to ${recipientEmail}`,
        },
      });

    } catch (err) {
      console.error(`[POST /api/invoices/${id}/email] ERROR:`, err);
      const reason = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: `Failed to send email: ${reason}`, status: 500 } },
        { status: 500 }
      );
    }
  });
}
