// POST /api/ai/chat
// Answers natural-language questions about the authenticated business's invoices.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { getBusinessForUser } from '@/lib/get-business';
import {
  classifyChatIntent,
  formatChatAnswer,
  runChatTool,
} from '@/lib/ai/chat';

const bodySchema = z.object({
  message: z
    .string()
    .trim()
    .min(2, 'Message is too short.')
    .max(1000, 'Message is too long (max 1000 characters).'),
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

      const intent = await classifyChatIntent(parsed.data.message);
      const { tool, data } = await runChatTool(business._id, intent);
      const reply = await formatChatAnswer(parsed.data.message, tool, data);

      return NextResponse.json({
        data: {
          reply,
          tool,
        },
      });
    } catch (err) {
      console.error('[POST /api/ai/chat]', err);
      const message =
        err instanceof Error ? err.message : 'Failed to answer question.';

      const isConfig = message.includes('GEMINI_API_KEY');
      const isBusy =
        /high demand|unavailable|try again later|temporarily/i.test(message) ||
        message.includes('503');
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
                : isBusy
                  ? 'AI_BUSY'
                  : 'AI_ERROR',
            message: isConfig
              ? message
              : isQuota
                ? 'AI free tier limit reached. Try again later.'
                : isBusy
                  ? 'AI is busy right now (high demand). Please try again in a moment.'
                  : message,
            status: isConfig || isBusy ? 503 : isQuota ? 429 : 502,
          },
        },
        { status: isConfig || isBusy ? 503 : isQuota ? 429 : 502 },
      );
    }
  });
}
