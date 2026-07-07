"use client";

import theme from "@/styles/theme";

// ─── Component ─────────────────────────────────────────────────────────────

export default function SkeletonLoader() {
  return (
    <>
      <style>{`
        @keyframes dashboard-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 768px) {
          .dashboard-stats-row { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .dashboard-stats-row { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <div>
        {/* Header skeleton */}
        <div style={{ marginBottom: theme.spacing[8] }}>
          <div
            style={{
              width: "180px",
              height: "30px",
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.neutral[200],
              marginBottom: theme.spacing[2],
              animation: "dashboard-pulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              width: "220px",
              height: "16px",
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.neutral[200],
              animation: "dashboard-pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* Stats skeleton */}
        <div
          className="dashboard-stats-row"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: theme.spacing[6],
            marginBottom: theme.spacing[8],
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: theme.colors.white,
                border: `1px solid ${theme.colors.neutral[200]}`,
                borderRadius: theme.radius.lg,
                padding: theme.spacing[6],
                animation: "dashboard-pulse 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            >
              <div
                style={{
                  width: "100px",
                  height: "14px",
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors.neutral[200],
                  marginBottom: theme.spacing[3],
                }}
              />
              <div
                style={{
                  width: "80px",
                  height: "28px",
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors.neutral[200],
                  marginBottom: theme.spacing[2],
                }}
              />
              <div
                style={{
                  width: "120px",
                  height: "12px",
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors.neutral[200],
                }}
              />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: theme.spacing[4],
          }}
        >
          <div
            style={{
              width: "140px",
              height: "20px",
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.neutral[200],
              animation: "dashboard-pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
        <div
          style={{
            backgroundColor: theme.colors.white,
            border: `1px solid ${theme.colors.neutral[200]}`,
            borderRadius: theme.radius.lg,
            padding: theme.spacing[4],
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: theme.spacing[4],
                padding: `${theme.spacing[3]} 0`,
                borderBottom:
                  i < 4 ? `1px solid ${theme.colors.neutral[200]}` : "none",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "14px",
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors.neutral[200],
                  animation: "dashboard-pulse 1.5s ease-in-out infinite",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: "14px",
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors.neutral[200],
                  animation: "dashboard-pulse 1.5s ease-in-out infinite",
                  animationDelay: `${i * 0.1 + 0.05}s`,
                }}
              />
              <div
                style={{
                  width: "70px",
                  height: "14px",
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors.neutral[200],
                  animation: "dashboard-pulse 1.5s ease-in-out infinite",
                  animationDelay: `${i * 0.1 + 0.1}s`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Renders a skeleton loading interface that mirrors the dashboard layout
//   while dashboard data is being fetched.
// • Displays animated placeholder elements for the dashboard header, statistics
//   cards, and recent invoices table to improve perceived loading performance.
// • Uses a custom pulse animation to provide smooth visual feedback during
//   loading without relying on external libraries.
// • Includes responsive grid behavior so skeleton statistic cards match the
//   actual dashboard layout across mobile, tablet, and desktop screen sizes.
// • Simulates multiple statistic cards and table rows to maintain layout
//   stability and prevent content shifting when real data loads.
// • Applies staggered animation delays across placeholders to create a more
//   natural and polished loading experience.
// • Uses the centralized theme configuration for consistent colors, spacing,
//   borders, border radius, and overall visual appearance.
// • Improves user experience by reducing perceived wait times and minimizing
//   layout shifts while asynchronous dashboard content is loading.
// ─────────────────────────────────────────────────────────────────────────────
