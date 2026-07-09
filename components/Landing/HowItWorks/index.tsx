"use client";

import { motion } from "framer-motion";
import { FiFileText, FiHash, FiDownload } from "react-icons/fi";
import theme from "@/styles/theme";

// ─── Styles ───

// Section wrapper with neutral-50 background
const section: React.CSSProperties = {
  backgroundColor: theme.colors.surface,
  padding: `${theme.spacing[16]} ${theme.spacing[4]}`,
};

// Inner container centered
const container: React.CSSProperties = {
  maxWidth: "1000px",
  margin: "0 auto",
  textAlign: "center",
};

// Section label above heading
const label: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.xs,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.primary[400],
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  marginBottom: theme.spacing[3],
};

// Main heading
const heading: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: "2.25rem",
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[900],
  lineHeight: 1.2,
  marginBottom: theme.spacing[12],
};

// Steps row
const stepsRow: React.CSSProperties = {
  display: "flex",
  gap: theme.spacing[8],
  justifyContent: "center",
};

// Individual step card
const stepCard: React.CSSProperties = {
  flex: 1,
  maxWidth: "280px",
  textAlign: "center",
};

// Step number in mono font
const stepNum: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: "2.5rem",
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.primary[600],
  marginBottom: theme.spacing[3],
};

// Step icon circle
const iconCircle: React.CSSProperties = {
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  backgroundColor: theme.colors.primary[50],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: `0 auto ${theme.spacing[4]}`,
};

// Step title
const stepTitle: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.base,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[900],
  marginBottom: theme.spacing[2],
};

// Step description
const stepDesc: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[600],
  lineHeight: 1.6,
};

// ─── Data ───
const steps = [
  {
    num: "01",
    icon: <FiFileText size={24} color={theme.colors.primary[600]} />,
    title: "Fill your invoice",
    desc: "Add client, line items, GST type — done in minutes.",
  },
  {
    num: "02",
    icon: <FiHash size={24} color={theme.colors.primary[600]} />,
    title: "GST auto-calculated",
    desc: "WHT, zero-rated, standard — all handled automatically.",
  },
  {
    num: "03",
    icon: <FiDownload size={24} color={theme.colors.primary[600]} />,
    title: "Download PDF",
    desc: "FBR-compliant PDF ready to send to your client.",
  },
];

// ─── Responsive CSS ───
const responsiveCSS = `
  @media (max-width: 768px) {
    .hiw-steps { flex-direction: column !important; align-items: center; }
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

          <div className="hiw-steps" style={stepsRow}>
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                style={stepCard}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.12 }}
              >
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
