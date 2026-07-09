"use client";

import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import Link from "next/link";
import theme from "@/styles/theme";

// ─── Styles ───

// Section wrapper
const section: React.CSSProperties = {
  backgroundColor: theme.colors.surface,
  padding: `${theme.spacing[16]} ${theme.spacing[4]}`,
};

// Inner container centered
const container: React.CSSProperties = {
  maxWidth: "900px",
  margin: "0 auto",
  textAlign: "center",
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
  marginBottom: theme.spacing[12],
};

// Cards row
const cardsRow: React.CSSProperties = {
  display: "flex",
  gap: theme.spacing[6],
  justifyContent: "center",
  alignItems: "stretch",
};

// Base card style
const cardBase: React.CSSProperties = {
  flex: 1,
  maxWidth: "400px",
  backgroundColor: theme.colors.white,
  borderRadius: "16px",
  padding: theme.spacing[8],
  textAlign: "left" as const,
  display: "flex",
  flexDirection: "column" as const,
};

// Free card
const cardFree: React.CSSProperties = {
  ...cardBase,
  border: `1px solid ${theme.colors.neutral[200]}`,
};

// Pro card
const cardPro: React.CSSProperties = {
  ...cardBase,
  border: `2px solid ${theme.colors.primary[600]}`,
  boxShadow: "0 16px 40px rgba(31, 92, 63, 0.1)",
};

// Most popular badge
const badge: React.CSSProperties = {
  display: "inline-block",
  fontFamily: theme.fonts.body,
  fontSize: "0.65rem",
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.white,
  backgroundColor: theme.colors.primary[600],
  padding: "3px 10px",
  borderRadius: theme.radius.full,
  textTransform: "uppercase" as const,
  marginBottom: theme.spacing[3],
};

// Plan name
const planName: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: theme.fontSizes.xl,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[900],
  marginBottom: theme.spacing[1],
};

// Price
const price: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: "2rem",
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.neutral[900],
  marginBottom: theme.spacing[1],
};

// Price period
const period: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[400],
  marginBottom: theme.spacing[6],
};

// Feature row
const featureRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[3],
  marginBottom: theme.spacing[3],
};

// Feature text
const featureText: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[600],
};

// Outlined button (free)
const btnOutline: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "center" as const,
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.base,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.primary[600],
  backgroundColor: "transparent",
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.primary[600]}`,
  cursor: "pointer",
  textDecoration: "none",
  marginTop: "auto",
};

// Filled button (pro)
const btnFilled: React.CSSProperties = {
  ...btnOutline,
  color: theme.colors.white,
  backgroundColor: theme.colors.primary[600],
  border: "none",
};

// ─── Data ───
const freeFeatures = [
  "5 invoices/month",
  "GST auto-calculation",
  "PDF download",
  "1 business profile",
  "10 clients",
];

const proFeatures = [
  "Unlimited invoices",
  "Everything in Free",
  "Logo upload",
  "Save PDF to cloud",
  "Dashboard stats",
];

// ─── Responsive CSS ───
const responsiveCSS = `
  @media (max-width: 640px) {
    .pricing-cards { flex-direction: column !important; align-items: center; }
  }
`;

// ─── Component ───
export default function Pricing() {
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
            Pricing
          </motion.p>

          <motion.h2
            style={heading}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Simple pricing.
            <br />
            No surprises.
          </motion.h2>

          <div className="pricing-cards" style={cardsRow}>
            {/* Free Card */}
            <motion.div
              style={cardFree}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div style={planName}>Free</div>
              <div style={price}>PKR 0</div>
              <div style={period}>per month</div>
              {freeFeatures.map((f) => (
                <div key={f} style={featureRow}>
                  <FiCheck
                    size={16}
                    color={theme.colors.success[600]}
                    strokeWidth={3}
                  />
                  <span style={featureText}>{f}</span>
                </div>
              ))}
              <Link href="/login" style={btnOutline}>
                Get started free
              </Link>
            </motion.div>

            {/* Pro Card */}
            <motion.div
              style={cardPro}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.25 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div style={badge}>Most Popular</div>
              <div style={planName}>Pro</div>
              <div style={price}>PKR 999</div>
              <div style={period}>per month</div>
              {proFeatures.map((f) => (
                <div key={f} style={featureRow}>
                  <FiCheck
                    size={16}
                    color={theme.colors.success[600]}
                    strokeWidth={3}
                  />
                  <span style={featureText}>{f}</span>
                </div>
              ))}
              <Link href="/login" style={btnFilled}>
                Start Pro — PKR 999/mo
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
