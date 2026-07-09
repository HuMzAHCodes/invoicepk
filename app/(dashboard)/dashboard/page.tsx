"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api-client";
import Dashboard from "@/components/Dashboard";
import type { DashboardStats } from "@/types";

// ─── Types ─────────────────────────────────────────────────────────────────

interface RecentInvoice {
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

interface InvoicesResponse {
  invoices: RecentInvoice[];
  total: number;
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [invoices, setInvoices] = useState<RecentInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, invoicesData] = await Promise.all([
        apiGet<DashboardStats>("/dashboard/stats"),
        apiGet<InvoicesResponse>("/invoices?limit=5"),
      ]);

      setStats(statsData);
      setInvoices(invoicesData.invoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Dashboard
      stats={stats}
      invoices={invoices}
      loading={loading}
      error={error}
      onRetry={fetchData}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Serves as the main entry point for the Dashboard page.
// • Fetches dashboard statistics and the five most recent invoices from the
//   backend API in parallel for faster page loading.
// • Maintains local state for dashboard data, recent invoices, loading status,
//   and API error messages.
// • Automatically loads dashboard data when the page is mounted.
// • Handles request failures gracefully by storing and exposing user-friendly
//   error messages.
// • Exposes a reusable retry function that allows failed API requests to be
//   executed again without refreshing the page.
// • Passes all fetched data and UI state to the Dashboard component, keeping
//   data fetching logic separate from presentation.
// • Uses the shared API client to ensure consistent communication with secured
//   backend endpoints.
// ─────────────────────────────────────────────────────────────────────────────
