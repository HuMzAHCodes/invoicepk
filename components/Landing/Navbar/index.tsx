"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import theme from "@/styles/theme";
import Logo from "./Logo";
import DesktopLinks from "./DesktopLinks";
import MobileMenu from "./MobileMenu";

// ─── Styles ───

// Sticky navbar wrapper — no shadow initially
const navBase: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  transition: "all 0.3s ease",
};

// Transparent state (top of page)
const navTransparent: React.CSSProperties = {
  ...navBase,
  backgroundColor: "transparent",
  borderBottom: "1px solid transparent",
  backdropFilter: "none",
};

// Scrolled state — blur + shadow
const navScrolled: React.CSSProperties = {
  ...navBase,
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  borderBottom: `1px solid ${theme.colors.neutral[200]}`,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{responsiveCSS}</style>
      <nav style={scrolled ? navScrolled : navTransparent}>
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
