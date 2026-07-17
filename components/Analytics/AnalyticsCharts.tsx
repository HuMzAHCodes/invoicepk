// components/Analytics/AnalyticsCharts.tsx
"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
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

interface AnalyticsChartsProps {
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

export default function AnalyticsCharts({
  currency,
  monthlyTrend,
  clientBilling,
  taxes,
  pipelineBreakdown,
}: AnalyticsChartsProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent SSR layout/hydration warnings due to Recharts' ResizeObserver dependency
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div style={skeletonContainerGrid}>
        <div style={skeletonCard}>Loading charts...</div>
        <div style={skeletonCard}>Loading charts...</div>
        <div style={skeletonCard}>Loading charts...</div>
        <div style={skeletonCard}>Loading charts...</div>
      </div>
    );
  }

  // Formatting currency helper
  const formatValue = (value: number) => {
    return `${currency} ${value.toLocaleString("en-PK", {
      maximumFractionDigits: 0,
    })}`;
  };

  // 1. Data for Donut Chart (Pipeline)
  const pipelineData = [
    { name: "Paid", value: pipelineBreakdown.paid.amount, color: "var(--success-400)" },
    { name: "Outstanding", value: pipelineBreakdown.sent.amount, color: "var(--warning-400)" },
    { name: "Draft", value: pipelineBreakdown.draft.amount, color: "var(--neutral-400)" },
  ].filter((item) => item.value > 0); // Only render slices with values

  // 2. Data for Tax Bar Chart
  const taxData = [
    { name: "GST (Sales Tax)", amount: taxes.gst, color: "var(--primary-400)" },
    { name: "WHT (Withheld)", amount: taxes.wht, color: "var(--accent-400)" },
  ];

  // ─── Styles ────────────────────────────────────────────────────────────

  const chartCard: React.CSSProperties = {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.neutral[200]}`,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[5],
    boxShadow: theme.shadows.sm,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[4],
  };

  const chartTitle: React.CSSProperties = {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.neutral[900],
    margin: 0,
  };

  const chartDescription: React.CSSProperties = {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.neutral[400],
    marginTop: `-${theme.spacing[3]}`,
    marginBottom: theme.spacing[1],
  };

  const donutLegendContainer: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    gap: theme.spacing[5],
    flexWrap: "wrap",
    marginTop: theme.spacing[2],
  };

  const legendItem: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.neutral[600],
  };

  const legendDot = (color: string): React.CSSProperties => ({
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: color,
  });

  const textStyle = {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    fill: "var(--neutral-600)",
  };

  const tooltipStyle: React.CSSProperties = {
    backgroundColor: "var(--white)",
    border: "1px solid var(--neutral-200)",
    borderRadius: theme.radius.md,
    padding: "8px 12px",
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.xs,
    boxShadow: theme.shadows.md,
    color: "var(--neutral-900)",
  };

  // Custom tooltips to keep the ledger aesthetic premium
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={tooltipStyle}>
          <div style={{ fontWeight: 600, marginBottom: "4px" }}>{label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ color: entry.color || entry.fill, display: "flex", gap: "8px", justifyContent: "space-between" }}>
              <span>{entry.name}:</span>
              <span style={{ fontFamily: theme.fonts.mono, fontWeight: 500 }}>{formatValue(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const ClientTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={tooltipStyle}>
          <div style={{ fontWeight: 600, marginBottom: "4px" }}>{data.name}</div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", color: "var(--primary-600)" }}>
            <span>Total Invoiced:</span>
            <span style={{ fontFamily: theme.fonts.mono }}>{formatValue(data.billed)}</span>
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", color: "var(--success-600)" }}>
            <span>Total Collected:</span>
            <span style={{ fontFamily: theme.fonts.mono }}>{formatValue(data.paid)}</span>
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", fontSize: "11px", color: "var(--neutral-400)", borderTop: "1px solid var(--neutral-200)", marginTop: "4px", paddingTop: "4px" }}>
            <span>Invoices Count:</span>
            <span>{data.count}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={containerGrid}>
      {/* Chart 1: Revenue Monthly Trend (Line / Area) */}
      <div style={{ ...chartCard, gridColumn: "span 2" }}>
        <h3 style={chartTitle}>Monthly Billings vs. Collections</h3>
        <p style={chartDescription}>Track invoice volume against cash actually received (past 6 months)</p>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary-600)" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="var(--primary-600)" stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success-600)" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="var(--success-600)" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" />
              <XAxis dataKey="name" tick={textStyle} stroke="var(--neutral-200)" />
              <YAxis tick={textStyle} stroke="var(--neutral-200)" tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontFamily: theme.fonts.body, fontSize: 12, paddingTop: 10 }} />
              <Area name="Billed Amount" type="monotone" dataKey="billed" stroke="var(--primary-600)" strokeWidth={2} fillOpacity={1} fill="url(#colorBilled)" />
              <Area name="Collected Amount" type="monotone" dataKey="paid" stroke="var(--success-600)" strokeWidth={2} fillOpacity={1} fill="url(#colorPaid)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Invoice Pipeline Breakdown (Donut) */}
      <div style={chartCard}>
        <h3 style={chartTitle}>Invoice Status Share</h3>
        <p style={chartDescription}>Billing distribution by current invoice statuses</p>
        <div style={{ width: "100%", height: 260, position: "relative" }}>
          {pipelineData.length === 0 ? (
            <div style={noDataContainer}>No invoicing data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatValue(Number(value || 0))} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div style={donutLegendContainer}>
          {pipelineData.map((item, idx) => (
            <div key={idx} style={legendItem}>
              <div style={legendDot(item.color)} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 3: Client Revenues (Horizontal or Column Bar Chart) */}
      <div style={chartCard}>
        <h3 style={chartTitle}>Top 5 Clients by Revenue</h3>
        <p style={chartDescription}>Which accounts generated the most billings</p>
        <div style={{ width: "100%", height: 300 }}>
          {clientBilling.length === 0 ? (
            <div style={noDataContainer}>No client billing history found.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientBilling} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" horizontal={false} />
                <XAxis type="number" tick={textStyle} stroke="var(--neutral-200)" tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <YAxis dataKey="name" type="category" tick={textStyle} stroke="var(--neutral-200)" width={90} />
                <Tooltip content={<ClientTooltip />} />
                <Bar name="Total Billed" dataKey="billed" fill="var(--primary-400)" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 4: GST vs WHT (Tax Audits) */}
      <div style={chartCard}>
        <h3 style={chartTitle}>Sales Tax vs. Withholding Tax</h3>
        <p style={chartDescription}>GST collected (receivable liability) vs WHT withheld by clients</p>
        <div style={{ width: "100%", height: 300 }}>
          {taxes.gst === 0 && taxes.wht === 0 ? (
            <div style={noDataContainer}>No tax records found.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taxData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" vertical={false} />
                <XAxis dataKey="name" tick={textStyle} stroke="var(--neutral-200)" />
                <YAxis tick={textStyle} stroke="var(--neutral-200)" tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip formatter={(value: any) => formatValue(Number(value || 0))} />
                <Bar name="Tax Amount" dataKey="amount" radius={[4, 4, 0, 0]} barSize={40}>
                  {taxData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Styles CSS Objects ──────────────────────────────────────────────────────

const containerGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
  gap: "24px",
  width: "100%",
};

const skeletonContainerGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
  gap: "24px",
  width: "100%",
};

const skeletonCard: React.CSSProperties = {
  minHeight: "350px",
  backgroundColor: "var(--white)",
  border: "1px solid var(--neutral-200)",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--neutral-400)",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
};

const noDataContainer: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  color: "var(--neutral-400)",
  fontFamily: "var(--font-body)",
  fontSize: "13px",
  border: "1px dashed var(--neutral-200)",
  borderRadius: "8px",
};
