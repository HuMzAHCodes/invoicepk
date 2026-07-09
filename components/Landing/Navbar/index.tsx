"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import theme from "@/styles/theme";
import Logo from "./Logo";
import CenterLinks from "./CenterLinks";
import DesktopLinks from "./DesktopLinks";
import MobileMenu from "./MobileMenu";

// ─── Styles ───

// Sticky navbar — neutral-50 background
const nav: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  backgroundColor: theme.colors.neutral[50],
  borderBottom: `1px solid ${theme.colors.neutral[200]}`,
  transition: "box-shadow 0.3s ease",
};

// Inner container — 3-column layout
const container: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

// Left section — logo
const left: React.CSSProperties = {
  flex: "0 0 auto",
};

// Center section — nav links
const center: React.CSSProperties = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
};

// Right section — auth buttons
const right: React.CSSProperties = {
  flex: "0 0 auto",
  display: "flex",
  alignItems: "center",
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
    .landing-center-links { display: none !important; }
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
      <nav style={{ ...nav, boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.06)" : "none" }}>
        <div style={container}>
          {/* Left — Logo */}
          <div style={left}>
            <Logo />
          </div>

          {/* Center — Nav links */}
          <div className="landing-center-links" style={center}>
            <CenterLinks />
          </div>

          {/* Right — Auth */}
          <div className="landing-desktop-links" style={right}>
            <DesktopLinks />
          </div>

          {/* Mobile hamburger */}
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
