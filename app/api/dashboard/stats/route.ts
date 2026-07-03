// app/api/dashboard/stats/route.ts
// GET /api/dashboard/stats
// Returns summary statistics for the authenticated business:
// total invoices, breakdown by status, revenue this month, outstanding amount.

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { getBusinessForUser } from '@/lib/get-business';
import Invoice from '@/models/Invoice';

export async function GET(req: NextRequest) {
  console.log('[GET /api/dashboard/stats] Request received');

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

      const businessId = business._id;

      // Start of current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Run all aggregations in parallel
      const [statusCounts, revenueAgg, outstandingAgg] = await Promise.all([

        // Count invoices by status
        Invoice.aggregate([
          { $match: { businessId } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),

        // Revenue this month — sum of netPayable for paid invoices this month
        Invoice.aggregate([
          {
            $match: {
              businessId,
              status:    'paid',
              updatedAt: { $gte: startOfMonth },
            },
          },
          {
            $group: {
              _id:     null,
              revenue: { $sum: '$netPayable' },
            },
          },
        ]),

        // Outstanding amount — sum of total for sent invoices (unpaid)
        Invoice.aggregate([
          {
            $match: {
              businessId,
              status: 'sent',
            },
          },
          {
            $group: {
              _id:         null,
              outstanding: { $sum: '$total' },
            },
          },
        ]),

      ]);

      // Build status breakdown
      const byStatus = { draft: 0, sent: 0, paid: 0 };
      let totalInvoices = 0;

      statusCounts.forEach((item: any) => {
        if (item._id === 'draft') byStatus.draft = item.count;
        if (item._id === 'sent')  byStatus.sent  = item.count;
        if (item._id === 'paid')  byStatus.paid  = item.count;
        totalInvoices += item.count;
      });

      const revenueThisMonth  = revenueAgg[0]?.revenue     ?? 0;
      const outstandingAmount = outstandingAgg[0]?.outstanding ?? 0;

      console.log(`[GET /api/dashboard/stats] Success | total: ${totalInvoices} | status: 200`);

      return NextResponse.json({
        data: {
          totalInvoices,
          byStatus,
          revenueThisMonth,
          revenueCurrency:  business.currency,
          outstandingAmount,
        },
      });

    } catch (err) {
      console.error('[GET /api/dashboard/stats] ERROR:', err);
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

   feat(api): implement dashboard statistics endpoint

   - Added GET /api/dashboard/stats endpoint
   - Protected endpoint using withAuth middleware
   - Connected request handling to MongoDB

   ---------------------------------------------------------------------------

   feat(security): enforce business authentication

   - Retrieved authenticated business profile
   - Scoped dashboard statistics to the authenticated business
   - Returned HTTP 404 when business profile was not found

   ---------------------------------------------------------------------------

   feat(dashboard): implement invoice summary statistics

   - Calculated total invoice count
   - Generated invoice status breakdown
   - Included draft invoice count
   - Included sent invoice count
   - Included paid invoice count

   ---------------------------------------------------------------------------

   feat(dashboard): calculate monthly revenue

   - Calculated revenue for the current month
   - Included only paid invoices
   - Summed invoice net payable amounts
   - Returned revenue using the business currency

   ---------------------------------------------------------------------------

   feat(dashboard): calculate outstanding balances

   - Calculated outstanding invoice amount
   - Included only unpaid (sent) invoices
   - Summed invoice totals awaiting payment

   ---------------------------------------------------------------------------

   feat(performance): optimize dashboard queries

   - Used MongoDB aggregation pipelines
   - Executed independent queries in parallel
   - Reduced response latency using Promise.all()
   - Minimized database round trips

   ---------------------------------------------------------------------------

   feat(logging): improve endpoint observability

   - Logged incoming requests
   - Logged successful dashboard generation
   - Logged unexpected server errors

   ---------------------------------------------------------------------------

   feat(errors): implement standardized error handling

   - Returned structured NOT_FOUND responses
   - Returned standardized SERVER_ERROR responses
   - Wrapped database operations in try/catch blocks

============================================================================ */