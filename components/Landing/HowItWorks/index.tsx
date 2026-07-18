"use client";

import { motion } from "framer-motion";
import { FiMic, FiHash, FiDownload } from "react-icons/fi";
import theme from "@/styles/theme";
import { CursorZone } from "@/components/CustomCursor";

// ─── Styles ───

const section: React.CSSProperties = {
  backgroundColor: theme.colors.surface,
  padding: `${theme.spacing[16]} ${theme.spacing[4]}`,
};

const container: React.CSSProperties = {
  maxWidth: "1000px",
  margin: "0 auto",
  textAlign: "center",
};

const label: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.xs,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.primary[400],
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  marginBottom: theme.spacing[3],
};

const heading: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: "2.25rem",
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[900],
  lineHeight: 1.2,
  marginBottom: theme.spacing[12],
};

const cardsRow: React.CSSProperties = {
  display: "flex",
  gap: theme.spacing[6],
  justifyContent: "center",
};

const card: React.CSSProperties = {
  flex: 1,
  maxWidth: "280px",
  padding: `${theme.spacing[8]} ${theme.spacing[6]}`,
  borderRadius: "16px",
  background: `linear-gradient(160deg, ${theme.colors.primary[50]} 0%, ${theme.colors.white} 100%)`,
  border: `1px solid ${theme.colors.primary[200]}`,
  textAlign: "center" as const,
  position: "relative" as const,
  overflow: "hidden" as const,
  boxShadow: theme.shadows.md,
};

const cardGlow: React.CSSProperties = {
  position: "absolute",
  top: "-40px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  background: `radial-gradient(circle, ${theme.colors.primary[200]}60 0%, transparent 70%)`,
  pointerEvents: "none",
};

const stepNum: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: "2.5rem",
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.primary[600],
  marginBottom: theme.spacing[4],
  position: "relative",
  zIndex: 1,
};

const iconCircle: React.CSSProperties = {
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  backgroundColor: theme.colors.primary[50],
  border: `1px solid ${theme.colors.primary[200]}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: `0 auto ${theme.spacing[5]}`,
  position: "relative",
  zIndex: 1,
};

const stepTitle: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.base,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[900],
  marginBottom: theme.spacing[2],
  position: "relative",
  zIndex: 1,
};

const stepDesc: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[600],
  lineHeight: 1.6,
  position: "relative",
  zIndex: 1,
};

const steps = [
  {
    num: "01",
    icon: <FiMic size={24} color={theme.colors.primary[600]} />,
    title: "Describe or speak it",
    desc: "Type a description or just talk — AI drafts the invoice for you.",
  },
  {
    num: "02",
    icon: <FiHash size={24} color={theme.colors.primary[600]} />,
    title: "GST & WHT auto-calculated",
    desc: "Standard, zero-rated, or withholding tax — FBR rules applied automatically.",
  },
  {
    num: "03",
    icon: <FiDownload size={24} color={theme.colors.primary[600]} />,
    title: "Download PDF or ask AI",
    desc: "Get an FBR-ready PDF, or ask the AI assistant about overdue invoices and client balances.",
  },
];

const responsiveCSS = `
  @media (max-width: 768px) {
    .hiw-cards { flex-direction: column !important; align-items: center; }
  }
`;

export default function HowItWorks() {
  return (
    <>
      <style>{responsiveCSS}</style>
      <CursorZone id="how-it-works">
        <section style={section}>
          <div style={container}>
            <motion.p
              style={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              How it works
            </motion.p>

            <motion.h2
              style={heading}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              From zero to invoice in 3 steps
            </motion.h2>

            <div className="hiw-cards" style={cardsRow}>
              {steps.map((s, i) => (
                <motion.div
                  key={s.num}
                  style={card}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.12 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                >
                  <div style={cardGlow} />
                  <div style={stepNum}>{s.num}</div>
                  <div style={iconCircle}>{s.icon}</div>
                  <div style={stepTitle}>{s.title}</div>
                  <div style={stepDesc}>{s.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </CursorZone>
    </>
  );
}
