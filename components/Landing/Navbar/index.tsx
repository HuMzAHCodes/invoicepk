"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import theme from "@/styles/theme";
import Logo from "./Logo";
import CenterLinks from "./CenterLinks";
import DesktopLinks from "./DesktopLinks";
import MobileMenu from "./MobileMenu";

// ─── Styles ───

// Sticky navbar
const nav: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  transition: "all 0.3s ease",
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

// Scroll progress circle — fixed bottom-right
const progressWrap: React.CSSProperties = {
  position: "fixed",
  bottom: theme.spacing[6],
  right: theme.spacing[6],
  width: "48px",
  height: "48px",
  zIndex: 200,
  cursor: "pointer",
};

// Progress text inside circle
const progressText: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  fontFamily: theme.fonts.mono,
  fontSize: "0.6rem",
  fontWeight: theme.fontWeights.bold,
  color: theme.colors.primary[600],
  pointerEvents: "none",
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
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);

      // Calculate scroll percentage
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? Math.round((window.scrollY / docHeight) * 100) : 0;
      setScrollPercent(percent);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // SVG circle values
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (scrollPercent / 100) * circumference;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{responsiveCSS}</style>
      <nav
        style={{
          ...nav,
          backgroundColor: scrolled ? "rgba(247, 245, 239, 0.85)" : theme.colors.neutral[50],
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: `1px solid ${scrolled ? theme.colors.neutral[200] : "transparent"}`,
          boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
        }}
      >
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

      {/* Scroll progress circle */}
      <div style={progressWrap} onClick={scrollToTop}>
        <svg width="48" height="48" viewBox="0 0 48 48">
          {/* Background circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill={theme.colors.white}
            stroke={theme.colors.neutral[200]}
            strokeWidth="3"
          />
          {/* Progress arc */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke={theme.colors.primary[600]}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 24 24)"
            style={{ transition: "stroke-dashoffset 0.15s ease" }}
          />
        </svg>
        <span style={progressText}>{scrollPercent}%</span>
      </div>

      <AnimatePresence>
        {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
