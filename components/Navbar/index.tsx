// components/Navbar/index.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import theme from "@/styles/theme";
import { ScrollSmoother } from "gsap/ScrollSmoother";

// ─── Types ─────────────────────────────────────────────────────────────────

interface NavbarProps {
  onMenuClick: () => void;
}

// ─── Breakpoints ───────────────────────────────────────────────────────────

const MOBILE_WIDTH = 768;

// ─── Component ─────────────────────────────────────────────────────────────

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();

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

  // Scroll progress using ScrollSmoother (not window.scrollY)
  useEffect(() => {
    let smoother: any = null;
    const initSmoother = () => {
      smoother = ScrollSmoother.get();
    };
    const timer = setInterval(() => {
      const s = ScrollSmoother.get();
      if (s) {
        clearInterval(timer);
        smoother = s;
        smoother.addEventListener("scroll", onScroll);
      }
    }, 100);

    const onScroll = () => {
      if (!smoother) return;
      setScrolled(smoother.scrollTop() > 10);
      const docHeight = smoother.content().scrollHeight - window.innerHeight;
      const percent =
        docHeight > 0
          ? Math.round((smoother.scrollTop() / docHeight) * 100)
          : 0;
      setScrollPercent(percent);
    };

    initSmoother();
    return () => {
      clearInterval(timer);
      if (smoother) smoother.removeEventListener("scroll", onScroll);
    };
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

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <header style={navbarStyle}>
      {/* Left: hamburger (mobile) + wordmark */}
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
  );
}

// feat(navbar): implement responsive dashboard navigation bar

// - Created Navbar component for the dashboard layout.
// - Accepts `onMenuClick` callback through props to allow parent components
//   to control sidebar visibility instead of managing sidebar state internally.
// - Uses CSS-in-JS (React.CSSProperties) to keep component styles colocated
//   with the component logic.
// - Layout consists of:
//   • Left section:
//       - Mobile hamburger button
//       - InvoicePK wordmark linked to /dashboard
//   • Right section:
//       - Logged-in user's name
//       - Circular avatar displaying the first letter of the user's name
// - Navbar uses `position: sticky` so it remains visible while scrolling.

// feat(auth): connect navbar with authentication context

// - Integrated `useAuth()` hook.
// - Reads authenticated user information from global Auth Context.
// - Displays:
//     - displayName if available
//     - "User" as fallback when displayName is unavailable.
// - Generates avatar initials dynamically by extracting the first character
//   of the display name and converting it to uppercase.

// Logic:
// Instead of passing user data through props, the component consumes
// authentication state directly from the shared context, allowing every
// component in the application to access the same authenticated user.

// feat(responsive): detect viewport size using React useEffect

// Implemented responsive layout detection.

// Logic:
// - Created `isMobile` state.
// - Defined MOBILE_WIDTH constant (768px).
// - On component mount:
//       window.innerWidth is checked.
// - A resize event listener is attached.
// - Whenever the browser width changes:
//       check() executes again.
//       isMobile updates automatically.

// Cleanup:
// - Removed resize event listener inside the useEffect cleanup function
//   to prevent memory leaks after component unmounts.

// Purpose:
// This allows the component to:
// - Show hamburger menu only on mobile devices.
// - Hide username on smaller screens.
// - Update layout instantly whenever the browser is resized.

// feat(scroll): synchronize navbar with GSAP ScrollSmoother

// Integrated GSAP ScrollSmoother instead of relying on native
// window.scrollY.

// Reason:
// ScrollSmoother creates a virtual scrolling system where
// window.scrollY no longer represents the actual visual scroll position.

// Implementation:
// - Periodically checks whether ScrollSmoother has been initialized.
// - Once available:
//       ScrollSmoother.get()
//       returns the active smoother instance.
// - Registers a custom scroll listener.

// On every scroll:
// - Determines whether page has been scrolled more than 10px.
// - Calculates current scroll percentage:
//       currentScroll / totalScrollableHeight
// - Updates:
//       scrolled state
//       scrollPercent state

// Cleanup:
// - Removes ScrollSmoother event listener.
// - Clears interval timer when component unmounts.

// docs(navbar): document useEffect lifecycle

// This component contains two independent useEffect hooks.

// First useEffect:
// Purpose:
// - Detect current screen size.
// - Listen for browser resize events.
// - Keep `isMobile` synchronized with viewport width.

// Lifecycle:
// Mount
//     ↓
// Run check()
//     ↓
// Attach resize listener
//     ↓
// Update state whenever browser width changes
//     ↓
// Remove listener during cleanup

// Second useEffect:
// Purpose:
// - Wait until GSAP ScrollSmoother exists.
// - Attach scroll listener.
// - Track page scroll progress.

// Lifecycle:
// Mount
//     ↓
// Repeatedly check ScrollSmoother availability
//     ↓
// Once available:
// Attach scroll listener
//     ↓
// Update scroll state while scrolling
//     ↓
// Remove listener on unmount

// Reason for separating them:
// Each useEffect is responsible for one independent side effect,
// making the component easier to understand and maintain.

// refactor(styles): centralize component styling

// Moved all inline styles into reusable React.CSSProperties objects.

// Benefits:
// - Styles become easier to locate and modify.
// - Reduces repeated object creation inside JSX.
// - Improves readability by separating presentation from markup.
// - Uses shared design tokens from the global theme object:
//     - colors
//     - spacing
//     - fonts
//     - border radius
//     - transitions

// This ensures the Navbar remains visually consistent with the rest
// of the application.

// feat(ui): conditionally render desktop and mobile navigation

// Implemented conditional rendering based on screen size.

// Mobile:
// - Hamburger menu visible.
// - Username hidden.
// - Avatar visible.

// Desktop:
// - Hamburger menu hidden.
// - Username displayed.
// - Avatar displayed.

// Conditional rendering is achieved by updating styles using the
// `isMobile` state instead of mounting and unmounting entire components,
// keeping rendering logic simple and efficient.

// feat(interactions): add hover feedback for mobile menu button

// Added hover interactions for the hamburger menu.

// Behavior:
// - Mouse Enter:
//       background becomes neutral[50]
//       icon color changes to neutral[900]

// - Mouse Leave:
//       restores transparent background
//       restores neutral icon color

// Purpose:
// Provides immediate visual feedback during user interaction without
// requiring additional CSS files.
