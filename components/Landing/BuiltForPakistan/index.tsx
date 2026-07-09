"use client";

import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import theme from "@/styles/theme";

// ─── Styles ───

// Section wrapper
const section: React.CSSProperties = {
  backgroundColor: theme.colors.white,
  padding: `${theme.spacing[16]} ${theme.spacing[4]}`,
};

// Inner container — two columns
const container: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[12],
};

// Left column — text and features
const left: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

// Right column — visual
const right: React.CSSProperties = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  minWidth: 0,
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
  marginBottom: theme.spacing[8],
};

// Feature row
const featureRow: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing[3],
  marginBottom: theme.spacing[4],
};

// Checkmark circle
const checkCircle: React.CSSProperties = {
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  backgroundColor: theme.colors.success[50],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  marginTop: "2px",
};

// Feature title
const featureTitle: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.base,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[900],
};

// Feature description
const featureDesc: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[600],
  marginTop: "2px",
};

// Right side card — GST visual
const gstCard: React.CSSProperties = {
  width: "320px",
  backgroundColor: theme.colors.white,
  borderRadius: "16px",
  border: `1px solid ${theme.colors.neutral[200]}`,
  boxShadow: "0 16px 40px rgba(15, 46, 31, 0.08)",
  padding: theme.spacing[6],
  textAlign: "center" as const,
};

// Big percentage number
const bigNum: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: "3.5rem",
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.primary[600],
  lineHeight: 1,
  marginBottom: theme.spacing[2],
};

// Caption below number
const caption: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[600],
};

// ─── Data ───
const features = [
  { title: "GST at 17%", desc: "Standard FBR rate, configurable per invoice" },
  { title: "Zero-rated GST", desc: "For IT export services (STZA exemption)" },
  { title: "WHT support", desc: "Withholding tax for corporate clients" },
  { title: "NTN on invoice", desc: "Your National Tax Number on every PDF" },
  {
    title: "STRN on invoice",
    desc: "Sales Tax Reg Number shown when applicable",
  },
  { title: "PKR + USD", desc: "Bill locally and internationally" },
];

// ─── Responsive CSS ───
const responsiveCSS = `
  @media (max-width: 768px) {
    .bfp-container { flex-direction: column !important; text-align: center; }
    .bfp-right { margin-top: 2rem; }
  }
`;

// ─── Component ───
export default function BuiltForPakistan() {
  return (
    <>
      <style>{responsiveCSS}</style>
      <section style={section}>
        <div className="bfp-container" style={container}>
          <div style={left}>
            <motion.p
              style={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              Built for Pakistan
            </motion.p>

            <motion.h2
              style={heading}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Every Pakistani tax rule,
              <br />
              built right in.
            </motion.h2>

            {features.map((f, i) => (
              <motion.div
                key={f.title}
                style={featureRow}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.08 }}
              >
                <div style={checkCircle}>
                  <FiCheck
                    size={14}
                    color={theme.colors.success[600]}
                    strokeWidth={3}
                  />
                </div>
                <div>
                  <div style={featureTitle}>{f.title}</div>
                  <div style={featureDesc}>{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bfp-right" style={right}>
            <motion.div
              style={gstCard}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div style={bigNum}>17%</div>
              <div style={caption}>GST calculated instantly</div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
