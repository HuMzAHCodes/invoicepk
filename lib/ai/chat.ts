// lib/ai/chat.ts
// Intent classification + answer formatting for invoice Q&A.

import { z } from 'zod';
import mongoose from 'mongoose';
import { generateJsonText } from '@/lib/ai/gemini';
import {
  getClientBalance,
  getMonthSummary,
  getOverdueInvoices,
  getUnpaidInvoices,
  type ChatToolName,
  type InvoiceChatRow,
} from '@/lib/ai/chat-tools';

const intentSchema = z.object({
  tool: z.enum([
    'overdue_invoices',
    'unpaid_invoices',
    'client_balance',
    'month_summary',
    'unsupported',
  ]),
  clientName: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
});

export type ChatIntent = z.infer<typeof intentSchema>;

const SCOPE_HINT =
  'I can help with your invoices — try asking what is overdue, which invoices are unpaid, a client balance, or this month\'s summary.';

const GREETING_REPLY =
  `Hi! I'm InvoicePK assistant. ${SCOPE_HINT}`;

const OFFTOPIC_REPLY =
  `I'm focused on your InvoicePK data only (not general chat). ${SCOPE_HINT}`;

function cleanJson(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function money(amount: number, currency = 'PKR'): string {
  return `${currency} ${amount.toLocaleString('en-PK')}`;
}

function formatInvoiceLines(invoices: InvoiceChatRow[]): string {
  if (invoices.length === 0) return '';
  return invoices
    .slice(0, 15)
    .map((inv) => {
      const client = inv.clientName ?? 'No client';
      const due = inv.dueDate ? `due ${inv.dueDate}` : 'no due date';
      const overdue =
        inv.daysOverdue != null ? ` · ${inv.daysOverdue}d overdue` : '';
      return `• ${client} — ${inv.invoiceNumber} — ${money(inv.netPayable, inv.currency)} (${due}${overdue}, ${inv.status})`;
    })
    .join('\n');
}

/** Fast local routing — no Gemini call. Returns null when unclear. */
export function heuristicChatIntent(question: string): ChatIntent | null {
  const q = question.trim().toLowerCase();

  if (
    /^(hi|hello|hey|salam|assalamu?\s*alaikum|good\s*(morning|afternoon|evening)|how are you|what'?s up|whats up)[\s!?.]*$/i.test(
      q,
    )
  ) {
    return {
      tool: 'unsupported',
      clientName: null,
      reason: GREETING_REPLY,
    };
  }

  // Clearly off-topic (weather, jokes, code, politics, etc.)
  if (
    /\b(weather|joke|football|cricket|recipe|write (me )?code|python|javascript|who is the president|tell me a story)\b/i.test(
      q,
    )
  ) {
    return {
      tool: 'unsupported',
      clientName: null,
      reason: OFFTOPIC_REPLY,
    };
  }

  if (
    /\b(overdue|past\s*due|late\s*payments?|still\s+overdue|payments?\s+still\s+(unpaid|overdue|due))\b/i.test(
      q,
    )
  ) {
    return { tool: 'overdue_invoices', clientName: null, reason: null };
  }

  if (/\b(this\s*month|month(ly)?\s+summary|summary\s+this\s+month)\b/i.test(q)) {
    return { tool: 'month_summary', clientName: null, reason: null };
  }

  if (/\b(unpaid|not\s+paid|outstanding)\b/i.test(q)) {
    return { tool: 'unpaid_invoices', clientName: null, reason: null };
  }

  const clientPatterns = [
    /(?:what does|how much does|does)\s+(.+?)\s+owe\b/i,
    /(?:balance|unpaid(?: invoices)?|outstanding)\s+(?:for|of)\s+(.+)$/i,
    /^(.+?)\s+(?:balance|unpaid invoices|outstanding)$/i,
  ];

  for (const pattern of clientPatterns) {
    const match = question.trim().match(pattern);
    if (match?.[1]) {
      const name = match[1].trim().replace(/[?.!]+$/, '');
      if (name.length >= 2 && !/^(my|the|all|some)$/i.test(name)) {
        return {
          tool: 'client_balance',
          clientName: name,
          reason: null,
        };
      }
    }
  }

  return null;
}

export async function classifyChatIntent(question: string): Promise<ChatIntent> {
  const local = heuristicChatIntent(question);
  if (local) return local;

  const prompt = `You route questions for InvoicePK, a Pakistani invoicing app.

Return ONLY JSON:
{
  "tool": "overdue_invoices" | "unpaid_invoices" | "client_balance" | "month_summary" | "unsupported",
  "clientName": string | null,
  "reason": string | null
}

Tool meanings:
- overdue_invoices: unpaid invoices past their due date (overdue / late / past due)
- unpaid_invoices: all invoices not paid yet (draft or sent), whether overdue or not
- client_balance: what a specific client owes / their unpaid invoices — set clientName
- month_summary: this month's invoice counts / paid vs unpaid totals
- unsupported: greetings, general chat, tax law advice, unrelated topics

For unsupported greetings, set reason to a short friendly redirect to invoice questions.
For other unsupported topics, set reason explaining you only answer invoice/client data questions.

User question:
"""
${question}
"""`;

  try {
    const raw = await generateJsonText(prompt);
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanJson(raw));
    } catch {
      return {
        tool: 'unsupported',
        clientName: null,
        reason: OFFTOPIC_REPLY,
      };
    }

    const result = intentSchema.safeParse(parsed);
    if (!result.success) {
      return {
        tool: 'unsupported',
        clientName: null,
        reason: OFFTOPIC_REPLY,
      };
    }

    if (result.data.tool === 'unsupported' && !result.data.reason) {
      return { ...result.data, reason: OFFTOPIC_REPLY };
    }

    return result.data;
  } catch (err) {
    console.warn('[classifyChatIntent] Gemini failed', err);
    return {
      tool: 'unsupported',
      clientName: null,
      reason:
        'AI is busy right now. Try a clear invoice question like "What payments are overdue?" or use the suggestion chips.',
    };
  }
}

