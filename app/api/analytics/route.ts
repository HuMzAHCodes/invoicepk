// app/api/analytics/route.ts
// GET /api/analytics
// Scopes all aggregates by the authenticated user's business.
// Fetches monthly trends, top clients, tax summaries, and pipeline statuses in parallel.

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { getBusinessForUser } from "@/lib/get-business";
import Invoice from "@/models/Invoice";

export async function GET(req: NextRequest) {
  console.log("[GET /api/analytics] Fetching business analytics data...");

  return withAuth(req, async (req, uid) => {
    try {
      await connectDB();

      // Retrieve business linked to Firebase UID
      const business = await getBusinessForUser(uid);
      if (!business) {
        return NextResponse.json(
          {
            error: {
              code: "NOT_FOUND",
              message: "Business profile not found.",
              status: 404,
            },
          },
          { status: 404 }
        );
      }

      const businessId = business._id;

      // Calculate monthly trend start boundary (last 6 months, starting from 1st of month)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      // Run aggregations in parallel using Promise.all
      const [monthlyTrendRaw, clientBillingRaw, taxBreakdownRaw, pipelineStatusRaw] =
        await Promise.all([
          // 1. Monthly billings & receipts (last 6 months)
          Invoice.aggregate([
            {
              $match: {
                businessId,
                status: { $ne: "draft" },
                issueDate: { $gte: sixMonthsAgo },
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$issueDate" },
                  month: { $month: "$issueDate" },
                },
                billed: { $sum: "$netPayable" },
                paid: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "paid"] }, "$netPayable", 0],
                  },
                },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ]),

          // 2. Client billings (top 5 by net billing)
          Invoice.aggregate([
            {
              $match: {
                businessId,
                status: { $ne: "draft" },
              },
            },
            {
              $group: {
                _id: "$clientId",
                billed: { $sum: "$netPayable" },
                paid: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "paid"] }, "$netPayable", 0],
                  },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { billed: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "clients",
                localField: "_id",
                foreignField: "_id",
                as: "clientInfo",
              },
            },
            { $unwind: { path: "$clientInfo", preserveNullAndEmptyArrays: true } },
          ]),

          // 3. Tax tracking summary (GST vs WHT total collections)
          Invoice.aggregate([
            {
              $match: {
                businessId,
                status: { $ne: "draft" },
              },
            },
            {
              $group: {
                _id: null,
                gst: { $sum: "$gstAmount" },
                wht: { $sum: "$whtAmount" },
              },
            },
          ]),

          // 4. Invoice pipeline by status (draft, sent, paid sums)
          Invoice.aggregate([
            {
              $match: {
                businessId,
              },
            },
            {
              $group: {
                _id: "$status",
                amount: { $sum: "$netPayable" },
                count: { $sum: 1 },
              },
            },
          ]),
        ]);

      // ─── Format monthly trend to fill in empty months ─────────────────────
      const monthlyTrend = [];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const y = d.getFullYear();
        const m = d.getMonth() + 1; // 1-indexed for comparison

        // Find match in aggregation output
        const match = monthlyTrendRaw.find(
          (item: any) => item._id.year === y && item._id.month === m
        );

        monthlyTrend.push({
          name: `${monthNames[m - 1]} ${y.toString().slice(-2)}`,
          billed: match ? match.billed : 0,
          paid: match ? match.paid : 0,
        });
      }

      // ─── Format Client Billing ─────────────────────────────────────────────
      const clientBilling = clientBillingRaw.map((item: any) => ({
        name: item.clientInfo?.name ?? "Deleted Client",
        billed: item.billed,
        paid: item.paid,
        count: item.count,
      }));

      // ─── Format Tax Summary ────────────────────────────────────────────────
      const taxes = {
        gst: taxBreakdownRaw[0]?.gst ?? 0,
        wht: taxBreakdownRaw[0]?.wht ?? 0,
      };

      // ─── Format Pipeline breakdown ────────────────────────────────────────
      const pipelineBreakdown = {
        draft: { count: 0, amount: 0 },
        sent: { count: 0, amount: 0 },
        paid: { count: 0, amount: 0 },
      };

      pipelineStatusRaw.forEach((item: any) => {
        const status = item._id as "draft" | "sent" | "paid";
        if (pipelineBreakdown[status]) {
          pipelineBreakdown[status] = {
            count: item.count,
            amount: item.amount,
          };
        }
      });

      console.log(`[GET /api/analytics] Success | Compiled analytics for business ${businessId}`);

      return NextResponse.json({
        data: {
          currency: business.currency,
          monthlyTrend,
          clientBilling,
          taxes,
          pipelineBreakdown,
        },
      });

    } catch (err: unknown) {
      console.error("[GET /api/analytics] ERROR:", err);
      return NextResponse.json(
        {
          error: {
            code: "SERVER_ERROR",
            message: "Failed to load business analytics data.",
            status: 500,
          },
        },
        { status: 500 }
      );
    }
  });
}
