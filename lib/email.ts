// lib/email.ts
// Email service using Nodemailer (Gmail SMTP) for sending invoices with PDF attachments.

import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error('SMTP_USER and SMTP_PASSWORD environment variables are not set');
    }
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
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
  const from = process.env.EMAIL_FROM || `InvoicePK <${process.env.SMTP_USER}>`;

  const info = await getTransporter().sendMail({
    from,
    to,
    subject,
    html,
    attachments: attachments.map((att) => ({
      filename: att.filename,
      content: att.content,
    })),
  });

  return info;
}
