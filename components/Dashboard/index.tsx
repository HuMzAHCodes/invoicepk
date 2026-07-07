"use client";

import { useAuth } from "@/lib/auth-context";
import DashboardHeader from "../DashboardHeader";
import StatsRow from "../StatsRow";
import RecentInvoicesTable from "../RecentInvoicesTable";
import SkeletonLoader from "../SkeletonLoader";
import type { DashboardStats } from "@/types";
import theme from "@/styles/theme";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: { id: string; name: string } | null;
  status: "draft" | "sent" | "paid";
  total: number;
  netPayable: number;
  currency: string;
  issueDate: string;
  dueDate: string | null;
}

interface DashboardAssemblerProps {
  stats: DashboardStats | null;
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function Dashboard({
  stats,
  invoices,
  loading,
  error,
  onRetry,
}: DashboardAssemblerProps) {
  const { user } = useAuth();

  const firstName =
    user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";

  // ─── Responsive CSS ────────────────────────────────────────────────────

  const responsiveCSS = `
    @media (max-width: 768px) {
      .dashboard-stats-row { grid-template-columns: 1fr !important; }
      .dashboard-table-scroll { overflow-x: auto; }
    }
    @media (min-width: 769px) and (max-width: 1024px) {
      .dashboard-stats-row { grid-template-columns: repeat(2, 1fr) !important; }
    }
  `;

  // ─── Styles ────────────────────────────────────────────────────────────

  const errorBoxStyle: React.CSSProperties = {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.danger[50],
    color: theme.colors.danger[600],
    borderRadius: theme.radius.md,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    marginBottom: theme.spacing[6],
  };

  const retryBtnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
    backgroundColor: theme.colors.neutral[600],
    color: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    borderRadius: theme.radius.md,
    border: "none",
    cursor: "pointer",
    transition: theme.transitions.fast,
  };

  // ─── Loading ───────────────────────────────────────────────────────────

  if (loading) return <SkeletonLoader />;

  // ─── Error ─────────────────────────────────────────────────────────────

  if (error) {
    return (
      <>
        <style>{responsiveCSS}</style>
        <div>
          <DashboardHeader firstName={firstName} />
          <div style={errorBoxStyle}>{error}</div>
          <button type="button" onClick={onRetry} style={retryBtnStyle}>
            Retry
          </button>
        </div>
      </>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <>
      <style>{responsiveCSS}</style>
      <div>
        <DashboardHeader firstName={firstName} />
        {stats && <StatsRow stats={stats} />}
        <RecentInvoicesTable invoices={invoices} />
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Acts as the main dashboard assembly component, coordinating all dashboard
//   sections into a single user interface.
// • Retrieves authenticated user information to generate a personalized welcome
//   message, with sensible fallbacks when profile details are unavailable.
// • Manages the dashboard's primary UI states, including loading, error, and
//   successful data rendering.
// • Displays a skeleton loading interface while dashboard statistics and recent
//   invoice data are being fetched.
// • Presents an error message with a retry action, allowing failed data
//   requests to be attempted again without leaving the page.
// • Renders the dashboard header, statistics overview, and recent invoices
//   table once data has been successfully loaded.
// • Injects responsive CSS rules to adapt the statistics grid and invoice table
//   layout across mobile, tablet, and desktop screen sizes.
// • Separates data orchestration from presentation by composing reusable
//   dashboard components into a cohesive dashboard experience.
// • Utilizes the centralized theme configuration to maintain consistent
//   typography, spacing, colors, buttons, and overall visual styling.
// ─────────────────────────────────────────────────────────────────────────────
