import theme from "@/styles/theme";

// ─── Styles ───

// Footer wrapper — dark primary-900
const footer: React.CSSProperties = {
  backgroundColor: theme.colors.primary[900],
  padding: `${theme.spacing[12]} ${theme.spacing[4]} ${theme.spacing[6]}`,
};

// Inner container — 3 columns
const container: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  display: "flex",
  gap: theme.spacing[12],
  marginBottom: theme.spacing[8],
};

// Column base
const col: React.CSSProperties = {
  flex: 1,
};

// Brand wordmark
const brand: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: theme.fontSizes.xl,
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.white,
  marginBottom: theme.spacing[2],
};

// Tagline
const tagline: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.primary[200],
  marginBottom: theme.spacing[2],
};

// Made in Pakistan
const madeIn: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.primary[400],
};

// Column heading
const colHeading: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.white,
  marginBottom: theme.spacing[4],
};

// Link item
const linkItem: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.primary[200],
  textDecoration: "none",
  display: "block",
  marginBottom: theme.spacing[2],
};

// Bottom bar
const bottomBar: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  borderTop: `1px solid ${theme.colors.primary[600]}`,
  paddingTop: theme.spacing[6],
  textAlign: "center" as const,
};

// Copyright text
const copyright: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.xs,
  color: theme.colors.primary[400],
};

// ─── Responsive CSS ───
const responsiveCSS = `
  @media (max-width: 640px) {
    .footer-cols { flex-direction: column !important; gap: 2rem !important; }
  }
`;

// ─── Component ───
export default function Footer() {
  return (
    <>
      <style>{responsiveCSS}</style>
      <footer style={footer}>
        <div className="footer-cols" style={container}>
          {/* Brand */}
          <div style={col}>
            <div style={brand}>InvoicePK</div>
            <div style={tagline}>GST invoices for Pakistani freelancers</div>
            <div style={madeIn}>Made in Pakistan 🇵🇰</div>
          </div>

          {/* Links */}
          <div style={col}>
            <div style={colHeading}>Product</div>
            <a href="#how-it-works" style={linkItem}>
              How it works
            </a>
            <a href="#pricing" style={linkItem}>
              Pricing
            </a>
            <a href="#faq" style={linkItem}>
              FAQ
            </a>
          </div>

          {/* Legal */}
          <div style={col}>
            <div style={colHeading}>Legal</div>
            <a href="/terms" style={linkItem}>
              Terms of Service
            </a>
            <a href="/privacy" style={linkItem}>
              Privacy Policy
            </a>
          </div>
        </div>

        <div style={bottomBar}>
          <div style={copyright}>© 2026 InvoicePK. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
