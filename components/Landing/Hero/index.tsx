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

// Dark gradient background wrapper
const section: React.CSSProperties = {
  position: "relative",
  padding: `${theme.spacing[16]} ${theme.spacing[4]}`,
  overflow: "hidden",
  background: `linear-gradient(160deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[900]} 100%)`,
};

// Whitish glow — top-left corner
const glowTopLeft: React.CSSProperties = {
  position: "absolute",
  top: "-60px",
  left: "-60px",
  width: "300px",
  height: "300px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
  pointerEvents: "none",
};

// Whitish glow — bottom-right corner
const glowBottomRight: React.CSSProperties = {
  position: "absolute",
  bottom: "-40px",
  right: "-40px",
  width: "250px",
  height: "250px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
  pointerEvents: "none",
};

// Inner container
const container: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[12],
  position: "relative",
  zIndex: 1,
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

// Main headline — white text
const headline: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: "3.75rem",
  fontWeight: theme.fontWeights.black,
  color: theme.colors.white,
  lineHeight: 1.1,
  marginBottom: theme.spacing[5],
};

// Highlight — light green tint for "2 minutes"
const highlight: React.CSSProperties = {
  color: theme.colors.primary[50],
};

// Subheadline — cream/off-white on dark bg
const subheadline: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.lg,
  color: theme.colors.neutral[100],
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

// Primary CTA — dark bg, white text
const ctaPrimary: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.base,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.white,
  backgroundColor: theme.colors.primary[900],
  padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
  borderRadius: theme.radius.md,
  border: "none",
  cursor: "pointer",
  transition: theme.transitions.fast,
  textDecoration: "none",
};

// Secondary CTA — transparent, ivory border
const ctaSecondary: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.base,
  fontWeight: theme.fontWeights.medium,
  color: theme.colors.neutral[50],
  backgroundColor: "transparent",
  padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.neutral[100]}`,
  cursor: "pointer",
  transition: theme.transitions.fast,
  textDecoration: "none",
};

// Number counter — accent gold
const counterSection: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: theme.fontSizes["2xl"],
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.accent[400],
};

// Counter label — cream
const counterLabel: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.xs,
  fontWeight: theme.fontWeights.regular,
  color: theme.colors.neutral[100],
  marginTop: theme.spacing[1],
};

// ─── Responsive CSS ───
const responsiveCSS = `
  @media (max-width: 1024px) {
    .hero-container { flex-direction: column !important; text-align: center; }
    .hero-headline { font-size: 2.25rem !important; }
    .hero-sub { margin-left: auto; margin-right: auto; }
    .hero-cta { justify-content: center; }
    .hero-right { margin-top: 2rem; transform: scale(0.85); }
  }
  @media (max-width: 480px) {
    .hero-headline { font-size: 1.875rem !important; }
    .hero-right { display: none !important; }
  }
`;

// ─── Component ───
export default function Hero() {
  const invoiced = useCountUp(24000000, 2000, 500);

  return (
    <>
      <style>{responsiveCSS}</style>
      <section style={section}>
        {/* Corner glows */}
        <div style={glowTopLeft} />
        <div style={glowBottomRight} />

        <div className="hero-container" style={container}>
          <div className="hero-left" style={left}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="hero-headline" style={headline}>
                Generate GST invoices
                <br />
                in <span style={highlight}>2 minutes.</span>
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
                  e.currentTarget.style.opacity = "0.85";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Start for free
              </Link>
              <a
                href="#how-it-works"
                style={ctaSecondary}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                See how it works
              </a>
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
