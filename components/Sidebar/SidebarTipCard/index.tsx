"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { apiGet } from "@/lib/api-client";
import { getNextGstDeadline, formatPKR, formatUSD } from "@/lib/gst";
import theme from "@/styles/theme";
import type { DashboardStats } from "@/types";

// ─── Static tax tips — InvoicePK-specific, swap/add freely, keep each under ~90 chars ──

const STATIC_TIPS: string[] = [
  "Zero-rated IT exports still need a valid invoice reference number.",
  "Keep invoice records for at least 6 years for FBR audit purposes.",
  "WHT applies even on services billed to unregistered clients.",
  "Your STRN must appear on every GST invoice, not just the NTN.",
  "Freelancers exporting IT services file GST returns at 0%, not exempt.",
];

const TIP_INTERVAL_MS = 6000;
const GST_DEADLINE_WARNING_DAYS = 10;

// ─── Blob travels between these two corners; direction flips on every tip change ──

const BLOB_POS_TOP_LEFT = { left: -24, top: -28 };
const BLOB_POS_BOTTOM_RIGHT = { left: 190, top: 40 };

interface Tip {
  text: string;
  href?: string;
  urgent?: boolean;
}

function buildInsightTips(stats: DashboardStats): Tip[] {
  const tips: Tip[] = [];
  const format = stats.revenueCurrency === "USD" ? formatUSD : formatPKR;

  if (stats.overdueCount > 0) {
    tips.push({
      text: `${stats.overdueCount} invoice${stats.overdueCount === 1 ? "" : "s"} overdue — ${format(stats.overdueAmount)} outstanding.`,
      href: "/invoices?status=overdue",
      urgent: true,
    });
  }

  const remaining = Math.max(0, stats.freeTierLimit - stats.monthlyInvoiceCount);
  tips.push({
    text: `${remaining} of ${stats.freeTierLimit} free invoices left this month.`,
    href: "/invoices/new",
  });

  const deadline = getNextGstDeadline();
  const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / 86_400_000);
  if (daysUntil >= 0 && daysUntil <= GST_DEADLINE_WARNING_DAYS) {
    tips.push({
      text: `GST return due in ${daysUntil} day${daysUntil === 1 ? "" : "s"} (${deadline.toLocaleDateString("en-PK", { day: "numeric", month: "short" })}).`,
      urgent: daysUntil <= 3,
    });
  }

  return tips;
}

export default function SidebarTipCard() {
  const blobRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLParagraphElement>(null);
  const [tipIndex, setTipIndex] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const goingToBottomRight = useRef(true); // ─ tracks current travel direction

  // ─── Fetch live insights once — non-critical, fail silently ──────────────
  useEffect(() => {
    apiGet<DashboardStats>("/dashboard/stats")
      .then(setStats)
      .catch(() => {});
  }, []);

  const insightTips = stats ? buildInsightTips(stats) : [];
  const tips: Tip[] = insightTips.length > 0
    ? [...insightTips, ...STATIC_TIPS.map((text) => ({ text }))]
    : STATIC_TIPS.map((text) => ({ text }));
  const currentTip = tips[tipIndex % tips.length];

  // ─── Tip rotation + synced blob direction-swap loop ───────────────────────
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const interval = setInterval(() => {
      // Blob: reverse direction, travel to the opposite corner
      if (blobRef.current && !prefersReducedMotion) {
        const target = goingToBottomRight.current
          ? BLOB_POS_BOTTOM_RIGHT
          : BLOB_POS_TOP_LEFT;
        gsap.to(blobRef.current, {
          left: target.left,
          top: target.top,
          duration: 3,
          ease: "power2.inOut",
        });
        goingToBottomRight.current = !goingToBottomRight.current;
      }

      // Tip text: fade out, swap, fade in
      if (!tipRef.current) {
        setTipIndex((i) => i + 1);
        return;
      }
      gsap.to(tipRef.current, {
        opacity: 0,
        y: -6,
        duration: 0.3,
        ease: "power1.in",
        onComplete: () => {
          setTipIndex((i) => i + 1);
          gsap.fromTo(
            tipRef.current,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.35, ease: "power1.out" }
          );
        },
      });
    }, TIP_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const labelColor = currentTip.urgent
    ? theme.status.overdue.text
    : theme.colors.primary[600];

  const tipParagraph = (
    <p
      ref={tipRef}
      className="mt-1.5 text-sm leading-snug"
      style={{ fontFamily: theme.fonts.body, color: theme.colors.neutral[900] }}
    >
      {currentTip.text}
    </p>
  );

  return (
    <div
      className="relative mt-auto mx-3 mb-4 overflow-hidden rounded-2xl border border-[var(--primary-600)]/15"
      style={{ backgroundColor: theme.colors.neutral[50] }}
    >
      {/* Ambient blob background */}
      <div
        ref={blobRef}
        className="pointer-events-none absolute h-28 w-28 rounded-full bg-[var(--primary-600)]/45 blur-xl"
        style={{ left: BLOB_POS_TOP_LEFT.left, top: BLOB_POS_TOP_LEFT.top }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 p-4">
        <span
          className="block text-[10px] font-medium uppercase tracking-wider"
          style={{ fontFamily: theme.fonts.mono, color: labelColor }}
        >
          {currentTip.href ? "Insight" : "Tax tip"}
        </span>
        {currentTip.href ? (
          <Link href={currentTip.href} className="block hover:underline">
            {tipParagraph}
          </Link>
        ) : (
          tipParagraph
        )}
      </div>
    </div>
  );
}
