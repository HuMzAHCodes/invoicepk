'use client';

import theme from '@/styles/theme';

// ─── Component ─────────────────────────────────────────────────────────────

export default function InvoiceSkeleton() {
  const rows = [0, 1, 2, 3, 4];

  return (
    <>
      <style>{`
        @keyframes invoice-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 768px) {
          .invoices-table-scroll { overflow-x: auto; }
        }
      `}</style>

      <div>
        {/* Header skeleton */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: theme.spacing[6],
          }}
        >
          <div
            style={{
              width: '140px',
              height: '30px',
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.neutral[200],
              animation: 'invoice-pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '120px',
              height: '36px',
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.neutral[200],
              animation: 'invoice-pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>

        {/* Filters skeleton */}
        <div
          style={{
            display: 'flex',
            gap: theme.spacing[3],
            marginBottom: theme.spacing[6],
          }}
        >
          <div
            style={{
              width: '240px',
              height: '36px',
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.neutral[200],
              animation: 'invoice-pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '150px',
              height: '36px',
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.neutral[200],
              animation: 'invoice-pulse 1.5s ease-in-out infinite',
              animationDelay: '0.1s',
            }}
          />
          <div
            style={{
              width: '150px',
              height: '36px',
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.neutral[200],
              animation: 'invoice-pulse 1.5s ease-in-out infinite',
              animationDelay: '0.2s',
            }}
          />
        </div>

        {/* Table skeleton */}
        <div
          style={{
            backgroundColor: theme.colors.white,
            border: `1px solid ${theme.colors.neutral[200]}`,
            borderRadius: theme.radius.lg,
            overflow: 'hidden',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 100px 120px 120px 120px 80px',
              gap: theme.spacing[4],
              padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
              backgroundColor: theme.colors.neutral[50],
              borderBottom: `1px solid ${theme.colors.neutral[200]}`,
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  height: '14px',
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors.neutral[200],
                  animation: 'invoice-pulse 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          {/* Data rows */}
          {rows.map((i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 100px 120px 120px 120px 80px',
                gap: theme.spacing[4],
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                borderBottom:
                  i < 4 ? `1px solid ${theme.colors.neutral[200]}` : 'none',
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((j) => (
                <div
                  key={j}
                  style={{
                    height: '14px',
                    borderRadius: theme.radius.sm,
                    backgroundColor: theme.colors.neutral[200],
                    animation: 'invoice-pulse 1.5s ease-in-out infinite',
                    animationDelay: `${(i * 7 + j) * 0.02}s`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}