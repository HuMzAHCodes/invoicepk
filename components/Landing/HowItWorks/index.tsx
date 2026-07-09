"use client";

import { motion } from "framer-motion";
import { FiFileText, FiHash, FiDownload } from "react-icons/fi";
import theme from "@/styles/theme";

// ─── Styles ───

// Dark gradient background — matches hero vibe
const section: React.CSSProperties = {
  background: `linear-gradient(160deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[900]} 100%)`,
  padding: `${theme.spacing[16]} ${theme.spacing[4]}`,
};

// Inner container centered
const container: React.CSSProperties = {
  maxWidth: "1000px",
  margin: "0 auto",
  textAlign: "center",
};

// Section label
const label: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.xs,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.primary[200],
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  marginBottom: theme.spacing[3],
};

// Main heading — white
const heading: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: "2.25rem",
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.white,
  lineHeight: 1.2,
  marginBottom: theme.spacing[12],
};

// Cards row
const cardsRow: React.CSSProperties = {
  display: "flex",
  gap: theme.spacing[6],
  justifyContent: "center",
};

// Glass card
const card: React.CSSProperties = {
  flex: 1,
  maxWidth: "280px",
  padding: `${theme.spacing[8]} ${theme.spacing[6]}`,
  borderRadius: "16px",
  background: "linear-gradient(160deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)",
  border: "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  textAlign: "center" as const,
  position: "relative" as const,
  overflow: "hidden" as const,
};

// Green glow inside card — top center
const cardGlow: React.CSSProperties = {
  position: "absolute",
  top: "-40px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  background: `radial-gradient(circle, ${theme.colors.primary[400]}30 0%, transparent 70%)`,
  pointerEvents: "none",
};

// Step number — large green
const stepNum: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: "2.5rem",
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.primary[200],
  marginBottom: theme.spacing[4],
  position: "relative",
  zIndex: 1,
};

// Icon circle — glass
const iconCircle: React.CSSProperties = {
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  backgroundColor: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: `0 auto ${theme.spacing[5]}`,
  position: "relative",
  zIndex: 1,
};

// Step title — white
const stepTitle: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.base,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.white,
  marginBottom: theme.spacing[2],
  position: "relative",
  zIndex: 1,
};

// Step description — cream
const stepDesc: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[100],
  lineHeight: 1.6,
  position: "relative",
  zIndex: 1,
};

// ─── Data ───
const steps = [
  {
    num: "01",
    icon: <FiFileText size={24} color={theme.colors.primary[200]} />,
    title: "Fill your invoice",
    desc: "Add client, line items, GST type — done in minutes.",
  },
  {
    num: "02",
    icon: <FiHash size={24} color={theme.colors.primary[200]} />,
    title: "GST auto-calculated",
    desc: "WHT, zero-rated, standard — all handled automatically.",
  },
  {
    num: "03",
    icon: <FiDownload size={24} color={theme.colors.primary[200]} />,
    title: "Download PDF",
    desc: "FBR-compliant PDF ready to send to your client.",
  },
];

// ─── Responsive CSS ───
const responsiveCSS = `
  @media (max-width: 768px) {
    .hiw-cards { flex-direction: column !important; align-items: center; }
  }
`;

// ─── Component ───
export default function HowItWorks() {
  return (
    <>
      <style>{responsiveCSS}</style>
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
    </>
  );
}
