"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import theme from "@/styles/theme";
import Logo from "./Logo";
import DesktopLinks from "./DesktopLinks";
import MobileMenu from "./MobileMenu";

// ─── Styles ───

// Sticky navbar wrapper
const nav: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  backgroundColor: theme.colors.white,
  borderBottom: `1px solid ${theme.colors.neutral[200]}`,
};

// Inner container
const container: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

// Hamburger button (mobile)
const hamburger: React.CSSProperties = {
  display: "none",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: theme.colors.neutral[900],
  padding: theme.spacing[1],
};

// ─── Responsive CSS ───
const responsiveCSS = `
  @media (max-width: 768px) {
    .landing-desktop-links { display: none !important; }
    .landing-hamburger { display: flex !important; }
  }
`;

// ─── Component ───
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{responsiveCSS}</style>
      <nav style={nav}>
        <div style={container}>
          <Logo />
          <div className="landing-desktop-links">
            <DesktopLinks />
          </div>
          <button
            className="landing-hamburger"
            style={hamburger}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
