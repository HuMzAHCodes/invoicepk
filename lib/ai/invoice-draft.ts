// lib/ai/invoice-draft.ts
// Prompt + Zod schema for "describe invoice → auto-fill" drafts.

import { z } from 'zod';
import { generateJsonText } from '@/lib/ai/gemini';

export const invoiceDraftAiSchema = z.object({
  clientName: z.string().nullable().optional(),
  dueDays: z.number().int().min(0).max(365).nullable().optional(),
  currency: z.enum(['PKR', 'USD']).optional().default('PKR'),
  gstType: z
    .enum(['standard', 'zero_rated', 'exempt'])
    .optional()
    .default('standard'),
  gstRate: z.number().min(0).max(100).optional().default(17),
  whtApplicable: z.boolean().optional().default(false),
  whtRate: z.number().min(0).max(100).optional().default(3),
  notes: z.string().nullable().optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
      }),
    )
    .min(1),
});

export type InvoiceDraftAi = z.infer<typeof invoiceDraftAiSchema>;

export function buildInvoiceDraftPrompt(
  description: string,
  clientNames: string[],
): string {
  const clientsBlock =
    clientNames.length > 0
      ? clientNames.map((n) => `- ${n}`).join('\n')
      : '(no existing clients)';

  return `You extract structured invoice data for a Pakistani invoicing app (InvoicePK).

Return ONLY valid JSON matching this shape:
{
  "clientName": string | null,
  "dueDays": number | null,
  "currency": "PKR" | "USD",
  "gstType": "standard" | "zero_rated" | "exempt",
  "gstRate": number,
  "whtApplicable": boolean,
  "whtRate": number,
  "notes": string | null,
  "items": [{ "description": string, "quantity": number, "unitPrice": number }]
}

Rules:
- Prefer PKR unless the user clearly asks for USD.
- Default gstType to "standard" and gstRate to 17 unless the user specifies otherwise.
- zero_rated → gstRate 0. exempt → gstRate 0.
- whtApplicable true only if the user mentions WHT / withholding / corporate tax deduction.
- dueDays is days from today (e.g. "due in 14 days" → 14). null if not mentioned.
- clientName: match one of the existing client names below when possible (use the exact spelling). Otherwise use the spoken/written name, or null.
- Split multiple products/services into separate items.
- Do not invent line items that were not mentioned. If quantity/price missing, use quantity 1 and unitPrice 0.
- Notes: short payment terms only if mentioned; otherwise null.

Existing clients for this business:
${clientsBlock}

User description:
"""
${description}
"""`;
}

export async function draftInvoiceFromDescription(
  description: string,
  clientNames: string[],
): Promise<InvoiceDraftAi> {
  const raw = await generateJsonText(
    buildInvoiceDraftPrompt(description, clientNames),
  );

  // Models sometimes wrap JSON in markdown fences despite responseMimeType
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned invalid JSON. Try rephrasing your description.');
  }

  const result = invoiceDraftAiSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      'AI draft was incomplete. Try adding item names, quantities, and prices.',
    );
  }

  return result.data;
}

export function matchClientByName<T extends { name: string }>(
  clientName: string | null | undefined,
  clients: T[],
): T | null {
  if (!clientName?.trim()) return null;

  const needle = clientName.trim().toLowerCase();
  const exact = clients.find((c) => c.name.trim().toLowerCase() === needle);
  if (exact) return exact;

  return (
    clients.find((c) => {
      const hay = c.name.trim().toLowerCase();
      return hay.includes(needle) || needle.includes(hay);
    }) ?? null
  );
}

export function addDaysIso(baseIsoDate: string, days: number): string {
  const d = new Date(`${baseIsoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
