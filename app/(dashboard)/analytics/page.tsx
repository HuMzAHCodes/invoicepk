// app/(dashboard)/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import PageHeader from "@/components/PageHeader";
import AnalyticsCharts from "@/components/Analytics/AnalyticsCharts";
import theme from "@/styles/theme";

// ─── Types ─────────────────────────────────────────────────────────────────

interface MonthlyData {
  name: string;
  billed: number;
  paid: number;
}

interface ClientData {
  name: string;
  billed: number;
  paid: number;
  count: number;
}

interface AnalyticsResponse {
  currency: string;
  monthlyTrend: MonthlyData[];
  clientBilling: ClientData[];
  taxes: { gst: number; wht: number };
  pipelineBreakdown: {
    draft: { count: number; amount: number };
    sent: { count: number; amount: number };
    paid: { count: number; amount: number };
  };
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiGet<AnalyticsResponse>("/analytics");
        setData(res);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load business analytics data."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  // ─── Styles ────────────────────────────────────────────────────────────

  const pageWrap: React.CSSProperties = {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[6],
    width: "100%",
  };

  const loadingWrap: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.base,
    color: theme.colors.neutral[400],
  };

  if (loading) {
    return <div style={loadingWrap}>Compiling financial summaries...</div>;
  }

  if (error) {
    return <div style={loadingWrap}>Error: {error}</div>;
  }

  if (!data) {
    return <div style={loadingWrap}>No invoicing history found to generate charts.</div>;
  }

  return (
    <div style={pageWrap}>
      <PageHeader
        title="Business Analytics"
        description="Monitor billings, client revenues, collections, and compliance tax credits."
      />
      <AnalyticsCharts
        currency={data.currency}
        monthlyTrend={data.monthlyTrend}
        clientBilling={data.clientBilling}
        taxes={data.taxes}
        pipelineBreakdown={data.pipelineBreakdown}
      />
    </div>
  );
}
