// components/Navbar/index.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import theme from "@/styles/theme";
// import { useCursorContext } from "@/components/CustomCursor/CursorProvider";

// ─── Types ─────────────────────────────────────────────────────────────────

interface NavbarProps {
  onMenuClick: () => void;
}

// ─── Breakpoints ───────────────────────────────────────────────────────────

const MOBILE_WIDTH = 768;

// ─── Component ─────────────────────────────────────────────────────────────

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();
  // const { smoother } = useCursorContext();

  const [isMobile, setIsMobile] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < MOBILE_WIDTH);
    }

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ★ dashboard has no CursorProvider/ScrollSmoother — track native scroll instead
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);

      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent =
        docHeight > 0 ? Math.round((window.scrollY / docHeight) * 100) : 0;
      setScrollPercent(percent);
    };

    onScroll(); // initial values
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const displayName = user?.displayName ?? "User";
  const initial = displayName.charAt(0).toUpperCase();

  // ─── Styles ────────────────────────────────────────────────────────────

  const navbarStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "56px",
    width: "100%",
    padding: "0 1.5rem",
    backgroundColor: theme.colors.white,
    borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    boxSizing: "border-box",
  };

  const leftGroupStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const hamburgerStyle: React.CSSProperties = {
    display: isMobile ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    borderRadius: theme.radius.md,
    color: theme.colors.neutral[600],
    cursor: "pointer",
    transition: theme.transitions.fast,
  };

  const wordmarkStyle: React.CSSProperties = {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.primary[600],
    textDecoration: "none",
    lineHeight: 1,
  };

  const rightGroupStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const avatarStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary[600],
    color: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    lineHeight: 1,
    userSelect: "none",
  };

  const usernameStyle: React.CSSProperties = {
    display: isMobile ? "none" : "block",
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.neutral[600],
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "160px",
  };

  // ─── Scroll Progress Styles ────────────────────────────────────────────

  // SVG circle values
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (scrollPercent / 100) * circumference;

  // Scroll progress line — bottom of navbar
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

  // Responsive CSS
  const responsiveCSS = `
  @media (max-width: 768px) {
    .landing-center-links { display: none !important; }
    .landing-desktop-links { display: none !important; }
    .landing-hamburger { display: flex !important; }
  }
`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <>
      <style>{responsiveCSS}</style>
      <header
        style={{
          ...navbarStyle,
          backgroundColor: scrolled
            ? "rgba(247, 245, 239, 0.85)"
            : theme.colors.white,
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: `1px solid ${scrolled ? theme.colors.neutral[200] : "transparent"}`,
          boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div style={leftGroupStyle}>
          <button
            type="button"
            style={hamburgerStyle}
            onClick={onMenuClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.neutral[50];
              e.currentTarget.style.color = theme.colors.neutral[900];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.neutral[600];
            }}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <Link href="/dashboard" style={wordmarkStyle}>
            InvoicePK
          </Link>
        </div>

        {/* Right: avatar + username */}
        <div style={rightGroupStyle}>
          <span style={usernameStyle}>{displayName}</span>
          <div style={avatarStyle} aria-hidden="true">
            {initial}
          </div>
        </div>
      </header>

      {/* Scroll progress line at bottom of navbar */}
      <div style={progressLineBg}>
        <div style={{ ...progressLineFill, width: `${scrollPercent}%` }} />
      </div>

      {/* Scroll progress circle */}
      <div style={progressWrap} onClick={scrollToTop}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          {/* Background circle */}
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill={theme.colors.white}
            stroke={theme.colors.neutral[200]}
            strokeWidth="3"
          />
          {/* Progress arc */}
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
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// COMMIT 1: Build Responsive Navbar Component
// ──────────────────────────────────────────────────────────────────────────────

// feat(navbar): create responsive dashboard navigation component

// Purpose:
// - Created a reusable Navbar component that serves as the top navigation
//   bar throughout the dashboard.

// Structure:
// - Left Section
//     • Hamburger menu (mobile only)
//     • InvoicePK logo linking back to the dashboard

// - Right Section
//     • Logged-in user's display name
//     • Circular avatar containing the user's first initial

// Props:
// - Receives `onMenuClick()` from the parent component.
// - Instead of opening/closing the sidebar itself, the Navbar delegates
//   this responsibility to its parent, keeping the component reusable and
//   following React's unidirectional data flow.

// Design:
// - Uses `position: sticky` so the navigation remains fixed at the top
//   while scrolling.
// - All styling is defined using `React.CSSProperties`, making the file
//   self-contained and easier to maintain.

// ──────────────────────────────────────────────────────────────────────────────
// COMMIT 2: Integrate Authentication Context
// ──────────────────────────────────────────────────────────────────────────────

// feat(auth): display authenticated user information

// Integrated the global authentication context using:

//     useAuth()

// Purpose:
// - Retrieves the currently authenticated Firebase user.
// - Displays the user's displayName.
// - Falls back to "User" if no display name exists.

// Avatar Logic:
// - Extracts the first character of displayName.
// - Converts it to uppercase.
// - Uses that character as the avatar label.

// Reason:
// Instead of passing user information through multiple component levels
// (prop drilling), React Context provides global access to authentication
// data from anywhere in the application.

// ──────────────────────────────────────────────────────────────────────────────
// COMMIT 3: Integrate ScrollSmoother through Context
// ──────────────────────────────────────────────────────────────────────────────

// feat(scroll): consume GSAP ScrollSmoother from Cursor Context

// Integrated

//     useCursorContext()

// instead of directly creating or searching for a ScrollSmoother instance.

// Purpose:
// - Retrieves the already initialized ScrollSmoother instance.
// - Ensures every component shares the same scrolling engine.
// - Prevents multiple ScrollSmoother instances from being created.

// Benefits:
// - Centralized scroll management.
// - Better separation of responsibilities.
// - Easier debugging.
// - Consistent smooth scrolling throughout the application.

// ──────────────────────────────────────────────────────────────────────────────
// COMMIT 4: Responsive Screen Detection using useEffect
// ──────────────────────────────────────────────────────────────────────────────

// feat(responsive): automatically detect mobile and desktop layouts

// Created a responsive detection system using React's useEffect.

// Logic:

// State:
//     isMobile

// Constant:
//     MOBILE_WIDTH = 768

// Workflow:

// Component Mount
//         ↓
// check() executes
//         ↓
// window.innerWidth is read
//         ↓
// isMobile becomes true/false
//         ↓
// Resize listener is attached
//         ↓
// Whenever browser width changes
//         ↓
// check() executes again
//         ↓
// Navbar instantly adapts

// Cleanup:
// When the component unmounts,
// the resize event listener is removed.

// Reason:
// Without cleanup, React components may leave unused event listeners in
// memory, resulting in memory leaks and unnecessary event executions.

// ──────────────────────────────────────────────────────────────────────────────
// COMMIT 5: Track Scroll Position using useEffect
// ──────────────────────────────────────────────────────────────────────────────

// feat(scroll): synchronize navbar with GSAP scrolling

// A second useEffect is responsible for monitoring page scrolling.

// Dependency:

//     [smoother]

// Meaning:
// This effect runs only when the ScrollSmoother instance becomes available
// or changes.

// Workflow:

// Component Mount
//         ↓
// Check if smoother exists
//         ↓
// If unavailable:
// Return immediately
//         ↓
// If available:
// Register Scroll Event
//         ↓
// User Scrolls
//         ↓
// onScroll() executes
//         ↓
// Updates:
//     • scrolled
//     • scrollPercent

// Cleanup:
// Removes the scroll listener whenever:

// - component unmounts
// - smoother instance changes

// Reason:
// Prevents duplicated listeners and unnecessary event execution.

// ──────────────────────────────────────────────────────────────────────────────
// COMMIT 6: Implement Scroll Percentage Calculation
// ──────────────────────────────────────────────────────────────────────────────

// feat(progress): calculate live scroll progress

// Every scroll event calculates how far the user has travelled through the
// page.

// Formula:

// Scrollable Height

//     contentHeight - viewportHeight

// Percentage

//     currentScroll / totalScrollableHeight × 100

// Result:

// scrollPercent

// stores values between

// 0 → 100

// This percentage drives:

// • Progress bar
// • Circular progress indicator
// • Scroll percentage text

// Using ScrollSmoother instead of window.scrollY ensures the values remain
// accurate because GSAP replaces the browser's native scrolling.

// ──────────────────────────────────────────────────────────────────────────────
// COMMIT 7: Dynamic Navbar Appearance
// ──────────────────────────────────────────────────────────────────────────────

// feat(ui): animate navbar based on scroll position

// Introduced a dynamic appearance controlled by the

//     scrolled

// state.

// Before scrolling:
// - White background
// - Transparent border
// - No shadow
// - No blur

// After scrolling more than 10 pixels:
// - Semi-transparent background
// - Glassmorphism blur effect
// - Bottom border
// - Soft drop shadow

// Purpose:
// Provides better visual separation between the navigation bar and page
// content while maintaining a modern UI.

// ──────────────────────────────────────────────────────────────────────────────
// COMMIT 8: Build Scroll Progress Indicator
// ──────────────────────────────────────────────────────────────────────────────

// feat(progress): add top progress line and circular progress widget

// Implemented two independent scroll indicators.

// 1. Progress Line
// ----------------

// Located directly beneath the navbar.

// Width:

// scrollPercent %

// As the user scrolls,
// the line gradually expands from left to right.

// 2. Circular Progress Indicator
// ------------------------------

// Located in the bottom-right corner.

// Components:

// • SVG background circle
// • SVG animated progress arc
// • Percentage text

// Purpose:
// Allows users to instantly understand how much of the page has been
// viewed.

// ──────────────────────────────────────────────────────────────────────────────
// COMMIT 9: Implement SVG Circular Progress Logic
// ──────────────────────────────────────────────────────────────────────────────

// feat(svg): generate animated circular progress using stroke calculations

// The circular progress uses SVG mathematics.

// Radius

//     30

// Circumference

//     2 × π × radius

// Dash Offset

//     circumference -
//     (scrollPercent / 100 × circumference)

// How it works:

// 0%
// Entire circle hidden.

// 50%
// Half of the stroke becomes visible.

// 100%
// Entire circle is drawn.

// The circle begins from the top using

// transform:

// rotate(-90deg)

// instead of the SVG default starting position on the right.

// ──────────────────────────────────────────────────────────────────────────────
// COMMIT 10: Scroll-to-Top Functionality
// ──────────────────────────────────────────────────────────────────────────────

// feat(interaction): allow users to return to the top smoothly

// Implemented

// scrollToTop()

// Behavior:

// If ScrollSmoother exists:

// Uses

// smoother.scrollTo()

// with

// Duration:
//     1 second

// Ease:
//     power2.out

// Otherwise:

// Falls back to

// window.scrollTo()

// using the browser's native smooth scrolling.

// Purpose:
// Provides a consistent smooth scrolling experience regardless of whether
// GSAP is available.

// ──────────────────────────────────────────────────────────────────────────────
// COMMIT 11: Responsive Rendering Logic
// ──────────────────────────────────────────────────────────────────────────────

// feat(ui): conditionally render navigation elements

// Desktop Layout

// ✓ Username visible
// ✓ Avatar visible
// ✗ Hamburger hidden

// Mobile Layout

// ✓ Hamburger visible
// ✓ Avatar visible
// ✗ Username hidden

// The responsive layout is controlled through

// isMobile

// instead of rendering completely different components.

// Benefits:
// - Less duplicated JSX
// - Simpler rendering logic
// - Easier maintenance

// ──────────────────────────────────────────────────────────────────────────────
// COMMIT 12: Organize Styles and Theme Integration
// ──────────────────────────────────────────────────────────────────────────────

// refactor(styles): centralize component styling using theme tokens

// All visual styling references the global theme object.

// Examples:

// theme.colors
// theme.spacing
// theme.fonts
// theme.radius
// theme.transitions

// Advantages:

// - Consistent design language
// - Easy theme customization
// - Reduced hardcoded values
// - Better scalability
// - Improved maintainability

// Every style object is defined before rendering, keeping JSX focused
// primarily on structure rather than presentation.

// ──────────────────────────────────────────────────────────────────────────────
// COMMIT 13: Explain Overall Component Lifecycle
// ──────────────────────────────────────────────────────────────────────────────

// docs(navbar): document complete component execution flow

// Overall Lifecycle

// Component Mount
//         ↓
// Load authenticated user
//         ↓
// Retrieve ScrollSmoother from Context
//         ↓
// Detect current screen size
//         ↓
// Register resize listener
//         ↓
// Register scroll listener
//         ↓
// Render navbar
//         ↓
// User Scrolls
//         ↓
// Update:
//     • scrolled
//     • scrollPercent
//         ↓
// Progress line expands
//         ↓
// Circular progress updates
//         ↓
// Navbar background animates
//         ↓
// User clicks progress circle
//         ↓
// Smooth scroll back to top
//         ↓
// Component Unmount
//         ↓
// Remove resize listener
// Remove scroll listener

// This separation of responsibilities follows React best practices,
// where each useEffect manages one independent side effect, making the
// component easier to understand, test, and maintain.
