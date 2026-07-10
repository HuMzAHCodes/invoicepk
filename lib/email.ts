// lib/email.ts
// Email service using Resend for sending invoices with PDF attachments.

import { Resend } from 'resend';

let resend: Resend;

function getResend(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface SendInvoiceEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments: {
    filename: string;
    content: Buffer;
  }[];
}

export async function sendInvoiceEmail({
  to,
  subject,
  html,
  attachments,
}: SendInvoiceEmailParams) {
  const from = process.env.EMAIL_FROM || 'InvoicePK <noreply@invoicepk.com>';

  const { data, error } = await getResend().emails.send({
    from,
    to: [to],
    subject,
    html,
    attachments: attachments.map((att) => ({
      filename: att.filename,
      content: att.content.toString('base64'),
    })),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
