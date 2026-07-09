"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import theme from "@/styles/theme";

// ─── Styles ───

// Section wrapper
const section: React.CSSProperties = {
  backgroundColor: theme.colors.white,
  padding: `${theme.spacing[16]} ${theme.spacing[4]}`,
};

// Inner container centered
const container: React.CSSProperties = {
  maxWidth: "720px",
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
  marginBottom: theme.spacing[10],
};

// Question row — base
const questionRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  padding: `${theme.spacing[4]} ${theme.spacing[4]}`,
  background: "none",
  border: "none",
  borderBottom: `1px solid ${theme.colors.neutral[200]}`,
  cursor: "pointer",
  textAlign: "left" as const,
  borderRadius: theme.radius.md,
  transition: "all 0.2s ease",
};

// Question text — base
const questionText: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.base,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[900],
  transition: "color 0.2s ease",
};

// Chevron icon wrapper — base
const chevron: React.CSSProperties = {
  flexShrink: 0,
  color: theme.colors.neutral[400],
  transition: "transform 0.2s ease, color 0.2s ease",
};

// Answer wrapper
const answerWrapper: React.CSSProperties = {
  overflow: "hidden",
};

// Answer text
const answerText: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[600],
  lineHeight: 1.7,
  textAlign: "left" as const,
  padding: `${theme.spacing[2]} ${theme.spacing[4]} ${theme.spacing[4]}`,
};

// ─── Data ───
const faqs = [
  {
    q: "Is InvoicePK free?",
    a: "Yes, up to 5 invoices per month. Pro is PKR 999/month for unlimited invoices.",
  },
  {
    q: "Is it FBR compliant?",
    a: "Yes. GST at 17%, zero-rated for IT exports, WHT support, NTN and STRN on every PDF.",
  },
  {
    q: "Do I need an STRN?",
    a: "Only if you charge GST. You can use InvoicePK without an STRN for exempt or zero-rated invoices.",
  },
  {
    q: "Can I bill in USD?",
    a: "Yes. Each invoice can be PKR or USD.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Your data is stored securely in MongoDB Atlas and never shared with third parties.",
  },
];

// ─── Component ───
export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="faq" style={section}>
      <div style={container}>
        <motion.p
          style={label}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          FAQ
        </motion.p>

        <motion.h2
          style={heading}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Frequently asked questions
        </motion.h2>

        {faqs.map((faq, i) => {
          const isOpen = open === i;
          const isHovered = hovered === i;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
            >
              <button
                style={{
                  ...questionRow,
                  backgroundColor: isHovered ? theme.colors.primary[50] : "transparent",
                  paddingLeft: isHovered ? theme.spacing[5] : theme.spacing[4],
                }}
                onClick={() => setOpen(isOpen ? null : i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <span
                  style={{
                    ...questionText,
                    color: isHovered ? theme.colors.primary[600] : theme.colors.neutral[900],
                  }}
                >
                  {faq.q}
                </span>
                <motion.span
                  style={{
                    ...chevron,
                    color: isHovered ? theme.colors.primary[600] : theme.colors.neutral[400],
                  }}
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiChevronDown size={20} />
                </motion.span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    style={answerWrapper}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div style={answerText}>{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
