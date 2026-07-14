// lib/ai/chat-tools.ts
// Deterministic Mongo queries for the invoice Q&A assistant.
// Always scoped by businessId — never trust client-supplied IDs here.

import mongoose from 'mongoose';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';

export type ChatToolName =
  | 'overdue_invoices'
  | 'unpaid_invoices'
  | 'client_balance'
  | 'month_summary'
  | 'unsupported';

export interface InvoiceChatRow {
  id: string;
  invoiceNumber: string;
  clientName: string | null;
  status: string;
  dueDate: string | null;
  issueDate: string;
  currency: string;
  total: number;
  netPayable: number;
  daysOverdue: number | null;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthRange(now = new Date()): { from: Date; to: Date } {
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { from, to };
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function mapInvoice(doc: any, today: Date): InvoiceChatRow {
  const due = doc.dueDate ? new Date(doc.dueDate) : null;
  const clientName =
    doc.clientId && typeof doc.clientId === 'object'
      ? doc.clientId.name ?? null
      : null;

  return {
    id: doc._id.toString(),
    invoiceNumber: doc.invoiceNumber,
    clientName,
    status: doc.status,
    dueDate: due ? due.toISOString().split('T')[0] : null,
    issueDate: new Date(doc.issueDate).toISOString().split('T')[0],
    currency: doc.currency,
    total: doc.total,
    netPayable: doc.netPayable,
    daysOverdue: due && due < today ? daysBetween(due, today) : null,
  };
}

export async function getOverdueInvoices(
  businessId: mongoose.Types.ObjectId,
): Promise<{ count: number; totalNetPayable: number; invoices: InvoiceChatRow[] }> {
  const today = startOfToday();
  const docs = await Invoice.find({
    businessId,
    status: { $ne: 'paid' },
    dueDate: { $ne: null, $lt: today },
  })
    .populate('clientId', 'name')
    .sort({ dueDate: 1 })
    .limit(50)
    .lean();

  const invoices = docs.map((d) => mapInvoice(d, today));
  const totalNetPayable = invoices.reduce((sum, i) => sum + i.netPayable, 0);

  return { count: invoices.length, totalNetPayable, invoices };
}

export async function getUnpaidInvoices(
  businessId: mongoose.Types.ObjectId,
): Promise<{ count: number; totalNetPayable: number; invoices: InvoiceChatRow[] }> {
  const today = startOfToday();
  const docs = await Invoice.find({
    businessId,
    status: { $in: ['draft', 'sent'] },
  })
    .populate('clientId', 'name')
    .sort({ dueDate: 1, createdAt: -1 })
    .limit(50)
    .lean();

  const invoices = docs.map((d) => mapInvoice(d, today));
  const totalNetPayable = invoices.reduce((sum, i) => sum + i.netPayable, 0);

  return { count: invoices.length, totalNetPayable, invoices };
}

export async function getClientBalance(
  businessId: mongoose.Types.ObjectId,
  clientNameQuery: string,
): Promise<{
  matchedClient: { id: string; name: string } | null;
  count: number;
  totalNetPayable: number;
  invoices: InvoiceChatRow[];
}> {
  const needle = clientNameQuery.trim();
  if (!needle) {
    return { matchedClient: null, count: 0, totalNetPayable: 0, invoices: [] };
  }

  const clients = await Client.find({ businessId })
    .select('name')
    .limit(100)
    .lean();

  const lower = needle.toLowerCase();
  const exact = clients.find((c) => c.name.trim().toLowerCase() === lower);
  const partial =
    exact ??
    clients.find((c) => {
      const hay = c.name.trim().toLowerCase();
      return hay.includes(lower) || lower.includes(hay);
    });

  if (!partial) {
    return { matchedClient: null, count: 0, totalNetPayable: 0, invoices: [] };
  }

  const today = startOfToday();
  const docs = await Invoice.find({
    businessId,
    clientId: partial._id,
    status: { $ne: 'paid' },
  })
    .populate('clientId', 'name')
    .sort({ dueDate: 1 })
    .limit(50)
    .lean();

  const invoices = docs.map((d) => mapInvoice(d, today));
  const totalNetPayable = invoices.reduce((sum, i) => sum + i.netPayable, 0);

  return {
    matchedClient: { id: partial._id.toString(), name: partial.name },
    count: invoices.length,
    totalNetPayable,
    invoices,
  };
}

export async function getMonthSummary(
  businessId: mongoose.Types.ObjectId,
): Promise<{
  month: string;
  createdCount: number;
  paidCount: number;
  unpaidCount: number;
  paidTotal: number;
  unpaidTotal: number;
}> {
  const { from, to } = monthRange();
  const docs = await Invoice.find({
    businessId,
    issueDate: { $gte: from, $lt: to },
  })
    .select('status netPayable')
    .lean();

  let paidCount = 0;
  let unpaidCount = 0;
  let paidTotal = 0;
  let unpaidTotal = 0;

  for (const doc of docs) {
    if (doc.status === 'paid') {
      paidCount += 1;
      paidTotal += doc.netPayable;
    } else {
      unpaidCount += 1;
      unpaidTotal += doc.netPayable;
    }
  }

  const month = from.toLocaleString('en-PK', { month: 'long', year: 'numeric' });

  return {
    month,
    createdCount: docs.length,
    paidCount,
    unpaidCount,
    paidTotal,
    unpaidTotal,
  };
}
