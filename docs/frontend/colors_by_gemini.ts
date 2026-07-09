// colors_by_gemini.ts
// Reference file — tracks Gemini-suggested colors mapped to components.
// Used when redesigning Navbar + Hero to match Gemini output.

const geminiColors = {
  // ─── Navbar ──────────────────────────────────────────────────────────────

  navbarBackground: {
    hex: "#F7F5EF",
    token: "neutral-50",
    inTheme: true,
    component: "Navbar background",
  },

  navbarLogoLinks: {
    hex: "#2B2924",
    token: "neutral-900",
    inTheme: true,
    component: "Navbar logo, nav links, Sign In text",
  },

  // ─── Hero ────────────────────────────────────────────────────────────────

  heroBackground: {
    hex: "#1F5C3F → #0F2E1F",
    token: "primary-600 → primary-900",
    inTheme: true,
    component: "Hero section full gradient background",
  },

  heroHeading: {
    hex: "#FFFFFF",
    token: "white",
    inTheme: true,
    component: "Hero main heading text (H1)",
  },

  heroHighlight: {
    hex: "#E8F0EA",
    token: "primary-50",
    inTheme: true,
    component: "Highlighted text accent (e.g. '2 minutes')",
  },

  heroSubtext: {
    hex: "#F0EAE0",
    token: "NEW — not in theme",
    inTheme: false,
    component: "Hero subtext, checkmarks, trust line on dark bg",
  },

  // ─── Hero Buttons ────────────────────────────────────────────────────────

  heroPrimaryCTA: {
    hex: "#0F2E1F",
    token: "primary-900",
    inTheme: true,
    component: "Primary CTA button background (Start for free)",
  },

  heroSecondaryCTA: {
    hex: "#F7F5EF",
    token: "neutral-50",
    inTheme: true,
    component: "Secondary CTA button border (See how it works)",
  },

  // ─── Invoice Card (on hero) ─────────────────────────────────────────────

  invoiceCardHeader: {
    hex: "#1F5C3F",
    token: "primary-600",
    inTheme: true,
    component: "Invoice card header bar",
  },

  invoicePaidBadge: {
    hex: "#2F8F4E",
    token: "success-600",
    inTheme: true,
    component: "Invoice card PAID badge",
  },

  invoiceCardBody: {
    hex: "#F7F5EF",
    token: "neutral-50",
    inTheme: true,
    component: "Invoice card body background",
  },

  invoiceCardBorders: {
    hex: "#DEDACB",
    token: "neutral-200",
    inTheme: true,
    component: "Invoice card row borders",
  },

  // ─── Status / Metric Colors ──────────────────────────────────────────────

  warningStatus: {
    hex: "#DE9F3E",
    token: "warning-400",
    inTheme: true,
    component: "Draft / sent / pending status text",
  },

  successStatus: {
    hex: "#2F8F4E",
    token: "success-600",
    inTheme: true,
    component: "Paid status, metric highlights",
  },
};

export default geminiColors;
