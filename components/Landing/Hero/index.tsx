"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import theme from "@/styles/theme";
import InvoiceCard from "./InvoiceCard";

// ─── Helpers ───

// Animate a number counting up
function useCountUp(target: number, duration: number, delay: number) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        setCount(Math.floor(progress * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);

  return count;
}

// Format number as PKR currency
function formatPKR(n: number): string {
  return n.toLocaleString("en-PK");
}

// ─── Styles ───

// Section wrapper
const section: React.CSSProperties = {
  backgroundColor: theme.colors.white,
  padding: `${theme.spacing[16]} ${theme.spacing[4]}`,
  overflow: "hidden",
};

// Inner container
const container: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[12],
};

// Left text column
const left: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

// Right visual column
const right: React.CSSProperties = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  minWidth: 0,
};

// Main headline
const headline: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: "3.75rem",
  fontWeight: theme.fontWeights.black,
  color: theme.colors.neutral[900],
  lineHeight: 1.1,
  marginBottom: theme.spacing[5],
};

// Subheadline
const subheadline: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.lg,
  color: theme.colors.neutral[600],
  lineHeight: 1.6,
  maxWidth: "480px",
  marginBottom: theme.spacing[6],
};

// CTA buttons row
const ctaRow: React.CSSProperties = {
  display: "flex",
  gap: theme.spacing[3],
  marginBottom: theme.spacing[5],
};

// Primary CTA button
const ctaPrimary: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.base,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.white,
  backgroundColor: theme.colors.primary[600],
  padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
  borderRadius: theme.radius.md,
  border: "none",
  cursor: "pointer",
  transition: theme.transitions.fast,
  textDecoration: "none",
};

// Secondary CTA button
const ctaSecondary: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.base,
  fontWeight: theme.fontWeights.medium,
  color: theme.colors.primary[600],
  backgroundColor: "transparent",
  padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.primary[600]}`,
  cursor: "pointer",
  transition: theme.transitions.fast,
  textDecoration: "none",
};

// Trust line container
const trustLine: React.CSSProperties = {
  display: "flex",
  gap: theme.spacing[4],
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[400],
  marginBottom: theme.spacing[6],
};

// Number counter section
const counterSection: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: theme.fontSizes["2xl"],
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.primary[600],
};

// Counter label
const counterLabel: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.xs,
  fontWeight: theme.fontWeights.regular,
  color: theme.colors.neutral[400],
  marginTop: theme.spacing[1],
};

// ─── Responsive CSS ───
const responsiveCSS = `
  @media (max-width: 1024px) {
    .hero-container { flex-direction: column !important; text-align: center; }
    .hero-headline { font-size: 2.25rem !important; }
    .hero-sub { margin-left: auto; margin-right: auto; }
    .hero-cta { justify-content: center; }
    .hero-trust { justify-content: center; }
    .hero-right { margin-top: 2rem; }
  }
  @media (max-width: 480px) {
    .hero-headline { font-size: 1.875rem !important; }
  }
`;

// ─── Component ───
export default function Hero() {
  const invoiced = useCountUp(24000000, 2000, 500);

  return (
    <>
      <style>{responsiveCSS}</style>
      <section style={section}>
        <div className="hero-container" style={container}>
          <div className="hero-left" style={left}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="hero-headline" style={headline}>
                Generate GST invoices
                <br />
                in 2 minutes.
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p className="hero-sub" style={subheadline}>
                FBR-compliant invoices with auto GST, WHT, and NTN/STRN for
                Pakistani freelancers and agencies. Free forever.
              </p>
            </motion.div>

            <motion.div
              className="hero-cta"
              style={ctaRow}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                href="/login"
                style={ctaPrimary}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                Start for free
              </Link>
              <a href="#how-it-works" style={ctaSecondary}>
                See how it works
              </a>
            </motion.div>

            <motion.div
              className="hero-trust"
              style={trustLine}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span>✓ Free forever</span>
              <span>✓ No credit card</span>
              <span>✓ FBR-compliant</span>
            </motion.div>

            <motion.div
              style={counterSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              PKR {formatPKR(invoiced)}+
              <div style={counterLabel}>invoiced by freelancers</div>
            </motion.div>
          </div>

          <div className="hero-right" style={right}>
            <InvoiceCard />
          </div>
        </div>
      </section>
    </>
  );
}
