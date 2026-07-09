"use client";

import { motion } from "framer-motion";
import { FiFileText, FiHash, FiDownload, FiZap } from "react-icons/fi";
import theme from "@/styles/theme";

// ─── Styles ───

// Section wrapper — same neutral-50 as before
const section: React.CSSProperties = {
  backgroundColor: theme.colors.surface,
  padding: `${theme.spacing[16]} ${theme.spacing[4]}`,
  position: "relative",
  overflow: "hidden",
};

// Inner container centered
const container: React.CSSProperties = {
  maxWidth: "1000px",
  margin: "0 auto",
  textAlign: "center",
  position: "relative",
  zIndex: 1,
};

// Section label
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
  marginBottom: theme.spacing[16],
};

// Steps wrapper — relative for SVG overlay
const stepsWrap: React.CSSProperties = {
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  maxWidth: "800px",
  margin: "0 auto",
};

// Individual step node
const stepNode: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
  zIndex: 2,
  width: "200px",
};

// Hexagon container
const hexWrap: React.CSSProperties = {
  position: "relative",
  width: "100px",
  height: "100px",
  marginBottom: theme.spacing[4],
};

// Glass hexagon shape
const hexagon: React.CSSProperties = {
  width: "100px",
  height: "100px",
  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 100%)",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
};

// Green glow behind hexagon
const hexGlow: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  background: `radial-gradient(circle, ${theme.colors.primary[400]}40 0%, transparent 70%)`,
  filter: "blur(8px)",
  pointerEvents: "none",
};

// Dark circle for step number
const numBadge: React.CSSProperties = {
  position: "absolute",
  top: "-8px",
  right: "-8px",
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: theme.colors.neutral[900],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: theme.fonts.mono,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.white,
  zIndex: 3,
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

// Step title
const stepTitle: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.base,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[900],
  textAlign: "center",
};

// Bottom features row
const featuresRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: theme.spacing[8],
  marginTop: theme.spacing[12],
  flexWrap: "wrap",
};

// Feature badge
const featureBadge: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[600],
};

// Feature icon circle
const featureIcon: React.CSSProperties = {
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  backgroundColor: theme.colors.primary[50],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// ─── SVG Path ───

// Wavy connecting line — sits behind the step nodes
const svgPath: React.CSSProperties = {
  position: "absolute",
  top: "40px",
  left: "0",
  width: "100%",
  height: "120px",
  zIndex: 1,
  pointerEvents: "none",
};

// ─── Data ───
const steps = [
  {
    num: "01",
    icon: <FiFileText size={28} color={theme.colors.primary[600]} />,
    title: "Build Invoice",
  },
  {
    num: "02",
    icon: <FiHash size={28} color={theme.colors.primary[600]} />,
    title: "Calculate Tax",
  },
  {
    num: "03",
    icon: <FiDownload size={28} color={theme.colors.primary[600]} />,
    title: "Finalize & Export",
  },
];

const features = [
  { icon: <FiZap size={14} color={theme.colors.primary[600]} />, text: "Fast Client & Line Item Entry" },
  { icon: <FiHash size={14} color={theme.colors.primary[600]} />, text: "Automated GST & WHT" },
  { icon: <FiFileText size={14} color={theme.colors.primary[600]} />, text: "FBR-Compliant PDF" },
];

// ─── Responsive CSS ───
const responsiveCSS = `
  @media (max-width: 768px) {
    .hiw-steps-wrap { flex-direction: column !important; align-items: center; gap: 3rem; }
    .hiw-svg-path { display: none !important; }
    .hiw-features { flex-direction: column !important; align-items: center; }
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
            From zero to invoice in 3 seamless steps
          </motion.h2>

          {/* Steps with SVG path */}
          <div style={{ position: "relative" }}>
            {/* Wavy connecting line */}
            <svg
              className="hiw-svg-path"
              style={svgPath}
              viewBox="0 0 800 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 60 C 80 60, 100 20, 180 20 C 260 20, 280 100, 400 100 C 520 100, 540 20, 620 20 C 700 20, 720 60, 800 60"
                stroke={theme.colors.primary[400]}
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.5"
              />
              <path
                d="M 0 60 C 80 60, 100 20, 180 20 C 260 20, 280 100, 400 100 C 520 100, 540 20, 620 20 C 700 20, 720 60, 800 60"
                stroke={theme.colors.primary[400]}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>

            {/* Step nodes */}
            <div className="hiw-steps-wrap" style={stepsWrap}>
              {steps.map((s, i) => (
                <motion.div
                  key={s.num}
                  style={stepNode}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.15 }}
                >
                  <div style={hexWrap}>
                    <div style={hexGlow} />
                    <div style={hexagon}>{s.icon}</div>
                    <div style={numBadge}>{s.num}</div>
                  </div>
                  <div style={stepTitle}>{s.title}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom feature badges */}
          <motion.div
            className="hiw-features"
            style={featuresRow}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            {features.map((f) => (
              <div key={f.text} style={featureBadge}>
                <div style={featureIcon}>{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
