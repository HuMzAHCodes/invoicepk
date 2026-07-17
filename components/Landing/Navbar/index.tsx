// components/Landing/Navbar/index.tsx
"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import theme from "@/styles/theme";
import Logo from "./Logo";
import CenterLinks from "./CenterLinks";
import DesktopLinks from "./DesktopLinks";
import MobileMenu from "./MobileMenu";
import { useCursorContext } from "@/components/CustomCursor"; // ★
import { ScrollTrigger } from "gsap/ScrollTrigger"; // ★

// ─── Styles ───

// Sticky navbar
const nav: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  transition: "all 0.3s ease",
  overflow: "hidden",
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
  width: "72px",
  height: "72px",
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
  fontSize: "0.75rem",
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

// Horizontal progress line — bottom of navbar
const progressLineBg: React.CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "3px",
  backgroundColor: "transparent",
};

const progressLineFill: React.CSSProperties = {
  height: "100%",
  backgroundColor: theme.colors.primary[600],
  transition: "width 0.15s ease",
  borderRadius: "0 2px 2px 0",
};

// ─── Component ───
export default function Navbar() {
  const { smoother } = useCursorContext(); // ★
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  // ★ ScrollSmoother has no addEventListener API — use ScrollTrigger's
  //   onUpdate instead, which fires on every scroll tick and integrates
  //   natively with ScrollSmoother
  useEffect(() => {
    if (!smoother) return;

    const updateScrollState = () => {
      setScrolled(smoother.scrollTop() > 10);

      const docHeight = smoother.content().scrollHeight - window.innerHeight;
      const percent =
        docHeight > 0
          ? Math.round((smoother.scrollTop() / docHeight) * 100)
          : 0;
      setScrollPercent(percent);
    };

    // Initial values
    updateScrollState();

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 0,
      end: "max",
      onUpdate: updateScrollState,
    });

    return () => {
      trigger.kill();
    };
  }, [smoother]);

  // SVG circle values
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (scrollPercent / 100) * circumference;

  // ★ scrollToTop now goes through smoother, with a fallback just in case
  const scrollToTop = () => {
    if (smoother) {
      smoother.scrollTo(0, { duration: 1, ease: "power2.out" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <style>{responsiveCSS}</style>
      <nav
        style={{
          ...nav,
          position: "sticky",
          backgroundColor: scrolled
            ? "var(--nav-glass-bg)"
            : theme.colors.neutral[50],
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

        {/* Scroll progress line */}
        <div style={progressLineBg}>
          <div style={{ ...progressLineFill, width: `${scrollPercent}%` }} />
        </div>
      </nav>

      {/* Scroll progress circle */}
      <div style={progressWrap} onClick={scrollToTop}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill={theme.colors.white}
            stroke={theme.colors.neutral[200]}
            strokeWidth="3"
          />
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke={theme.colors.primary[600]}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 36 36)"
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
