"use client";

import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import Link from "next/link";
import theme from "@/styles/theme";
import { CursorZone } from "@/components/CustomCursor";

const section: React.CSSProperties = {
  backgroundColor: theme.colors.surface,
  padding: `${theme.spacing[16]} ${theme.spacing[4]}`,
};

const container: React.CSSProperties = {
  maxWidth: "900px",
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
  alignItems: "stretch",
};

const cardFree: React.CSSProperties = {
  flex: 1,
  maxWidth: "400px",
  backgroundColor: theme.colors.white,
  borderRadius: "16px",
  border: `1px solid ${theme.colors.neutral[200]}`,
  padding: theme.spacing[8],
  textAlign: "left" as const,
  display: "flex",
  flexDirection: "column" as const,
};

const cardPro: React.CSSProperties = {
  flex: 1,
  maxWidth: "400px",
  background: `linear-gradient(160deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[900]} 100%)`,
  borderRadius: "16px",
  border: "none",
  padding: theme.spacing[8],
  textAlign: "left" as const,
  display: "flex",
  flexDirection: "column" as const,
  boxShadow: "0 20px 50px rgba(15, 46, 31, 0.25)",
  position: "relative" as const,
};

const badge: React.CSSProperties = {
  position: "absolute",
  top: theme.spacing[4],
  right: theme.spacing[4],
  fontFamily: theme.fonts.body,
  fontSize: "0.65rem",
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.primary[900],
  backgroundColor: theme.colors.accent[400],
  padding: "4px 12px",
  borderRadius: theme.radius.full,
  textTransform: "uppercase" as const,
};

const planName: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: theme.fontSizes.xl,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[900],
  marginBottom: theme.spacing[1],
};

const planNameWhite: React.CSSProperties = {
  ...planName,
  color: theme.colors.white,
};

const price: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: "2.25rem",
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.neutral[900],
  marginBottom: theme.spacing[1],
};

const priceWhite: React.CSSProperties = {
  ...price,
  color: theme.colors.white,
};

const period: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[400],
  marginBottom: theme.spacing[6],
};

const periodCream: React.CSSProperties = {
  ...period,
  color: theme.colors.neutral[100],
};

const featureRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[3],
  marginBottom: theme.spacing[3],
};

const featureText: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[600],
};

const featureTextWhite: React.CSSProperties = {
  ...featureText,
  color: theme.colors.neutral[100],
};

const btnOutline: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "center" as const,
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.base,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[900],
  backgroundColor: theme.colors.white,
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.neutral[200]}`,
  cursor: "pointer",
  textDecoration: "none",
  marginTop: "auto",
  transition: theme.transitions.fast,
};

const btnWhite: React.CSSProperties = {
  ...btnOutline,
  color: theme.colors.primary[900],
  backgroundColor: theme.colors.white,
  border: "none",
};

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

const responsiveCSS = `
  @media (max-width: 640px) {
    .pricing-cards { flex-direction: column !important; align-items: center; }
  }
`;

export default function Pricing() {
  return (
    <>
      <style>{responsiveCSS}</style>
      <CursorZone id="pricing">
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
                <div style={period}>per month, forever</div>
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
                <div style={planNameWhite}>Pro</div>
                <div style={priceWhite}>PKR 999</div>
                <div style={periodCream}>per month</div>
                {proFeatures.map((f) => (
                  <div key={f} style={featureRow}>
                    <FiCheck
                      size={16}
                      color={theme.colors.success[400]}
                      strokeWidth={3}
                    />
                    <span style={featureTextWhite}>{f}</span>
                  </div>
                ))}
                <Link href="/login" style={btnWhite}>
                  Start Pro — PKR 999/mo
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </CursorZone>
    </>
  );
}
