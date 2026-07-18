"use client";

import StatsCard from "../StatsCard";
import type { DashboardStats } from "@/types";
import theme from "@/styles/theme";

// ─── Types ─────────────────────────────────────────────────────────────────

interface StatsRowProps {
  stats: DashboardStats;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function StatsRow({ stats }: StatsRowProps) {
  const containerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: theme.spacing[6],
    marginBottom: theme.spacing[8],
  };

  const sub = `draft: ${stats.byStatus.draft}  ·  sent: ${stats.byStatus.sent}  ·  paid: ${stats.byStatus.paid}`;

  return (
    <div className="dashboard-stats-row" style={containerStyle}>
      <StatsCard
        label="Total Invoices"
        value={stats.totalInvoices}
        currency=""
        sub={sub}
        href="/invoices"
        delay={0}
      />

      <StatsCard
        label="Revenue This Month"
        value={stats.revenueThisMonth}
        currency={stats.revenueCurrency}
        sub={stats.revenueCurrency}
        valueColor={theme.colors.success[600]}
        delay={0.1}
      />

      <StatsCard
        label="Outstanding"
        value={stats.outstandingAmount}
        currency={stats.revenueCurrency}
        sub="unpaid sent invoices"
        valueColor={theme.colors.warning[600]}
        delay={0.2}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Renders the dashboard's primary statistics section using a responsive
//   three-column grid layout.
// • Displays key business metrics including total invoices, monthly revenue,
//   and outstanding invoice amounts.
// • Combines invoice status counts (draft, sent, and paid) into a concise
//   summary displayed beneath the Total Invoices card.
// • Passes revenue currency information to financial statistic cards for
//   consistent localized formatting.
// • Applies semantic color coding to financial values, highlighting revenue in
//   the success color and outstanding balances in the warning color.
// • Uses staggered animation delays to create a smooth sequential appearance
//   of statistic cards during page load.
// • Enables quick navigation to the invoices page by making the Total Invoices
//   card clickable.
// • Relies on the reusable StatsCard component and centralized theme system to
//   maintain consistent styling, formatting, and behavior across the dashboard.
// ─────────────────────────────────────────────────────────────────────────────
