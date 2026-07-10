// app/api/cron/reminders/route.ts
// GET /api/cron/reminders
// Triggered daily by Vercel Cron. Checks for unpaid, overdue invoices
// and sends daily payment reminders to clients with PDF invoices attached.

import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { connectDB } from '@/lib/db';
import Invoice from '@/models/Invoice';
import InvoicePDFTemplate from '@/components/InvoicePDF/InvoicePDFTemplate';
import { sendInvoiceEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  console.log('[GET /api/cron/reminders] Request received');

  try {
    // 1. Verify Vercel Cron Secret (prevent unauthorized public triggers)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('[GET /api/cron/reminders] Unauthorized trigger attempt');
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Unauthorized.', status: 401 } },
        { status: 401 }
      );
    }

    // 2. Connect to database
    await connectDB();

    // 3. Find all invoices that are 'sent' (unpaid) and whose due dates are in the past
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Include all invoices due up to end of today

    const overdueInvoices = await Invoice.find({
      status: 'sent',
      dueDate: { $lt: today },
    })
      .populate('businessId')
      .populate('clientId');

    console.log(`[GET /api/cron/reminders] Found ${overdueInvoices.length} overdue invoices to process`);

    const results = [];

    // 4. Loop through and send reminders
    for (const inv of overdueInvoices) {
      const client = inv.clientId as any;
      const business = inv.businessId as any;

      if (!client || !client.email) {
        console.log(`[GET /api/cron/reminders] Skipping Invoice ${inv.invoiceNumber}: Client has no email`);
        continue;
      }

      if (!business) {
        console.log(`[GET /api/cron/reminders] Skipping Invoice ${inv.invoiceNumber}: Business profile not found`);
        continue;
      }

      try {
        // Build PDF template props
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
          client: {
            name:    client.name,
            email:   client.email   ?? null,
            address: client.address ?? null,
            ntn:     client.ntn     ?? null,
          },
        };

        // Render PDF buffer
        const pdfBuffer = await renderToBuffer(
          InvoicePDFTemplate(pdfProps) as any
        );

        // Build filename
        const clientNameSlug = client.name.replace(/\s+/g, '_');
        const filename = `Reminder_${inv.invoiceNumber}_${clientNameSlug}.pdf`;

        // Build email HTML body
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #fbeaea; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #b23333; }
              .title { font-size: 20px; font-weight: bold; color: #b23333; margin: 0; }
              .invoice-number { font-size: 16px; margin-top: 5px; color: #6E6A5D; }
              .details { margin-bottom: 20px; }
              .details p { margin: 8px 0; }
              .amount { font-size: 18px; font-weight: bold; color: #1F5C3F; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dedacb; font-size: 12px; color: #6E6A5D; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 class="title">Payment Reminder: Invoice Overdue</h2>
              <div class="invoice-number">Invoice ${inv.invoiceNumber}</div>
            </div>
            
            <div class="details">
              <p>Dear ${client.name},</p>
              <p>This is a friendly reminder that invoice <strong>${inv.invoiceNumber}</strong> issued by <strong>${business.name}</strong> is currently overdue.</p>
              <p>The invoice was due for payment on <strong>${new Date(inv.dueDate!).toLocaleDateString()}</strong>.</p>
              <p class="amount">Outstanding Amount: ${inv.currency} ${inv.netPayable.toLocaleString()}</p>
            </div>
            
            <p>Please find your detailed invoice PDF attached. If you have already processed this payment, you can safely ignore this email.</p>
            
            <p>Thank you for your prompt business.</p>
            
            <div class="footer">
              <p>Sent automatically by ${business.name} via InvoicePK.</p>
            </div>
          </body>
          </html>
        `;

        // Send email with PDF attachment
        await sendInvoiceEmail({
          to: client.email,
          subject: `Payment Reminder: Invoice ${inv.invoiceNumber} from ${business.name}`,
          html,
          attachments: [
            {
              filename,
              content: pdfBuffer,
            },
          ],
        });

        console.log(`[GET /api/cron/reminders] Reminder sent for Invoice ${inv.invoiceNumber} to ${client.email}`);
        results.push({ invoiceId: inv._id, invoiceNumber: inv.invoiceNumber, status: 'sent_success' });

      } catch (sendErr) {
        console.error(`[GET /api/cron/reminders] Failed to send reminder for Invoice ${inv.invoiceNumber}:`, sendErr);
        results.push({ invoiceId: inv._id, invoiceNumber: inv.invoiceNumber, status: 'failed', error: String(sendErr) });
      }
    }

    return NextResponse.json({
      data: {
        processedCount: overdueInvoices.length,
        results,
      },
    });

  } catch (err) {
    console.error('[GET /api/cron/reminders] Global Cron Error:', err);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Something went wrong.', status: 500 } },
      { status: 500 }
    );
  }
}