export async function runChatTool(
  businessId: mongoose.Types.ObjectId,
  intent: ChatIntent,
): Promise<{ tool: ChatToolName; data: unknown }> {
  switch (intent.tool) {
    case 'overdue_invoices':
      return {
        tool: 'overdue_invoices',
        data: await getOverdueInvoices(businessId),
      };
    case 'unpaid_invoices':
      return {
        tool: 'unpaid_invoices',
        data: await getUnpaidInvoices(businessId),
      };
    case 'client_balance':
      return {
        tool: 'client_balance',
        data: await getClientBalance(businessId, intent.clientName ?? ''),
      };
    case 'month_summary':
      return {
        tool: 'month_summary',
        data: await getMonthSummary(businessId),
      };
    default:
      return {
        tool: 'unsupported',
        data: {
          message: intent.reason ?? OFFTOPIC_REPLY,
        },
      };
  }
}

function formatDeterministic(tool: ChatToolName, data: unknown): string {
  if (tool === 'unsupported') {
    return (
      (data as { message?: string })?.message ?? OFFTOPIC_REPLY
    );
  }

  if (tool === 'month_summary') {
    const s = data as {
      month: string;
      createdCount: number;
      paidCount: number;
      unpaidCount: number;
      paidTotal: number;
      unpaidTotal: number;
    };
    return [
      `Here's your ${s.month} summary:`,
      `• Invoices created: ${s.createdCount}`,
      `• Paid: ${s.paidCount} (${money(s.paidTotal)})`,
      `• Unpaid: ${s.unpaidCount} (${money(s.unpaidTotal)})`,
    ].join('\n');
  }

  if (tool === 'client_balance') {
    const s = data as {
      matchedClient: { name: string } | null;
      count: number;
      totalNetPayable: number;
      invoices: InvoiceChatRow[];
    };
    if (!s.matchedClient) {
      return `I couldn't find a matching client. Check the name or open Clients to confirm spelling.`;
    }
    if (s.count === 0) {
      return `${s.matchedClient.name} has no unpaid invoices right now.`;
    }
    return [
      `${s.matchedClient.name} owes ${money(s.totalNetPayable)} across ${s.count} unpaid invoice(s):`,
      formatInvoiceLines(s.invoices),
    ].join('\n');
  }

  const s = data as {
    count: number;
    totalNetPayable: number;
    invoices: InvoiceChatRow[];
  };

  if (tool === 'overdue_invoices') {
    if (s.count === 0) {
      return 'You have no overdue unpaid invoices right now.';
    }
    return [
      `You have ${s.count} overdue unpaid invoice(s) totaling ${money(s.totalNetPayable)}:`,
      formatInvoiceLines(s.invoices),
    ].join('\n');
  }

  // unpaid_invoices
  if (s.count === 0) {
    return 'You have no unpaid invoices right now.';
  }
  return [
    `You have ${s.count} unpaid invoice(s) totaling ${money(s.totalNetPayable)}:`,
    formatInvoiceLines(s.invoices),
  ].join('\n');
}

export async function formatChatAnswer(
  _question: string,
  tool: ChatToolName,
  data: unknown,
): Promise<string> {
  // Fast path: format from Mongo results only (no second Gemini round-trip).
  // Gemini is still used when heuristic routing needs help classifying intent.
  return formatDeterministic(tool, data);
}
