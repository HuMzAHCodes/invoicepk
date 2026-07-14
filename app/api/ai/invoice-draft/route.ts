// POST /api/ai/invoice-draft
// Turns a natural-language invoice description into structured form fields.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { getBusinessForUser } from '@/lib/get-business';
import {
  addDaysIso,
  draftInvoiceFromDescription,
  matchClientByName,
} from '@/lib/ai/invoice-draft';
import Client from '@/models/Client';

const bodySchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, 'Description is too short. Add a bit more detail.')
    .max(2000, 'Description is too long (max 2000 characters).'),
});

export async function POST(req: NextRequest) {
  return withAuth(req, async (req, uid) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
          {
            error: {
              code: 'CONFIG_ERROR',
              message:
                'AI is not configured. Add GEMINI_API_KEY to your environment.',
              status: 503,
            },
          },
          { status: 503 },
        );
      }

      const json = await req.json();
      const parsed = bodySchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: parsed.error.issues[0]?.message ?? 'Invalid request.',
              status: 400,
            },
          },
          { status: 400 },
        );
      }

      await connectDB();

      const business = await getBusinessForUser(uid);
      if (!business) {
        return NextResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Business profile not found.',
              status: 404,
            },
          },
          { status: 404 },
        );
      }

      const clients = await Client.find({ businessId: business._id })
        .select('name isCorporate')
        .limit(100)
        .lean();

      const clientNames = clients.map((c) => c.name);
      const draft = await draftInvoiceFromDescription(
        parsed.data.description,
        clientNames,
      );

      const matched = matchClientByName(draft.clientName, clients);
      const issueDate = new Date().toISOString().split('T')[0];
      const dueDate =
        typeof draft.dueDays === 'number'
          ? addDaysIso(issueDate, draft.dueDays)
          : null;

      return NextResponse.json({
        data: {
          clientId: matched ? matched._id.toString() : null,
          clientName: draft.clientName ?? null,
          clientMatched: Boolean(matched),
          isCorporate: matched ? Boolean(matched.isCorporate) : false,
          issueDate,
          dueDate,
          currency: draft.currency,
          gstType: draft.gstType,
          gstRate: draft.gstRate,
          whtApplicable: draft.whtApplicable,
          whtRate: draft.whtRate,
          notes: draft.notes ?? '',
          items: draft.items.map((item, i) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            sortOrder: i,
          })),
        },
      });
    } catch (err) {
      console.error('[POST /api/ai/invoice-draft]', err);
      const message =
        err instanceof Error ? err.message : 'Failed to generate invoice draft.';

      const isConfig = message.includes('GEMINI_API_KEY');
      const isQuota =
        /quota|rate limit|resource exhausted/i.test(message) ||
        message.includes('429');

      return NextResponse.json(
        {
          error: {
            code: isConfig
              ? 'CONFIG_ERROR'
              : isQuota
                ? 'RATE_LIMITED'
                : 'AI_ERROR',
            message: isQuota
              ? 'AI free tier limit reached. Try again later or fill the form manually.'
              : message,
            status: isConfig ? 503 : isQuota ? 429 : 502,
          },
        },
        { status: isConfig ? 503 : isQuota ? 429 : 502 },
      );
    }
  });
}
